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

function ClientDashboard() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [totalRequests, setTotalRequests] = useState(0);
    const [activeRequest, setActiveRequest] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get('/requests/my');
                const requests = res.data;
                setTotalRequests(requests.length);
                const active = requests.find(r =>
                    r.status === 'pending' || r.status === 'approved' || r.status === 'in_progress'
                );
                setActiveRequest(active || null);
            } catch (err) { console.error(err); }
        };
        fetchRequests();
    }, []);

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const cards = [
        {
            icon: '🚗',
            title: 'Catalog Mașini',
            desc: 'Explorează mașinile disponibile și solicită livrarea la adresa ta.',
            action: () => navigate('/cars'),
            label: 'Explorează →',
        },
        {
            icon: '📦',
            title: 'Cererile Mele',
            desc: 'Urmărește statusul livrărilor tale și vizualizează pozele documentate.',
            action: () => navigate('/my-requests'),
            label: 'Vezi cererile →',
            badge: activeRequest ? '1 activă' : totalRequests > 0 ? `${totalRequests} total` : null,
        },
        {
            icon: '🔑',
            title: 'Schimbare Parolă',
            desc: 'Actualizează parola contului tău pentru a-ți menține securitatea.',
            action: () => navigate('/change-password'),
            label: 'Modifică →',
        },
        {
            icon: '🗑️',
            title: 'Ștergere Cont',
            desc: 'Șterge definitiv contul și toate datele asociate acestuia.',
            action: () => navigate('/delete-account'),
            label: 'Șterge cont →',
            danger: true,
        },
    ];

    return (
        <div style={ isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page }>
            <style>{`
                .nav-link:hover { color: #f59e0b !important; }
                .logout-btn:hover { background: #1e3a5f !important; }
                .dash-card:hover { border-color: #f59e0b !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(245,158,11,0.12) !important; }
                .dash-card { transition: all 0.2s ease; }
                .danger-card:hover { border-color: #dc2626 !important; transform: translateY(-3px); }
                .danger-card { transition: all 0.2s ease; }
            `}</style>

            <div style={ isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px', width: '100%', boxSizing: 'border-box' } : styles.navbar }>
                <div style={ isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo }>AUTODROP</div>
                <div style={ isMobile ? { ...styles.navLinks, width: '100%', gap: '10px', flexDirection: 'column', alignItems: 'flex-start', flexWrap: 'wrap' } : styles.navLinks }>
                    <span className="nav-link" style={styles.navLink} onClick={() => navigate('/cars')}>Catalog</span>
                    <span className="nav-link" style={styles.navLink} onClick={() => navigate('/my-requests')}>Cererile mele</span>
                    <div style={ isMobile ? { ...styles.navDivider, display: 'none' } : styles.navDivider } />
                    <span style={styles.navUser}>Bună, {user?.name?.split(' ')[0]}!</span>
                    <button className="logout-btn" style={styles.logoutBtn} onClick={handleLogout}>Deconectare</button>
                </div>
            </div>

            <div style={ isMobile ? { ...styles.content, padding: '32px 16px' } : styles.content }>
                <div style={ isMobile ? { ...styles.pageHeader, textAlign: 'left', marginBottom: '24px' } : styles.pageHeader }>
                    <h1 style={ isMobile ? { ...styles.pageTitle, fontSize: '22px' } : styles.pageTitle }>Bună, {user?.name?.split(' ')[0]}!</h1>
                    <p style={styles.pageSubtitle}>
                        Gestionează livrările tale auto din contul tău.
                    </p>
                </div>

                <div style={ isMobile ? { ...styles.grid, gridTemplateColumns: '1fr', gap: '12px', maxWidth: '100%' } : styles.grid }>
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className={card.danger ? 'danger-card' : 'dash-card'}
                            style={card.danger ? styles.dangerCard : styles.card}
                            onClick={card.action}
                        >
                            <div style={styles.cardTop}>
                                <div style={{
                                    ...styles.iconWrap,
                                    backgroundColor: card.danger ? '#fef2f2' : '#fffbeb',
                                }}>
                                    <span style={styles.icon}>{card.icon}</span>
                                </div>
                                {card.badge && (
                                    <span style={styles.badge}>{card.badge}</span>
                                )}
                            </div>
                            <h3 style={card.danger ? styles.dangerTitle : styles.cardTitle}>
                                {card.title}
                            </h3>
                            <p style={styles.cardDesc}>{card.desc}</p>
                            <span style={card.danger ? styles.dangerLabel : styles.cardLabel}>
                                {card.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    navbar: {
        backgroundColor: '#0a1628', padding: '0 32px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
    },
    navLogo: { fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '24px' },
    navLink: { fontSize: '13px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' },
    navDivider: { width: '1px', height: '20px', backgroundColor: '#1e3a5f' },
    navUser: { fontSize: '13px', color: '#94a3b8' },
    logoutBtn: {
        padding: '6px 14px', backgroundColor: 'transparent',
        border: '0.5px solid #1e3a5f', borderRadius: '8px',
        color: '#94a3b8', fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s',
    },
    content: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '60px 20px', minHeight: 'calc(100vh - 56px)',
    },
    pageHeader: { textAlign: 'center', marginBottom: '48px' },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: '#0a1628', margin: '0 0 8px 0' },
    pageSubtitle: { fontSize: '15px', color: '#64748b', margin: 0 },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        width: '100%',
        maxWidth: '680px',
    },
    card: {
        backgroundColor: 'white', borderRadius: '16px',
        border: '0.5px solid #e2e8f0', padding: '28px',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px',
    },
    dangerCard: {
        backgroundColor: 'white', borderRadius: '16px',
        border: '0.5px solid #fecaca', padding: '28px',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px',
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
    iconWrap: {
        width: '48px', height: '48px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    icon: { fontSize: '24px' },
    badge: {
        fontSize: '11px', fontWeight: '600', padding: '3px 10px',
        borderRadius: '20px', backgroundColor: '#fffbeb',
        color: '#b45309', border: '0.5px solid #fde68a',
    },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#0a1628', margin: 0 },
    dangerTitle: { fontSize: '16px', fontWeight: '600', color: '#dc2626', margin: 0 },
    cardDesc: { fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6', flex: 1 },
    cardLabel: { fontSize: '13px', color: '#f59e0b', fontWeight: '600', marginTop: '4px' },
    dangerLabel: { fontSize: '13px', color: '#dc2626', fontWeight: '600', marginTop: '4px' },
};

export default ClientDashboard;