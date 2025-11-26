import React, { useRef, useEffect } from 'react'
import { Bell, LogOut, User, Menu } from 'lucide-react'
import './Header.css'

const Header = ({ 
  currentUser, 
  onLogout, 
  onLoginClick,
  notifications = [],
  showNotifications = false,
  onToggleNotifications,
  onMarkNotificationRead,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const notificationRef = useRef(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onToggleNotifications && onToggleNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, onToggleNotifications])
  return (
    <header className="header">
      <div className="header-left">
        {currentUser && (
          <button 
            className="hamburger-button"
            onClick={onToggleSidebar}
            title="Menü"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
      
      <div className="logo">
        <img 
          src="/logo.png" 
          alt="Egedalı Gurme Logo" 
          className="logo-image"
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex'
            }
          }}
        />
        <div className="logo-fallback" style={{ display: 'none' }}>
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">Egedalı Gurme</span>
        </div>
      </div>
      
      <div className="header-right">
        {currentUser ? (
          <>
            <div className="user-info">
              <User size={20} />
              <span className="user-name">
                {currentUser?.role === 'admin' ? 'Yönetici' : 'Garson'}: {currentUser?.name}
              </span>
            </div>
            <div className="notification-wrapper" ref={notificationRef}>
              <button 
                className={`icon-button notification-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
                onClick={onToggleNotifications}
                title="Bildirimler"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Bildirimler</h3>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-read"
                        onClick={() => {
                          notifications.forEach(n => {
                            if (!n.read) onMarkNotificationRead(n.id)
                          })
                        }}
                      >
                        Tümünü okundu işaretle
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <p>Bildirim bulunmuyor</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => {
                            if (!notification.read) {
                              onMarkNotificationRead(notification.id)
                            }
                          }}
                        >
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.timestamp).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {!notification.read && <div className="notification-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="icon-button" onClick={onLogout} title="Çıkış Yap">
              <LogOut size={20} />
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}

export default Header

