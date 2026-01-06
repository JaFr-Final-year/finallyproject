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

    useEffect(() => {
        /**
         * Fetches the current user session on component mount.
         */
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
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
        setShowSuggestions(false)
    }

    /**
     * Uses the browser Geolocation API to find the user's current city name.
     * Now using Google Maps Geocoding API.
     */
    const getCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

                if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
                    console.error("Google Maps API Key is missing or invalid.");
                    alert("Please configure your Google Maps API Key in the .env file.");
                    return;
                }

                try {
                    // Reverse geocoding using Google Maps API
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
                    const data = await response.json();

                    if (data.status === 'OK' && data.results.length > 0) {
                        // Find the city/locality from address components
                        const addressComponents = data.results[0].address_components;
                        const cityComponent = addressComponents.find(c =>
                            c.types.includes('locality') ||
                            c.types.includes('administrative_area_level_2') ||
                            c.types.includes('postal_town')
                        );

                        const locationName = cityComponent ? cityComponent.long_name : "Current Location";
                        setSearchTerm(locationName);
                    } else {
                        console.error("Geocoding failed:", data.status);
                        setSearchTerm("Current Location");
                    }
                    setShowSuggestions(false);
                } catch (error) {
                    console.error("Error fetching location from Google Maps", error);
                    setSearchTerm("Current Location");
                    setShowSuggestions(false);
                }
            }, (error) => {
                console.error("Geolocation error", error);
                alert("Unable to retrieve your location. Please allow location access.");
            });
        } else {
            alert("Geolocation is not supported by your browser");
        }
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
                        <li className="suggestion-item current-location" onClick={getCurrentLocation}>
                            📍 Use Current Location
                        </li>
                        {locations.filter(loc => loc.toLowerCase().includes(searchTerm.toLowerCase())).map((loc, index) => (
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
