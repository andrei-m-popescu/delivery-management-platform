const express = require('express');
const router = express.Router();
const { getAllCars, getCarById, addCar, updateCar, deleteCar } = require('../controllers/carController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

router.get('/', verifyToken, getAllCars);
router.get('/:id', verifyToken, getCarById);
router.post('/', verifyToken, verifyAdmin, upload.single('image'), addCar);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateCar);
router.delete('/:id', verifyToken, verifyAdmin, deleteCar);

module.exports = router;