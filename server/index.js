const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*'
}));
app.use(express.json());

// Folder static pentru poze
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const deliveryRequestRoutes = require('./routes/deliveryRequestRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const photoRoutes = require('./routes/photoRoutes');
const reportRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/requests', deliveryRequestRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/reports', reportRoutes);

// Test conexiune DB
const db = require('./config/db');
db.query('SELECT 1')
    .then(() => console.log('Conectat la baza de date MySQL!'))
    .catch(err => console.error('Eroare conexiune DB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serverul ruleaza pe portul ${PORT}`);
});