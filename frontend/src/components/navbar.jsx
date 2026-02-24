import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import logouticon from '../assets/logout.png'
import usericon from '../assets/user.png'

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'AdBoards', href: '#ad-search-section' },
    { label: 'About', href: '#about-section' },
    { label: 'Contact', href: '/contact' }
]

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // Theme initialization
        const storedTheme = localStorage.getItem('theme')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (storedTheme === 'dark' || (!storedTheme && systemDark)) {
            setDarkMode(true)
            document.documentElement.classList.add('dark')
        } else {
            setDarkMode(false)
            document.documentElement.classList.remove('dark')
        }

        const getUser = async () => {
            const { data } = await supabase.auth.getSession()
            setUser(data?.session?.user ?? null)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setDarkMode(false)
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setDarkMode(true)
        }
    }

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await supabase.auth.signOut()
            navigate('/')
        }
    }

    const [activeHash, setActiveHash] = useState(location.hash);

    useEffect(() => {
        if (location.pathname !== '/') {
            setActiveHash('');
            return;
        }

        const sections = ['ad-search-section', 'about-section'];
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveHash(`#${entry.target.id}`);
                }
            });
        }, observerOptions);

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        const handleScroll = () => {
            if (window.scrollY < 100) {
                setActiveHash('');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]);

    useEffect(() => {
        setActiveHash(location.hash);
    }, [location.hash]);

    const handleNavClick = (href) => {
        if (href === '/') {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveHash('');
        } else if (href.startsWith('#')) {
            const element = document.getElementById(href.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setActiveHash(href);
                window.history.pushState(null, null, href);
            } else if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                    const el = document.getElementById(href.substring(1));
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                        setActiveHash(href);
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
                {NAV_ITEMS.map((item) => {
                    const isHome = item.label === 'Home';
                    const isActive = isHome
                        ? (location.pathname === '/' && !activeHash)
                        : (activeHash === item.href || (location.pathname === item.href));

                    return (
                        <li
                            key={item.href}
                            onClick={() => handleNavClick(item.href)}
                            style={{ color: isActive ? '#c5a059' : undefined }}
                        >
                            {item.label}
                        </li>
                    );
                })}
            </ul>

            <div className="nav-actions-container">
                <button
                    onClick={toggleTheme}
                    className="user-btn"
                    style={{ marginRight: '0.5rem', backgroundColor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#fbbf24' : '#1e293b', border: 'none' }}
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </button>

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
