import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import { supabase } from '../utils/supabase'

const Home = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sample product data
  const products = [
    { id: 1, name: 'Billboard - Highway 101', location: 'New York', price: '$500/month', category: 'billboard', image: '🏙️', size: '14x48 ft' },
    { id: 2, name: 'Digital Screen - Times Square', location: 'New York', price: '$2000/month', category: 'digital', image: '📺', size: '20x30 ft' },
    { id: 3, name: 'Bus Stop Ad - Downtown', location: 'Los Angeles', price: '$300/month', category: 'transit', image: '🚌', size: '4x6 ft' },
    { id: 4, name: 'Wall Mural - Main Street', location: 'Chicago', price: '$800/month', category: 'mural', image: '🎨', size: '30x40 ft' },
    { id: 5, name: 'Billboard - Route 66', location: 'Phoenix', price: '$450/month', category: 'billboard', image: '🛣️', size: '14x48 ft' },
    { id: 6, name: 'Digital Billboard - Airport', location: 'Dallas', price: '$1500/month', category: 'digital', image: '✈️', size: '16x32 ft' },
  ]

  return (
    <div>
      <Navbar />
      <div className="home-container">
        {!loading && user && (
          <h1 className="welcome-text">Welcome {user.user_metadata?.name || user.email}</h1>
        )}
        {!loading && !user && (
          <h1 className="welcome-text">Welcome</h1>
        )}
        {loading && (
          <h1 className="welcome-text">Loading...</h1>
        )}

        {/* Filter and Sort Section */}
        <div className="filter-sort-container">
          <div className="filter-section">
            <label>Filter by Category:</label>
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="billboard">Billboard</option>
              <option value="digital">Digital Screen</option>
              <option value="transit">Transit Ads</option>
              <option value="mural">Wall Murals</option>
            </select>
          </div>

          <div className="sort-section">
            <label>Sort by:</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="products-grid">
          {products
            .filter(product => filterCategory === 'all' || product.category === filterCategory)
            .map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">{product.image}</div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-location">📍 {product.location}</p>
                  <p className="product-size">📏 {product.size}</p>
                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    <button className="view-btn">View Details</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home