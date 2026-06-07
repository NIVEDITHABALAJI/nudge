const Workspace = require('../models/Workspace');
const crypto = require('crypto');

// Generate unique invite code
const generateInviteCode = () => {
  return crypto.randomBytes(6).toString('hex');
};

// @route POST /api/workspaces
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      inviteCode: generateInviteCode()
    });

    res.status(201).json({ message: 'Workspace created!', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/workspaces
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id
    }).populate('owner', 'name email');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/workspaces/:id
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route POST /api/workspaces/join/:inviteCode
const joinWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      inviteCode: req.params.inviteCode
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if already a member
    const isMember = workspace.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    workspace.members.push({ user: req.user._id, role: 'member' });
    await workspace.save();

    res.json({ message: 'Joined workspace!', workspace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createWorkspace, getWorkspaces, getWorkspace, joinWorkspace };