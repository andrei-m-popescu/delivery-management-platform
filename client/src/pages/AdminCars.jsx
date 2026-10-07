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

function AdminCars() {
    const width = useWindowSize();
    const isMobile = width < 768;
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCar, setEditCar] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({ brand: '', model: '', year: '', color: '', vin: '', price: '', status: 'available' });
    const navigate = useNavigate();

    useEffect(() => { fetchCars(); }, []);

    const fetchCars = async () => {
        try {
            const res = await api.get('/cars');
            setCars(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAdd = () => {
        setEditCar(null);
        setFormData({ brand: '', model: '', year: '', color: '', vin: '', price: '', status: 'available' });
        setImageFile(null);
        setImagePreview(null);
        setShowModal(true);
    };

    const handleEdit = (car) => {
        setEditCar(car);
        setFormData({ brand: car.brand, model: car.model, year: car.year, color: car.color || '', vin: car.vin || '', price: car.price || '', status: car.status });
        setImageFile(null);
        setImagePreview(car.image_url ? `${BASE_URL}${car.image_url}` : null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ești sigur că vrei să ștergi această mașină?')) return;
        try {
            await api.delete(`/cars/${id}`);
            fetchCars();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (imageFile) {
                data.append('image', imageFile);
            } else if (editCar?.image_url) {
                data.append('image_url', editCar.image_url);
            }
            if (editCar) {
                await api.put(`/cars/${editCar.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/cars', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setShowModal(false);
            fetchCars();
        } catch (err) { alert(err.response?.data?.message || 'Eroare!'); }
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
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: 'hidden' }}>
            <style>{`
                * { box-sizing: border-box; }
                .add-btn:hover { background: #d97706 !important; }
                .edit-btn:hover { background: #1e3a5f !important; }
                .del-btn:hover { background: #991b1b !important; }
                .upload-area:hover { border-color: #f59e0b !important; }
                .nav-tab:hover { color: #f1f5f9 !important; }
            `}</style>

            {/* Navbar */}
            <div style={{ backgroundColor: '#0a1628', width: '100%', position: 'sticky', top: 0, zIndex: 100 }}>
                {isMobile ? (
                    <div style={{ padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' }}>AUTODROP</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span className="nav-tab" style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/admin/dashboard')}>Cereri</span>
                            <span style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: '600', borderBottom: '2px solid #f59e0b', paddingBottom: '2px' }}>Catalog</span>
                            <span className="nav-tab" style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>Utilizatori</span>
                            <button style={{ padding: '4px 10px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }}>Exit</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', letterSpacing: '3px' }}>AUTODROP</div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="nav-tab" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/admin/dashboard')}>Toate cererile</span>
                            <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f59e0b' }}>Catalog mașini</span>
                            <span className="nav-tab" style={{ fontSize: '13px', color: '#94a3b8', cursor: 'pointer', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/admin/users')}>Utilizatori</span>
                            <div style={{ width: '1px', height: '20px', backgroundColor: '#1e3a5f', margin: '0 8px' }} />
                            <button style={{ padding: '6px 14px', backgroundColor: 'transparent', border: '0.5px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }}>Deconectare</button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ padding: isMobile ? '16px' : '28px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0a1628', margin: '0 0 4px 0' }}>Catalog Mașini</h1>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Gestionează stocul de autoturisme</p>
                    </div>
                    <button className="add-btn" style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }} onClick={handleAdd}>+ Adaugă Mașină</button>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '0.5px solid #e2e8f0', overflow: isMobile ? 'auto' : 'hidden' }}>
                    {!isMobile && (
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 1fr 1.5fr', padding: '10px 20px', backgroundColor: '#f8fafc', borderBottom: '0.5px solid #f1f5f9', fontSize: '11px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px' }}>
                            <span>Imagine</span><span>Mașină</span><span>An</span><span>Culoare</span><span>Preț</span><span>Status</span><span>Acțiuni</span>
                        </div>
                    )}
                    {loading ? <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>Se încarcă...</p> :
                        cars.map(car => {
                            const status = getStatus(car.status);
                            return (
                                <div key={car.id} style={isMobile ? { padding: '12px', borderBottom: '0.5px solid #f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' } : { display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 1fr 1.5fr', padding: '12px 20px', borderBottom: '0.5px solid #f8fafc', alignItems: 'center' }}>
                                    <div style={isMobile ? { display: 'flex', gap: '12px', alignItems: 'center' } : {}}>
                                        {car.image_url ? (
                                            <img src={`${BASE_URL}${car.image_url}`} alt={car.brand} style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '0.5px solid #e2e8f0' }} />
                                        ) : (
                                            <div style={{ width: '64px', height: '44px', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '0.5px solid #e2e8f0' }}>🚗</div>
                                        )}
                                        {isMobile && (
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a1628' }}>{car.brand} {car.model}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{car.year} · {car.color || '-'}</div>
                                            </div>
                                        )}
                                    </div>
                                    {!isMobile && <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a1628' }}>{car.brand} {car.model}</div>}
                                    {!isMobile && <div style={{ fontSize: '13px', color: '#64748b' }}>{car.year}</div>}
                                    {!isMobile && <div style={{ fontSize: '13px', color: '#64748b' }}>{car.color || '-'}</div>}
                                    {!isMobile && <div style={{ fontSize: '13px', color: '#64748b' }}>€{Number(car.price).toLocaleString()}</div>}
                                    <div>
                                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: status.bg, color: status.color, border: `0.5px solid ${status.border}` }}>{status.text}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="edit-btn" style={{ padding: '5px 12px', backgroundColor: '#0a1628', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }} onClick={() => handleEdit(car)}>Editează</button>
                                        <button className="del-btn" style={{ padding: '5px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }} onClick={() => handleDelete(car.id)}>Șterge</button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,22,40,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0a1628', margin: '0 0 20px 0' }}>{editCar ? 'Editează Mașina' : 'Adaugă Mașină Nouă'}</h3>
                        <form onSubmit={handleSubmit}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>IMAGINE MAȘINĂ</label>
                            <div className="upload-area" style={{ border: '1.5px dashed #e2e8f0', borderRadius: '12px', padding: '20px', cursor: 'pointer', marginBottom: '8px', transition: 'border-color 0.2s', textAlign: 'center', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => document.getElementById('carImage').click()}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '32px' }}>📷</span>
                                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0a1628', margin: 0 }}>Click pentru a încărca o imagine</p>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>JPG, PNG sau WEBP — max 5MB</p>
                                    </div>
                                )}
                            </div>
                            <input id="carImage" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            {imageFile && <p style={{ fontSize: '12px', color: '#16a34a', margin: '0 0 16px 0', fontWeight: '500' }}>✓ {imageFile.name}</p>}
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <div style={{ flex: 1, marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>MARCĂ *</label><input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="brand" value={formData.brand} onChange={handleChange} required /></div>
                                <div style={{ flex: 1, marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>MODEL *</label><input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="model" value={formData.model} onChange={handleChange} required /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <div style={{ flex: 1, marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>AN *</label><input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="year" type="number" value={formData.year} onChange={handleChange} required /></div>
                                <div style={{ flex: 1, marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>CULOARE</label><input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="color" value={formData.color} onChange={handleChange} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px' }}>
                                <div style={{ flex: 1, marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>PREȚ (EUR)</label><input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="price" type="number" value={formData.price} onChange={handleChange} /></div>
                                <div style={{ flex: 1, marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>VIN</label><input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="vin" value={formData.vin} onChange={handleChange} /></div>
                            </div>
                            {editCar && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '1.5px', marginBottom: '8px' }}>STATUS</label>
                                    <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '0.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0a1628' }} name="status" value={formData.status} onChange={handleChange}>
                                        <option value="available">Disponibil</option>
                                        <option value="reserved">Rezervat</option>
                                        <option value="delivered">Livrat</option>
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button type="button" style={{ padding: '10px 20px', backgroundColor: '#f8fafc', color: '#64748b', border: '0.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }} onClick={() => setShowModal(false)}>Anulează</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0a1628', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>{editCar ? 'Salvează' : 'Adaugă'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCars;