const express = require('express');
const router = express.Router();
const { getMyDeliveries, startDelivery, completeDelivery } = require('../controllers/deliveryController');
const { verifyToken, verifyDeliverer } = require('../middleware/authMiddleware');

router.get('/my', verifyToken, verifyDeliverer, getMyDeliveries);
router.put('/:id/start', verifyToken, verifyDeliverer, startDelivery);
router.put('/:id/complete', verifyToken, verifyDeliverer, completeDelivery);

module.exports = router;