import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
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
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'deliverer') navigate('/deliverer/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la autentificare!');
        }
    };

    return (
        <div style={styles.page}>
            <div style={{ ...styles.blob, top: '10%', left: '15%', animationDelay: '0s' }} />
            <div style={{ ...styles.blob, top: '60%', right: '10%', animationDelay: '2s', width: '300px', height: '300px' }} />
            <div style={{ ...styles.blob, bottom: '5%', left: '40%', animationDelay: '4s', width: '200px', height: '200px' }} />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.12; }
                    50% { transform: translateY(-20px) scale(1.05); opacity: 0.2; }
                }
                input:focus {
                    border-color: #f59e0b !important;
                     box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
                }
                .login-btn:hover {
                    background-color: #d97706 !important;
                    transform: translateY(-1px);
                }
                .login-btn:active { transform: translateY(0px); }
            `}</style>

            <div style={{
                ...styles.card,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <div style={styles.wordmark}>AutoDrop</div>
                <h2 style={styles.title}>Bine ai revenit!</h2>
                <p style={styles.subtitle}>Autentifică-te în contul tău</p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>EMAIL</label>
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        placeholder="exemplu@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <label style={styles.label}>PAROLĂ</label>
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="••••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <div style={styles.forgotRow}>
                        <span style={styles.forgotLink}>Ai uitat parola?</span>
                    </div>
                    <button className="login-btn" style={styles.button} type="submit">
                        Autentificare
                    </button>
                </form>

                <div style={styles.divider} />
                <p style={styles.registerText}>
                    Nu ai cont?{' '}
                    <Link to="/register" style={styles.registerLink}>Înregistrează-te</Link>
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
        padding: '44px 40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #1f1f1f',
        position: 'relative',
        zIndex: 1,
    },
    wordmark: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '28px',
    },
    title: {
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '700',
        textAlign: 'center',
        margin: '0 0 8px 0',
    },
    subtitle: {
        color: '#555555',
        fontSize: '14px',
        textAlign: 'center',
        margin: '0 0 32px 0',
    },
    errorBox: {
        backgroundColor: '#1a0a0a',
        border: '1px solid #3d1515',
        color: '#ff6b6b',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        marginBottom: '20px',
        textAlign: 'center',
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
        padding: '14px 16px',
        backgroundColor: '#0d0d0d',
        border: '1px solid #1f1f1f',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '14px',
        marginBottom: '20px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    forgotRow: {
        textAlign: 'right',
        marginBottom: '20px',
        marginTop: '-12px',
    },
    forgotLink: {
        color: '#444444',
        fontSize: '13px',
        cursor: 'pointer',
    },
    button: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#f59e0b',
        color: '#0a1628',
        fontWeight: '700',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        transition: 'all 0.2s ease',
    },
    divider: {
        height: '1px',
        backgroundColor: '#1a1a1a',
        margin: '28px 0',
    },
    registerText: {
        textAlign: 'center',
        color: '#444444',
        fontSize: '14px',
        margin: 0,
    },
    registerLink: {
        color: '#f59e0b',
        textDecoration: 'none',
        fontWeight: '600',
    },
};

export default Login;