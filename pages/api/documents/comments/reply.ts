import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { commentReplySchema, validateData } from "@/lib/validations";
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

    // POST: สร้างการตอบกลับความคิดเห็น
    if (req.method === "POST") {
      // ตรวจสอบความถูกต้องของข้อมูล
      const validationResult = await validateData(commentReplySchema, {
        ...req.body,
        userId: session.user.id,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error
        });
      }

      const { commentId, content } = validationResult.data;

      // ตรวจสอบว่าความคิดเห็นมีอยู่จริง
      const comment = await prisma.documentComment.findUnique({
        where: { id: commentId },
        include: { 
          document: {
            include: {
              thesis: true
            }
          }
        },
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: "ไม่พบความคิดเห็น"
        });
      }

      // ตรวจสอบสิทธิ์
      const thesis = comment.document.thesis;
      const isAuthorized = 
        thesis.studentId === session.user.id ||
        thesis.advisorId === session.user.id ||
        thesis.coAdvisorId === session.user.id ||
        session.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: "ไม่มีสิทธิ์ตอบกลับความคิดเห็นนี้"
        });
      }

      // สร้างการตอบกลับใหม่
      const reply = await prisma.commentReply.create({
        data: {
          content,
          commentId,
          userId: session.user.id,
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
        res.socket.server.io.to(`document:${comment.documentId}`).emit('new-document-reply', {
          commentId,
          reply
        });
      }

      // สร้างการแจ้งเตือนสำหรับผู้เกี่ยวข้อง
      const notificationRecipients = new Set<string>();
      
      // แจ้งเตือนเจ้าของความคิดเห็น
      if (comment.userId !== session.user.id) {
        notificationRecipients.add(comment.userId);
      }
      
      // แจ้งเตือนผู้เกี่ยวข้องกับวิทยานิพนธ์
      if (thesis.studentId !== session.user.id && thesis.studentId !== comment.userId) {
        notificationRecipients.add(thesis.studentId);
      }
      
      if (thesis.advisorId && thesis.advisorId !== session.user.id && thesis.advisorId !== comment.userId) {
        notificationRecipients.add(thesis.advisorId);
      }
      
      if (thesis.coAdvisorId && thesis.coAdvisorId !== session.user.id && thesis.coAdvisorId !== comment.userId) {
        notificationRecipients.add(thesis.coAdvisorId);
      }

      // สร้างการแจ้งเตือนสำหรับผู้เกี่ยวข้องแต่ละคน
      for (const userId of notificationRecipients) {
        await prisma.notification.create({
          data: {
            title: "การตอบกลับความคิดเห็นใหม่",
            message: `${session.user.name || 'ผู้ใช้'} ได้ตอบกลับความคิดเห็นในเอกสาร ${comment.document.name}`,
            type: "info",
            userId,
            thesisId: thesis.id,
            link: `/theses/${thesis.id}/documents/${comment.documentId}?page=${comment.pageNumber}`,
          },
        });
        
        // ส่งการแจ้งเตือนแบบเรียลไทม์ไปยังผู้ใช้
        if (res.socket?.server?.io) {
          const notification = {
            title: "การตอบกลับความคิดเห็นใหม่",
            message: `${session.user.name || 'ผู้ใช้'} ได้ตอบกลับความคิดเห็นในเอกสาร ${comment.document.name}`,
            type: "info",
            link: `/theses/${thesis.id}/documents/${comment.documentId}?page=${comment.pageNumber}`,
            createdAt: new Date(),
          };
          
          res.socket.server.io.to(`user:${userId}`).emit('new-notification', notification);
        }
      }

      return res.status(201).json({
        success: true,
        reply
      });
    }

    // ถ้าไม่ใช่ POST
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
    
  } catch (error) {
    console.error("Error in comment reply API:", error);
    return res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในระบบ โปรดลองอีกครั้งภายหลัง"
    });
  }
} 