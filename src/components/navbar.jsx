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
    const [user, setUser] = useState(null)


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

            {/* Navigation Links */}
            <ul className='navbar'>
                <li onClick={() => {
                    if (location.pathname === '/') {
                        const element = document.getElementById('ad-search-section');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                        }
                    } else {
                        navigate('/adlist');
                    }
                }}>Ad listings</li>
                <li onClick={() => navigate('/about')}>About</li>
                <li onClick={() => navigate('/contact')}>Contact</li>
            </ul>

            {/* User Auth/Profile section */}
            <div>
                {user ? (
                    <div className='nav-right-btn'>
                        {location.pathname !== '/vendor' && <button className='rentout-btn' onClick={() => navigate('/vendor')}>Rent</button>}
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
