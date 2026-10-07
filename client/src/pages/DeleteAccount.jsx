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

function DeleteAccount() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;

    const handleDelete = async (e) => {
        e.preventDefault();
        setError('');
        if (!window.confirm('Ești sigur că vrei să îți ștergi contul? Această acțiune este ireversibilă!')) return;
        try {
            await api.delete('/auth/delete-account', { data: { password } });
            localStorage.clear();
            alert('Contul tau a fost sters cu succes!');
            navigate('/login');
        } catch (err) { setError(err.response?.data?.message || 'Eroare!'); }
    };

    return (
        <div style={ isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page }>
            <style>{`
                input:focus { border-color: #dc2626 !important; outline: none; box-shadow: 0 0 0 3px rgba(220,38,38,0.15) !important; }
                .delete-btn:hover { background: #991b1b !important; }
            `}</style>

            <div style={ isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px' } : styles.navbar }>
                <div style={ isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo }>AUTODROP</div>
                <div style={ isMobile ? { display: 'flex', width: '100%', justifyContent: 'flex-end' } : {} }>
                    <button style={styles.backBtn} onClick={() => navigate('/cars')}>← Înapoi</button>
                </div>
            </div>

            <div style={ isMobile ? { ...styles.content, padding: '24px 16px' } : styles.content }>
                <div style={ isMobile ? { ...styles.card, padding: '20px', maxWidth: '100%' } : styles.card }>
                    <div style={styles.cardIcon}>⚠️</div>
                    <h2 style={styles.title}>Ștergere Cont</h2>
                    <div style={styles.warningBox}>
                        <p style={styles.warningText}>Aceasta actiune este <strong>ireversibilă</strong>. Toate datele tale vor fi șterse permanent și nu vor putea fi recuperate.</p>
                    </div>

                    {error && <div style={styles.errorBox}>{error}</div>}

                    <form onSubmit={handleDelete}>
                        <label style={styles.label}>CONFIRMĂ CU PAROLA TA</label>
                        <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Introdu parola..." />
                        <button className="delete-btn" style={styles.deleteButton} type="submit">
                            Șterge Contul Definitiv
                        </button>
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
    card: { backgroundColor: 'white', borderRadius: '16px', border: '0.5px solid #fecaca', padding: '40px', width: '100%', maxWidth: '420px' },
    cardIcon: { fontSize: '32px', textAlign: 'center', marginBottom: '12px' },
    title: { fontSize: '20px', fontWeight: '600', color: '#dc2626', textAlign: 'center', margin: '0 0 20px 0' },
    warningBox: { backgroundColor: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' },
    warningText: { fontSize: '13px', color: '#dc2626', margin: 0, lineHeight: '1.6' },
    errorBox: { backgroundColor: '#fef2f2', border: '0.5px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' },
    label: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' },
    input: { width: '100%', padding: '13px 16px', backgroundColor: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '12px', color: '#0a1628', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    deleteButton: { width: '100%', padding: '14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
};

export default DeleteAccount;