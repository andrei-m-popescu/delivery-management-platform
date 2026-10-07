const db = require('../config/db');

// Client - creeaza cerere de livrare
const createRequest = async (req, res) => {
    const { car_id, delivery_address } = req.body;
    const client_id = req.user.id;

    try {
        // Verifica daca masina e disponibila
        const [cars] = await db.query('SELECT * FROM cars WHERE id = ?', [car_id]);
        if (cars.length === 0) return res.status(404).json({ message: 'Masina nu a fost gasita!' });
        if (cars[0].status !== 'available') return res.status(400).json({ message: 'Masina nu este disponibila!' });

        // Creeaza cererea
        await db.query(
            'INSERT INTO delivery_requests (client_id, car_id, delivery_address) VALUES (?, ?, ?)',
            [client_id, car_id, delivery_address]
        );

        // Marcheaza masina ca rezervata
        await db.query('UPDATE cars SET status = ? WHERE id = ?', ['reserved', car_id]);

        res.status(201).json({ message: 'Cerere de livrare creata cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Client - vede propriile cereri
const getMyRequests = async (req, res) => {
    const client_id = req.user.id;
    try {
        const [requests] = await db.query(
            `SELECT dr.*, c.brand, c.model, c.year, c.color, c.image_url, c.price,
                    d.id as delivery_id,
                    dmg.description as damage_description
             FROM delivery_requests dr
             JOIN cars c ON dr.car_id = c.id
             LEFT JOIN deliveries d ON d.request_id = dr.id
             LEFT JOIN damage_reports dmg ON dmg.delivery_id = d.id
             WHERE dr.client_id = ?
             ORDER BY dr.created_at DESC`,
            [client_id]
        );
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Admin - vede toate cererile
const getAllRequests = async (req, res) => {
    const { status, deliverer_id } = req.query;
    try {
        let conditions = [];
        const params = [];

        if (status) {
            conditions.push('dr.status = ?');
            params.push(status);
        }

        if (deliverer_id) {
            conditions.push('d.deliverer_id = ?');
            params.push(deliverer_id);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
            SELECT dr.*, c.brand, c.model, c.year, c.color,
                   u.name as client_name, u.email as client_email, u.phone as client_phone,
                   d.id as delivery_id, d.deliverer_id,
                   dmg.description as damage_description
            FROM delivery_requests dr
            JOIN cars c ON dr.car_id = c.id
            JOIN users u ON dr.client_id = u.id
            LEFT JOIN deliveries d ON d.request_id = dr.id
            LEFT JOIN damage_reports dmg ON dmg.delivery_id = d.id
            ${whereClause}
            ORDER BY dr.created_at DESC
        `;

        const [requests] = await db.query(query, params);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Admin - aproba cererea si asigneaza livrator
const { sendStatusEmail, sendDelivererEmail } = require('../config/email');

const approveRequest = async (req, res) => {
    const { deliverer_id, delivery_cost } = req.body;
    const request_id = req.params.id;

    try {
        // Verifica daca cererea a fost deja aprobata
        const [existing] = await db.query(
            'SELECT id FROM deliveries WHERE request_id = ?',
            [request_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Aceasta cerere a fost deja aprobata!' });
        }

        await db.query(
            'UPDATE delivery_requests SET status = ?, delivery_cost = ? WHERE id = ?',
            ['approved', delivery_cost, request_id]
        );

        await db.query(
            'INSERT INTO deliveries (request_id, deliverer_id) VALUES (?, ?)',
            [request_id, deliverer_id]
        );

        // Obtine datele pentru email
        const [requests] = await db.query(
            `SELECT dr.*, 
                    u.email as client_email, u.name as client_name,
                    c.brand, c.model,
                    d.email as deliverer_email, d.name as deliverer_name
             FROM delivery_requests dr
             JOIN users u ON dr.client_id = u.id
             JOIN cars c ON dr.car_id = c.id
             JOIN users d ON d.id = ?
             WHERE dr.id = ?`,
            [deliverer_id, request_id]
        );

        if (requests.length > 0) {
            const data = requests[0];
            const carName = `${data.brand} ${data.model}`;

            // Email client
            await sendStatusEmail(data.client_email, data.client_name, carName, 'approved');

            // Email livrator
            await sendDelivererEmail(
                data.deliverer_email,
                data.deliverer_name,
                carName,
                data.client_name,
                data.delivery_address
            );
        }

        res.json({ message: 'Cerere aprobata si livrator asignat!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

const rejectRequest = async (req, res) => {
    const request_id = req.params.id;
    try {
        const [requests] = await db.query('SELECT * FROM delivery_requests WHERE id = ?', [request_id]);
        if (requests.length === 0) return res.status(404).json({ message: 'Cererea nu a fost gasita!' });

        await db.query('UPDATE delivery_requests SET status = ? WHERE id = ?', ['rejected', request_id]);
        await db.query('UPDATE cars SET status = ? WHERE id = ?', ['available', requests[0].car_id]);

        res.json({ message: 'Cerere respinsa!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

module.exports = { createRequest, getMyRequests, getAllRequests, approveRequest, rejectRequest };