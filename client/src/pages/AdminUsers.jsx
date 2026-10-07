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

function AdminUsers() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterRole, setFilterRole] = useState('all');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'deliverer' });
    const navigate = useNavigate();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/create-user', formData);
            alert('Cont creat cu succes!');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'deliverer' });
            fetchUsers();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ești sigur că vrei să ștergi acest cont?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            fetchUsers();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const getRole = (role) => {
        switch (role) {
            case 'client': return { text: 'Client', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
            case 'deliverer': return { text: 'Livrator', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
            case 'admin': return { text: 'Admin', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
            default: return { text: role, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        }
    };

    const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: 'hidden' }}>
            <style>{`
                * { box-sizing: border-box; }
                .filter-btn-active { background: #0a1628 !important; color: white !important; border-color: #0a1628 !important; }
                .add-btn:hover { background: #d97706 !important; }
                .nav-tab:hover { color: #f1f5f9 !important; }
            `}</style>

            {/* Navbar */}
            <div style={{ backgroundColor: '#0a1628', width: '100%', position: 'sticky', top: 0, zIndex: 100 }}>
                {isMobile ? (
                    <div style={{ padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' }}>AUTODROP</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span className="nav-tab" style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>Cereri</span>
                            <span className="nav-tab" style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/admin/cars')}>Catalog</span>
                            <span style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: '600', borderBottom: '2px solid #f59e0b', paddingBottom: '2px' }}>Utilizatori</span>
                            <button style={{ padding: '4px 10px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }}>Exit</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' }}>AUTODROP</div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="nav-tab" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/admin/dashboard')}>Toate cererile</span>
                            <span className="nav-tab" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/admin/cars')}>Catalog mașini</span>
                            <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f59e0b' }}>Utilizatori</span>
                            <div style={{ width: '1px', height: '20px', backgroundColor: '#1e3a5f', margin: '0 8px' }} />
                            <button style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }}>Deconectare</button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ padding: isMobile ? '16px' : '28px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0a1628', margin: '0 0 4px 0' }}>Gestionare Conturi</h1>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{users.length} utilizatori înregistrați</p>
                    </div>
                    <button className="add-btn" style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setShowModal(true)}>+ Adaugă Cont</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {[{ key: 'all', label: 'Toți' }, { key: 'client', label: 'Clienți' }, { key: 'deliverer', label: 'Livratori' }, { key: 'admin', label: 'Admini' }].map(({ key, label }) => (
                        <button key={key} className={filterRole === key ? 'filter-btn-active' : ''} style={{ padding: '6px 16px', border: '0.5px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', backgroundColor: 'white', color: '#64748b', transition: 'all 0.2s' }} onClick={() => setFilterRole(key)}>{label}</button>
                    ))}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', overflow: isMobile ? 'auto' : 'hidden' }}>
                    {!isMobile && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 1.2fr 1fr', padding: '10px 20px', backgroundColor: '#f8fafc', borderBottom: '0.5px solid #f1f5f9', fontSize: '11px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px' }}>
                            <span>Nume</span><span>Email</span><span>Telefon</span><span>Rol</span><span>Înregistrat</span><span>Acțiuni</span>
                        </div>
                    )}
                    {loading ? <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>Se încarcă...</p> :
                        filteredUsers.map(user => {
                            const role = getRole(user.role);
                            return (
                                <div key={user.id} style={isMobile ? { padding: '12px', borderBottom: '0.5px solid #f8fafc', display: 'flex', flexDirection: 'column', gap: '6px' } : { display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 1.2fr 1fr', padding: '14px 20px', borderBottom: '0.5px solid #f8fafc', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a1628' }}>{user.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{user.phone || '-'}</div>
                                    <div><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: role.bg, color: role.color, border: `0.5px solid ${role.border}` }}>{role.text}</span></div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{new Date(user.created_at).toLocaleDateString('ro-RO')}</div>
                                    <div>
                                        {user.role !== 'admin' && (
                                            <button style={{ padding: '5px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleDelete(user.id)}>Șterge</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,22,40,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 20px 0' }}>Adaugă Cont Nou</h3>
                        <form onSubmit={handleCreateUser}>
                            {[{ label: 'NUME *', name: 'name', type: 'text', required: true }, { label: 'EMAIL *', name: 'email', type: 'email', required: true }, { label: 'PAROLĂ *', name: 'password', type: 'password', required: true }, { label: 'TELEFON', name: 'phone', type: 'text', required: false }].map(({ label, name, type, required }) => (
                                <div key={name}>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>{label}</label>
                                    <input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} type={type} name={name} value={formData[name]} onChange={handleChange} required={required} />
                                </div>
                            ))}
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>ROL *</label>
                            <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="role" value={formData.role} onChange={handleChange}>
                                <option value="deliverer">Livrator</option>
                                <option value="client">Client</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" style={{ padding: '10px 20px', backgroundColor: '#f8fafc', color: '#64748b', border: '0.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }} onClick={() => setShowModal(false)}>Anulează</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Creează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;