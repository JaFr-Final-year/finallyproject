import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [stats, setStats] = useState({
    totalSpend: 0,
    activeBookings: 0,
    myListingsCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const getProfileData = async () => {
    try {
      // 1. Get Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        setLoading(false);
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // 2. Fetch My Listings (if any)
      const { data: listingsData, error: listingsError } = await supabase
        .from('ads')
        .select('*')
        .or(`owner_id.eq.${currentUser.id},user_id.eq.${currentUser.id}`);

      if (!listingsError) setMyListings(listingsData || []);

      // 3. Fetch My Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('ads')
        .select('*')
        .eq('booked_by_email', currentUser.email);

      if (!bookingsError) {
        setMyBookings(bookingsData || []);
        const spend = (bookingsData || []).reduce((acc, curr) => acc + (curr.price || 0), 0);
        const active = (bookingsData || []).filter(b => b.is_booked).length;

        setStats({
          totalSpend: spend,
          activeBookings: active,
          myListingsCount: (listingsData || []).length
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  const handleDeleteListing = async (adId) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/ads/${adId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert("Listing deleted successfully.");
        getProfileData(); // Refresh list
      } else {
        throw new Error("Failed to delete listing.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete listing. Please try again.");
    }
  };

  const handleEditClick = (ad) => {
    setEditingAd({ ...ad });
    setIsEditing(true);
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/ads/${editingAd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingAd.name,
          location: editingAd.location,
          price: editingAd.price,
          description: editingAd.description
        })
      });

      if (response.ok) {
        alert("Listing updated successfully.");
        setIsEditing(false);
        setEditingAd(null);
        getProfileData(); // Refresh list
      } else {
        throw new Error("Failed to update listing.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Could not update listing.");
    }
  };

  const handleSwitchUser = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="ad-loading-container">
        <div className="premium-loader"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-container text-center">
          <div className="empty-state">
            <span className="empty-icon">👤</span>
            <h2>Authentication Required</h2>
            <p>Please log in to access your profile dashboard.</p>
            <button className="proceed-btn" style={{ marginTop: '2rem', maxWidth: '200px', marginInline: 'auto' }} onClick={() => navigate('/login')}>Login Now</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">

        {/* 1. Premium Hero Header */}
        <div className="profile-hero animate-fade-in">
          <div className="profile-avatar-large">
            {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="profile-details-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>{user.user_metadata?.name || 'Valued Member'}</h1>
              </div>
              <button className="switch-user-btn" onClick={handleSwitchUser}>Switch User</button>
            </div>
            <div className="profile-meta-grid">
              <div className="meta-item">
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
              <div className="meta-item">
                <label>Member Since</label>
                <span>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="meta-item">
                <label>Account Status</label>
                <span style={{ color: '#22c55e' }}>Verified ✓</span>
              </div>
            </div>
          </div>
        </div>
        {/* 2. Stats Dashboard */}
        <div className="stats-dashboard animate-slide-up">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Spending</h3>
              <p>{stats.totalSpend}₹</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Active Bookings</h3>
              <p>{stats.activeBookings}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📢</div>
            <div className="stat-info">
              <h3>My Ad Listings</h3>
              <p>{stats.myListingsCount}</p>
            </div>
          </div>
        </div>

        {/* 3. Content Sections */}
        <div className="profile-content-grid animate-fade-in">

          {/* Recent Bookings */}
          <div className="content-section">
            <div className="section-header">
              <h2>My Bookings</h2>
              <button className="view-all-btn" onClick={() => navigate('/adlist')}>Book More</button>
            </div>
            {myBookings.length > 0 ? (
              <div className="activity-list">
                {myBookings.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-info">
                      <h4>{item.name}</h4>
                      <p>📍 {item.location}</p>
                    </div>
                    <div className="activity-status">
                      <span className="status-badge status-paid">Confirmed</span>
                      <span className="activity-amount">{item.price}₹</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎫</span>
                <p>No active bookings found.</p>
              </div>
            )}
          </div>

          {/* My Listings */}
          <div className="content-section">
            <div className="section-header">
              <h2>My Listings</h2>
              <button className="view-all-btn" onClick={() => navigate('/vendor')}>Add New</button>
            </div>
            {myListings.length > 0 ? (
              <div className="activity-list">
                {myListings.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-info">
                      <h4>{item.name}</h4>
                      <p>
                        {item.is_booked
                          ? '🔴 Booked'
                          : (item.status !== 'active' ? '⏳ Pending Approval' : '🟢 Available')}
                      </p>
                      <div className="listing-actions">
                        <button className="edit-btn" onClick={() => handleEditClick(item)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteListing(item.id)}>Delete</button>
                      </div>
                    </div>
                    <div className="activity-status">
                      <span className={`status-badge ${item.is_booked
                          ? 'status-pending'
                          : (item.status !== 'active' ? 'status-alert' : 'status-active')
                        }`}>
                        {item.is_booked ? 'Rented' : (item.status !== 'active' ? 'Pending' : 'Active')}
                      </span>
                      <span className="activity-amount">{item.price}₹</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🏗️</span>
                <p>You haven't listed any space yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit Listing</h2>
              <button className="close-modal" onClick={() => setIsEditing(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateListing} className="edit-form">
              <div className="form-group">
                <label>Ad Title</label>
                <input
                  type="text"
                  value={editingAd.name}
                  onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editingAd.location}
                  onChange={(e) => setEditingAd({ ...editingAd, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={editingAd.price}
                    onChange={(e) => setEditingAd({ ...editingAd, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={editingAd.description}
                  onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;