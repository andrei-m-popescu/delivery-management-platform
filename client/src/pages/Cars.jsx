import { useState, useEffect } from 'react';
import api from '../services/api';
import { BASE_URL } from '../services/api';
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

function Cars() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => { fetchCars(); }, []);

    const fetchCars = async () => {
        try {
            const res = await api.get('/cars');
            setCars(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCarClick = (car) => {
        if (car.status !== 'available') {
            setSelectedCar(car);
        } else {
            navigate(`/request-delivery/${car.id}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getStatus = (status) => {
        switch (status) {
            case 'available': return { text: 'Disponibil', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
            case 'reserved': return { text: 'Rezervat', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
            case 'delivered': return { text: 'Livrat', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
            default: return { text: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: 'hidden' }}>
            <style>{`
                .car-card:hover { transform: translateY(-3px); border-color: #f59e0b !important; }
                .car-card { transition: transform 0.2s ease, border-color 0.2s ease; }
                * { box-sizing: border-box; }
            `}</style>

            {/* Navbar */}
            <div style={{
                backgroundColor: '#0a1628',
                padding: isMobile ? '0 16px' : '0 32px',
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                {isMobile ? (
                    // Mobile navbar
                    <div>
                        <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' }}>AUTODROP</div>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#f1f5f9', fontSize: '20px' }}
                            >
                                {menuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                        {menuOpen && (
                            <div style={{ borderTop: '1px solid #1e3a5f', paddingBottom: '12px' }}>
                                <div style={{ padding: '12px 0', color: '#f1f5f9', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                                    Catalog
                                </div>
                                <div
                                    style={{ padding: '12px 0', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}
                                    onClick={() => { navigate('/my-requests'); setMenuOpen(false); }}
                                >
                                    Cererile mele
                                </div>
                                <div style={{ borderTop: '1px solid #1e3a5f', marginTop: '8px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Bună, {user?.name?.split(' ')[0]}!</span>
                                    <button
                                        onClick={handleLogout}
                                        style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        Deconectare
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Desktop navbar
                    <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' }}>AUTODROP</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500', cursor: 'pointer' }}>Catalog</span>
                            <span style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/my-requests')}>Cererile mele</span>
                            <div style={{ width: '1px', height: '20px', backgroundColor: '#1e3a5f' }} />
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Bună, {user?.name?.split(' ')[0]}!</span>
                            <button
                                onClick={handleLogout}
                                style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Deconectare
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: isMobile ? '16px' : '32px 40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '600', color: '#0a1628', margin: '0 0 4px 0' }}>Catalog Mașini</h1>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Alege mașina dorită și solicită livrarea la domiciliu</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#f0fdf4', border: '0.5px solid #bbf7d0', borderRadius: '20px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#16a34a' }}>{cars.filter(c => c.status === 'available').length}</span>
                        <span style={{ fontSize: '12px', color: '#16a34a' }}>disponibile</span>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', margin: '0 auto 12px' }} />
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Se încarcă catalogul...</p>
                    </div>
                ) : cars.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '60px 0' }}>Nu există mașini disponibile momentan.</p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: isMobile ? '12px' : '20px',
                    }}>
                        {cars.filter(car => car.status !== 'delivered').map(car => {
                            const status = getStatus(car.status);
                            return (
                                <div
                                    key={car.id}
                                    className="car-card"
                                    style={{ backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', cursor: 'pointer', overflow: 'hidden' }}
                                    onClick={() => handleCarClick(car)}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={car.image_url?.startsWith('/uploads') ? `${BASE_URL}${car.image_url}` : car.image_url || 'https://via.placeholder.com/400x240?text=AutoDrop'}
                                            alt={`${car.brand} ${car.model}`}
                                            style={{ width: '100%', height: isMobile ? '160px' : '170px', objectFit: 'cover', display: 'block' }}
                                        />
                                        <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', backgroundColor: status.bg, color: status.color, border: `0.5px solid ${status.border}` }}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <div style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0a1628', margin: '0 0 6px 0' }}>{car.brand} {car.model}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {car.year}</span>
                                            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>·</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>🎨 {car.color || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '17px', fontWeight: '700', color: '#0a1628' }}>€{Number(car.price).toLocaleString()}</span>
                                            {car.status === 'available' && (
                                                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>Comandă →</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedCar && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 22, 40, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedCar(null)}>
                    <div style={{ backgroundColor: 'white', padding: '36px 32px', borderRadius: '16px', textAlign: 'center', maxWidth: '380px', width: '90%' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚫</div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' }}>Mașină indisponibilă</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.6' }}>
                            Ne pare rău, <strong>{selectedCar.brand} {selectedCar.model}</strong> nu este disponibilă momentan.
                        </p>
                        <button style={{ padding: '10px 28px', backgroundColor: '#0a1628', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }} onClick={() => setSelectedCar(null)}>
                            Închide
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cars;