const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { isConnected, jsonDb } = require('../db');

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { name, phone, email, details } = req.body;
    const userId = req.user.id;

    if (!name || !phone || !email || !details) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (isConnected()) {
      const newComplaint = await Complaint.create({
        name,
        phone,
        email,
        details,
        createdBy: userId,
        status: 'pending',
        date: new Date()
      });

      return res.status(201).json(newComplaint);
    } else {
      // JSON DB Fallback
      const complaints = jsonDb.read('Complaint');
      const newComplaint = {
        _id: 'mock_comp_' + Date.now() + Math.random().toString(36).substr(2, 5),
        name,
        phone,
        email,
        details,
        status: 'pending',
        date: new Date().toISOString(),
        createdBy: userId,
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      complaints.push(newComplaint);
      jsonDb.write('Complaint', complaints);

      return res.status(201).json(newComplaint);
    }
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ message: 'Server error creating complaint', error: err.message });
  }
};

// Get Complaints
exports.getComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isConnected()) {
      let complaints;
      if (userRole === 'user') {
        // Users only see their own complaints
        complaints = await Complaint.find({ createdBy: userId }).sort({ date: -1 });
      } else {
        // Admin and Agent see all complaints, populate createdBy user info
        complaints = await Complaint.find()
          .populate('createdBy', 'firstName lastName username email')
          .populate('assignedTo', 'firstName lastName username email')
          .sort({ date: -1 });
      }
      return res.json(complaints);
    } else {
      // JSON DB Fallback
      const complaints = jsonDb.read('Complaint');
      const users = jsonDb.read('User');

      let filteredComplaints;
      if (userRole === 'user') {
        filteredComplaints = complaints.filter(c => c.createdBy === userId);
      } else {
        // Mock DB: populate manually
        filteredComplaints = complaints.map(c => {
          const creator = users.find(u => u._id === c.createdBy);
          const assignee = c.assignedTo ? users.find(u => u._id === c.assignedTo) : null;
          
          return {
            ...c,
            createdBy: creator ? {
              _id: creator._id,
              firstName: creator.firstName,
              lastName: creator.lastName,
              username: creator.username,
              email: creator.email
            } : null,
            assignedTo: assignee ? {
              _id: assignee._id,
              firstName: assignee.firstName,
              lastName: assignee.lastName,
              username: assignee.username,
              email: assignee.email
            } : null
          };
        });
      }

      // Sort by date descending
      filteredComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.json(filteredComplaints);
    }
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ message: 'Server error retrieving complaints' });
  }
};

// Update Complaint Status / Assignee
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const userRole = req.user.role;

    if (userRole !== 'admin' && userRole !== 'agent') {
      return res.status(403).json({ message: 'Access denied: Admin or Agent only' });
    }

    if (isConnected()) {
      const updateData = {};
      if (status) updateData.status = status;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

      const updated = await Complaint.findByIdAndUpdate(id, updateData, { new: true })
        .populate('createdBy', 'firstName lastName username email')
        .populate('assignedTo', 'firstName lastName username email');

      if (!updated) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      return res.json(updated);
    } else {
      // JSON DB Fallback
      const complaints = jsonDb.read('Complaint');
      const index = complaints.findIndex(c => c._id === id);

      if (index === -1) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (status) complaints[index].status = status;
      if (assignedTo !== undefined) complaints[index].assignedTo = assignedTo;
      complaints[index].updatedAt = new Date().toISOString();

      jsonDb.write('Complaint', complaints);

      // Populate manually
      const users = jsonDb.read('User');
      const updated = complaints[index];
      const creator = users.find(u => u._id === updated.createdBy);
      const assignee = updated.assignedTo ? users.find(u => u._id === updated.assignedTo) : null;

      const populated = {
        ...updated,
        createdBy: creator ? {
          _id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          username: creator.username,
          email: creator.email
        } : null,
        assignedTo: assignee ? {
          _id: assignee._id,
          firstName: assignee.firstName,
          lastName: assignee.lastName,
          username: assignee.username,
          email: assignee.email
        } : null
      };

      return res.json(populated);
    }
  } catch (err) {
    console.error('Update complaint error:', err);
    res.status(500).json({ message: 'Server error updating complaint' });
  }
};
