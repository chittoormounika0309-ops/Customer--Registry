const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, complaintController.createComplaint);
router.get('/', authMiddleware, complaintController.getComplaints);
router.put('/:id', authMiddleware, complaintController.updateComplaint);

module.exports = router;
