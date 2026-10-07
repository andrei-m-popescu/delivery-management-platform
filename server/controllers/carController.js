const db = require('../config/db');


const getAllCars = async (req, res) => {
    try {
        const [cars] = await db.query('SELECT * FROM cars ORDER BY created_at DESC');
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// O singura masina dupa id
const getCarById = async (req, res) => {
    try {
        const [cars] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
        if (cars.length === 0) return res.status(404).json({ message: 'Masina nu a fost gasita!' });
        res.json(cars[0]);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

const addCar = async (req, res) => {
    const { brand, model, year, color, vin, price } = req.body;
    try {
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        await db.query(
            'INSERT INTO cars (brand, model, year, color, vin, image_url, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [brand, model, year, color, vin, image_url, price]
        );
        res.status(201).json({ message: 'Masina adaugata cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

const updateCar = async (req, res) => {
    const { brand, model, year, color, vin, price, status } = req.body;
    try {
        let image_url = req.body.image_url;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }
        await db.query(
            'UPDATE cars SET brand=?, model=?, year=?, color=?, vin=?, image_url=?, price=?, status=? WHERE id=?',
            [brand, model, year, color, vin, image_url, price, status, req.params.id]
        );
        res.json({ message: 'Masina actualizata cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Doar admin poate sterge
const deleteCar = async (req, res) => {
    try {
        await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
        res.json({ message: 'Masina stearsa cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

module.exports = { getAllCars, getCarById, addCar, updateCar, deleteCar };