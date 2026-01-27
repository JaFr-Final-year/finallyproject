import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import { supabase } from '../utils/supabase'

/**
 * User Profile page displaying personal details and dashboard.
 * Includes "Rent Out Details" (Listings) and "Paid Rent Details" (Bookings).
 */
const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // State for "Rent Out Details" (Items the user is listing)
  const [myListings, setMyListings] = useState([])

  // Mock Data for "Paid Rent Details" (Items the user has rented)
  const myBookings = [
    { id: 201, name: 'Digital Screen - Times Square', date: 'Jan 15, 2024', amount: '$2000', status: 'Paid' },
    { id: 202, name: 'Highway 101 Banner', date: 'Feb 01, 2024', amount: '$450', status: 'Paid' }
  ]

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user) return
      try {
        const response = await fetch(`http://localhost:5000/api/ads/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setMyListings(data || [])
        }
      } catch (error) {
        console.error('Error fetching my listings:', error)
      }
    }

    fetchMyListings()
  }, [user])



  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error fetching profile:', error.message)
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="profile-page-container">
          <h1>Loading Profile...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="profile-page-container">
          <h1>Please log in to view your profile.</h1>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="profile-page-container">

        {/* 1. User Details Container */}
        <div className="profile-header-card">
          <div className="profile-avatar">
            {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user.user_metadata?.name || 'User'}</h1>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member ID:</strong> {user.id.slice(0, 8)}...</p>
            {/* Password is intentionally excluded */}
          </div>
        </div>

        {/* 2. Split Container: Rent Out vs Paid Rent */}
        <div className="profile-content-split">

          {/* Left: Rent Out Details (My Listings) */}
          <div className="profile-section">
            <h2>Rent Out Details (My Listings)</h2>
            {myListings.length > 0 ? (
              <div className="listings-list">
                {myListings.map(item => (
                  <div key={item.id} className="list-item">
                    <div>
                      <span className="item-name">{item.name}</span>
                      <span className="item-meta">{item.location}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`item-status ${item.status === 'Active' ? 'status-active' : ''}`}>
                        {item.status}
                      </span>
                      <div className="item-meta" style={{ marginTop: '0.5rem' }}>{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>You haven't listed any items for rent yet.</p>
            )}
          </div>

          {/* Right: Paid Rent Details (My Bookings) */}
          <div className="profile-section">
            <h2>Paid Rent Details (My Bookings)</h2>
            {myBookings.length > 0 ? (
              <div className="bookings-list">
                {myBookings.map(item => (
                  <div key={item.id} className="list-item">
                    <div>
                      <span className="item-name">{item.name}</span>
                      <span className="item-meta">Date: {item.date}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="item-status status-paid">{item.status}</span>
                      <div className="item-meta" style={{ marginTop: '0.5rem' }}>{item.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>You haven't rented any spaces yet.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile