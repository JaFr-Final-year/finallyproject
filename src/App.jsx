import './index.css'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Vendor from './pages/vendor.jsx' 
function App() {
  

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/vendor" element={<Vendor/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
