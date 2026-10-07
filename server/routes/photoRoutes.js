const express = require('express');
const router = express.Router();
const { uploadPhotos, getPhotos } = require('../controllers/photoController');
const { verifyToken, verifyDeliverer } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

router.post('/', verifyToken, verifyDeliverer, upload.array('photos', 10), uploadPhotos);
router.get('/:delivery_id', verifyToken, getPhotos);

module.exports = router;