import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './admin.css';

const Admin = () => {
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });

    // Dashboard State
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state for adding new ad
    const [formData, setFormData] = useState({
        name: '',
        category: 'billboard',
        location: '',
        price: '',
        size: '',
        description: '',
        contactNumber: ''
    });

    useEffect(() => {
        if (isLoggedIn) {
            fetchAds();
        }
    }, [isLoggedIn]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginCreds.username === 'admin' && loginCreds.password === 'admin123') {
            setIsLoggedIn(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/ads");
            const data = await res.json();
            setAds(data);
        } catch (err) {
            console.error("Fetch ads error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/ads/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "active" })
            });

            if (!res.ok) throw new Error("Accept failed");

            await fetchAds();
            alert("Ad accepted");
        } catch (err) {
            console.error(err);
            alert("Failed to accept ad");
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm("Delete this ad?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/ads/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Delete failed");

            await fetchAds();
            alert("Ad removed");
        } catch (err) {
            console.error(err);
            alert("Failed to remove ad");
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                name: formData.name,
                category: formData.category,
                location: formData.location,
                price: Number(formData.price),
                size: formData.size,
                description: formData.description,
                contact_number: formData.contactNumber,
                owner_id: user?.id ?? null,
                status: "active"
            };

            const res = await fetch("http://localhost:5000/api/ads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Create failed");

            setShowAddModal(false);
            setFormData({
                name: "",
                category: "billboard",
                location: "",
                price: "",
                size: "",
                description: "",
                contactNumber: ""
            });

            await fetchAds();
            alert("Ad created");
        } catch (err) {
            console.error(err);
            alert("Failed to add ad");
        }
    };

    const filteredAds = activeTab === 'pending'
        ? ads.filter(ad => ad.status !== 'active')
        : ads;

    // Automatic Background Blobs Component
    const InteractiveBackground = () => {
        return (
            <div className="interactive-bg-container">
                <div className="bg-blob blob-1"></div>
                <div className="bg-blob blob-2"></div>
                <div className="bg-blob blob-3"></div>
                <div className="bg-blob blob-4"></div>
            </div>
        );
    };

    const AdminHeader = () => (
        <header className="admin-custom-header">
            <Link to="/" className="admin-logo-link">
                <span className="admin-logo-text">SpaceToAd</span>
            </Link>
        </header>
    );

    if (!isLoggedIn) {
        return (
            <div className="admin-page">
                <InteractiveBackground />
                <AdminHeader />
                <div className="admin-login-wrapper">
                    <div className="admin-login-card">
                        <h2 className="admin-login-title">Admin Access</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="Username"
                                value={loginCreds.username}
                                onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                className="admin-input"
                                placeholder="Password"
                                value={loginCreds.password}
                                onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                                required
                            />
                            <button type="submit" className="admin-login-btn">Secure Login</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <InteractiveBackground />
            <AdminHeader />

            <div className="admin-dashboard-wrapper">
                <div className="admin-glass-panel">
                    <div className="admin-stat-bar">
                        <h1 className="admin-title-main">Dashboard</h1>
                        <button
                            className="dashboard-btn btn-accept"
                            onClick={() => setShowAddModal(true)}
                        >
                            + New Listing
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="admin-tabs" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            onClick={() => setActiveTab('pending')}
                            style={{
                                padding: '1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'pending' ? '3px solid #c5a059' : '3px solid transparent',
                                fontWeight: '700',
                                color: activeTab === 'pending' ? '#c5a059' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Pending {ads.filter(ad => ad.status !== 'active').length > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', marginLeft: '5px' }}>{ads.filter(ad => ad.status !== 'active').length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            style={{
                                padding: '1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'all' ? '3px solid #c5a059' : '3px solid transparent',
                                fontWeight: '700',
                                color: activeTab === 'all' ? '#c5a059' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All Ads ({ads.length})
                        </button>
                    </div>

                    {/* Ads List */}
                    {loading ? (
                        <div className="ad-loading">Synchronizing Database...</div>
                    ) : (
                        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Ad Name</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAds.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontSize: '1.2rem' }}>
                                                ✨ No ads requiring attention.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAds.map(ad => (
                                            <tr key={ad.id} className="row-item">
                                                <td>{ad.name || 'Untitled'}</td>
                                                <td>{ad.location}</td>
                                                <td>{new Date(ad.created_at).toLocaleDateString()}</td>
                                                <td style={{ color: '#c5a059', fontWeight: '800' }}>₹{ad.price}</td>
                                                <td>
                                                    <span className={`status-pill ${ad.status === 'active' ? 'status-active' : 'status-pending'}`}>
                                                        {ad.status === 'active' ? 'Active' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                                        {ad.status !== 'active' && (
                                                            <button
                                                                className="dashboard-btn btn-accept"
                                                                onClick={() => handleAccept(ad.id)}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            className="dashboard-btn btn-delete"
                                                            onClick={() => handleRemove(ad.id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                    }}>
                        <div className="admin-login-card" style={{ maxWidth: '600px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 className="admin-login-title" style={{ margin: 0 }}>Create Listing</h2>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', color: '#fff', cursor: 'pointer' }}>&times;</button>
                            </div>
                            <form onSubmit={handleAddSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="admin-input" name="name" placeholder="Ad Title" value={formData.name} onChange={handleFormChange} required />
                                    <select className="admin-input" name="category" value={formData.category} onChange={handleFormChange}>
                                        <option value="billboard">Billboard</option>
                                        <option value="digital">Digital Screen</option>
                                        <option value="transit">Transit Ad</option>
                                        <option value="mural">Wall Mural</option>
                                    </select>
                                    <input className="admin-input" name="location" placeholder="Location" value={formData.location} onChange={handleFormChange} required />
                                    <input className="admin-input" name="price" placeholder="Price (₹)" value={formData.price} onChange={handleFormChange} required />
                                    <input className="admin-input" name="size" placeholder="Size (ft)" value={formData.size} onChange={handleFormChange} required />
                                    <input className="admin-input" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleFormChange} required />
                                </div>
                                <textarea className="admin-input" name="description" placeholder="Description" rows="4" style={{ borderRadius: '25px', resize: 'none' }} value={formData.description} onChange={handleFormChange}></textarea>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="admin-login-btn" style={{ flex: 1, margin: 0 }}>Publish</button>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="dashboard-btn btn-delete" style={{ flex: 1, padding: '1.2rem' }}>Discard</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
