const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Verifica daca exista deja emailul
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email-ul este deja folosit!' });
        }

        // Encripteaza parola
        const hashedPassword = await bcrypt.hash(password, 10);

        // Salveaza userul
        await db.query(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, 'client']
        );

        res.status(201).json({ message: 'Cont creat cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cauta userul
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email sau parola incorecta!' });
        }

        const user = users[0];

        // Verifica parola
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email sau parola incorecta!' });
        }

        // Genereaza token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Admin - obtine lista livratori
const getDeliverers = async (req, res) => {
    try {
        const [deliverers] = await db.query(
            'SELECT id, name, email, phone FROM users WHERE role = ?',
            ['deliverer']
        );
        res.json(deliverers);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Admin - obtine toti userii
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Admin - creeaza user nou
const createUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email-ul este deja folosit!' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, role]
        );
        res.status(201).json({ message: 'Cont creat cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Admin - sterge user
const deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Cont sters cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Schimbare parola
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Obtine userul din DB
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit!' });
        }

        // Verifica parola curenta
        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Parola curenta este incorecta!' });
        }

        // Encripteaza parola noua
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizeaza parola
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Parola a fost schimbata cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

// Stergere cont
const deleteAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Contul a fost sters cu succes!' });
    } catch (err) {
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
};

module.exports = { register, login, getDeliverers, getAllUsers, createUser, deleteUser, changePassword, deleteAccount };

