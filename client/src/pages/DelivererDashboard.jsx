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

function DelivererDashboard() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFor, setUploadingFor] = useState(null);
    const [uploadType, setUploadType] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [photos, setPhotos] = useState({});
    const [damageModal, setDamageModal] = useState(false);
    const [damageDeliveryId, setDamageDeliveryId] = useState(null);
    const [damageDescription, setDamageDescription] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchDeliveries(); }, []);

    const fetchDeliveries = async () => {
        try {
            const res = await api.get('/deliveries/my');
            setDeliveries(res.data);
            for (const del of res.data) { fetchPhotos(del.id); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPhotos = async (deliveryId) => {
        try {
            const res = await api.get(`/photos/${deliveryId}`);
            setPhotos(prev => ({ ...prev, [deliveryId]: res.data }));
        } catch (err) { console.error(err); }
    };

    const handleStart = async (deliveryId) => {
        try {
            await api.put(`/deliveries/${deliveryId}/start`, {});
            fetchDeliveries();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleComplete = async (deliveryId, withDamage = false) => {
        if (withDamage) { setDamageDeliveryId(deliveryId); setDamageModal(true); return; }
        try {
            await api.put(`/deliveries/${deliveryId}/complete`, { withDamage: false });
            fetchDeliveries();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleConfirmDamage = async () => {
        if (!damageDescription.trim()) return alert('Te rugam sa descrii daunele!');
        try {
            await api.put(`/deliveries/${damageDeliveryId}/complete`, { withDamage: true, damageDescription });
            setDamageModal(false); setDamageDescription(''); setDamageDeliveryId(null);
            fetchDeliveries();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleUploadPhotos = async () => {
        if (selectedFiles.length === 0) return alert('Selectează cel puțin o poză!');
        const formData = new FormData();
        formData.append('delivery_id', uploadingFor);
        formData.append('type', uploadType);
        for (const file of selectedFiles) { formData.append('photos', file); }
        try {
            await api.post('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Poze încărcate cu succes!');
            setUploadingFor(null); setSelectedFiles([]);
            fetchPhotos(uploadingFor);
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    const openMaps = (address) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');

    const getStatus = (status) => {
        switch (status) {
            case 'approved': return { text: 'Aprobată', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
            case 'in_progress': return { text: 'În curs', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
            case 'delivered': return { text: 'Livrată', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
            case 'delivered_with_damage': return { text: 'Livr. cu daune', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
            default: return { text: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        }
    };

    return (
        <div style={ isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page }>
            <style>{`
                html, body, #root { overflow-x: hidden !important; }
                .maps-btn:hover { background: #1e3a5f !important; }
                .start-btn:hover { background: #6b21a8 !important; }
                .complete-btn:hover { background: #15803d !important; }
                .damage-btn:hover { background: #991b1b !important; }
            `}</style>

            <div style={ isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px', width: '100%', boxSizing: 'border-box' } : styles.navbar }>
                <div style={ isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo }>AUTODROP</div>
                <div style={ isMobile ? { ...styles.navLinks, width: '100%', gap: '8px', flexDirection: 'column', alignItems: 'flex-start', flexWrap: 'wrap' } : styles.navLinks }>
                    <span style={styles.navTabActive}>Livrările mele</span>
                    <div style={ isMobile ? { ...styles.navDivider, display: 'none' } : styles.navDivider } />
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Bună, {user?.name?.split(' ')[0]}!</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={styles.changePassBtn} onClick={() => navigate('/change-password')}>Schimbă parola</button>
                        <button style={styles.logoutBtn} onClick={handleLogout}>Deconectare</button>
                    </div>
                </div>
            </div>

            <div style={ isMobile ? { ...styles.content, padding: '16px' } : styles.content }>
                <div style={ isMobile ? { ...styles.pageHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '12px' } : styles.pageHeader }>
                    <h1 style={ isMobile ? { ...styles.pageTitle, fontSize: '20px' } : styles.pageTitle }>Livrările Mele</h1>
                    <div style={ isMobile ? { ...styles.statsRow, width: '100%' } : styles.statsRow }>
                        <span style={styles.statPill}>
                            <span style={styles.statNum}>{deliveries.filter(d => d.request_status === 'approved' || d.request_status === 'in_progress').length}</span>
                            <span style={styles.statLabel}>active</span>
                        </span>
                    </div>
                </div>

                {loading ? <p style={styles.loadingText}>Se încarcă...</p> :
                    deliveries.length === 0 ? (
                        <div style={styles.emptyWrap}>
                            <div style={styles.emptyIcon}>🚗</div>
                            <h3 style={styles.emptyTitle}>Nicio livrare asignată</h3>
                            <p style={styles.emptyText}>Vei vedea livrările asignate de administrator aici.</p>
                        </div>
                    ) : (
                        <div style={ isMobile ? { ...styles.list, gap: '12px' } : styles.list }>
                            {deliveries.map(del => {
                                const status = getStatus(del.request_status);
                                const deliveryPhotos = photos[del.id] || [];
                                const pickupPhotos = deliveryPhotos.filter(p => p.type === 'pickup');
                                const deliveryPhotosList = deliveryPhotos.filter(p => p.type === 'delivery');

                                return (
                                    <div key={del.id} style={styles.card}>
                                        <div style={ isMobile ? { ...styles.cardTop, flexDirection: 'column', gap: '12px', padding: '12px' } : styles.cardTop }>
                                            <div style={styles.cardInfo}>
                                                <div style={styles.cardTitleRow}>
                                                    <h3 style={styles.carTitle}>{del.brand} {del.model} ({del.year})</h3>
                                                    <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color, border: `0.5px solid ${status.border}` }}>{status.text}</span>
                                                </div>
                                                <div style={styles.detailsGrid}>
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Client</span>
                                                        <span style={styles.detailValue}>{del.client_name}</span>
                                                    </div>
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Telefon</span>
                                                        <span style={styles.detailValue}>{del.client_phone}</span>
                                                    </div>
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Adresă livrare</span>
                                                        <span style={styles.detailValue}>{del.delivery_address}</span>
                                                    </div>
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Asignat la</span>
                                                        <span style={styles.detailValue}>{new Date(del.assigned_at).toLocaleDateString('ro-RO')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={ isMobile ? { ...styles.cardActions, minWidth: 'auto', alignItems: 'flex-start' } : styles.cardActions }>
                                                <button className="maps-btn" style={styles.mapsBtn} onClick={() => openMaps(del.delivery_address)}>
                                                    🗺️ Vezi Traseu
                                                </button>
                                                {del.request_status === 'approved' && (
                                                    <>
                                                        <button style={styles.uploadBtn} onClick={() => { setUploadingFor(del.id); setUploadType('pickup'); }}>
                                                            📷 Poze Preluare
                                                        </button>
                                                        <button className="start-btn" style={styles.startBtn} onClick={() => handleStart(del.id)}>
                                                            🚀 Start Livrare
                                                        </button>
                                                    </>
                                                )}
                                                {del.request_status === 'in_progress' && (
                                                    <>
                                                        <button style={styles.uploadBtn} onClick={() => { setUploadingFor(del.id); setUploadType('delivery'); }}>
                                                            📷 Poze Livrare
                                                        </button>
                                                        <button className="complete-btn" style={styles.completeBtn} onClick={() => handleComplete(del.id, false)}>
                                                            ✅ Marchează Livrat
                                                        </button>
                                                        <button className="damage-btn" style={styles.damageBtn} onClick={() => handleComplete(del.id, true)}>
                                                            ⚠️ Livrat cu Daune
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {(pickupPhotos.length > 0 || deliveryPhotosList.length > 0) && (
                                            <div style={styles.photosSection}>
                                                {pickupPhotos.length > 0 && (
                                                    <div style={styles.photoGroup}>
                                                        <p style={styles.photoTitle}>📷 Poze Preluare</p>
                                                        <div style={styles.photoGrid}>{pickupPhotos.map(photo => <img key={photo.id} src={`${BASE_URL}${photo.photo_url}`} alt="Preluare" style={styles.photo} />)}</div>
                                                    </div>
                                                )}
                                                {deliveryPhotosList.length > 0 && (
                                                    <div style={styles.photoGroup}>
                                                        <p style={styles.photoTitle}>📷 Poze Livrare</p>
                                                        <div style={styles.photoGrid}>{deliveryPhotosList.map(photo => <img key={photo.id} src={`${BASE_URL}${photo.photo_url}`} alt="Livrare" style={styles.photo} />)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </div>

            {damageModal && (
                <div style={styles.overlay} onClick={() => setDamageModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>⚠️ Raport Daune</h3>
                        <p style={styles.modalSubtitle}>Descrie daunele constatate la livrarea autoturismului:</p>
                        <textarea style={styles.damageTextarea} placeholder="Ex: Zgarietura pe aripa dreapta fata, aproximativ 10cm..." value={damageDescription} onChange={e => setDamageDescription(e.target.value)} rows={5} />
                        <div style={styles.modalButtons}>
                            <button style={styles.cancelBtn} onClick={() => { setDamageModal(false); setDamageDescription(''); }}>Anulează</button>
                            <button style={styles.damageConfirmBtn} onClick={handleConfirmDamage}>Confirma Daunele</button>
                        </div>
                    </div>
                </div>
            )}

            {uploadingFor && (
                <div style={styles.overlay} onClick={() => setUploadingFor(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>📷 Încarcă Poze — {uploadType === 'pickup' ? 'Preluare' : 'Livrare'}</h3>
                        <p style={styles.modalSubtitle}>Selectează pozele pentru documentare.</p>
                        <input type="file" multiple accept="image/*" onChange={e => setSelectedFiles(Array.from(e.target.files))} style={styles.fileInput} />
                        {selectedFiles.length > 0 && <p style={styles.fileCount}>✓ {selectedFiles.length} poză/poze selectată/e</p>}
                        <div style={styles.modalButtons}>
                            <button style={styles.cancelBtn} onClick={() => { setUploadingFor(null); setSelectedFiles([]); }}>Anulează</button>
                            <button style={styles.confirmBtn} onClick={handleUploadPhotos}>Încarcă</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    navbar: { backgroundColor: '#0a1628', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
    navLogo: { fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '12px' },
    navTabActive: { fontSize: '13px', color: '#f1f5f9', fontWeight: '500', padding: '0 8px', height: '56px', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f59e0b' },
    navDivider: { width: '1px', height: '20px', backgroundColor: '#1e3a5f' },
    changePassBtn: { padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' },
    logoutBtn: { padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' },
    content: { padding: '28px 32px', maxWidth: '1000px', margin: '0 auto' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    pageTitle: { fontSize: '22px', fontWeight: '600', color: '#0a1628', margin: 0 },
    statsRow: { display: 'flex', gap: '8px' },
    statPill: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#eff6ff', border: '0.5px solid #bfdbfe', borderRadius: '20px' },
    statNum: { fontSize: '15px', fontWeight: '600', color: '#1d4ed8' },
    statLabel: { fontSize: '12px', color: '#1d4ed8' },
    loadingText: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '60px 0' },
    emptyWrap: { textAlign: 'center', padding: '80px 0' },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' },
    emptyText: { fontSize: '14px', color: '#64748b', margin: 0 },
    list: { display: 'flex', flexDirection: 'column', gap: '14px' },
    card: { backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', overflow: 'hidden' },
    cardTop: { padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' },
    cardInfo: { flex: 1 },
    cardTitleRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' },
    carTitle: { fontSize: '15px', fontWeight: '600', color: '#0a1628', margin: 0 },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
    detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    detailItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
    detailLabel: { fontSize: '10px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' },
    detailValue: { fontSize: '13px', color: '#0a1628' },
    cardActions: { display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, minWidth: '160px' },
    mapsBtn: { padding: '8px 14px', backgroundColor: '#0a1628', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' },
    uploadBtn: { padding: '8px 14px', backgroundColor: '#fffbeb', color: '#b45309', border: '0.5px solid #fde68a', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
    startBtn: { padding: '8px 14px', backgroundColor: '#7e22ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' },
    completeBtn: { padding: '8px 14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' },
    damageBtn: { padding: '8px 14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' },
    photosSection: { borderTop: '0.5px solid #f1f5f9', padding: '16px 20px', backgroundColor: '#fafafa' },
    photoGroup: { marginBottom: '12px' },
    photoTitle: { fontSize: '12px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' },
    photoGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    photo: { width: '110px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '0.5px solid #e2e8f0' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,22,40,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '450px' },
    modalTitle: { fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' },
    modalSubtitle: { fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' },
    damageTextarea: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit', backgroundColor: '#f8fafc' },
    fileInput: { width: '100%', marginBottom: '12px' },
    fileCount: { fontSize: '13px', color: '#16a34a', marginBottom: '16px' },
    modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    cancelBtn: { padding: '10px 20px', backgroundColor: '#f8fafc', color: '#64748b', border: '0.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' },
    confirmBtn: { padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
    damageConfirmBtn: { padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
};

export default DelivererDashboard;