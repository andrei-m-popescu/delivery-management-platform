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

function AdminDashboard() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const [requests, setRequests] = useState([]);
    const [deliverers, setDeliverers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedDeliverer, setSelectedDeliverer] = useState('');
    const [deliveryCost, setDeliveryCost] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDeliverer, setFilterDeliverer] = useState('all');
    const [showReportModal, setShowReportModal] = useState(false);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportStats, setReportStats] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchRequests(filterStatus, filterDeliverer);
        fetchDeliverers();
    }, [filterStatus, filterDeliverer]);

    const fetchRequests = async (status = 'all', delivererId = 'all') => {
        setRequests([]);
        try {
            let url = '/requests/all';
            const params = [];
            if (status !== 'all') params.push(`status=${status}`);
            if (delivererId !== 'all') params.push(`deliverer_id=${delivererId}`);
            if (params.length > 0) url += `?${params.join('&')}`;
            const res = await api.get(url);
            setRequests(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchDeliverers = async () => {
        try {
            const res = await api.get('/auth/deliverers');
            setDeliverers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleApprove = async () => {
        if (!selectedDeliverer) return alert('Selectează un livrator!');
        if (!deliveryCost) return alert('Introdu costul de livrare!');
        try {
            await api.put(`/requests/${selectedRequest.id}/approve`, {
                deliverer_id: selectedDeliverer, delivery_cost: deliveryCost
            });
            alert('Cerere aprobată și livrator asignat!');
            setSelectedRequest(null); setSelectedDeliverer(''); setDeliveryCost('');
            fetchRequests(filterStatus, filterDeliverer);
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Ești sigur că vrei să respingi această cerere?')) return;
        try {
            await api.put(`/requests/${requestId}/reject`);
            fetchRequests(filterStatus, filterDeliverer);
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const handleGenerateReport = async () => {
        setShowReportModal(true);
        setReportLoading(true);
        setReport(null);
        try {
            const res = await api.get('/reports/generate');
            setReport(res.data.report);
            setReportStats(res.data.stats);
        } catch (err) {
            console.error(err);
            setReport('Eroare la generarea raportului. Incearca din nou.');
        } finally {
            setReportLoading(false);
}
    };

    const getStatus = (status) => {
        switch (status) {
            case 'pending': return { text: 'În așteptare', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
            case 'approved': return { text: 'Aprobată', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
            case 'in_progress': return { text: 'În curs', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
            case 'delivered': return { text: 'Livrată', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
            case 'delivered_with_damage': return { text: 'Livr. cu daune', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
            case 'rejected': return { text: 'Respinsă', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
            default: return { text: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        }
    };

    const stats = {
        today: requests.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length,
        pending: requests.filter(r => r.status === 'pending').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        delivered: requests.filter(r => r.status === 'delivered' || r.status === 'delivered_with_damage').length,
    };

    return (
        <div style={isMobile ? { ...styles.page, overflowX: 'hidden', boxSizing: 'border-box', width: '100%' } : styles.page}>
            <style>{`
                .nav-tab:hover { color: #f1f5f9 !important; }
                .nav-tab-active { border-bottom: 2px solid #f59e0b; }
                .approve-btn:hover { background: #15803d !important; }
                .reject-btn:hover { background: #475569 !important; }
                select:focus { outline: none; border-color: #f59e0b !important; }
            `}</style>

            <div style={isMobile ? { ...styles.navbar, height: 'auto', padding: '8px 12px', width: '100%', boxSizing: 'border-box' } : styles.navbar}>
                <div style={isMobile ? { ...styles.navLogo, fontSize: '13px' } : styles.navLogo}>AUTODROP</div>
                <div style={isMobile ? { ...styles.navLinks, width: '100%', gap: '8px', flexDirection: 'column', alignItems: 'flex-start', flexWrap: 'wrap' } : styles.navLinks}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="nav-tab nav-tab-active" style={styles.navTabActive} onClick={() => navigate('/admin/dashboard')}>Toate cererile</span>
                        <span className="nav-tab" style={styles.navTab} onClick={() => navigate('/admin/cars')}>Catalog</span>
                        <span className="nav-tab" style={styles.navTab} onClick={() => navigate('/admin/users')}>Utilizatori</span>
                        <div style={styles.navDivider} />
                        <span style={styles.navUser}>Bună, {user?.name?.split(' ')[0]}!</span>
                        <button style={styles.logoutBtn} onClick={handleLogout}>Deconectare</button>
                    </div>
                </div>
            </div>

            <div style={isMobile ? { ...styles.content, padding: '16px' } : styles.content}>
                <div style={isMobile ? { ...styles.statsRow, gridTemplateColumns: '1fr', gap: '12px' } : styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📦</div>
                        <div style={styles.statLabel}>Livrări azi</div>
                        <div style={styles.statValue}>{stats.today}</div>
                    </div>
                    <div style={{ ...styles.statCard, borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
                        <div style={styles.statIcon}>🕐</div>
                        <div style={{ ...styles.statLabel, color: '#b45309' }}>Cereri noi</div>
                        <div style={{ ...styles.statValue, color: '#b45309' }}>{stats.pending}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🚗</div>
                        <div style={styles.statLabel}>În curs</div>
                        <div style={styles.statValue}>{stats.inProgress}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <div style={styles.statLabel}>Livrate total</div>
                        <div style={styles.statValue}>{stats.delivered}</div>
                    </div>
                </div>

                <div style={isMobile ? { ...styles.tableCard, overflowX: 'auto' } : styles.tableCard}>
                    <div style={styles.tableHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={styles.tableTitle}>Toate Cererile</h2>
                            <button
                                onClick={handleGenerateReport}
                                style={{
                                    padding: '7px 16px',
                                    backgroundColor: '#0a1628',
                                    color: '#f59e0b',
                                    border: '0.5px solid #f59e0b',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                ✨ Raport AI
                            </button>
                        </div>
                        <div style={styles.filters}>
                            <select style={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="all">Toate statusurile</option>
                                <option value="pending">În așteptare</option>
                                <option value="approved">Aprobate</option>
                                <option value="in_progress">În curs</option>
                                <option value="delivered">Livrate</option>
                                <option value="delivered_with_damage">Livrate cu daune</option>
                                <option value="rejected">Respinse</option>
                            </select>
                            <select style={styles.filterSelect} value={filterDeliverer} onChange={e => setFilterDeliverer(e.target.value)}>
                                <option value="all">Toți livratorii</option>
                                {deliverers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={isMobile ? { ...styles.colHeader, display: 'none' } : styles.colHeader}>
                        <span>Mașină</span><span>Client</span><span>Adresă</span><span>Data</span><span>Status</span><span>Acțiuni</span>
                    </div>

                    {loading ? <p style={styles.loadingText}>Se încarcă...</p> :
                        requests.length === 0 ? <p style={styles.loadingText}>Nu există cereri.</p> :
                            requests.map(req => {
                                const status = getStatus(req.status);
                                return (
                                    <div key={req.id} style={isMobile ? { padding: '12px', borderBottom: '0.5px solid #f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' } : styles.row}>
                                        <div>
                                            <div style={styles.rowPrimary}>{req.brand} {req.model}</div>
                                            <div style={styles.rowSec}>{req.year}</div>
                                        </div>
                                        <div>
                                            <div style={styles.rowPrimary}>{req.client_name}</div>
                                            <div style={styles.rowSec}>{req.client_phone}</div>
                                        </div>
                                        <div style={{ ...styles.rowSec, fontSize: '12px' }}>
                                            {req.delivery_address}
                                        </div>
                                        <div style={styles.rowSec}>
                                            {new Date(req.created_at).toLocaleDateString('ro-RO')}
                                        </div>
                                        <div>
                                            <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color, border: `0.5px solid ${status.border}` }}>
                                                {status.text}
                                            </span>
                                            {req.delivery_cost && (
                                                <div style={styles.costText}>💰 {Number(req.delivery_cost).toLocaleString()} RON</div>
                                            )}
                                            {req.status === 'delivered_with_damage' && req.damage_description && (
                                            <div style={{
                                                marginTop: '6px',
                                                padding: '6px 10px',
                                                backgroundColor: '#fef2f2',
                                                border: '0.5px solid #fecaca',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                color: '#dc2626'
                                            }}>
                                                ⚠️ {req.damage_description}
                                            </div>
                                        )}
                                        </div>
                                        <div style={styles.rowActions}>
                                            {req.status === 'pending' && (
                                                <>
                                                    <button className="approve-btn" style={styles.approveBtn} onClick={() => setSelectedRequest(req)}>Aprobă</button>
                                                    <button className="reject-btn" style={styles.rejectBtn} onClick={() => handleReject(req.id)}>Respinge</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    }
                </div>
            </div>

            {selectedRequest && (
                <div style={styles.overlay} onClick={() => setSelectedRequest(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>Aprobă Cererea</h3>
                        <div style={styles.modalInfo}>
                            <p style={styles.modalCar}>{selectedRequest.brand} {selectedRequest.model} ({selectedRequest.year})</p>
                            <p style={styles.modalDetail}>👤 {selectedRequest.client_name} · {selectedRequest.client_phone}</p>
                            <p style={styles.modalDetail}>📍 {selectedRequest.delivery_address}</p>
                            <p style={styles.modalDetail}>📅 {new Date(selectedRequest.created_at).toLocaleDateString('ro-RO')}</p>
                        </div>
                        <div style={styles.modalDivider} />
                        <label style={styles.modalLabel}>SELECTEAZĂ LIVRATORUL</label>
                        <select style={styles.modalSelect} value={selectedDeliverer} onChange={e => setSelectedDeliverer(e.target.value)}>
                            <option value="">-- Alege livrator --</option>
                            {deliverers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
                        </select>
                        <label style={styles.modalLabel}>COST LIVRARE (RON)</label>
                        <input style={styles.modalInput} type="number" placeholder="Ex: 250" value={deliveryCost} onChange={e => setDeliveryCost(e.target.value)} />
                        <div style={styles.modalButtons}>
                            <button style={styles.cancelBtn} onClick={() => { setSelectedRequest(null); setDeliveryCost(''); }}>Anulează</button>
                            <button style={styles.confirmBtn} onClick={handleApprove}>Confirmă</button>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div style={styles.overlay} onClick={() => setShowReportModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '640px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: 0 }}>✨ Raport AI — AutoDrop</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                            >✕</button>
                        </div>

                        {reportLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Se generează raportul...</p>
                            </div>
                        ) : (
                            <>
                                {reportStats && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#0a1628' }}>{reportStats.totalRequests}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>Total cereri</div>
                                        </div>
                                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>{reportStats.delivered}</div>
                                            <div style={{ fontSize: '11px', color: '#16a34a' }}>Livrate</div>
                                        </div>
                                        <div style={{ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>{reportStats.withDamage}</div>
                                            <div style={{ fontSize: '11px', color: '#dc2626' }}>Cu daune</div>
                                        </div>
                                    </div>
                                )}
                               <div style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    fontSize: '14px',
                                    lineHeight: '1.8',
                                    color: '#0a1628',
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: report
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br/>')
                                }}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
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
    navLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
    navTabActive: { fontSize: '13px', color: '#f1f5f9', fontWeight: '500', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f59e0b' },
    navTab: { fontSize: '13px', color: '#94a3b8', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' },
    navDivider: { width: '1px', height: '20px', backgroundColor: '#1e3a5f', margin: '0 8px' },
    navUser: { fontSize: '13px', color: '#94a3b8' },
    logoutBtn: { padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', marginLeft: '8px' },
    content: { padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
    statCard: { backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' },
    statIcon: { fontSize: '20px', marginBottom: '4px' },
    statLabel: { fontSize: '12px', color: '#64748b' },
    statValue: { fontSize: '24px', fontWeight: '600', color: '#0a1628' },
    tableCard: { backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', overflow: 'hidden' },
    tableHeader: { padding: '16px 20px', borderBottom: '0.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tableTitle: { fontSize: '15px', fontWeight: '600', color: '#0a1628', margin: 0 },
    filters: { display: 'flex', gap: '10px' },
    filterSelect: { padding: '7px 12px', borderRadius: '8px', border: '0.5px solid #e2e8f0', fontSize: '13px', color: '#0a1628', cursor: 'pointer', backgroundColor: '#f8fafc' },
    colHeader: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 1fr 1.2fr 1fr', padding: '10px 20px', backgroundColor: '#f8fafc', borderBottom: '0.5px solid #f1f5f9', fontSize: '11px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px' },
    row: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2fr 1fr 1.2fr 1fr', padding: '14px 20px', borderBottom: '0.5px solid #f8fafc', alignItems: 'center' },
    rowPrimary: { fontSize: '13px', fontWeight: '500', color: '#0a1628' },
    rowSec: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
    costText: { fontSize: '11px', color: '#16a34a', marginTop: '4px' },
    rowActions: { display: 'flex', gap: '6px' },
    approveBtn: { padding: '5px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' },
    rejectBtn: { padding: '5px 12px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s' },
    loadingText: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '40px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,22,40,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '460px' },
    modalTitle: { fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 16px 0' },
    modalInfo: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px' },
    modalCar: { fontSize: '14px', fontWeight: '600', color: '#0a1628', margin: '0 0 6px 0' },
    modalDetail: { fontSize: '13px', color: '#64748b', margin: '3px 0' },
    modalDivider: { height: '0.5px', backgroundColor: '#e2e8f0', margin: '16px 0' },
    modalLabel: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' },
    modalSelect: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', marginBottom: '16px', backgroundColor: '#f8fafc', color: '#0a1628' },
    modalInput: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' },
    modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    cancelBtn: { padding: '10px 20px', backgroundColor: '#f8fafc', color: '#64748b', border: '0.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' },
    confirmBtn: { padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
};

export default AdminDashboard;