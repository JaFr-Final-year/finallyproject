import './index.css'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import Login from './pages/login.jsx'

function App() {
  

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
