import './index.css'
import { Routes, Route } from 'react-router-dom'
import Adlist from './pages/adlist.jsx'
import Login from './pages/login.jsx'
import Vendor from './pages/vendor.jsx'
import Profile from './pages/profile.jsx'
import Home from './pages/home.jsx' 
/**
 * Main application component that defines the routing structure.
 */
function App() {
  return (
    <>
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
        </Routes>
      </div>
    </>
  )
}

export default App
