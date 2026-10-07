const db = require('../config/db');
const { sendStatusEmail } = require('../config/email');

const getMyDeliveries = async (req, res) => {
    const deliverer_id = req.user.id;
    try {
        const [deliveries] = await db.query(
            `SELECT d.*, 
                    dr.delivery_address, dr.status as request_status, dr.delivery_cost,
                    c.brand, c.model, c.year, c.color, c.image_url,
                    u.name as client_name, u.phone as client_phone
             FROM deliveries d
             JOIN delivery_requests dr ON d.request_id = dr.id
             JOIN cars c ON dr.car_id = c.id
             JOIN users u ON dr.client_id = u.id
             WHERE d.deliverer_id = ?
             ORDER BY d.assigned_at DESC`,
            [deliverer_id]
        );
        res.json(deliveries);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

const startDelivery = async (req, res) => {
    const deliverer_id = req.user.id;
    const delivery_id = req.params.id;
    try {
        const [deliveries] = await db.query(
            'SELECT * FROM deliveries WHERE id = ? AND deliverer_id = ?',
            [delivery_id, deliverer_id]
        );
        if (deliveries.length === 0) return res.status(404).json({ message: 'Livrare negasita!' });

        await db.query('UPDATE deliveries SET started_at = NOW() WHERE id = ?', [delivery_id]);
        await db.query(
            'UPDATE delivery_requests SET status = ? WHERE id = ?',
            ['in_progress', deliveries[0].request_id]
        );

        // Trimite email clientului
        const [requests] = await db.query(
            `SELECT dr.*, u.email, u.name, c.brand, c.model
             FROM delivery_requests dr
             JOIN users u ON dr.client_id = u.id
             JOIN cars c ON dr.car_id = c.id
             WHERE dr.id = ?`,
            [deliveries[0].request_id]
        );
        if (requests.length > 0) {
            await sendStatusEmail(
                requests[0].email,
                requests[0].name,
                `${requests[0].brand} ${requests[0].model}`,
                'in_progress'
            );
        }

        res.json({ message: 'Livrare pornita!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

const completeDelivery = async (req, res) => {
    const deliverer_id = req.user.id;
    const delivery_id = req.params.id;
    const { withDamage, damageDescription } = req.body;
    try {
        const [deliveries] = await db.query(
            'SELECT * FROM deliveries WHERE id = ? AND deliverer_id = ?',
            [delivery_id, deliverer_id]
        );
        if (deliveries.length === 0) return res.status(404).json({ message: 'Livrare negasita!' });

        const newStatus = withDamage ? 'delivered_with_damage' : 'delivered';

        await db.query('UPDATE deliveries SET completed_at = NOW() WHERE id = ?', [delivery_id]);
        await db.query(
            'UPDATE delivery_requests SET status = ? WHERE id = ?',
            [newStatus, deliveries[0].request_id]
        );
        await db.query(
            'UPDATE cars SET status = ? WHERE id = (SELECT car_id FROM delivery_requests WHERE id = ?)',
            ['delivered', deliveries[0].request_id]
        );

        // Salveaza raportul de daune daca exista
        if (withDamage && damageDescription) {
            await db.query(
                'INSERT INTO damage_reports (delivery_id, description) VALUES (?, ?)',
                [delivery_id, damageDescription]
            );
        }

        // Trimite email clientului
        const [requests] = await db.query(
            `SELECT dr.*, u.email, u.name, c.brand, c.model
             FROM delivery_requests dr
             JOIN users u ON dr.client_id = u.id
             JOIN cars c ON dr.car_id = c.id
             WHERE dr.id = ?`,
            [deliveries[0].request_id]
        );
        if (requests.length > 0) {
            await sendStatusEmail(
                requests[0].email,
                requests[0].name,
                `${requests[0].brand} ${requests[0].model}`,
                newStatus
            );
        }

        res.json({ message: 'Livrare finalizata!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

module.exports = { getMyDeliveries, startDelivery, completeDelivery };