const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { isConnected, jsonDb } = require('../db');

// Get all customers (users)
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    if (isConnected()) {
      const customers = await User.find({ role: 'user' }).select('-password');
      return res.json(customers);
    } else {
      const users = jsonDb.read('User');
      const customers = users
        .filter(u => u.role === 'user')
        .map(({ password, ...rest }) => rest);
      return res.json(customers);
    }
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

// Get all agents & admins
router.get('/agents', authMiddleware, async (req, res) => {
  try {
    if (isConnected()) {
      const agents = await User.find({ role: { $in: ['agent', 'admin'] } }).select('-password');
      return res.json(agents);
    } else {
      const users = jsonDb.read('User');
      const agents = users
        .filter(u => u.role === 'agent' || u.role === 'admin')
        .map(({ password, ...rest }) => rest);
      return res.json(agents);
    }
  } catch (err) {
    console.error('Fetch agents error:', err);
    res.status(500).json({ message: 'Server error fetching agents' });
  }
});

module.exports = router;
