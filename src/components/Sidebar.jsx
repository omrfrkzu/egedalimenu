import React, { useRef, useEffect } from 'react'
import { Menu, Table, BarChart3, Settings, ShoppingCart, X, User, Bell, LogOut } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  currentUser, 
  isOpen, 
  onClose,
  notifications = [],
  showNotifications = false,
  onToggleNotifications,
  onMarkNotificationRead,
  onLogout
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

  const menuItems = [
    { id: 'menü', icon: Menu, label: 'Menü' },
    { id: 'masalar', icon: Table, label: 'Masalar' },
    { id: 'siparişler', icon: ShoppingCart, label: 'Siparişler' },
    { id: 'raporlar', icon: BarChart3, label: 'Raporlar', adminOnly: true },
    { id: 'ayarlar', icon: Settings, label: 'Ayarlar', adminOnly: true },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        {currentUser && (
          <div className="sidebar-user-info">
            <User size={20} />
            <span className="sidebar-user-name">
              {currentUser?.role === 'admin' ? 'Yönetici' : 'Garson'}: {currentUser?.name}
            </span>
          </div>
        )}
        <button className="sidebar-close" onClick={onClose} title="Kapat">
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems
          .filter(item => !item.adminOnly || currentUser?.role === 'admin')
          .map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      {currentUser && (
        <div className="sidebar-footer">
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className={`sidebar-footer-button notification-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
              onClick={onToggleNotifications}
              title="Bildirimler"
            >
              <Bell size={20} />
              <span>Bildirimler</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown sidebar-notifications">
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
          <button className="sidebar-footer-button" onClick={onLogout} title="Çıkış Yap">
            <LogOut size={20} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

