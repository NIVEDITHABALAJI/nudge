const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Nudge API is running 🚀' });
});

// Socket.io
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} 🟢`);

  socket.on('join_workspace', (workspaceId) => {
    socket.join(workspaceId);
    console.log(`${socket.user.name} joined workspace: ${workspaceId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { workspaceId, content } = data;
      const message = await Message.create({
        workspace: workspaceId,
        sender: socket.user._id,
        content
      });
      const populatedMessage = await message.populate('sender', 'name email');
      io.to(workspaceId).emit('receive_message', populatedMessage);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Add reaction to message
socket.on('add_reaction', async (data) => {
  try {
    const { messageId, emoji, workspaceId } = data;
    const message = await Message.findById(messageId);
    if (!message) return;

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      const userIndex = existingReaction.users.indexOf(socket.user._id.toString());
      if (userIndex === -1) {
        existingReaction.users.push(socket.user._id);
      } else {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      }
    } else {
      message.reactions.push({ emoji, users: [socket.user._id] });
    }

    await message.save();
    const updated = await Message.findById(messageId).populate('sender', 'name email');
    io.to(workspaceId).emit('message_updated', updated);
  } catch (error) {
    console.error('Reaction error:', error);
  }
});

  socket.on('leave_workspace', (workspaceId) => {
    socket.leave(workspaceId);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name} 🔴`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));