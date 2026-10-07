import { useState, useEffect } from 'react';
import api from '../services/api';
import { BASE_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Custom hook: returns current window width
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

function MyRequests() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState({});
    const [expandedRequest, setExpandedRequest] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests/my');
            setRequests(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPhotos = async (requestId, deliveryId) => {
        if (photos[requestId]) {
            setExpandedRequest(expandedRequest === requestId ? null : requestId);
            return;
        }
        try {
            const res = await api.get(`/photos/${deliveryId}`);
            setPhotos(prev => ({ ...prev, [requestId]: res.data }));
            setExpandedRequest(requestId);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const getStatus = (status) => {
        switch (status) {
            case 'pending': return { text: 'În așteptare', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
            case 'approved': return { text: 'Aprobată', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
            case 'in_progress': return { text: 'În curs de livrare', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
            case 'delivered': return { text: 'Livrată', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
            case 'delivered_with_damage': return { text: 'Livrată cu daune', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
            case 'rejected': return { text: 'Respinsă', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
            default: return { text: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        }
    };

    return (
        <div style={ isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page }>
            <style>{`
                html, body, #root { overflow-x: hidden !important; }
                .nav-link:hover { color: #f59e0b !important; }
                .logout-btn:hover { background: #1e3a5f !important; }
                .photos-btn:hover { border-color: #f59e0b !important; color: #f59e0b !important; }
                .explore-btn:hover { background: #1e3a5f !important; }
            `}</style>

            <div style={ isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px', boxSizing: 'border-box', width: '100%' } : styles.navbar }>
                <div style={ isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo }>AUTODROP</div>
                <div style={ isMobile ? { ...styles.navLinks, width: '100%', gap: '10px', flexDirection: 'column', alignItems: 'flex-start', flexWrap: 'wrap' } : styles.navLinks }>
                    <span className="nav-link" style={styles.navLink} onClick={() => navigate('/cars')}>Catalog</span>
                    <span style={styles.navLinkActive}>Cererile mele</span>
                    <div style={ isMobile ? { ...styles.navDivider, display: 'none' } : styles.navDivider } />
                    <div style={styles.navUser}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Bună, {user?.name?.split(' ')[0]}!</span>
                        <button className="logout-btn" style={styles.logoutBtn} onClick={handleLogout}>Deconectare</button>
                    </div>
                </div>
            </div>

            <div style={ isMobile ? { ...styles.content, padding: '16px' } : styles.content }>
                <div style={ isMobile ? { ...styles.pageHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '12px' } : styles.pageHeader }>
                    <div>
                        <h1 style={ isMobile ? { ...styles.pageTitle, fontSize: '20px' } : styles.pageTitle }>Cererile Mele</h1>
                        <p style={styles.pageSubtitle}>Urmărește statusul livrărilor tale</p>
                    </div>
                    <button style={ isMobile ? { ...styles.newRequestBtn, width: '100%', padding: '12px 16px' } : styles.newRequestBtn } onClick={() => navigate('/cars')}>
                        + Cerere nouă
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loadingWrap}>
                        <p style={styles.loadingText}>Se încarcă...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div style={styles.emptyWrap}>
                        <div style={styles.emptyIcon}>📦</div>
                        <h3 style={styles.emptyTitle}>Nicio cerere încă</h3>
                        <p style={styles.emptyText}>Explorează catalogul și solicită prima ta livrare.</p>
                        <button className="explore-btn" style={styles.exploreBtn} onClick={() => navigate('/cars')}>
                            Explorează Mașini
                        </button>
                    </div>
                ) : (
                    <div style={ isMobile ? { ...styles.list, gap: '12px' } : styles.list }>
                        {requests.map(req => {
                            const status = getStatus(req.status);
                            const reqPhotos = photos[req.id] || [];
                            const pickupPhotos = reqPhotos.filter(p => p.type === 'pickup');
                            const deliveryPhotos = reqPhotos.filter(p => p.type === 'delivery');
                            const hasPhotos = ['delivered', 'delivered_with_damage', 'in_progress'].includes(req.status);

                            return (
                                <div key={req.id} style={styles.card}>
                                    <div style={ isMobile ? { ...styles.cardTop, flexDirection: 'column', alignItems: 'flex-start', gap: '10px', padding: '12px' } : styles.cardTop }>
                                        <img
                                            src={req.image_url?.startsWith('/uploads') ? `${BASE_URL}${req.image_url}` : req.image_url || 'https://via.placeholder.com/120x80?text=AutoDrop'}
                                            alt={`${req.brand} ${req.model}`}
                                            style={ isMobile ? { ...styles.carImage, width: '100%', height: '160px', objectFit: 'cover' } : styles.carImage }
                                        />
                                        <div style={styles.cardInfo}>
                                            <h3 style={styles.carTitle}>{req.brand} {req.model} ({req.year})</h3>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detail}>📍 {req.delivery_address}</span>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detail}>📅 {new Date(req.created_at).toLocaleDateString('ro-RO')}</span>
                                                {req.delivery_cost && (
                                                    <span style={styles.costBadge}>
                                                        💰 {Number(req.delivery_cost).toLocaleString()} RON
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={ isMobile ? { ...styles.cardRight, alignItems: 'flex-start' } : styles.cardRight }>
                                            <span style={{ ...styles.statusBadge, backgroundColor: status.bg, color: status.color, border: `0.5px solid ${status.border}` }}>
                                                {status.text}
                                            </span>
                                            {hasPhotos && req.delivery_id && (
                                                <button className="photos-btn" style={styles.photosBtn} onClick={() => fetchPhotos(req.id, req.delivery_id)}>
                                                    {expandedRequest === req.id ? '▲ Ascunde' : '📷 Vezi poze'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                     {req.status === 'delivered_with_damage' && req.damage_description && (
                                            <div style={{
                                                marginTop: '10px',
                                                padding: '10px 14px',
                                                backgroundColor: '#fef2f2',
                                                border: '0.5px solid #fecaca',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                color: '#dc2626'
                                            }}>
                                                ⚠️ <strong>Raport daune:</strong> {req.damage_description}
                                            </div>
                                     )}           
                                    {expandedRequest === req.id && (
                                        <div style={ isMobile ? { ...styles.photosSection, padding: '12px', boxSizing: 'border-box' } : styles.photosSection }>
                                            {pickupPhotos.length > 0 && (
                                                <div style={styles.photoGroup}>
                                                    <p style={styles.photoGroupTitle}>📷 Poze la preluare</p>
                                                    <div style={ isMobile ? { ...styles.photoGrid, gap: '8px', alignItems: 'flex-start' } : styles.photoGrid }>
                                                        {pickupPhotos.map(photo => (
                                                            <img key={photo.id} src={`${BASE_URL}${photo.photo_url}`} alt="Preluare" style={ isMobile ? { ...styles.photo, width: '48%' } : styles.photo } onClick={() => window.open(`${BASE_URL}${photo.photo_url}`, '_blank')} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {deliveryPhotos.length > 0 && (
                                                <div style={styles.photoGroup}>
                                                    <p style={styles.photoGroupTitle}>📷 Poze la livrare</p>
                                                    <div style={ isMobile ? { ...styles.photoGrid, gap: '8px', alignItems: 'flex-start' } : styles.photoGrid }>
                                                        {deliveryPhotos.map(photo => (
                                                            <img key={photo.id} src={`${BASE_URL}${photo.photo_url}`} alt="Livrare" style={ isMobile ? { ...styles.photo, width: '48%' } : styles.photo } onClick={() => window.open(`${BASE_URL}${photo.photo_url}`, '_blank')} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {reqPhotos.length === 0 && (
                                                <p style={styles.noPhotos}>Nu există poze încărcate încă.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
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
    navLinks: { display: 'flex', alignItems: 'center', gap: '24px' },
    navLinkActive: { fontSize: '13px', color: '#f1f5f9', fontWeight: '500', cursor: 'pointer' },
    navLink: { fontSize: '13px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' },
    navDivider: { width: '1px', height: '20px', backgroundColor: '#1e3a5f' },
    navUser: { display: 'flex', alignItems: 'center', gap: '12px' },
    logoutBtn: {
        padding: '6px 14px', backgroundColor: 'transparent',
        border: '0.5px solid #1e3a5f', borderRadius: '8px',
        color: '#94a3b8', fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s',
    },
    content: { padding: '32px 40px', maxWidth: '1000px', margin: '0 auto' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
    pageTitle: { fontSize: '24px', fontWeight: '600', color: '#0a1628', margin: '0 0 4px 0' },
    pageSubtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
    newRequestBtn: {
        padding: '10px 20px', backgroundColor: '#f59e0b',
        color: '#0a1628', border: 'none', borderRadius: '10px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    },
    loadingWrap: { textAlign: 'center', padding: '60px 0' },
    loadingText: { color: '#94a3b8', fontSize: '14px' },
    emptyWrap: { textAlign: 'center', padding: '80px 0' },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' },
    emptyText: { fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' },
    exploreBtn: {
        padding: '12px 28px', backgroundColor: '#0a1628',
        color: 'white', border: 'none', borderRadius: '10px',
        fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '14px' },
    card: { backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', overflow: 'hidden' },
    cardTop: { padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' },
    carImage: { width: '110px', height: '75px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
    cardInfo: { flex: 1 },
    carTitle: { fontSize: '15px', fontWeight: '600', color: '#0a1628', margin: '0 0 6px 0' },
    detailRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
    detail: { fontSize: '13px', color: '#64748b' },
    costBadge: {
        fontSize: '12px', padding: '2px 10px', borderRadius: '20px',
        backgroundColor: '#f0fdf4', color: '#16a34a', border: '0.5px solid #bbf7d0',
    },
    cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 },
    statusBadge: {
        display: 'inline-block', padding: '4px 14px',
        borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    },
    photosBtn: {
        padding: '7px 14px', backgroundColor: 'transparent',
        border: '0.5px solid #e2e8f0', borderRadius: '8px',
        cursor: 'pointer', fontSize: '12px', color: '#64748b',
        transition: 'border-color 0.2s, color 0.2s',
    },
    photosSection: { borderTop: '0.5px solid #f1f5f9', padding: '16px 20px', backgroundColor: '#fafafa' },
    photoGroup: { marginBottom: '14px' },
    photoGroupTitle: { fontSize: '13px', fontWeight: '600', color: '#0a1628', margin: '0 0 10px 0' },
    photoGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    photo: {
        width: '140px', height: '95px', objectFit: 'cover',
        borderRadius: '8px', border: '0.5px solid #e2e8f0', cursor: 'pointer',
    },
    noPhotos: { fontSize: '13px', color: '#94a3b8' },
};

export default MyRequests;