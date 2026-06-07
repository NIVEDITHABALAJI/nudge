const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

router.get('/:workspaceId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      workspace: req.params.workspaceId
    })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;