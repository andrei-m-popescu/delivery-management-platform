const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/generate', verifyToken, verifyAdmin, generateReport);

module.exports = router;