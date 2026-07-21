const { Server } = require('socket.io');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

let io;

function initSocket(httpServer, corsOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins, // e.g. ['http://localhost:5173', 'http://localhost:5174']
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Customer app: join their own private room so admin's replies reach them
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Admin app: join global room so ALL new messages/conversations are visible in the inbox list
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
    });

    // Admin app: join a specific conversation room while that chat window is open
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('send_message', async (payload, callback) => {
      try {
        const { conversationId, userId, senderRole, text, image, productRef } = payload;

        let conversation = conversationId
          ? await Conversation.findById(conversationId)
          : await Conversation.findOne({ user: userId });

        if (!conversation) {
          conversation = await Conversation.create({ user: userId });
        }

        const message = await Message.create({
          conversation: conversation._id,
          senderRole,
          sender: userId || null,
          text: text || '',
          image: image || null,
          productRef: productRef || undefined,
        });

        conversation.lastMessage = text || (image ? '📷 Photo' : '');
        conversation.lastMessageAt = new Date();
        if (senderRole === 'user') {
          conversation.unreadByAdmin += 1;
        } else {
          conversation.unreadByUser += 1;
        }
        await conversation.save();

        const populated = await message.populate('sender', 'name email');

        // User + admin dujon ke e realtime pathiye dicchi
        io.to(`user_${conversation.user}`).emit('receive_message', populated);
        io.to('admin_room').emit('receive_message', populated);
        io.to('admin_room').emit('conversation_updated', conversation);
        io.to(`user_${conversation.user}`).emit('conversation_updated', conversation);

        if (callback) callback({ success: true, message: populated, conversation });
      } catch (err) {
        console.error('send_message error:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('mark_as_read', async ({ conversationId, readerRole }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        if (readerRole === 'admin') {
          conversation.unreadByAdmin = 0;
        } else {
          conversation.unreadByUser = 0;
        }
        await conversation.save();

        await Message.updateMany(
          { conversation: conversationId, senderRole: readerRole === 'admin' ? 'user' : 'admin' },
          { isRead: true }
        );

        io.to('admin_room').emit('conversation_updated', conversation);
        io.to(`user_${conversation.user}`).emit('conversation_updated', conversation);
      } catch (err) {
        console.error('mark_as_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized yet');
  return io;
}

module.exports = { initSocket, getIO };