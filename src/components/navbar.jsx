import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import logouticon from '../assets/logout.png'
import usericon from '../assets/user.png'

/**
 * Navbar component for navigation, location search, and user authentication state management.
 */
const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [user, setUser] = useState(null)

    // Predefined list of locations for suggestions
    const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]

    // Logic to determine which locations to show
    const isExactMatch = locations.some(loc => loc.toLowerCase() === searchTerm.toLowerCase())
    const displayedLocations = isExactMatch
        ? locations
        : locations.filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))


    useEffect(() => {
        /**
         * Fetches the current user session on component mount.
         */
        const getUser = async () => {
            const { data, error } = await supabase.auth.getSession()
            if (!error && data?.session) {
                setUser(data.session.user)
            } else {
                setUser(null)
            }
        }

        getUser()

        /**
         * Subscribes to authentication state changes (login, logout, etc.)
         */
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        // Unsubscribe from auth listener on component unmount
        return () => subscription.unsubscribe()
    }, [])

    /**
     * Handles the input change for location search.
     * @param {Object} e - Event object 
     */
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setShowSuggestions(true)
    }

    /**
     * Selects a location from the suggestions list.
     * @param {string} loc - The selected location 
     */
    const selectLocation = (loc) => {
        setSearchTerm(loc)
        setShowSuggestions(true)
    }



    /**
     * Handles user logout via Supabase.
     */
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error("Error logging out:", error)
            alert("Error logging out")
        } else {
            navigate('/')
        }
    }

    return (
        <div className='nav-container'>
            {/* Clickable Logo */}
            <h1 className='logo' onClick={() => navigate('/')}>SpaceToAd</h1>

            {/* Location Search Input */}
            <div className='location-search'>
                <input
                    type="text"
                    placeholder="Location"
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={() => setShowSuggestions(true)}
                    // Delay blur to allow click on suggestion to register
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && (
                    <ul className="suggestions-list">
                        <li className="suggestion-item current-location">
                            📍 Use Current Location
                        </li>
                        {displayedLocations.map((loc, index) => (
                            <li key={index} className="suggestion-item" onClick={() => selectLocation(loc)}>
                                {loc}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Navigation Links */}
            <ul className='navbar'>
                <li onClick={() => navigate('/services')}>Services</li>
                <li onClick={() => navigate('/about')}>About</li>
                <li onClick={() => navigate('/contact')}>Contact</li>
            </ul>

            {/* User Auth/Profile section */}
            <div>
                {user ? (
                    <div className='nav-right-btn'>
                        {location.pathname !== '/vendor' && <button className='rentout-btn' onClick={() => navigate('/vendor')}>Rent Out</button>}
                        <button className='user-btn' onClick={() => navigate('/profile')}><img src={usericon} alt="Profile" /></button>
                        <button className='login-btn logout-btn' onClick={handleLogout}><img src={logouticon} alt="Logout" /> </button>
                    </div>
                ) : (
                    <button className='login-btn' onClick={() => navigate('/login')}>Login</button>
                )}
            </div>
        </div>
    )
}

export default Navbar
