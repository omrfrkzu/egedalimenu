import React, { useRef, useEffect, useState } from 'react'
import { Bell, LogOut, User, Menu, ShoppingCart, Plus, Minus, X, Check } from 'lucide-react'
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
  isSidebarOpen,
  // Müşteri sepeti için props
  isCustomerMode = false,
  customerCartItems = [],
  selectedTable,
  onUpdateQuantity,
  onCompleteOrder,
  orderNote = '',
  setOrderNote
}) => {
  const notificationRef = useRef(null)
  const cartRef = useRef(null)
  const [showCart, setShowCart] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length
  const cartItemCount = customerCartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = customerCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onToggleNotifications && onToggleNotifications(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false)
      }
    }

    if (showNotifications || showCart) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showCart, onToggleNotifications])
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
            <button className="logout-button" onClick={onLogout} title="Çıkış Yap">
              <LogOut size={18} />
              <span>Çıkış</span>
            </button>
          </>
        ) : (
          // Müşteri modu - sepet ikonu
          isCustomerMode && selectedTable && (
            <div className="cart-wrapper" ref={cartRef}>
              <button 
                className={`icon-button cart-button ${cartItemCount > 0 ? 'has-items' : ''}`}
                onClick={() => setShowCart(!showCart)}
                title="Sepet"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </button>
              {showCart && cartItemCount > 0 && (
                <div className="cart-dropdown">
                  <div className="cart-header">
                    <h3>Sepetim</h3>
                    <button 
                      className="cart-close-btn"
                      onClick={() => setShowCart(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="cart-items-list">
                    {customerCartItems.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          {item.image && item.image.trim() !== '' ? (
                            <>
                              <img 
                                src={item.image} 
                                alt={item.name}
                                onError={(e) => {
                                  if (e.target && e.target.nextSibling) {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }
                                }}
                              />
                              <div className="cart-item-image-fallback" style={{ display: 'none' }}>
                                🍽️
                              </div>
                            </>
                          ) : (
                            <div className="cart-item-image-fallback">🍽️</div>
                          )}
                        </div>
                        <div className="cart-item-info">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <p className="cart-item-price">{(item.price * item.quantity).toFixed(2)} ₺</p>
                        </div>
                        <div className="cart-item-controls">
                          <button
                            className="cart-quantity-btn"
                            onClick={() => onUpdateQuantity && onUpdateQuantity(selectedTable, item.id, -1)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="cart-quantity">{item.quantity}</span>
                          <button
                            className="cart-quantity-btn"
                            onClick={() => onUpdateQuantity && onUpdateQuantity(selectedTable, item.id, 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary">
                    <div className="cart-summary-item">
                      <span>Toplam:</span>
                      <strong>{cartTotal.toFixed(2)} ₺</strong>
                    </div>
                  </div>
                  {setOrderNote && (
                    <div className="cart-note">
                      <label htmlFor="cart-note-input">Not (Opsiyonel)</label>
                      <textarea
                        id="cart-note-input"
                        className="cart-note-input"
                        placeholder="Siparişinizle ilgili özel bir not ekleyebilirsiniz..."
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                  <button
                    className="cart-complete-btn"
                    onClick={() => {
                      if (onCompleteOrder && selectedTable) {
                        onCompleteOrder(selectedTable, orderNote)
                        setShowCart(false)
                      }
                    }}
                  >
                    <Check size={18} />
                    <span>Siparişi Tamamla</span>
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </header>
  )
}

export default Header

