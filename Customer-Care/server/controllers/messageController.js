const Message = require('../models/Message');
const User = require('../models/User');
const { isConnected, jsonDb } = require('../db');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, complaintId } = req.body;
    const sender = req.user.id;

    if (!receiver || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    if (isConnected()) {
      const newMessage = await Message.create({
        sender,
        receiver,
        content,
        complaintId: complaintId || null,
        timestamp: new Date()
      });

      // Populate sender info
      const populated = await Message.findById(newMessage._id)
        .populate('sender', 'firstName lastName username email role')
        .populate('receiver', 'firstName lastName username email role');

      return res.status(201).json(populated);
    } else {
      // JSON DB Fallback
      const messages = jsonDb.read('Message');
      const users = jsonDb.read('User');

      const newMessage = {
        _id: 'mock_msg_' + Date.now() + Math.random().toString(36).substr(2, 5),
        sender,
        receiver,
        content,
        complaintId: complaintId || null,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      messages.push(newMessage);
      jsonDb.write('Message', messages);

      // Populate manually
      const senderUser = users.find(u => u._id === sender);
      const receiverUser = users.find(u => u._id === receiver);

      const populated = {
        ...newMessage,
        sender: senderUser ? {
          _id: senderUser._id,
          firstName: senderUser.firstName,
          lastName: senderUser.lastName,
          username: senderUser.username,
          email: senderUser.email,
          role: senderUser.role
        } : null,
        receiver: receiverUser ? {
          _id: receiverUser._id,
          firstName: receiverUser.firstName,
          lastName: receiverUser.lastName,
          username: receiverUser.username,
          email: receiverUser.email,
          role: receiverUser.role
        } : null
      };

      return res.status(201).json(populated);
    }
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error sending message', error: err.message });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    // For agents/admins, they might request messages for a specific customer via query parameter
    const { targetUserId } = req.query;

    if (isConnected()) {
      let query = {};
      
      if (currentUserRole === 'user') {
        // Customer sees chats where they are sender or receiver
        query = {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        };
      } else {
        // Agent/Admin can fetch chats with a specific user
        if (targetUserId) {
          query = {
            $or: [
              { sender: targetUserId, receiver: currentUserId },
              { sender: currentUserId, receiver: targetUserId },
              // or between target user and any agent
              { sender: targetUserId },
              { receiver: targetUserId }
            ]
          };
        } else {
          // If no target user specified, return all messages (though agents usually look up by user)
          query = {};
        }
      }

      const messages = await Message.find(query)
        .populate('sender', 'firstName lastName username email role')
        .populate('receiver', 'firstName lastName username email role')
        .sort({ timestamp: 1 });

      return res.json(messages);
    } else {
      // JSON DB Fallback
      const messages = jsonDb.read('Message');
      const users = jsonDb.read('User');

      let filtered;
      if (currentUserRole === 'user') {
        filtered = messages.filter(m => m.sender === currentUserId || m.receiver === currentUserId);
      } else {
        if (targetUserId) {
          filtered = messages.filter(m => 
            (m.sender === targetUserId) || 
            (m.receiver === targetUserId)
          );
        } else {
          filtered = messages;
        }
      }

      // Populate manually
      const populated = filtered.map(m => {
        const senderUser = users.find(u => u._id === m.sender);
        const receiverUser = users.find(u => u._id === m.receiver);

        return {
          ...m,
          sender: senderUser ? {
            _id: senderUser._id,
            firstName: senderUser.firstName,
            lastName: senderUser.lastName,
            username: senderUser.username,
            email: senderUser.email,
            role: senderUser.role
          } : null,
          receiver: receiverUser ? {
            _id: receiverUser._id,
            firstName: receiverUser.firstName,
            lastName: receiverUser.lastName,
            username: receiverUser.username,
            email: receiverUser.email,
            role: receiverUser.role
          } : null
        };
      });

      // Sort by timestamp ascending
      populated.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      return res.json(populated);
    }
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error retrieving messages' });
  }
};
