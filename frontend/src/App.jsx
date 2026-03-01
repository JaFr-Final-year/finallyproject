import './index.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import Adlist from './pages/adlist.jsx'
import Login from './pages/login.jsx'
import Vendor from './pages/vendor.jsx'
import Profile from './pages/profile.jsx'
import Home from './pages/home.jsx'
import AdBoard from './pages/AdBoard.jsx'
import About from './pages/about.jsx'
import Admin from './pages/admin.jsx'
import Contact from './pages/contact.jsx'
import BookingPage from './pages/BookingPage.jsx'
/**
 * Main application component that defines the routing structure.
 */
function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/admin' && location.pathname !== '/login';

  return (
    <>
      {showNavbar && <Navbar />}
      <div>
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />
          {/*AD List page */}
          <Route path="/adlist" element={<Adlist />} />
          {/* Login/Signup page */}
          <Route path="/login" element={<Login />} />
          {/* Page for listing or managing items */}
          <Route path="/vendor" element={<Vendor />} />
          {/* User profile management page */}
          <Route path="/profile" element={<Profile />} />
          {/* Ad Details Page */}
          <Route path="/ad/:id" element={<AdBoard />} />
          {/* About Page */}
          <Route path="/about" element={<About />} />
          {/* Admin Page */}
          <Route path="/admin" element={<Admin />} />
          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />
          {/* Booking Page */}
          <Route path="/book/:id" element={<BookingPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App
