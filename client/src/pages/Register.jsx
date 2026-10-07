import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setVisible(true), 50);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formData.password !== formData.confirmPassword) {
            return setError('Parolele nu coincid!');
        }
        if (formData.password.length < 6) {
            return setError('Parola trebuie sa aiba cel putin 6 caractere!');
        }
        try {
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });
            setSuccess('Cont creat cu succes! Te redirectionam...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la inregistrare!');
        }
    };

    return (
        <div style={styles.page}>
            <div style={{ ...styles.blob, top: '10%', left: '15%' }} />
            <div style={{ ...styles.blob, top: '60%', right: '10%', width: '300px', height: '300px', animationDelay: '2s' }} />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); opacity: 0.12; }
                    50% { transform: translateY(-20px); opacity: 0.2; }
                }
                input:focus {
                    border-color: #f59e0b !important;
                    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
                }
                .reg-btn:hover { background-color: #d97706 !important; transform: translateY(-1px); }
                .reg-btn:active { transform: translateY(0px); }
            `}</style>

            <div style={{
                ...styles.card,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <div style={styles.wordmark}>AutoDrop</div>
                <h2 style={styles.title}>Creează cont nou</h2>
                <p style={styles.subtitle}>Completează datele de mai jos</p>

                {error && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div style={styles.half}>
                            <label style={styles.label}>NUME COMPLET</label>
                            <input style={styles.input} type="text" name="name" placeholder="Ion Popescu" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div style={styles.half}>
                            <label style={styles.label}>TELEFON</label>
                            <input style={styles.input} type="text" name="phone" placeholder="07xx xxx xxx" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <label style={styles.label}>EMAIL</label>
                    <input style={styles.input} type="email" name="email" placeholder="exemplu@gmail.com" value={formData.email} onChange={handleChange} required />
                    <label style={styles.label}>PAROLĂ</label>
                    <input style={styles.input} type="password" name="password" placeholder="••••••••••" value={formData.password} onChange={handleChange} required />
                    <label style={styles.label}>CONFIRMĂ PAROLA</label>
                    <input style={styles.input} type="password" name="confirmPassword" placeholder="••••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                    <button className="reg-btn" style={styles.button} type="submit">
                        Creează cont
                    </button>
                </form>

                <div style={styles.divider} />
                <p style={styles.loginText}>
                    Ai deja cont?{' '}
                    <Link to="/login" style={styles.loginLink}>Autentifică-te</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
    },
    blob: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
        opacity: 0.12,
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none',
    },
    card: {
        backgroundColor: '#141414',
        borderRadius: '24px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid #1f1f1f',
        position: 'relative',
        zIndex: 1,
    },
    wordmark: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '24px',
    },
    title: {
        color: '#ffffff',
        fontSize: '20px',
        fontWeight: '700',
        textAlign: 'center',
        margin: '0 0 6px 0',
    },
    subtitle: {
        color: '#555555',
        fontSize: '14px',
        textAlign: 'center',
        margin: '0 0 28px 0',
    },
    errorBox: {
        backgroundColor: '#1a0a0a',
        border: '1px solid #3d1515',
        color: '#ff6b6b',
        borderRadius: '12px',
        padding: '10px 14px',
        fontSize: '13px',
        marginBottom: '16px',
        textAlign: 'center',
    },
    successBox: {
        backgroundColor: '#0a1a0a',
        border: '1px solid #1a3d15',
        color: '#6bff7a',
        borderRadius: '12px',
        padding: '10px 14px',
        fontSize: '13px',
        marginBottom: '16px',
        textAlign: 'center',
    },
    row: {
        display: 'flex',
        gap: '12px',
    },
    half: {
        flex: 1,
    },
    label: {
        display: 'block',
        color: '#444444',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '13px 16px',
        backgroundColor: '#0d0d0d',
        border: '1px solid #1f1f1f',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '14px',
        marginBottom: '16px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#f59e0b',
        color: '#0a1628',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        transition: 'all 0.2s ease',
        marginTop: '4px',
    },
    divider: {
        height: '1px',
        backgroundColor: '#1a1a1a',
        margin: '24px 0',
    },
    loginText: {
        textAlign: 'center',
        color: '#444444',
        fontSize: '14px',
        margin: 0,
    },
    loginLink: {
        color: '#f59e0b',
        textDecoration: 'none',
        fontWeight: '600',
    },
};

export default Register;