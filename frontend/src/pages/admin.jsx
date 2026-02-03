import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import { supabase } from '../utils/supabase';

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
    setLoading(true)
    const res = await fetch("http://localhost:5000/api/ads")
    const data = await res.json()
    setAds(data)
  } catch (err) {
    console.error("Fetch ads error:", err)
  } finally {
    setLoading(false)
  }
}


    const handleAccept = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/ads/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" })
    })

    if (!res.ok) throw new Error("Accept failed")

    await fetchAds()
    alert("Ad accepted")
  } catch (err) {
    console.error(err)
    alert("Failed to accept ad")
  }
}


    const handleRemove = async (id) => {
  if (!window.confirm("Delete this ad?")) return

  try {
    const res = await fetch(`http://localhost:5000/api/ads/${id}`, {
      method: "DELETE"
    })

    if (!res.ok) throw new Error("Delete failed")

    await fetchAds()
    alert("Ad removed")
  } catch (err) {
    console.error(err)
    alert("Failed to remove ad")
  }
}


    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
  e.preventDefault()

  try {
    const { data: { user } } = await supabase.auth.getUser()

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
    }

    const res = await fetch("http://localhost:5000/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error("Create failed")

    setShowAddModal(false)
    setFormData({
      name: "",
      category: "billboard",
      location: "",
      price: "",
      size: "",
      description: "",
      contactNumber: ""
    })

    await fetchAds()
    alert("Ad created")
  } catch (err) {
    console.error(err)
    alert("Failed to add ad")
  }
}


    const filteredAds = activeTab === 'pending'
        ? ads.filter(ad => ad.status !== 'active')
        : ads;

    if (!isLoggedIn) {
        return (
            <div>
                <Navbar />
                <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <div className="login-card" style={{ width: '400px', height: 'auto', padding: '2rem' }}>
                        <h2 className="login-title">Admin Login</h2>
                        <form onSubmit={handleLogin} style={{ width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={loginCreds.username}
                                onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                                style={{ margin: '0.5rem 0' }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginCreds.password}
                                onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                                style={{ margin: '0.5rem 0' }}
                            />
                            <button type="submit" className="login-button" style={{ marginTop: '1rem' }}>Login</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="container" style={{ padding: '100px 2rem 2rem' }}>
                <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#1e293b', margin: 0 }}>Admin Dashboard</h1>
                    <button
                        className="submit-btn"
                        style={{ margin: 0, width: 'auto' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        + Add New Ad
                    </button>
                </div>

                {/* Tabs */}
                <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => setActiveTab('pending')}
                        style={{
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'pending' ? '3px solid #c5a059' : '3px solid transparent',
                            fontWeight: activeTab === 'pending' ? '700' : '500',
                            color: activeTab === 'pending' ? '#1e293b' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
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
                            fontWeight: activeTab === 'all' ? '700' : '500',
                            color: activeTab === 'all' ? '#1e293b' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        All Ads ({ads.length})
                    </button>
                </div>

                {/* Ads List */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="ads-table-container" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Ad Name</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Location</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Date</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Price</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Status</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAds.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No ads found.</td>
                                    </tr>
                                ) : (
                                    filteredAds.map(ad => (
                                        <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{ad.name || 'Untitled'}</td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{ad.location}</td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(ad.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', color: '#1e293b', fontWeight: '700' }}>{ad.price}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    backgroundColor: ad.status === 'active' ? '#d1fae5' : '#fef3c7',
                                                    color: ad.status === 'active' ? '#059669' : '#d97706'
                                                }}>
                                                    {ad.status === 'active' ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                {ad.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleAccept(ad.id)}
                                                        style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemove(ad.id)}
                                                    style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Modal */}
                {showAddModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                    }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h2 style={{ margin: 0 }}>Add New Ad</h2>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="vendor-form">
                                <input className="form-input" name="name" placeholder="Ad Title" value={formData.name} onChange={handleFormChange} required />
                                <select className="form-input" name="category" value={formData.category} onChange={handleFormChange}>
                                    <option value="billboard">Billboard</option>
                                    <option value="digital">Digital Screen</option>
                                    <option value="transit">Transit Ad</option>
                                    <option value="mural">Wall Mural</option>
                                </select>
                                <input className="form-input" name="location" placeholder="Location" value={formData.location} onChange={handleFormChange} required />
                                <input className="form-input" name="price" placeholder="Price" value={formData.price} onChange={handleFormChange} required />
                                <input className="form-input" name="size" placeholder="Size" value={formData.size} onChange={handleFormChange} required />
                                <input className="form-input" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleFormChange} required />
                                <textarea className="form-input" name="description" placeholder="Description" rows="3" value={formData.description} onChange={handleFormChange}></textarea>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="submit-btn" style={{ flex: 1, marginTop: 0 }}>Add Ad</button>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="submit-btn" style={{ flex: 1, marginTop: 0, background: '#94a3b8' }}>Cancel</button>
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
