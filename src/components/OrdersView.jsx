import React from 'react'
import { Check } from 'lucide-react'
import './OrdersView.css'

const OrdersView = ({ pendingOrders, preparedOrders, onMarkPrepared }) => {
  // Eski format desteği: items array ise { items, note: '' } formatına çevir
  const normalizeOrder = (orderData) => {
    if (Array.isArray(orderData)) {
      return { items: orderData, note: '' }
    }
    return { items: orderData.items || [], note: orderData.note || '' }
  }

  const pendingOrdersList = Object.entries(pendingOrders)
    .map(([tableId, orderData]) => [tableId, normalizeOrder(orderData)])
    .filter(([_, order]) => order.items.length > 0)
  
  const preparedOrdersList = Object.entries(preparedOrders)
    .map(([tableId, orderData]) => [tableId, normalizeOrder(orderData)])
    .filter(([_, order]) => order.items.length > 0)

  return (
    <div className="orders-view">
      <div className="orders-header">
        <h2>Siparişler</h2>
      </div>

      {/* Bekleyen Siparişler */}
      <div className="orders-section">
        <h3 className="orders-section-title">Bekleyen Siparişler</h3>
        {pendingOrdersList.length === 0 ? (
          <div className="empty-orders">
            <p>Bekleyen sipariş bulunmuyor</p>
          </div>
        ) : (
          <div className="orders-list">
            {pendingOrdersList.map(([tableId, order]) => {
              const { items, note } = order
              const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
              return (
                <div key={tableId} className="order-card">
                  <div className="order-card-header">
                    <h3>Masa {tableId}</h3>
                    <span className="order-total">{total.toFixed(2)} ₺</span>
                  </div>
                  <div className="order-items-list">
                    {items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{(item.price * item.quantity).toFixed(2)} ₺</span>
                      </div>
                    ))}
                  </div>
                  {note && (
                    <div className="order-note">
                      <span className="order-note-label">Not:</span>
                      <span className="order-note-text">{note}</span>
                    </div>
                  )}
                  <div className="order-card-actions">
                    <button
                      className="mark-prepared-btn"
                      onClick={() => onMarkPrepared && onMarkPrepared(tableId)}
                    >
                      <Check size={18} />
                      Hazırlandı
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Hazırlanan Siparişler */}
      {preparedOrdersList.length > 0 && (
        <div className="orders-section">
          <h3 className="orders-section-title">Hazırlanan Siparişler</h3>
          <div className="orders-list">
            {preparedOrdersList.map(([tableId, order]) => {
              const { items, note } = order
              const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
              return (
                <div key={tableId} className="order-card prepared">
                  <div className="order-card-header">
                    <h3>Masa {tableId}</h3>
                    <span className="order-total">{total.toFixed(2)} ₺</span>
                    <span className="prepared-badge">Hazır</span>
                  </div>
                  <div className="order-items-list">
                    {items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{(item.price * item.quantity).toFixed(2)} ₺</span>
                      </div>
                    ))}
                  </div>
                  {note && (
                    <div className="order-note">
                      <span className="order-note-label">Not:</span>
                      <span className="order-note-text">{note}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersView

