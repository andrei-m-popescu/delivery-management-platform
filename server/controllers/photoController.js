const db = require('../config/db');

// Livrator - uploadeaza poze
const uploadPhotos = async (req, res) => {
    const { delivery_id, type } = req.body;
    const deliverer_id = req.user.id;

    try {
        // Verifica ca livrarea apartine livratotului
        const [deliveries] = await db.query(
            'SELECT * FROM deliveries WHERE id = ? AND deliverer_id = ?',
            [delivery_id, deliverer_id]
        );
        if (deliveries.length === 0) {
            return res.status(404).json({ message: 'Livrare negasita!' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Nicio poza incarcata!' });
        }

        // Salveaza fiecare poza in baza de date
        for (const file of req.files) {
            const photoUrl = `/uploads/${file.filename}`;
            await db.query(
                'INSERT INTO delivery_photos (delivery_id, photo_url, type) VALUES (?, ?, ?)',
                [delivery_id, photoUrl, type]
            );
        }

        res.status(201).json({ message: 'Poze incarcate cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Toti - vad pozele unei livrari
const getPhotos = async (req, res) => {
    const { delivery_id } = req.params;

    try {
        const [photos] = await db.query(
            'SELECT * FROM delivery_photos WHERE delivery_id = ? ORDER BY uploaded_at ASC',
            [delivery_id]
        );
        res.json(photos);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

module.exports = { uploadPhotos, getPhotos };