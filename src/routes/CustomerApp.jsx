import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Header from '../components/Header'
import MenuView from '../components/MenuView'
import { useLocalStorageDebounce } from '../hooks/useLocalStorageDebounce'
import '../App.css'

const CUSTOMER_ACCOUNT_ID = 'customer'

const getInitialState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

const CustomerApp = () => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [orders, setOrders] = useState(() => getInitialState('restaurant_orders', {}))
  const [pendingOrders, setPendingOrders] = useState(() => getInitialState('restaurant_pending_orders', {}))
  const [occupiedTables, setOccupiedTables] = useState(() => getInitialState('restaurant_occupied_tables', {}))
  const [orderNote, setOrderNote] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({
    total: 0,
    message: '',
    title: 'Siparişiniz Alındı!'
  })

  useEffect(() => {
    document.title = 'Egedalı Gurme | Menü'
  }, [])

  useLocalStorageDebounce('restaurant_orders', orders, 400)
  useLocalStorageDebounce('restaurant_pending_orders', pendingOrders, 400)
  useLocalStorageDebounce('restaurant_occupied_tables', occupiedTables, 400)

  const getTableData = useCallback((tableId) => {
    if (tableId === null || tableId === undefined) return null
    return orders[tableId] || null
  }, [orders])

  const ensureCustomerAccount = useCallback((tableId) => {
    if (!tableId) return
    setOrders(prev => {
      const tableData = prev[tableId] || {
        accounts: {},
        activeAccountId: CUSTOMER_ACCOUNT_ID
      }
      if (tableData.accounts?.[CUSTOMER_ACCOUNT_ID]) {
        return {
          ...prev,
          [tableId]: {
            ...tableData,
            activeAccountId: CUSTOMER_ACCOUNT_ID
          }
        }
      }
      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [CUSTOMER_ACCOUNT_ID]: {
              id: CUSTOMER_ACCOUNT_ID,
              name: 'Müşteri',
              items: [],
              createdAt: Date.now()
            }
          },
          activeAccountId: CUSTOMER_ACCOUNT_ID
        }
      }
    })
  }, [])

  const customerOrdersForDisplay = useMemo(() => {
    const summary = {}
    Object.entries(orders).forEach(([tableId, tableData]) => {
      const account = tableData.accounts?.[CUSTOMER_ACCOUNT_ID]
      if (account) {
        summary[Number(tableId)] = account.items || []
      }
    })
    return summary
  }, [orders])

  const selectedTableItems = useMemo(() => {
    if (!selectedTable) return []
    return customerOrdersForDisplay[selectedTable] || []
  }, [customerOrdersForDisplay, selectedTable])

  const handleTableSelect = useCallback((tableId) => {
    if (tableId === null) {
      setSelectedTable(null)
      return
    }
    if (occupiedTables[tableId]) {
      alert('Bu masa şu anda dolu. Lütfen başka bir masa seçin.')
      return
    }
    ensureCustomerAccount(tableId)
    setSelectedTable(tableId)
  }, [ensureCustomerAccount, occupiedTables])

  const handleAddItem = useCallback((item) => {
    if (!selectedTable) {
      alert('Lütfen önce bir masa seçin!')
      return
    }
    setOrders(prev => {
      const tableData = prev[selectedTable] || {
        accounts: {},
        activeAccountId: CUSTOMER_ACCOUNT_ID
      }
      const account = tableData.accounts?.[CUSTOMER_ACCOUNT_ID] || {
        id: CUSTOMER_ACCOUNT_ID,
        name: 'Müşteri',
        items: [],
        createdAt: Date.now()
      }
      const existingItem = account.items.find(o => o.id === item.id)
      const updatedItems = existingItem
        ? account.items.map(o =>
            o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
          )
        : [...account.items, { ...item, quantity: 1 }]

      return {
        ...prev,
        [selectedTable]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [CUSTOMER_ACCOUNT_ID]: {
              ...account,
              items: updatedItems
            }
          },
          activeAccountId: CUSTOMER_ACCOUNT_ID
        }
      }
    })
  }, [selectedTable])

  const handleUpdateQuantity = useCallback((tableId, itemId, delta) => {
    if (!tableId) return
    setOrders(prev => {
      const tableData = prev[tableId]
      if (!tableData) return prev
      const account = tableData.accounts?.[CUSTOMER_ACCOUNT_ID]
      if (!account) return prev

      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [CUSTOMER_ACCOUNT_ID]: {
              ...account,
              items: account.items
                .map(item => {
                  if (item.id === itemId) {
                    const newQuantity = item.quantity + delta
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
                  }
                  return item
                })
                .filter(Boolean)
            }
          }
        }
      }
    })
  }, [])

  const handleCustomerCompleteOrder = useCallback((tableId, note = '') => {
    const tableData = getTableData(tableId)
    const customerAccount = tableData?.accounts?.[CUSTOMER_ACCOUNT_ID]
    const tableOrders = customerAccount?.items || []
    if (!tableOrders.length) return

    const tableTotal = tableOrders.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    setPendingOrders(prev => ({
      ...prev,
      [tableId]: {
        items: [...tableOrders],
        note: note.trim() || ''
      }
    }))

    setOccupiedTables(prev => ({
      ...prev,
      [tableId]: true
    }))

    setOrders(prev => {
      const current = prev[tableId]
      if (!current?.accounts?.[CUSTOMER_ACCOUNT_ID]) return prev
      return {
        ...prev,
        [tableId]: {
          ...current,
          accounts: {
            ...current.accounts,
            [CUSTOMER_ACCOUNT_ID]: {
              ...current.accounts[CUSTOMER_ACCOUNT_ID],
              items: []
            }
          }
        }
      }
    })

    setSuccessMessage({
      total: tableTotal,
      message: 'Siparişiniz hazırlanıyor.',
      title: 'Siparişiniz Alındı!'
    })
    setShowSuccessModal(true)
    setOrderNote('')
    setSelectedTable(null)

    setTimeout(() => {
      setShowSuccessModal(false)
    }, 3000)
  }, [getTableData])

  return (
    <div className="app">
      <Header
        currentUser={null}
        isCustomerMode
        customerCartItems={selectedTableItems}
        selectedTable={selectedTable}
        onUpdateQuantity={handleUpdateQuantity}
        onCompleteOrder={handleCustomerCompleteOrder}
        orderNote={orderNote}
        setOrderNote={setOrderNote}
      />
      <div className="app-body">
        <div className="main-content customer-mode">
          <MenuView
            onAddItem={handleAddItem}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
            isCustomerMode
            orders={customerOrdersForDisplay}
            onCompleteOrder={handleCustomerCompleteOrder}
            occupiedTables={occupiedTables}
            onUpdateQuantity={handleUpdateQuantity}
            isAdmin={false}
            orderNote={orderNote}
            setOrderNote={setOrderNote}
          />
        </div>
      </div>
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-icon">
              <CheckCircle size={64} />
            </div>
            <h2 className="success-modal-title">{successMessage.title}</h2>
            <p className="success-modal-total">Toplam: {successMessage.total.toFixed(2)} ₺</p>
            <p className="success-modal-message">{successMessage.message}</p>
            <button
              className="success-modal-button"
              onClick={() => setShowSuccessModal(false)}
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerApp


