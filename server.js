const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // สร้าง Socket.IO server
  const io = new Server(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // การจัดการการเชื่อมต่อ Socket.IO
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // ฟังก์ชันเข้าร่วมห้องสนทนา (thesis-specific room)
    socket.on('join-thesis-room', (thesisId) => {
      socket.join(`thesis:${thesisId}`);
      console.log(`Client ${socket.id} joined thesis room ${thesisId}`);
    });
    
    // ฟังก์ชันออกจากห้องสนทนา
    socket.on('leave-thesis-room', (thesisId) => {
      socket.leave(`thesis:${thesisId}`);
      console.log(`Client ${socket.id} left thesis room ${thesisId}`);
    });
    
    // ฟังก์ชันส่งข้อความใหม่
    socket.on('send-message', async (data) => {
      try {
        const { thesisId, message } = data;
        
        if (!thesisId || !message) {
          socket.emit('message-error', { error: 'Missing required fields' });
          return;
        }
        
        // ส่งข้อความกลับไปยังห้องสนทนาของวิทยานิพนธ์นั้น
        io.to(`thesis:${thesisId}`).emit('new-message', message);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });
    
    // ฟังก์ชันทำเครื่องหมายว่าอ่านแล้ว
    socket.on('mark-message-read', async (data) => {
      try {
        const { thesisId, messageId, readAt } = data;
        
        if (!thesisId || !messageId) {
          socket.emit('message-error', { error: 'Missing required fields' });
          return;
        }
        
        // ส่งการอัพเดตกลับไปยังห้องสนทนา
        io.to(`thesis:${thesisId}`).emit('message-read', { messageId, readAt });
        
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('message-error', { error: 'Failed to mark message as read' });
      }
    });
    
    // เข้าร่วมห้องของเอกสาร
    socket.on('join-document-room', (documentId) => {
      socket.join(`document:${documentId}`);
      console.log(`Client ${socket.id} joined document room ${documentId}`);
    });
    
    // ออกจากห้องของเอกสาร
    socket.on('leave-document-room', (documentId) => {
      socket.leave(`document:${documentId}`);
      console.log(`Client ${socket.id} left document room ${documentId}`);
    });
    
    // ฟังก์ชันส่งความคิดเห็นใหม่ในเอกสาร
    socket.on('document-comment', (data) => {
      try {
        const { documentId, comment } = data;
        
        if (!documentId || !comment) {
          socket.emit('comment-error', { error: 'Missing required fields' });
          return;
        }
        
        // ส่งการแจ้งเตือนไปยังห้องของเอกสาร
        io.to(`document:${documentId}`).emit('new-document-comment', comment);
        
      } catch (error) {
        console.error('Error sending document comment:', error);
        socket.emit('comment-error', { error: 'Failed to send comment' });
      }
    });
    
    // ฟังก์ชันส่งการแจ้งเตือนในระบบ
    socket.on('notification', (data) => {
      try {
        const { userId, notification } = data;
        
        if (!userId || !notification) {
          socket.emit('notification-error', { error: 'Missing required fields' });
          return;
        }
        
        // ส่งการแจ้งเตือนไปยังผู้ใช้เฉพาะคน
        socket.to(`user:${userId}`).emit('new-notification', notification);
        
      } catch (error) {
        console.error('Error sending notification:', error);
        socket.emit('notification-error', { error: 'Failed to send notification' });
      }
    });
    
    // ฟังก์ชันเข้าร่วมห้องส่วนตัวของผู้ใช้
    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Client ${socket.id} joined user room ${userId}`);
    });
    
    // จัดการตอนตัดการเชื่อมต่อ
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 