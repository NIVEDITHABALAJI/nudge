const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  joinWorkspace
} = require('../controllers/workspaceController');

router.post('/', protect, createWorkspace);
router.get('/', protect, getWorkspaces);
router.get('/:id', protect, getWorkspace);
router.post('/join/:inviteCode', protect, joinWorkspace);

module.exports = router;