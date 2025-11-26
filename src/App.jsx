import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import TablesView from './components/TablesView'
import MenuView from './components/MenuView'
import ReportsView from './components/ReportsView'
import SettingsView from './components/SettingsView'
import OrderPanel from './components/OrderPanel'
import OrdersView from './components/OrdersView'
import AdminLogin from './pages/AdminLogin'
import WaiterLogin from './pages/WaiterLogin'
import './App.css'

const DEFAULT_ACCOUNT_ID = 'default'
const CUSTOMER_ACCOUNT_ID = 'customer'

function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [activeTab, setActiveTab] = useState('masalar')
  const [selectedTable, setSelectedTable] = useState(null)
  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_orders')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [isMobile, setIsMobile] = useState(false)
  const [isOrderPanelVisible, setIsOrderPanelVisible] = useState(false)
  const [showMenuOnly, setShowMenuOnly] = useState(false)
  const [tableCreatedMap, setTableCreatedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_table_created_map')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [occupiedTables, setOccupiedTables] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_occupied_tables')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }) // { tableId: true/false }
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ total: 0, message: '', title: 'Siparişiniz Alındı!' })
  const [reportStats, setReportStats] = useState({
    totalSales: 0,
    totalOrders: 0,
  })
  // Ödeme kayıtları - detaylı raporlar için
  const [paymentRecords, setPaymentRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_payment_records')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  // localStorage'dan siparişleri yükle
  const [pendingOrders, setPendingOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_pending_orders')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }) // Müşteri siparişleri - { tableId: [items] }
  const [preparedOrders, setPreparedOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('restaurant_prepared_orders')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }) // Hazırlanan siparişler - { tableId: [items] }
  const [accountModalState, setAccountModalState] = useState({ isOpen: false, tableId: null })
  const [accountNameInput, setAccountNameInput] = useState('')
  const [isStaffMenuFocused, setIsStaffMenuFocused] = useState(false)

  const getTableData = (tableId) => {
    if (!tableId && tableId !== 0) return null
    return orders[tableId] || null
  }

  const getTableAccounts = (tableId) => {
    const tableData = getTableData(tableId)
    return tableData?.accounts || {}
  }

  const getAccountItems = (tableId, accountId) => {
    if (!tableId && tableId !== 0) return []
    if (!accountId) return []
    const account = getTableAccounts(tableId)[accountId]
    return account?.items || []
  }

  const getAccountDisplayName = (tableId, accountId) => {
    if (!accountId) return ''
    if (accountId === CUSTOMER_ACCOUNT_ID) return 'Müşteri'
    if (accountId === DEFAULT_ACCOUNT_ID) return 'Genel Hesap'
    return getTableAccounts(tableId)[accountId]?.name || 'İsimsiz Hesap'
  }

  const getTableAggregatedItems = (tableId) => {
    const accounts = getTableAccounts(tableId)
    return Object.values(accounts).flatMap(account => account.items || [])
  }

  const mergeItems = (existingItems = [], incomingItems = []) => {
    const itemsMap = new Map()
    existingItems.forEach(item => {
      itemsMap.set(item.id, { ...item })
    })
    incomingItems.forEach(item => {
      if (!itemsMap.has(item.id)) {
        itemsMap.set(item.id, { ...item })
      } else {
        const current = itemsMap.get(item.id)
        itemsMap.set(item.id, { ...current, quantity: (current.quantity || 0) + (item.quantity || 0) })
      }
    })
    return Array.from(itemsMap.values())
  }

  const ensureTableHasAccount = (tableId, accountId, accountName = '') => {
    setOrders(prev => {
      const tableData = prev[tableId] || { accounts: {}, activeAccountId: accountId }
      if (tableData.accounts[accountId]) {
        return {
          ...prev,
          [tableId]: {
            ...tableData,
            activeAccountId: accountId || tableData.activeAccountId || DEFAULT_ACCOUNT_ID
          }
        }
      }

      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [accountId]: {
              id: accountId,
              name: accountName,
              items: [],
              createdAt: Date.now()
            }
          },
          activeAccountId: accountId
        }
      }
    })
  }

  // Tüm hook'lar erken return'den önce çağrılmalı
  const selectedTableOrders = useMemo(() => {
    if (!selectedTable || !selectedAccountId) return []
    const tableData = orders[selectedTable]
    const account = tableData?.accounts?.[selectedAccountId]
    return account?.items || []
  }, [orders, selectedTable, selectedAccountId])

  const selectedTableTotal = useMemo(() => {
    return selectedTableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedTableOrders])

  const selectedAccountName = useMemo(() => {
    if (!selectedTable || !selectedAccountId) return ''
    if (selectedAccountId === CUSTOMER_ACCOUNT_ID) return 'Müşteri'
    if (selectedAccountId === DEFAULT_ACCOUNT_ID) return 'Genel Hesap'
    return orders[selectedTable]?.accounts?.[selectedAccountId]?.name || ''
  }, [orders, selectedAccountId, selectedTable])

  const staffOrdersForDisplay = useMemo(() => {
    const summary = {}
    Object.entries(orders).forEach(([tableId, tableData]) => {
      summary[tableId] = Object.values(tableData.accounts || {}).flatMap(account => account.items || [])
    })
    return summary
  }, [orders])

  const customerOrdersForDisplay = useMemo(() => {
    const summary = {}
    Object.entries(orders).forEach(([tableId, tableData]) => {
      const account = tableData.accounts?.[CUSTOMER_ACCOUNT_ID]
      if (account) {
        // Convert tableId to number to match selectedTable type
        const numericTableId = Number(tableId)
        summary[numericTableId] = account.items || []
      }
    })
    return summary
  }, [orders])

  const tableGuestCounts = useMemo(() => {
    const counts = {}
    Object.entries(orders).forEach(([tableId, tableData]) => {
      const namedAccounts = Object.values(tableData.accounts || {}).filter(account => {
        if (!account) return false
        if (account.id === DEFAULT_ACCOUNT_ID || account.id === CUSTOMER_ACCOUNT_ID) return false
        return Boolean(account.name && account.name.trim())
      })
      if (namedAccounts.length > 0) {
        counts[tableId] = namedAccounts.length
      }
    })
    return counts
  }, [orders])

  const modalAccounts = useMemo(() => {
    if (!accountModalState.tableId) return []
    const tableData = orders[accountModalState.tableId]
    if (!tableData) return []
    return Object.values(tableData.accounts || {})
      .filter(account => account.id !== CUSTOMER_ACCOUNT_ID)
      .sort(
      (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
    )
  }, [accountModalState.tableId, orders])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 1024px)').matches)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (!selectedTable || selectedTableOrders.length === 0) {
      setIsOrderPanelVisible(false)
      return
    }

    // OrderPanel sadece masa oluşturulduktan sonra gösterilmeli
    // Masa oluşturulmadan önce sadece MenuView'de "Siparişi Oluştur" butonu gösterilir
    if (!isMobile && tableCreatedMap[selectedTable]) {
      setIsOrderPanelVisible(true)
    } else {
      setIsOrderPanelVisible(false)
    }
  }, [isMobile, selectedTable, selectedTableOrders, tableCreatedMap])

  useEffect(() => {
    if (!isMobile) {
      setShowMenuOnly(false)
    }
  }, [isMobile])

  useEffect(() => {
    if (!selectedTable) {
      setShowMenuOnly(false)
      setIsStaffMenuFocused(false)
    }
  }, [selectedTable])

  useEffect(() => {
    if (isMobile && showMenuOnly) {
      setIsOrderPanelVisible(false)
    }
  }, [isMobile, showMenuOnly])

  // orders değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_orders', JSON.stringify(orders))
    } catch (error) {
      console.error('orders kaydedilemedi:', error)
    }
  }, [orders])

  // occupiedTables değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_occupied_tables', JSON.stringify(occupiedTables))
    } catch (error) {
      console.error('occupiedTables kaydedilemedi:', error)
    }
  }, [occupiedTables])

  // tableCreatedMap değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_table_created_map', JSON.stringify(tableCreatedMap))
    } catch (error) {
      console.error('tableCreatedMap kaydedilemedi:', error)
    }
  }, [tableCreatedMap])

  // pendingOrders değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_pending_orders', JSON.stringify(pendingOrders))
    } catch (error) {
      console.error('pendingOrders kaydedilemedi:', error)
    }
  }, [pendingOrders])

  // preparedOrders değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_prepared_orders', JSON.stringify(preparedOrders))
    } catch (error) {
      console.error('preparedOrders kaydedilemedi:', error)
    }
  }, [preparedOrders])

  // paymentRecords değiştiğinde localStorage'a kaydet (kalıcı veri)
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_payment_records', JSON.stringify(paymentRecords))
    } catch (error) {
      console.error('paymentRecords kaydedilemedi:', error)
    }
  }, [paymentRecords])

  useEffect(() => {
    // localStorage'dan kullanıcı bilgisini yükle
    const loadUser = () => {
      try {
        const saved = localStorage.getItem('currentUser')
        if (saved) {
          setCurrentUser(JSON.parse(saved))
        } else {
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Kullanıcı bilgisi yüklenemedi:', error)
      }
    }
    
    loadUser()
    
    // Storage değişikliklerini dinle (diğer tab'lardan)
    window.addEventListener('storage', loadUser)
    // Custom event'i dinle (aynı tab'dan AdminLogin'den)
    window.addEventListener('userLogin', loadUser)
    
    return () => {
      window.removeEventListener('storage', loadUser)
      window.removeEventListener('userLogin', loadUser)
    }
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    setSelectedTable(null)
    setSelectedAccountId(null)
    // Not: orders, occupiedTables, tableCreatedMap localStorage'da kalır
    // Ödeme alınana kadar masalar ve siparişler korunur
    setShowMenuOnly(false)
    setAccountModalState({ isOpen: false, tableId: null })
    setIsStaffMenuFocused(false)
    // Not: pendingOrders ve preparedOrders localStorage'da kalır, çıkış yapılsa bile siparişler görünmeye devam eder
  }

  const selectTableAccount = (tableId, accountId, accountName = '') => {
    if (!tableId || !accountId) return
    setOrders(prev => {
      const tableData = prev[tableId] || {
        accounts: {},
        activeAccountId: accountId
      }
      const existingAccount = tableData.accounts[accountId]
      const nextAccounts = {
        ...tableData.accounts,
        [accountId]: existingAccount || {
          id: accountId,
          name: accountName,
          items: [],
          createdAt: Date.now()
        }
      }
      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: nextAccounts,
          activeAccountId: accountId
        }
      }
    })
    setSelectedTable(tableId)
    setSelectedAccountId(accountId)
    if (currentUser && !isMobile) {
      setIsStaffMenuFocused(true)
    }
    if (isMobile) {
      setShowMenuOnly(true)
      setIsOrderPanelVisible(false)
    }
  }

  const handleTableSelect = (tableId, options = {}) => {
    // Müşteri modunda masa seçimi temizleniyorsa
    if (!currentUser && tableId === null) {
      setSelectedTable(null)
      setSelectedAccountId(null)
      return
    }

    // Müşteri modunda dolu masaları seçilemez yap
    if (!currentUser && occupiedTables[tableId]) {
      alert('Bu masa şu anda dolu. Lütfen başka bir masa seçin.')
      return
    }

    if (!currentUser) {
      // Eğer başka bir masa seçiliyse, önce onu temizle
      if (selectedTable && selectedTable !== tableId) {
        setSelectedTable(null)
        setSelectedAccountId(null)
      }
      selectTableAccount(tableId, CUSTOMER_ACCOUNT_ID)
      return
    }

    if (options.accountId) {
      selectTableAccount(tableId, options.accountId)
      setAccountModalState({ isOpen: false, tableId: null })
      return
    }

    ensureTableHasAccount(tableId, DEFAULT_ACCOUNT_ID)
    setAccountModalState({ isOpen: true, tableId })
    setAccountNameInput('')
  }

  const handleAccountModalClose = () => {
    setAccountModalState({ isOpen: false, tableId: null })
    setAccountNameInput('')
  }

  const handleCreateNamedAccount = () => {
    const tableId = accountModalState.tableId
    const trimmedName = accountNameInput.trim()
    if (!tableId || !trimmedName) return
    const newAccountId = `acc-${Date.now()}`
    selectTableAccount(tableId, newAccountId, trimmedName)
    handleAccountModalClose()
  }

  const handleAddItem = (item) => {
    if (!selectedTable) return
    const targetAccountId = currentUser ? selectedAccountId : CUSTOMER_ACCOUNT_ID
    if (!targetAccountId) {
      alert('Lütfen önce hesap seçin veya oluşturun.')
      return
    }

    setOrders(prev => {
      const tableData = prev[selectedTable] || {
        accounts: {},
        activeAccountId: targetAccountId
      }
      const account = tableData.accounts[targetAccountId] || {
        id: targetAccountId,
        name: targetAccountId === DEFAULT_ACCOUNT_ID ? '' : tableData.accounts?.[targetAccountId]?.name || '',
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
            [targetAccountId]: {
              ...account,
              items: updatedItems
            }
          },
          activeAccountId: targetAccountId
        }
      }
    })
  }

  // Müşteri sipariş tamamlama
  const handleCustomerCompleteOrder = (tableId, note = '') => {
    const customerAccount = orders[tableId]?.accounts?.[CUSTOMER_ACCOUNT_ID]
    const tableOrders = customerAccount?.items || []
    if (!tableOrders.length) return

    const tableTotal = tableOrders.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Bildirim oluştur
    const notificationMessage = note 
      ? `Masa ${tableId} için yeni sipariş! Toplam: ${tableTotal.toFixed(2)} ₺ (Not: ${note})`
      : `Masa ${tableId} için yeni sipariş! Toplam: ${tableTotal.toFixed(2)} ₺`
    
    const notification = {
      id: Date.now(),
      type: 'new_order',
      message: notificationMessage,
      tableId: tableId,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [notification, ...prev])

    // Masayı dolu olarak işaretle (ödeme alınana kadar)
    setOccupiedTables(prev => ({
      ...prev,
      [tableId]: true
    }))

    // Siparişi pendingOrders'a ekle (admin ve garson görebilsin)
    // Yapı: { items: [...], note: "..." }
    setPendingOrders(prev => ({
      ...prev,
      [tableId]: {
        items: [...tableOrders],
        note: note.trim() || ''
      }
    }))

    // Müşteri sepetini temizle
    setOrders(prev => {
      const tableData = prev[tableId]
      if (!tableData) return prev
      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [CUSTOMER_ACCOUNT_ID]: {
              ...tableData.accounts[CUSTOMER_ACCOUNT_ID],
              items: []
            }
          }
        }
      }
    })

    setSelectedTable(null)
    setSelectedAccountId(null)

    // Başarı modalını göster
    setSuccessMessage({
      total: tableTotal,
      message: 'Siparişiniz hazırlanıyor.',
      title: 'Siparişiniz Alındı!'
    })
    setShowSuccessModal(true)
    
    // 3 saniye sonra otomatik kapat
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 3000)
  }

  // Siparişi hazırlandı olarak işaretle
  const handleMarkOrderPrepared = (tableId) => {
    // Eski format desteği: array ise { items, note: '' } formatına çevir
    const orderData = pendingOrders[tableId]
    let order
    if (Array.isArray(orderData)) {
      order = { items: orderData, note: '' }
    } else {
      order = { items: orderData?.items || [], note: orderData?.note || '' }
    }
    
    if (!order.items.length) return

    // Siparişi preparedOrders'a taşı
    setPreparedOrders(prev => ({
      ...prev,
      [tableId]: order
    }))

    // pendingOrders'dan kaldır
    setPendingOrders(prev => {
      const updated = { ...prev }
      delete updated[tableId]
      return updated
    })

    // Masayı dolu olarak işaretle (ödeme alınana kadar)
    setOccupiedTables(prev => ({
      ...prev,
      [tableId]: true
    }))

    // Masalar sekmesi siparişleri göstersin diye ürünleri personele ait siparişlere aktar
    setOrders(prev => {
      const tableData = prev[tableId] || {
        accounts: {},
        activeAccountId: DEFAULT_ACCOUNT_ID
      }
      const defaultAccount = tableData.accounts?.[DEFAULT_ACCOUNT_ID] || {
        id: DEFAULT_ACCOUNT_ID,
        name: '',
        items: [],
        createdAt: Date.now()
      }

      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [DEFAULT_ACCOUNT_ID]: {
              ...defaultAccount,
              items: mergeItems(defaultAccount.items, order.items)
            }
          },
          activeAccountId: tableData.activeAccountId || DEFAULT_ACCOUNT_ID
        }
      }
    })
  }

  const handleUpdateQuantity = (tableId, itemId, delta, accountIdOverride) => {
    if (!tableId) return
    const targetAccountId = accountIdOverride
      || (currentUser ? selectedAccountId : CUSTOMER_ACCOUNT_ID)
    if (!targetAccountId) return

    setOrders(prev => {
      const tableData = prev[tableId]
      if (!tableData) return prev
      const account = tableData.accounts?.[targetAccountId]
      if (!account) return prev

      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [targetAccountId]: {
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
  }

  const handleRemoveItem = (tableId, itemId, accountIdOverride) => {
    if (!tableId) return
    const targetAccountId = accountIdOverride
      || (currentUser ? selectedAccountId : CUSTOMER_ACCOUNT_ID)
    if (!targetAccountId) return

    setOrders(prev => {
      const tableData = prev[tableId]
      if (!tableData) return prev
      const account = tableData.accounts?.[targetAccountId]
      if (!account) return prev

      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: {
            ...tableData.accounts,
            [targetAccountId]: {
              ...account,
              items: account.items.filter(item => item.id !== itemId)
            }
          }
        }
      }
    })
  }

  const handleConfirmOrder = (tableId, paymentMethod, accountIdOverride) => {
    const targetAccountId = accountIdOverride || selectedAccountId
    if (!tableId || !targetAccountId || !paymentMethod) return
    const account = orders[tableId]?.accounts?.[targetAccountId]
    const tableOrders = account?.items || []
    if (!tableOrders.length) return

    const tableTotal = tableOrders.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    setReportStats(prev => ({
      totalSales: prev.totalSales + tableTotal,
      totalOrders: prev.totalOrders + 1,
    }))

    // Detaylı ödeme kaydı oluştur
    const accountName = account?.name || (targetAccountId === DEFAULT_ACCOUNT_ID ? 'Genel Hesap' : 'İsimsiz Hesap')
    const paymentRecord = {
      id: `payment-${Date.now()}`,
      tableId,
      accountId: targetAccountId,
      accountName,
      items: tableOrders.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      total: tableTotal,
      paymentMethod,
      date: new Date().toISOString(),
      timestamp: Date.now()
    }

    const updatedRecords = [...paymentRecords, paymentRecord]
    setPaymentRecords(updatedRecords)
    // localStorage'a kayıt useEffect ile otomatik yapılacak

    setOrders(prev => {
      const tableData = prev[tableId]
      if (!tableData) return prev
      const updatedAccounts = { ...(tableData.accounts || {}) }

      if (targetAccountId === DEFAULT_ACCOUNT_ID || targetAccountId === CUSTOMER_ACCOUNT_ID) {
        updatedAccounts[targetAccountId] = {
          ...updatedAccounts[targetAccountId],
          items: []
        }
      } else {
        delete updatedAccounts[targetAccountId]
      }

      if (!updatedAccounts[DEFAULT_ACCOUNT_ID]) {
        updatedAccounts[DEFAULT_ACCOUNT_ID] = {
          id: DEFAULT_ACCOUNT_ID,
          name: '',
          items: [],
          createdAt: Date.now()
        }
      }

      return {
        ...prev,
        [tableId]: {
          ...tableData,
          accounts: updatedAccounts,
          activeAccountId: DEFAULT_ACCOUNT_ID
        }
      }
    })

    // Masayı boşa çıkar (ödeme alındı)
    setOccupiedTables(prev => {
      const updated = { ...prev }
      delete updated[tableId]
      return updated
    })

    setTableCreatedMap(prev => {
      const updated = { ...prev }
      delete updated[tableId]
      return updated
    })

    setSelectedTable(null)
    setSelectedAccountId(null)
    setIsStaffMenuFocused(false)
    setIsOrderPanelVisible(false)
    
    // Masalar sayfasına dön
    setActiveTab('masalar')

    // Başarı modalını göster
    setSuccessMessage({
      total: tableTotal,
      message: `Ödeme alındı! Ödeme yöntemi: ${paymentMethod}`,
      title: 'Ödeme Alındı!'
    })
    setShowSuccessModal(true)
    
    // 2 saniye sonra otomatik kapat
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 2000)

    console.log('Sipariş onaylandı:', { tableOrders, paymentMethod })
  }

  const handleCloseOrderPanel = () => {
    if (isMobile) {
      setIsOrderPanelVisible(false)
      setShowMenuOnly(false)
      return
    }

    setIsStaffMenuFocused(false)
    setSelectedTable(null)
    setSelectedAccountId(null)
  }

  const handleMenuAction = () => {
    if (!selectedTable || !selectedAccountId || selectedTableOrders.length === 0) return
    const tableId = selectedTable
    const wasAlreadyCreated = Boolean(tableCreatedMap[tableId])

    setTableCreatedMap(prev => ({
      ...prev,
      [tableId]: true
    }))

    if (wasAlreadyCreated) {
      setIsOrderPanelVisible(true)
      if (isMobile) {
        setShowMenuOnly(false)
      }
      return
    }

    setIsOrderPanelVisible(false)
    setIsStaffMenuFocused(false)
    setSelectedTable(null)
    setSelectedAccountId(null)
    setShowMenuOnly(false)
  }

  const canAccessTab = (tabId) => {
    if (!currentUser) return false
    if (currentUser.role !== 'admin' && (tabId === 'raporlar' || tabId === 'ayarlar')) {
      return false
    }
    return true
  }

  const handleTabChange = (tabId) => {
    if (!canAccessTab(tabId)) return

    setActiveTab(tabId)
    setIsStaffMenuFocused(false)
    if (tabId === 'masalar') {
      setSelectedTable(null)
      setSelectedAccountId(null)
      setShowMenuOnly(false)
      setIsOrderPanelVisible(false)
    }
    // Mobilde sekme değiştiğinde sidebar'ı kapat
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const renderContent = () => {
    // Müşteri modu - giriş yapmadan menü sayfası
    if (!currentUser) {
      return (
        <MenuView 
          onAddItem={handleAddItem}
          selectedTable={selectedTable}
          onTableSelect={handleTableSelect}
          isCustomerMode={true}
          orders={customerOrdersForDisplay}
          onCompleteOrder={handleCustomerCompleteOrder}
          occupiedTables={occupiedTables}
          onUpdateQuantity={handleUpdateQuantity}
          isAdmin={false}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
        />
      )
    }
    
    // Giriş yapmış kullanıcılar için normal akış
    switch (activeTab) {
      case 'menü':
        return <MenuView onAddItem={handleAddItem} isAdmin={currentUser?.role === 'admin'} />
      case 'siparişler':
        return <OrdersView 
          pendingOrders={pendingOrders} 
          preparedOrders={preparedOrders}
          onMarkPrepared={handleMarkOrderPrepared}
        />
      case 'masalar':
        const isMenuPanelOpen = selectedTable && (!isMobile || showMenuOnly)
        return (
          <div className={`tables-with-menu ${isMobile ? 'mobile-layout' : ''}`}>
            <div className={`tables-section ${isMobile && showMenuOnly ? 'hidden' : ''} ${isStaffMenuFocused ? 'hidden' : ''}`}>
              <TablesView
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
                orders={staffOrdersForDisplay}
                occupiedTables={occupiedTables}
                preparedOrders={preparedOrders}
                guestCounts={tableGuestCounts}
              />
            </div>
            <div className={`menu-panel ${isMenuPanelOpen ? 'open' : ''} ${isMobile && showMenuOnly ? 'fullscreen' : ''} ${isStaffMenuFocused && !isMobile ? 'expanded' : ''}`}>
              <div className="menu-panel-header">
                <div className="menu-panel-title">
                  <span>Seçilen Masa</span>
                  <h3>{selectedTable ? `Masa ${selectedTable}` : 'Henüz seçim yapılmadı'}</h3>
                  {selectedTable && selectedAccountId && (
                    <p className="menu-panel-account-name">
                      {selectedAccountName || 'Genel Hesap'}
                    </p>
                  )}
                </div>
                {selectedTable && (
                  <div className="menu-panel-total">
                    <span>Toplam</span>
                    <strong>{selectedTableTotal.toFixed(2)} ₺</strong>
                  </div>
                )}
              </div>
              <div className="menu-panel-content">
                {selectedTable ? (
                  <MenuView
                    onAddItem={handleAddItem}
                    showCreateButton={selectedTableOrders.length > 0 && !tableCreatedMap[selectedTable]}
                    onCreateTable={handleMenuAction}
                    actionLabel={tableCreatedMap[selectedTable] ? 'Ödeme Al' : 'Siparişi Oluştur'}
                    isAdmin={currentUser?.role === 'admin'}
                  />
                ) : (
                  <div className="menu-panel-empty">
                    <p>Menüyü açmak için bir masa seçin.</p>
                    <span>Masaya tıkladığınızda ürün ekleyebilirsiniz.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'raporlar':
        if (currentUser?.role !== 'admin') {
          return (
            <div className="restricted-view">
              <p>Bu ekran sadece yönetici hesabı için kullanılabilir.</p>
            </div>
          )
        }
        return <ReportsView stats={reportStats} paymentRecords={paymentRecords} />
      case 'ayarlar':
        return <SettingsView />
      default:
        return <TablesView
          onTableSelect={handleTableSelect}
          selectedTable={selectedTable}
          orders={staffOrdersForDisplay}
          guestCounts={tableGuestCounts}
        />
    }
  }

  const mainLayout = (
    <>
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onLoginClick={() => navigate('/admin')}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onMarkNotificationRead={(id) => {
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
          )
        }}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        // Müşteri sepeti için props
        isCustomerMode={!currentUser}
        customerCartItems={!currentUser && selectedTable ? (customerOrdersForDisplay[selectedTable] || []) : []}
        selectedTable={selectedTable}
        onUpdateQuantity={handleUpdateQuantity}
        onCompleteOrder={handleCustomerCompleteOrder}
        orderNote={orderNote}
        setOrderNote={setOrderNote}
      />
      <div className="app-body">
        {currentUser && (
          <>
            <Sidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              currentUser={currentUser}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              notifications={notifications}
              showNotifications={showNotifications}
              onToggleNotifications={() => setShowNotifications(!showNotifications)}
              onMarkNotificationRead={(id) => {
                setNotifications(prev => 
                  prev.map(n => n.id === id ? { ...n, read: true } : n)
                )
              }}
              onLogout={handleLogout}
            />
            {isMobile && isSidebarOpen && (
              <div 
                className="sidebar-overlay"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </>
        )}
        <div className={`main-content ${!currentUser ? 'customer-mode' : ''}`}>
          {renderContent()}
          {currentUser && selectedTable && activeTab === 'masalar' && selectedTableOrders.length > 0 && isOrderPanelVisible && (
            <OrderPanel
              tableId={selectedTable}
              accountId={selectedAccountId}
              accountName={selectedAccountName}
              orders={selectedTableOrders}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onConfirmOrder={handleConfirmOrder}
              onClose={handleCloseOrderPanel}
            />
          )}
        </div>
      </div>
      {accountModalState.isOpen && currentUser && (
        <div className="account-modal-overlay" onClick={handleAccountModalClose}>
          <div className="account-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <div className="account-modal-title">
                <div className="account-modal-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <span>HESAP SEÇİMİ</span>
                  <h3>Masa {accountModalState.tableId} için hesap seçin</h3>
                </div>
              </div>
              <button className="account-modal-close" onClick={handleAccountModalClose} aria-label="Kapat">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="account-modal-body">
              <div className="account-modal-section account-create-section">
                <div className="account-section-header">
                  <div className="account-section-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <label htmlFor="account-name-input">Müşteri Adı</label>
                </div>
                <div className="account-input-wrapper">
                  <input
                    id="account-name-input"
                    type="text"
                    value={accountNameInput}
                    placeholder="Örn. Ayşe, Ali, Çocuk Masası..."
                    onChange={(e) => setAccountNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && accountNameInput.trim()) {
                        handleCreateNamedAccount()
                      }
                    }}
                  />
                </div>
                <div className="account-modal-actions">
                  <button
                    type="button"
                    className="account-btn-primary"
                    onClick={handleCreateNamedAccount}
                    disabled={!accountNameInput.trim()}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Yeni Hesap Başlat</span>
                  </button>
                  <button
                    type="button"
                    className="account-btn-secondary"
                    onClick={() => handleTableSelect(accountModalState.tableId, { accountId: DEFAULT_ACCOUNT_ID })}
                  >
                    <span>Ad girmeden devam et</span>
                  </button>
                </div>
              </div>
              <div className="account-modal-divider">
                <span>veya</span>
              </div>
              <div className="account-modal-section account-list">
                <div className="account-section-header">
                  <div className="account-section-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 19V5C17 4.46957 16.7893 3.96086 16.4142 3.58579C16.0391 3.21071 15.5304 3 15 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19L10 15L17 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4>Mevcut hesaplar</h4>
                </div>
                {modalAccounts.length === 0 ? (
                  <div className="account-empty-state">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 8V24M8 16H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Bu masa için henüz hesap yok.</span>
                  </div>
                ) : (
                  <div className="account-chip-group">
                    {modalAccounts.map(account => {
                      const totalItems = (account.items || []).reduce((sum, item) => sum + item.quantity, 0)
                      const displayName = account.id === DEFAULT_ACCOUNT_ID
                        ? 'Genel Hesap'
                        : (account.name || 'İsimsiz Hesap')
                      return (
                        <button
                          key={account.id}
                          type="button"
                          className="account-chip"
                          onClick={() => handleTableSelect(accountModalState.tableId, { accountId: account.id })}
                        >
                          <div className="account-chip-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 19V5C17 4.46957 16.7893 3.96086 16.4142 3.58579C16.0391 3.21071 15.5304 3 15 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19L10 15L17 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="account-chip-content">
                            <strong>{displayName}</strong>
                            {totalItems > 0 && (
                              <span className="account-chip-badge">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 7H11M7 3V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {totalItems} ürün
                              </span>
                            )}
                          </div>
                          <div className="account-chip-arrow">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-icon">
              <CheckCircle size={64} />
            </div>
            <h2 className="success-modal-title">{successMessage.title || 'Siparişiniz Alındı!'}</h2>
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
    </>
  )

  return (
    <Routes>
      <Route path="/admin" element={
          currentUser ? (
            <div className="app">
              {mainLayout}
            </div>
          ) : (
            <AdminLogin />
          )
        } 
      />
      <Route
        path="/garson"
        element={
          currentUser ? (
            <div className="app">
              {mainLayout}
            </div>
          ) : (
            <WaiterLogin />
          )
        }
      />
      <Route path="/" element={
        <div className="app">
          {mainLayout}
        </div>
      } />
      <Route path="*" element={
        <div className="app">
          {mainLayout}
        </div>
      } />
    </Routes>
  )
}

export default App

