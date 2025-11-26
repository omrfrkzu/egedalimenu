import React, { useState, memo } from 'react'
import './TablesView.css'

const TablesView = ({
  onTableSelect,
  selectedTable,
  orders,
  occupiedTables = {},
  preparedOrders = {},
  guestCounts = {}
}) => {
  const [activeFloor, setActiveFloor] = useState('upstairs')
  const tables = [
    // Üst kat: 7 masa
    { id: 1, number: 1, capacity: 4, floor: 'upstairs' },
    { id: 2, number: 2, capacity: 2, floor: 'upstairs' },
    { id: 3, number: 3, capacity: 6, floor: 'upstairs' },
    { id: 4, number: 4, capacity: 4, floor: 'upstairs' },
    { id: 5, number: 5, capacity: 2, floor: 'upstairs' },
    { id: 6, number: 6, capacity: 8, floor: 'upstairs' },
    { id: 7, number: 7, capacity: 4, floor: 'upstairs' },
    // Alt kat: 5 masa
    { id: 8, number: 1, capacity: 4, floor: 'downstairs' },
    { id: 9, number: 2, capacity: 2, floor: 'downstairs' },
    { id: 10, number: 3, capacity: 6, floor: 'downstairs' },
    { id: 11, number: 4, capacity: 4, floor: 'downstairs' },
    { id: 12, number: 5, capacity: 2, floor: 'downstairs' },
    // Bahçe: 3 masa
    { id: 13, number: 1, capacity: 4, floor: 'garden' },
    { id: 14, number: 2, capacity: 6, floor: 'garden' },
    { id: 15, number: 3, capacity: 4, floor: 'garden' },
  ]

  const floorLabels = {
    upstairs: 'Üst Kat',
    downstairs: 'Alt Kat',
    garden: 'Bahçe'
  }

  const floorOrder = ['upstairs', 'downstairs', 'garden']

  const tablesByFloor = tables.reduce((acc, table) => {
    if (!acc[table.floor]) {
      acc[table.floor] = []
    }
    acc[table.floor].push(table)
    return acc
  }, {})

  const getTableStatus = (tableId) => {
    // Hazırlanan sipariş varsa aktif (hazır)
    if (preparedOrders[tableId] && preparedOrders[tableId].length > 0) {
      return 'prepared'
    }
    // Önce occupiedTables kontrolü (müşteri siparişi tamamladıysa dolu)
    if (occupiedTables[tableId]) {
      return 'occupied'
    }
    // Sonra orders kontrolü (garson sipariş eklediyse dolu)
    const tableOrders = orders[tableId] || []
    return tableOrders.length > 0 ? 'occupied' : 'empty'
  }

  const getStatusLabel = (status) => {
    const labels = {
      empty: 'Boş',
      occupied: 'Dolu',
      prepared: 'Hazır'
    }
    return labels[status]
  }

  const getStatusColor = (status) => {
    const colors = {
      empty: '#FFFFFF',
      occupied: 'var(--table-occupied)',
      prepared: '#10b981' // Yeşil - hazır siparişler için
    }
    return colors[status]
  }

  const getStatusTextColor = (status) => {
    return status === 'empty' ? '#000000' : '#FFFFFF'
  }

  const getTableTotal = (tableId) => {
    const tableOrders = orders[tableId] || []
    return tableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  return (
    <div className="tables-view">
      <div className="tables-header">
        <h2>Masalar</h2>
        <div className="tables-stats">
          <span className="stat-item">
            <span className="stat-dot" style={{ backgroundColor: 'var(--table-empty)' }}></span>
            Boş: {tables.filter(t => getTableStatus(t.id) === 'empty').length}
          </span>
          <span className="stat-item">
            <span className="stat-dot" style={{ backgroundColor: 'var(--table-occupied)' }}></span>
            Dolu: {tables.filter(t => getTableStatus(t.id) === 'occupied').length}
          </span>
          <span className="stat-item">
            <span className="stat-dot" style={{ backgroundColor: '#10b981' }}></span>
            Hazır: {tables.filter(t => getTableStatus(t.id) === 'prepared').length}
          </span>
        </div>
      </div>

      <div className="tables-tabs">
        {floorOrder.map((floorKey) => (
          <button
            key={floorKey}
            type="button"
            className={`tables-tab ${activeFloor === floorKey ? 'active' : ''}`}
            onClick={() => setActiveFloor(floorKey)}
          >
            {floorLabels[floorKey]}
          </button>
        ))}
      </div>

      <div className="tables-section">
        <h3 className="tables-section-title">{floorLabels[activeFloor]}</h3>
        <div className="tables-grid">
          {(tablesByFloor[activeFloor] || []).map((table) => {
            const tableOrders = orders[table.id] || []
            const hasOrders = tableOrders.length > 0
            const tableStatus = getTableStatus(table.id)
            const guestCount = guestCounts[table.id] || 0
            const shouldShowGuests = guestCount > 0

            return (
              <div
                key={table.id}
                className={`table-card ${selectedTable === table.id ? 'selected' : ''}`}
                style={{
                  '--table-color': getStatusColor(tableStatus)
                }}
                onClick={() => onTableSelect(table.id)}
              >
                <div className="table-number">Masa {table.number}</div>
                <div
                  className="table-status"
                  style={{
                    backgroundColor: getStatusColor(tableStatus),
                    color: getStatusTextColor(tableStatus)
                  }}
                >
                  {getStatusLabel(tableStatus)}
                </div>
                {shouldShowGuests && (
                  <div className="table-guest-count">👥 {guestCount} kişi</div>
                )}
                {hasOrders && (
                  <div className="table-orders-badge">
                    {tableOrders.reduce((sum, item) => sum + item.quantity, 0)} ürün
                  </div>
                )}
                {hasOrders && (
                  <div className="table-order-total">
                    {getTableTotal(table.id).toFixed(2)} ₺
                  </div>
                )}
                {tableStatus === 'prepared' && (
                  <div className="table-prepared-badge">
                    ✓ Hazır
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(TablesView)

