import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function useWindowSize() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

function ChangePassword() {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const width = useWindowSize();
    const isMobile = width < 768;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (formData.newPassword !== formData.confirmPassword) return setError('Parolele noi nu coincid!');
        if (formData.newPassword.length < 6) return setError('Parola trebuie sa aiba cel putin 6 caractere!');
        try {
            await api.put('/auth/change-password', { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
            setSuccess('Parola a fost schimbata cu succes!');
            setTimeout(() => {
                const role = user?.role;
                if (role === 'admin') navigate('/admin/dashboard');
                else if (role === 'deliverer') navigate('/deliverer/dashboard');
                else navigate('/cars');
            }, 2000);
        } catch (err) { setError(err.response?.data?.message || 'Eroare!'); }
    };

    const handleBack = () => {
        const role = user?.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'deliverer') navigate('/deliverer/dashboard');
        else navigate('/cars');
    };

    return (
        <div style={ isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page }>
            <style>{`
                input:focus { border-color: #f59e0b !important; outline: none; box-shadow: 0 0 0 3px rgba(245,158,11,0.15) !important; }
                .submit-btn:hover { background: #d97706 !important; }
            `}</style>

            <div style={ isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px' } : styles.navbar }>
                <div style={ isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo }>AUTODROP</div>
                <div style={ isMobile ? { display: 'flex', width: '100%', justifyContent: 'flex-end' } : {} }>
                    <button style={styles.backBtn} onClick={handleBack}>← Înapoi</button>
                </div>
            </div>

            <div style={ isMobile ? { ...styles.content, padding: '24px 16px' } : styles.content }>
                <div style={ isMobile ? { ...styles.card, padding: '20px', maxWidth: '100%' } : styles.card }>
                    <div style={styles.cardIcon}>🔑</div>
                    <h2 style={styles.title}>Schimbare Parolă</h2>
                    <p style={styles.subtitle}>Introdu parola curentă și noua parolă dorită.</p>

                    {error && <div style={styles.errorBox}>{error}</div>}
                    {success && <div style={styles.successBox}>{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <label style={styles.label}>PAROLA CURENTĂ</label>
                        <input style={styles.input} type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required />
                        <label style={styles.label}>PAROLA NOUĂ</label>
                        <input style={styles.input} type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
                        <label style={styles.label}>CONFIRMĂ PAROLA NOUĂ</label>
                        <input style={styles.input} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                        <button className="submit-btn" style={styles.button} type="submit">Schimbă Parola</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    navbar: { backgroundColor: '#0a1628', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
    navLogo: { fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' },
    backBtn: { background: 'none', border: '0.5px solid #1e3a5f', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', padding: '6px 14px', borderRadius: '8px' },
    content: { display: 'flex', justifyContent: 'center', padding: '60px 20px' },
    card: { backgroundColor: 'white', borderRadius: '16px', border: '0.5px solid #e2e8f0', padding: '40px', width: '100%', maxWidth: '420px' },
    cardIcon: { fontSize: '32px', textAlign: 'center', marginBottom: '12px' },
    title: { fontSize: '20px', fontWeight: '600', color: '#0a1628', textAlign: 'center', margin: '0 0 6px 0' },
    subtitle: { fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '0 0 28px 0' },
    errorBox: { backgroundColor: '#fef2f2', border: '0.5px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' },
    successBox: { backgroundColor: '#f0fdf4', border: '0.5px solid #bbf7d0', color: '#16a34a', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' },
    label: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' },
    input: { width: '100%', padding: '13px 16px', backgroundColor: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '12px', color: '#0a1628', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    button: { width: '100%', padding: '14px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s', marginTop: '4px' },
};

export default ChangePassword;