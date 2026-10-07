const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acces interzis! Token lipsa.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalid!' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acces interzis! Doar pentru admini.' });
    }
    next();
};

const verifyDeliverer = (req, res, next) => {
    if (req.user.role !== 'deliverer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acces interzis!' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyDeliverer };