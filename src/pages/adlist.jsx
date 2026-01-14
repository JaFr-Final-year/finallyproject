import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

/**
 * Home page component that displays available advertising spaces.
 * Supports filtering by category and sorting (UI only in this version).
 */
const AdList = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [filterCategory, setFilterCategory] = useState('all')
  const [location, setLocation] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const openAdDetails = (id) => {
    window.open(`/ad/${id}`, '_blank')
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
              if (sortBy === 'newest') return b.id - a.id;
              if (sortBy === 'price-low') {
                return parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''));
              }
              if (sortBy === 'price-high') {
                return parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''));
              }
              if (sortBy === 'location') {
                return a.location.localeCompare(b.location);
              }
              return 0;
            })
            .map(product => (
              <div
                key={product.id}
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
                    <span className="product-price">{product.price}</span>
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

// Mock data for advertising products
export const products = [
  { id: 1, name: 'Billboard - Western Express Hwy', location: 'Mumbai', price: '₹40,000/month', category: 'billboard', image: '🏙️', size: '14x48 ft', description: 'High visibility billboard on the main highway, perfect for large-scale brand awareness campaigns. Visible to thousands of daily commuters.' },
  { id: 2, name: 'Digital Screen - Connaught Place', location: 'Delhi', price: '₹1,50,000/month', category: 'digital', image: '📺', size: '20x30 ft', description: 'Bright digital screen in the heart of the city. High engagement and dynamic content capabilities.' },
  { id: 3, name: 'Bus Stop Ad - Indiranagar', location: 'Bangalore', price: '₹25,000/month', category: 'transit', image: '🚌', size: '4x6 ft', description: 'Target commuters with this bus stop ad. Great for local reach and high frequency exposure.' },
  { id: 4, name: 'Wall Mural - Park Street', location: 'Kolkata', price: '₹65,000/month', category: 'mural', image: '🎨', size: '30x40 ft', description: 'Artistic wall mural on a busy street. Creates a unique and memorable brand impression.' },
  { id: 5, name: 'Billboard - SG Highway', location: 'Ahmedabad', price: '₹35,000/month', category: 'billboard', image: '🛣️', size: '14x48 ft', description: 'Classic billboard location on the busy highway. Ideal for travel and tourism related advertisements.' },
  { id: 6, name: 'Digital Billboard - Airport', location: 'Hyderabad', price: '₹1,20,000/month', category: 'digital', image: '✈️', size: '16x32 ft', description: 'Premium digital space near the airport. Capture the attention of travelers and business professionals.' },
  { id: 7, name: 'Bus Bench - Marine Drive', location: 'Mumbai', price: '₹20,000/month', category: 'transit', image: '🪑', size: '2x6 ft', description: 'Street-level visibility on famous Marine Drive. Perfect for local targeting.' },
  { id: 8, name: 'Metro Station Digital', location: 'Delhi', price: '₹1,00,000/month', category: 'digital', image: '🚇', size: '55 inch', description: 'High-traffic metro entrance digital screen. Captive audience during commute.' },
  { id: 9, name: 'Auto Rickshaw Display', location: 'Chennai', price: '₹30,000/month', category: 'transit', image: '�', size: '1x3 ft', description: 'Mobile advertising throughout the city center. High frequency impressions.' },
  { id: 10, name: 'Mall Kiosk - Phoenix Marketcity', location: 'Pune', price: '₹50,000/month', category: 'digital', image: '🛍️', size: '4x6 ft', description: 'Interactive kiosk in a major shopping mall. Reach consumers with high purchase intent.' },
  { id: 11, name: 'Stadium Scoreboard', location: 'Mumbai', price: '₹4,00,000/game', category: 'digital', image: '🏟️', size: '50x100 ft', description: 'Massive exposure during cricket matches and concerts. Unmissable brand impact.' },
  { id: 12, name: 'Office Lobby Screen', location: 'Bangalore', price: '₹55,000/month', category: 'digital', image: '🏢', size: '65 inch', description: 'Corporate audience targeting in premium tech parks.' },
  { id: 13, name: 'Highway Billboard - NH8', location: 'Jaipur', price: '₹45,000/month', category: 'billboard', image: '🚗', size: '14x48 ft', description: 'Prime highway location for maximum visibility to vehicle traffic.' },
  { id: 14, name: 'Street Art Mural', location: 'Kochi', price: '₹90,000/month', category: 'mural', image: '🎭', size: '20x20 ft', description: 'Creative and colorful mural in the arts district. Highly instagrammable.' },
  { id: 15, name: 'Railway Station Poster', location: 'Lucknow', price: '₹15,000/month', category: 'billboard', image: '🚉', size: '4x6 ft', description: 'High footfall visibility at Main Railway Station platforms.' },
  { id: 16, name: 'Cinema Hall Slide', location: 'Chandigarh', price: '₹10,000/week', category: 'digital', image: '🍿', size: 'Screen', description: 'On-screen advertising before blockbuster movies. Captive audience.' },
  { id: 17, name: 'IT Park Food Court', location: 'Hyderabad', price: '₹75,000/month', category: 'billboard', image: '🍽️', size: '6x4 ft', description: 'Standee placement in busy food courts of Hitech City. Targets professionals.' },
  { id: 18, name: 'Toll Plaza Gantry', location: 'Gurgaon', price: '₹2,50,000/month', category: 'billboard', image: '🚧', size: '80x20 ft', description: 'Massive gantry structure over the expressway toll plaza. 100% visibility to passing traffic.' },
  { id: 19, name: 'Bus Shelter Branding', location: 'Trivandrum', price: '₹22,000/month', category: 'transit', image: '🚏', size: 'Full Shelter', description: 'Complete branding of a bus shelter in the city center.' },
  { id: 20, name: 'Unipole Hoarding', location: 'Indore', price: '₹60,000/month', category: 'billboard', image: '🚩', size: '20x10 ft', description: 'Prominent unipole at a major traffic junction.' },
  { id: 21, name: 'Metro Pillar Branding', location: 'Nagpur', price: '₹40,000/month', category: 'billboard', image: '🚇', size: 'Pillar Wrap', description: 'Eye-catching wrap around metro pillars on main roads.' },
  { id: 22, name: 'Airport Baggage Claim', location: 'Goa', price: '₹1,80,000/month', category: 'digital', image: '🧳', size: 'Digital Screen', description: 'Digital screens on baggage belts. High dwell time for tourists.' },
  { id: 23, name: 'Lift Branding', location: 'Noida', price: '₹12,000/month', category: 'billboard', image: '↕️', size: 'Door Wrap', description: 'Internal and external lift door branding in corporate towers.' },
  { id: 24, name: 'Society Gate Sponsorship', location: 'Pune', price: '₹18,000/month', category: 'billboard', image: '🏡', size: 'Gate Arch', description: 'Branding at the entrance arch of premium residential societies.' },
]
