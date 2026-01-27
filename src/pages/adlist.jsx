import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

/**
 * Home page component that displays available advertising spaces.
 * Supports filtering by category and sorting (UI only in this version).
 */
const AdList = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [filterCategory, setFilterCategory] = useState('all')
  const [location, setLocation] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [products, setProducts] = useState([]) // State for products from DB

  const openAdDetails = (id) => {
    navigate(`/ad/${id}`)
  }

  const popularLocations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat']

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation("Current Location")
        },
        (error) => {
          console.error("Error getting location: ", error)
          alert("Unable to retrieve your location")
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')

      if (error) {
        console.error('Error fetching ads:', error)
      } else {
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching ads:', err)
    }
  }

  useEffect(() => {
    /**
     * Fetches current user session on mount.
     */
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(data.session?.user ?? null)
      } catch (error) {
        console.error('Error fetching session:', error.message)
      } finally {
        setLoading(false)
      }
    }

    getUser()
    fetchProducts() // Fetch ads on mount

    /**
     * Listens for authentication state changes.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div>
      <div className="home-container" id="ad-search-section">


        {/* Custom Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-group" style={{ position: 'relative' }}>
            <div className="search-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon-svg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div className="search-input-content">
              <label>Location</label>
              <input
                type="text"
                placeholder="Where are you planning?"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>
            {showSuggestions && (
              <ul className="suggestions-list" style={{ marginTop: '10px' }}>
                <li className="suggestion-item current-location" onClick={handleCurrentLocation}>
                  📍 Use Current Location
                </li>
                {popularLocations.filter(loc => loc.toLowerCase().includes(location.toLowerCase()) && loc !== location).map((loc) => (
                  <li key={loc} className="suggestion-item" onClick={() => {
                    setLocation(loc);
                    setShowSuggestions(false);
                  }}>
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="search-divider"></div>

          <div className="search-input-group">
            <div className="search-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon-svg"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
            </div>
            <div className="search-input-content">
              <label>Budget</label>
              <input type="number" placeholder="What's your budget?" />
            </div>
          </div>

          <div className="search-divider"></div>

          <div className="search-input-group">
            <div className="search-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon-svg"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="search-input-content">
              <label>Duration</label>
              <input type="number" placeholder="How long?" />
            </div>
          </div>

          <button className="search-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </button>
        </div>

        {/* Filter and Sort UI Controls */}
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

        {/* Dynamic Product Grid */}
        <div className="products-grid">
          {products
            .filter(product => filterCategory === 'all' || product.category === filterCategory)
            .sort((a, b) => {
              if (sortBy === 'newest') return (b.id || 0) - (a.id || 0); // Handle potentially missing or non-numeric IDs if DB uses UUIDs
              // Basic price parsing helper since price is text "₹40,000/month"
              const getPrice = (p) => parseInt(p.price?.replace(/[^0-9]/g, '') || 0);

              if (sortBy === 'price-low') {
                return getPrice(a) - getPrice(b);
              }
              if (sortBy === 'price-high') {
                return getPrice(b) - getPrice(a);
              }
              if (sortBy === 'location') {
                return (a.location || '').localeCompare(b.location || '');
              }
              return 0;
            })
            .map(product => (
              <div
                key={product.id || Math.random()} // Fallback key
                className="product-card"
                onClick={() => openAdDetails(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">{product.image}</div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-location">📍 {product.location}</p>
                  <p className="product-size">📏 {product.size}</p>
                  <div className="product-footer">
                    <span className="product-price">{product.price}₹/Month</span>
                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double trigger if button is clicked
                        openAdDetails(product.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}


export default AdList
