import React, { useEffect, useState, memo, useMemo } from 'react'
import { X, Plus, Minus, Trash2, Check } from 'lucide-react'
import './OrderPanel.css'

const OrderPanel = ({
  tableId,
  accountId,
  accountName,
  orders,
  onUpdateQuantity,
  onRemoveItem,
  onConfirmOrder,
  onClose,
}) => {
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const total = useMemo(() => orders.reduce((sum, item) => sum + item.price * item.quantity, 0), [orders])
  const paymentMethods = [
    'Kredi Kartı',
    'Nakit',
    'Ticket',
    'Sodexo',
    'Setcard',
    'Multinet',
    'Metropol'
  ]

  useEffect(() => {
    setSelectedPayment(null)
    setShowPaymentOptions(false)
  }, [tableId, accountId])

  const effectiveAccountName = accountName?.trim() || 'Genel Hesap'

  return (
    <div className="order-panel">
      <div className="order-panel-header">
        <div>
          <h3>Masa {tableId}</h3>
          <span className="order-panel-account-label">{effectiveAccountName}</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="order-panel-content">
        {orders.length === 0 ? (
          <div className="empty-order">
            <p>Henüz ürün eklenmedi</p>
            <span>Menüden ürün seçerek ekleyebilirsiniz</span>
          </div>
        ) : (
          <div className="order-items">
            {orders.map((item) => {
              const lineTotal = (item.price * item.quantity).toFixed(2)
              const unitPrice = Number(item.price).toFixed(2)

              return (
                <div key={item.id} className="order-item">
                  <div className="order-item-image">
                    {item.image && item.image.trim() !== '' ? (
                      <>
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            if (e.target && e.target.nextSibling) {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }
                          }}
                          onLoad={(e) => {
                            if (e.target && e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'none'
                            }
                          }}
                        />
                        <div className="order-item-image-fallback" style={{ display: 'none' }}>
                          🍽️
                        </div>
                      </>
                    ) : (
                      <div className="order-item-image-fallback">🍽️</div>
                    )}
                    <div className="order-item-quantity-badge">{item.quantity}</div>
                  </div>

                  <div className="order-item-body">
                    <div className="order-item-header">
                      <h4 title={item.name}>{item.name}</h4>
                      <span className="order-item-price">{unitPrice} ₺</span>
                    </div>

                    <div className="order-item-footer">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => onUpdateQuantity(tableId, item.id, -1, accountId)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => onUpdateQuantity(tableId, item.id, 1, accountId)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <span className="order-item-total">{lineTotal} ₺</span>
                    </div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => onRemoveItem(tableId, item.id, accountId)}
                    aria-label={`${item.name} ürününü sil`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div className="order-panel-footer">
          {showPaymentOptions && (
            <div className="payment-methods">
              <span>Ödeme Yöntemi</span>
              <div className="payment-buttons">
                {paymentMethods.map(method => (
                  <button
                    key={method}
                    className={`payment-btn ${selectedPayment === method ? 'selected' : ''}`}
                    onClick={() => setSelectedPayment(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="order-total">
            <span className="total-label">Toplam:</span>
            <span className="total-amount">{total.toFixed(2)} ₺</span>
          </div>
          <button
            className="confirm-order-btn"
            onClick={() => {
              if (!showPaymentOptions) {
                setShowPaymentOptions(true)
                return
              }
              if (!selectedPayment) return
              onConfirmOrder(tableId, selectedPayment, accountId)
            }}
            disabled={(showPaymentOptions && !selectedPayment) || !accountId}
          >
            <Check size={20} />
            Ödeme Al
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(OrderPanel)

