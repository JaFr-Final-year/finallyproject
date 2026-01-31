import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { supabase } from '../utils/supabase'


import logouticon from '../assets/logout.png'
import usericon from '../assets/user.png'


const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '#about-section' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' }
]

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getSession()
            setUser(data?.session?.user ?? null)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await supabase.auth.signOut()
            navigate('/')
        }
    }

    const handleNavClick = (href) => {
        if (href === '/') {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href.startsWith('#')) {
            const element = document.getElementById(href.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, null, href);
            } else if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                    const el = document.getElementById(href.substring(1));
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, null, href);
                    }
                }, 500);
            }
        } else {
            navigate(href);
        }
    }

    return (
        <div className="nav-container">
            <div className="logo" onClick={() => handleNavClick('/')} style={{ cursor: 'pointer' }}>
                SpaceToAd
            </div>

            <ul className="navbar">
                {NAV_ITEMS.map((item) => (
                    <li
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        style={{
                            color: ((item.href === '/' && location.pathname === '/' && !location.hash) ||
                                (item.href === location.pathname) ||
                                (item.href.startsWith('#') && location.hash === item.href))
                                ? '#c5a059' : undefined
                        }}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>

            <div className="nav-actions-container">
                {user ? (
                    <div className="nav-right-btn">
                        {location.pathname !== '/vendor' && (
                            <button className="rentout-btn" onClick={() => navigate('/vendor')}>
                                Rent
                            </button>
                        )}
                        <button className="user-btn" onClick={() => navigate('/profile')}>
                            <img src={usericon} alt="Profile" />
                        </button>
                        <button className="login-btn logout-btn" onClick={handleLogout}>
                            <img src={logouticon} alt="Logout" />
                        </button>
                    </div>
                ) : (
                    <button className="login-btn" onClick={() => navigate('/login')}>
                        Login
                    </button>
                )}
            </div>
        </div>
    )
}

export default Navbar
