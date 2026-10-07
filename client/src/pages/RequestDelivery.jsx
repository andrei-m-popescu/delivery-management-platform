import { useState, useEffect } from 'react';
import api from '../services/api';
import { BASE_URL } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

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

function RequestDelivery() {
    const { carId } = useParams();
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const [car, setCar] = useState(null);
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchCar(); }, []);

    const fetchCar = async () => {
        try {
            const res = await api.get(`/cars/${carId}`);
            setCar(res.data);
        } catch { setError('Masina nu a fost gasita!'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post('/requests', { car_id: carId, delivery_address: address });
            setSuccess('Cerere trimisă cu succes! Vei fi redirecționat...');
            setTimeout(() => navigate('/my-requests'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare la trimiterea cererii!');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Se încarcă...</p>
        </div>
    );

    return (
        <div style={isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page}>
            <style>{`
                .submit-btn:hover { background: #d97706 !important; }
                textarea:focus { border-color: #f59e0b !important; outline: none; box-shadow: 0 0 0 3px rgba(245,158,11,0.15) !important; }
            `}</style>

            <div style={isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px', width: '100%', boxSizing: 'border-box' } : styles.navbar}>
                <div style={isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo}>AUTODROP</div>
                <div style={isMobile ? { display: 'flex', width: '100%', justifyContent: 'flex-end' } : {}}>
                    <button style={styles.backNavBtn} onClick={() => navigate('/cars')}>← Înapoi la catalog</button>
                </div>
            </div>

            <div style={isMobile ? { ...styles.content, padding: '20px' } : styles.content}>
                <div style={isMobile ? { ...styles.card, padding: '20px' } : styles.card}>
                    <h2 style={styles.title}>Cerere de Livrare</h2>

                    {car && (
                        <div style={isMobile ? { ...styles.carInfo, flexDirection: 'column', alignItems: 'flex-start', gap: '12px' } : styles.carInfo}>
                            <img
                                src={car.image_url?.startsWith('/uploads') ? `${BASE_URL}${car.image_url}` : car.image_url || 'https://via.placeholder.com/120x80?text=AutoDrop'}
                                alt={`${car.brand} ${car.model}`}
                                style={isMobile ? { ...styles.carImage, width: '100%', height: '200px', objectFit: 'cover' } : styles.carImage}
                            />
                            <div style={styles.carDetails}>
                                <h3 style={styles.carName}>{car.brand} {car.model}</h3>
                                <div style={styles.carMeta}>
                                    <span style={styles.metaItem}>📅 {car.year}</span>
                                    <span style={styles.metaDot}>·</span>
                                    <span style={styles.metaItem}>🎨 {car.color || 'N/A'}</span>
                                </div>
                                <span style={styles.carPrice}>€{Number(car.price).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {error && <div style={styles.errorBox}>{error}</div>}
                    {success && <div style={styles.successBox}>{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <label style={styles.label}>ADRESA DE LIVRARE</label>
                        <textarea
                            style={styles.textarea}
                            placeholder="Ex: Str. Exemplu nr. 10, București, Sector 1"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            required
                            rows={4}
                        />
                        <p style={styles.hint}>Introdu adresa completa unde doresti livrarea autoturismului.</p>
                        <button
                            className="submit-btn"
                            style={{
                                ...styles.button,
                                opacity: submitting ? 0.6 : 1,
                                cursor: submitting ? 'not-allowed' : 'pointer'
                            }}
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Se trimite...' : 'Trimite Cererea'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    navbar: {
        backgroundColor: '#0a1628', padding: '0 32px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
    },
    navLogo: { fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' },
    backNavBtn: {
        background: 'none', border: '0.5px solid #1e3a5f',
        color: '#94a3b8', cursor: 'pointer', fontSize: '13px',
        padding: '6px 14px', borderRadius: '8px',
    },
    content: { display: 'flex', justifyContent: 'center', padding: '40px 20px' },
    card: {
        backgroundColor: 'white', borderRadius: '16px',
        border: '0.5px solid #e2e8f0', padding: '36px',
        width: '100%', maxWidth: '520px',
    },
    title: { fontSize: '20px', fontWeight: '600', color: '#0a1628', margin: '0 0 24px 0' },
    carInfo: {
        display: 'flex', gap: '16px', alignItems: 'center',
        marginBottom: '28px', padding: '16px',
        backgroundColor: '#f8fafc', borderRadius: '12px',
        border: '0.5px solid #e2e8f0',
    },
    carImage: { width: '110px', height: '75px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
    carDetails: { flex: 1 },
    carName: { fontSize: '15px', fontWeight: '600', color: '#0a1628', margin: '0 0 6px 0' },
    carMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
    metaItem: { fontSize: '12px', color: '#64748b' },
    metaDot: { color: '#cbd5e1', fontSize: '12px' },
    carPrice: { fontSize: '16px', fontWeight: '700', color: '#0a1628' },
    errorBox: {
        backgroundColor: '#fef2f2', border: '0.5px solid #fecaca',
        color: '#dc2626', borderRadius: '10px', padding: '10px 14px',
        fontSize: '13px', marginBottom: '16px', textAlign: 'center',
    },
    successBox: {
        backgroundColor: '#f0fdf4', border: '0.5px solid #bbf7d0',
        color: '#16a34a', borderRadius: '10px', padding: '10px 14px',
        fontSize: '13px', marginBottom: '16px', textAlign: 'center',
    },
    label: {
        display: 'block', color: '#64748b', fontSize: '10px',
        fontWeight: '700', letterSpacing: '1.5px', marginBottom: '8px',
    },
    textarea: {
        width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc',
        border: '0.5px solid #e2e8f0', borderRadius: '12px',
        color: '#0a1628', fontSize: '14px', marginBottom: '8px',
        boxSizing: 'border-box', resize: 'vertical',
        transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
    },
    hint: { fontSize: '12px', color: '#94a3b8', margin: '0 0 20px 0' },
    button: {
        width: '100%', padding: '14px', backgroundColor: '#f59e0b',
        color: '#0a1628', border: 'none', borderRadius: '12px',
        fontSize: '15px', fontWeight: '700', cursor: 'pointer',
        transition: 'background 0.2s',
    },
};

export default RequestDelivery;