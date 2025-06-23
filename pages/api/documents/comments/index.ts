import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { documentCommentSchema, validateData } from "@/lib/validations";
import { NextApiResponseServerIO } from "@/lib/socket-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  try {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ"
      });
    }

    // GET: ดึงความคิดเห็นทั้งหมดสำหรับเอกสาร
    if (req.method === "GET") {
      const { documentId } = req.query;

      if (!documentId || typeof documentId !== "string") {
        return res.status(400).json({
          success: false,
          error: "ต้องระบุ documentId"
        });
      }

      // ดึงข้อมูลเอกสาร
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { thesis: true }
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "ไม่พบเอกสาร"
        });
      }

      // ตรวจสอบสิทธิ์: ต้องเป็นนักศึกษาเจ้าของวิทยานิพนธ์หรืออาจารย์ที่ปรึกษา
      const thesis = document.thesis;
      const isAuthorized = 
        thesis.studentId === session.user.id ||
        thesis.advisorId === session.user.id ||
        thesis.coAdvisorId === session.user.id ||
        session.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: "ไม่มีสิทธิ์เข้าถึงเอกสารนี้"
        });
      }

      // ดึงความคิดเห็นทั้งหมด
      const comments = await prisma.documentComment.findMany({
        where: { documentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        success: true,
        comments
      });
    }

    // POST: สร้างความคิดเห็นใหม่
    if (req.method === "POST") {
      // ตรวจสอบความถูกต้องของข้อมูล
      const validationResult = await validateData(documentCommentSchema, {
        ...req.body,
        userId: session.user.id,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error
        });
      }

      const { documentId, content, pageNumber, highlightedText, position } = validationResult.data;

      // ตรวจสอบว่าเอกสารมีอยู่จริง
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { thesis: true },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "ไม่พบเอกสาร"
        });
      }

      // ตรวจสอบสิทธิ์
      const thesis = document.thesis;
      const isAuthorized = 
        thesis.studentId === session.user.id ||
        thesis.advisorId === session.user.id ||
        thesis.coAdvisorId === session.user.id ||
        session.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: "ไม่มีสิทธิ์เพิ่มความคิดเห็นในเอกสารนี้"
        });
      }

      // สร้างความคิดเห็นใหม่
      const comment = await prisma.documentComment.create({
        data: {
          content,
          documentId,
          userId: session.user.id,
          pageNumber,
          highlightedText,
          position,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
        },
      });

      // ส่งการแจ้งเตือนไปยังห้องของเอกสาร
      if (res.socket?.server?.io) {
        res.socket.server.io.to(`document:${documentId}`).emit('new-document-comment', comment);
      }

      // สร้างการแจ้งเตือนสำหรับผู้เกี่ยวข้อง
      const notificationRecipients = new Set<string>();
      
      // แจ้งเตือนผู้เกี่ยวข้องกับวิทยานิพนธ์
      if (thesis.studentId !== session.user.id) {
        notificationRecipients.add(thesis.studentId);
      }
      
      if (thesis.advisorId && thesis.advisorId !== session.user.id) {
        notificationRecipients.add(thesis.advisorId);
      }
      
      if (thesis.coAdvisorId && thesis.coAdvisorId !== session.user.id) {
        notificationRecipients.add(thesis.coAdvisorId);
      }

      // สร้างการแจ้งเตือนสำหรับผู้เกี่ยวข้องแต่ละคน
      for (const userId of notificationRecipients) {
        await prisma.notification.create({
          data: {
            title: "ความคิดเห็นใหม่ในเอกสาร",
            message: `${session.user.name || 'ผู้ใช้'} ได้เพิ่มความคิดเห็นในเอกสาร ${document.name}`,
            type: "info",
            userId,
            thesisId: thesis.id,
            link: `/theses/${thesis.id}/documents/${document.id}?page=${pageNumber}`,
          },
        });
        
        // ส่งการแจ้งเตือนแบบเรียลไทม์ไปยังผู้ใช้
        if (res.socket?.server?.io) {
          const notification = {
            title: "ความคิดเห็นใหม่ในเอกสาร",
            message: `${session.user.name || 'ผู้ใช้'} ได้เพิ่มความคิดเห็นในเอกสาร ${document.name}`,
            type: "info",
            link: `/theses/${thesis.id}/documents/${document.id}?page=${pageNumber}`,
            createdAt: new Date(),
          };
          
          res.socket.server.io.to(`user:${userId}`).emit('new-notification', notification);
        }
      }

      return res.status(201).json({
        success: true,
        comment
      });
    }

    // ถ้าไม่ใช่ GET หรือ POST
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
    
  } catch (error) {
    console.error("Error in document comments API:", error);
    return res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในระบบ โปรดลองอีกครั้งภายหลัง"
    });
  }
} 