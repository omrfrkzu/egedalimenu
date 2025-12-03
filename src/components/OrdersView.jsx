import React, { memo, useMemo, useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { useOrdersStore } from '../store/ordersStore'
import { useSocket } from '../hooks/useSocket'
import './OrdersView.css'

const OrdersView = () => {
  const [activeTab, setActiveTab] = useState('open') // 'open' | 'closed'
  
  // Use orders store
  const {
    openOrders,
    closedOrders,
    loading,
    error,
    fetchOpenOrders,
    fetchClosedOrders,
    closeOrder
  } = useOrdersStore()
  
  // Initialize WebSocket connection
  useSocket()
  
  // Fetch orders on mount
  useEffect(() => {
    fetchOpenOrders()
    fetchClosedOrders()
  }, [fetchOpenOrders, fetchClosedOrders])
  
  // Handle mark as prepared (close order)
  const handleMarkPrepared = async (orderId) => {
    try {
      await closeOrder(orderId, 'paid')
      // Refresh closed orders to show updated list
      fetchClosedOrders()
    } catch (error) {
      console.error('Error marking order as prepared:', error)
      alert('Sipariş kapatılırken bir hata oluştu')
    }
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Calculate total for order
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }
  
  // Display orders based on active tab
  const displayOrders = useMemo(() => {
    if (activeTab === 'open') {
      return openOrders
    }
    return closedOrders
  }, [activeTab, openOrders, closedOrders])
  
  if (loading && openOrders.length === 0 && closedOrders.length === 0) {
    return (
      <div className="orders-view">
        <div className="orders-header">
          <h2>Siparişler</h2>
        </div>
        <div className="orders-loading">
          <p>Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="orders-view">
        <div className="orders-header">
          <h2>Siparişler</h2>
        </div>
        <div className="orders-error">
          <p>Hata: {error}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="orders-view">
      <div className="orders-header">
        <h2>Siparişler</h2>
      </div>
      
      {/* Tabs */}
      <div className="orders-tabs">
        <button
          className={`orders-tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Açık Siparişler
          {openOrders.length > 0 && (
            <span className="orders-badge">{openOrders.length}</span>
          )}
        </button>
        <button
          className={`orders-tab ${activeTab === 'closed' ? 'active' : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          Kapananlar
          {closedOrders.length > 0 && (
            <span className="orders-badge">{closedOrders.length}</span>
          )}
        </button>
      </div>
      
      {/* Orders List */}
      <div className="orders-section">
        {activeTab === 'open' && (
          <h3 className="orders-section-title">Bekleyen Siparişler</h3>
        )}
        {activeTab === 'closed' && (
          <h3 className="orders-section-title">Kapanan Siparişler</h3>
        )}
        
        {displayOrders.length === 0 ? (
          <div className="empty-orders">
            <p>
              {activeTab === 'open' 
                ? 'Bekleyen sipariş bulunmuyor' 
                : 'Kapanan sipariş bulunmuyor'}
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {displayOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : []
              const total = order.total || calculateTotal(items)
              const isClosed = order.closed_at !== null
              
              return (
                <div 
                  key={order.id} 
                  className={`order-card ${isClosed ? 'prepared' : ''}`}
                >
                  <div className="order-card-header">
                    <div>
                      <h3>Masa {order.table_id}</h3>
                      {order.created_at && (
                        <span className="order-date">
                          {formatDate(order.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="order-header-right">
                      <span className="order-total">{total.toFixed(2)} ₺</span>
                      {isClosed && (
                        <span className="prepared-badge">
                          {order.status === 'paid' ? 'Ödendi' : 'İptal'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="order-items-list">
                    {items.map((item, index) => (
                      <div key={item.id || index} className="order-item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">
                          {(item.price * item.quantity).toFixed(2)} ₺
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {order.note && (
                    <div className="order-note">
                      <span className="order-note-label">Not:</span>
                      <span className="order-note-text">{order.note}</span>
                    </div>
                  )}
                  
                  {order.closed_at && (
                    <div className="order-closed-info">
                      <span className="order-closed-label">Kapanış:</span>
                      <span className="order-closed-date">
                        {formatDate(order.closed_at)}
                      </span>
                    </div>
                  )}
                  
                  {!isClosed && (
                    <div className="order-card-actions">
                      <button
                        className="mark-prepared-btn"
                        onClick={() => handleMarkPrepared(order.id)}
                      >
                        <Check size={18} />
                        Masa Kapat
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(OrdersView)
