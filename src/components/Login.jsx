import React, { useState } from 'react'
import { User, AlertCircle, LogIn, Lock } from 'lucide-react'
import './Login.css'

const normalizeText = (text = '') =>
  text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const Login = ({ onLogin, mode = 'admin' }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const normalizedInput = normalizeText(username)
    const isEgedali = normalizedInput === normalizeText('egedali')

    if (!isEgedali) {
      setError('Kullanıcı adı hatalı!')
      return
    }

    if (mode === 'admin') {
      if (password === '6437') {
        const user = {
          id: 1,
          name: 'Egedali',
          username: 'egedali',
          role: 'admin'
        }
        onLogin(user)
      } else {
        setError('Şifre hatalı!')
      }
      return
    }

    // Garson girişi
    if (mode === 'waiter') {
      if (password === '2375') {
        const user = {
          id: 2,
          name: 'Egedali',
          username: 'egedali',
          role: 'garson'
        }
        onLogin(user)
      } else {
        setError('Şifre hatalı!')
      }
      return
    }

    setError('Geçersiz giriş modu!')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <picture>
            <source srcSet="/logo.avif" type="image/avif" />
            <source srcSet="/logo.webp" type="image/webp" />
            <img 
              src="/logo.webp" 
              alt="Egedalı Gurme Logo" 
              className="login-icon"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.style.display = 'none'
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'block'
                }
              }}
            />
          </picture>
          <span className="login-icon-fallback" style={{ display: 'none' }}>🍽️</span>
          <h1>Egedalı Gurme</h1>
          <p>{mode === 'admin' ? 'Yönetici Girişi' : 'Garson Girişi'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>
              <User size={18} />
              <span>Kullanıcı Adı</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adı"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              <span>Şifre</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-button">
            <LogIn size={20} />
            <span>Giriş Yap</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

