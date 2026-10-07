const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getAllRequests, approveRequest, rejectRequest } = require('../controllers/deliveryRequestController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createRequest);
router.get('/my', verifyToken, getMyRequests);
router.get('/all', verifyToken, verifyAdmin, getAllRequests);
router.put('/:id/approve', verifyToken, verifyAdmin, approveRequest);
router.put('/:id/reject', verifyToken, verifyAdmin, rejectRequest);

module.exports = router;