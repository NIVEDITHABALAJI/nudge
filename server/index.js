const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const workspaceRoutes = require('./routes/workspaceRoutes');
app.use('/api/workspaces', workspaceRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Nudge API is running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));