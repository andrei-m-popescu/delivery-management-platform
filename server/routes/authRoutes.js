const express = require('express');
const router = express.Router();
const { register, login, getDeliverers, getAllUsers, createUser, deleteUser, changePassword, deleteAccount } = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/deliverers', verifyToken, verifyAdmin, getDeliverers);
router.get('/users', verifyToken, verifyAdmin, getAllUsers);
router.post('/create-user', verifyToken, verifyAdmin, createUser);
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser);
router.put('/change-password', verifyToken, changePassword);
router.delete('/delete-account', verifyToken, deleteAccount);

module.exports = router;