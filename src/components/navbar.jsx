import React from 'react'
import { useNavigate } from 'react-router-dom'
const Navbar = () => {
    const navigate = useNavigate()
    return (
        <div className='nav-container'>
            <h1 className='logo'   >AdHub</h1>
            <ul className='navbar'>
                <li onClick={() => navigate('/services')}>Services</li>
                <li onClick={() => navigate('/about')}>About</li>
                <li onClick={() => navigate('/contact')}>Contact</li>
            </ul>
            <button className='login-btn' onClick={() => navigate('/login')}>Login</button>
        </div>
    )
}

export default Navbar