import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

    const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setShowSuggestions(true)
    }

    const selectLocation = (loc) => {
        setSearchTerm(loc)
        setShowSuggestions(false)
    }

    const getCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Coords:", latitude, longitude); // Debugging
                try {
                    // Using OpenStreetMap Nominatim API
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                        headers: {
                            'User-Agent': 'AdHubTestApp/1.0' // It's good practice to identify your app
                        }
                    });
                    const data = await response.json();

                    // Prioritize city-level names
                    const locationName = data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        data.address.municipality ||
                        data.address.county ||
                        "Current Location";

                    setSearchTerm(locationName);
                    setShowSuggestions(false);
                } catch (error) {
                    console.error("Error fetching location", error);
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

    return (
        <div className='nav-container'>
            <h1 className='logo' onClick={() => navigate('/')}>SpaceToAd</h1>
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

            <ul className='navbar'>
                <li onClick={() => navigate('/services')}>Services</li>
                <li onClick={() => navigate('/about')}>About</li>
                <li onClick={() => navigate('/contact')}>Contact</li>
            </ul>
            <div>
                <button className='login-btn' onClick={() => navigate('/login')}>Login</button>
                <button className='login-btn' onClick={() => navigate('/vendor')}>Rent Out</button>
            </div>
        </div>
    )
}

export default Navbar