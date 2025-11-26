import React from 'react'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Login'
import './AdminLogin.css'

const AdminLogin = () => {
  const navigate = useNavigate()

  const handleLogin = (user) => {
    // Kullanıcı bilgilerini localStorage'a kaydet
    localStorage.setItem('currentUser', JSON.stringify(user))
    // Custom event'i tetikle ki App.jsx'te currentUser state'i güncellensin
    window.dispatchEvent(new Event('userLogin'))
    // Admin paneline yönlendir
    navigate('/admin', { replace: true })
  }

  return (
    <div className="admin-login-page">
      <Login mode="admin" onLogin={handleLogin} />
    </div>
  )
}

export default AdminLogin

