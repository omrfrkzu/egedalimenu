import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Plus, Check, X, Minus, Info, Coffee, GlassWater, UtensilsCrossed, Cookie, Table as TableIcon, Printer, CreditCard } from 'lucide-react'
import './MenuView.css'

// Ürün adını formatla: Tüm harfler büyük
const formatProductName = (name) => {
  if (!name || typeof name !== 'string') return name
  
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.toLocaleUpperCase('tr-TR'))
    .join(' ')
}

const MenuView = ({
  onAddItem,
  showCreateButton = false,
  onCreateTable,
  actionLabel = 'Masayı Oluştur',
  selectedTable,
  onTableSelect,
  isCustomerMode = false,
  orders = {},
  onCompleteOrder,
  occupiedTables = {},
  onUpdateQuantity,
  isAdmin = false
}) => {
  const [categoryIndex, setCategoryIndex] = useState([])
  const [categoryItems, setCategoryItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingCategoryId, setLoadingCategoryId] = useState('')
  const [menuError, setMenuError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [orderNote, setOrderNote] = useState('')
  const [activeFloor, setActiveFloor] = useState(null)
  const [addedItems, setAddedItems] = useState(new Set())
  
  // Masalar listesi
  const tables = [
    { id: 1, number: 1, floor: 'Üst Kat' },
    { id: 2, number: 2, floor: 'Üst Kat' },
    { id: 3, number: 3, floor: 'Üst Kat' },
    { id: 4, number: 4, floor: 'Üst Kat' },
    { id: 5, number: 5, floor: 'Üst Kat' },
    { id: 6, number: 6, floor: 'Üst Kat' },
    { id: 7, number: 7, floor: 'Üst Kat' },
    { id: 8, number: 1, floor: 'Alt Kat' },
    { id: 9, number: 2, floor: 'Alt Kat' },
    { id: 10, number: 3, floor: 'Alt Kat' },
    { id: 11, number: 4, floor: 'Alt Kat' },
    { id: 12, number: 5, floor: 'Alt Kat' },
    { id: 13, number: 1, floor: 'Bahçe' },
    { id: 14, number: 2, floor: 'Bahçe' },
    { id: 15, number: 3, floor: 'Bahçe' },
  ]
  
  const normalizeMenuItems = useCallback((items = []) => {
    return items.map((item, index) => {
      const priceStr = item.price?.replace(/[₺\s]/g, '') || '0'
      const price = parseFloat(priceStr) || 0
      let imageUrl = item.image || ''
      if (
        imageUrl &&
        !imageUrl.startsWith('http://') &&
        !imageUrl.startsWith('https://') &&
        !imageUrl.startsWith('/') &&
        imageUrl.startsWith('ges/')
      ) {
        imageUrl = ''
      }

      const generatedId = item.__generatedId ?? item.id ?? `${item.slug || 'menu-item'}-${index + 1}`

      return {
        id: generatedId,
        name: formatProductName(item.name),
        price,
        image: imageUrl,
        description: item.description || '',
        slug: item.slug || '',
        category: item.category,
        categoryCode: item.categoryCode || ''
      }
    })
  }, [])

  const fetchCategoryItems = useCallback(async (categoryId) => {
    if (!categoryId) return
    try {
      setLoadingCategoryId(categoryId)
      const response = await fetch(`/menu/${categoryId}.json`)
      if (!response.ok) {
        throw new Error(`Kategori ${categoryId} yüklenemedi`)
      }
      const data = await response.json()
      setCategoryItems(prev => ({
        ...prev,
        [categoryId]: normalizeMenuItems(data)
      }))
    } catch (error) {
      console.error(`Kategori ${categoryId} verileri alınırken hata:`, error)
      setMenuError('Menü verileri yüklenirken bir hata oluştu.')
    } finally {
      setLoadingCategoryId(current => (current === categoryId ? '' : current))
    }
  }, [normalizeMenuItems])

  const getTableTotal = (tableId) => {
    const tableOrders = orders[tableId] || []
    return tableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Menü kategorilerini yükle
  useEffect(() => {
    let isMounted = true

    const loadIndex = async () => {
      try {
        const response = await fetch('/menu/index.json')
        if (!response.ok) {
          throw new Error('Menü dizini yüklenemedi')
        }
        const data = await response.json()
        if (isMounted) {
          setCategoryIndex(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Menü kategorileri yüklenirken hata:', error)
        if (isMounted) {
          setMenuError('Menü verileri yüklenirken bir hata oluştu.')
          setLoading(false)
        }
      }
    }

    loadIndex()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleCategories = useMemo(() => {
    if (!categoryIndex || categoryIndex.length === 0) {
      return []
    }

    return categoryIndex.filter((category) => {
      const label = category.label || ''
      const categoryId = category.id || ''
      const isMezeCategory = label.toLocaleLowerCase('tr-TR') === 'mezeler'
      const isFavorilerCategory = categoryId === 'favoriler' || label.toLocaleLowerCase('tr-TR') === 'favoriler'
      
      // Mezeler kategorisi sadece admin ve garson (müşteri olmayan) tarafından görülebilir
      // isCustomerMode true ise mezeleri gizle, false ise (admin/garson) göster
      if (isMezeCategory) {
        return !isCustomerMode
      }
      
      // Favoriler kategorisi sadece müşteri modunda görülebilir
      // isCustomerMode false ise (admin/garson) favorileri gizle
      if (isFavorilerCategory) {
        return isCustomerMode
      }
      
      return true
    })
  }, [categoryIndex, isCustomerMode])

  const [activeCategory, setActiveCategory] = useState('')
  const [showTableSelector, setShowTableSelector] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [productQuantities, setProductQuantities] = useState({})
  
  // Kategori ikonları
  const getCategoryIcon = (categoryId) => {
    const iconMap = {
      'favoriler': Coffee,
      'kahvaltı-tabakları': UtensilsCrossed,
      'mezeler': Cookie,
      'sandviçler': UtensilsCrossed,
      'sıcak-lezzetler': UtensilsCrossed,
      'yumurta-çeşitleri': UtensilsCrossed,
    }
    return iconMap[categoryId] || Coffee
  }
  
  // Seçili masanın siparişlerini al
  const currentTableOrders = useMemo(() => {
    if (!selectedTable || !orders[selectedTable]) return []
    return orders[selectedTable] || []
  }, [selectedTable, orders])
  
  // Ürün miktarlarını güncelle
  useEffect(() => {
    const quantities = {}
    currentTableOrders.forEach(item => {
      quantities[item.id] = item.quantity || 0
    })
    setProductQuantities(quantities)
  }, [currentTableOrders])

  // Kategori değiştiğinde ilk kategoriyi ayarla
  useEffect(() => {
    if (visibleCategories.length === 0) return
    const isActiveVisible = visibleCategories.some(category => category.id === activeCategory)
    if (!activeCategory || !isActiveVisible) {
      setActiveCategory(visibleCategories[0]?.id || '')
    }
  }, [visibleCategories, activeCategory])

  // Sipariş tamamlandığında veya masa değiştiğinde not alanını temizle
  useEffect(() => {
    if (isCustomerMode && selectedTable) {
      const tableOrders = orders[selectedTable] || []
      if (tableOrders.length === 0) {
        setOrderNote('')
      }
    } else if (!selectedTable) {
      setOrderNote('')
    }
  }, [isCustomerMode, selectedTable, orders])

  // Modal açıldığında scroll'u en üste al
  useEffect(() => {
    if (showTableSelector) {
      // Modal içeriğini en üste kaydır
      setTimeout(() => {
        const modalBody = document.querySelector('.table-selector-body')
        if (modalBody) {
          modalBody.scrollTop = 0
        }
        // Modal overlay'ini de en üste kaydır
        const modal = document.querySelector('.table-selector-modal')
        if (modal) {
          modal.scrollTop = 0
        }
      }, 100)
    }
  }, [showTableSelector])

  // Ürün detay modali açıkken modal sabit kalacak, arka plandaki sayfa scroll edilebilir olacak
  useEffect(() => {
    if (!selectedItem) return

    const handleWheel = (e) => {
      const modalContent = e.target.closest('.product-modal-content')
      const modalBody = e.target.closest('.product-modal-body')
      
      // Modal body içindeyse ve scroll edilebilir içerik varsa, modal içinde scroll yap
      if (modalBody) {
        const isScrollable = modalBody.scrollHeight > modalBody.clientHeight
        const isAtTop = modalBody.scrollTop === 0
        const isAtBottom = modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight - 1
        
        // Modal içinde scroll yapılabilir ve sınırda değilse, normal scroll yap
        if (isScrollable && !(isAtTop && e.deltaY < 0) && !(isAtBottom && e.deltaY > 0)) {
          return // Modal içinde scroll yap
        }
      }
      
      // Modal içinde değilse veya modal scroll sınırındaysa, arka plandaki sayfaya scroll yap
      if (!modalContent || (modalBody && ((modalBody.scrollTop === 0 && e.deltaY < 0) || (modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight - 1 && e.deltaY > 0)))) {
        window.scrollBy(0, e.deltaY)
        e.preventDefault()
      }
    }

    // Overlay'e wheel event ekle
    const overlay = document.querySelector('.product-modal-overlay')
    if (overlay) {
      overlay.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener('wheel', handleWheel)
      }
    }
  }, [selectedItem])

  // Masaları katlara göre grupla
  const tablesByFloor = useMemo(() => {
    return tables.reduce((acc, table) => {
      if (!acc[table.floor]) {
        acc[table.floor] = []
      }
      acc[table.floor].push(table)
      return acc
    }, {})
  }, [])

  // İlk katı varsayılan olarak ayarla
  useEffect(() => {
    if (showTableSelector && !activeFloor && Object.keys(tablesByFloor).length > 0) {
      setActiveFloor(Object.keys(tablesByFloor)[0])
    }
  }, [showTableSelector, activeFloor, tablesByFloor])

  useEffect(() => {
    if (!activeCategory) return
    if (categoryItems[activeCategory]) return
    fetchCategoryItems(activeCategory)
  }, [activeCategory, categoryItems, fetchCategoryItems])

  const handleItemClick = useCallback((item) => {
    if (!item.description) return
    setSelectedItem(item)
  }, [])

  if (loading) {
    return (
      <div className="menu-view">
        <div className="menu-header">
          <h2>Menü</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Menü yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (menuError) {
    return (
      <div className="menu-view">
        <div className="menu-header">
          <h2>Menü</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>{menuError}</p>
        </div>
      </div>
    )
  }

  // Filtreleme için ürün isimlerini al
  const productFilters = useMemo(() => {
    if (!categoryItems[activeCategory]) return []
    const items = categoryItems[activeCategory]
    const filters = ['all']
    items.forEach(item => {
      const name = item.name.toLowerCase()
      if (name.includes('ice') || name.includes('iced')) {
        if (!filters.includes('ice coffee')) filters.push('ice coffee')
      }
      if (name.includes('american')) {
        if (!filters.includes('american')) filters.push('american')
      }
      if (name.includes('café') || name.includes('cafe')) {
        if (!filters.includes('café noir')) filters.push('café noir')
      }
      if (name.includes('brewed')) {
        if (!filters.includes('brewed coffee')) filters.push('brewed coffee')
      }
      if (name.includes('flavored')) {
        if (!filters.includes('flavored coffee')) filters.push('flavored coffee')
      }
    })
    return filters
  }, [categoryItems, activeCategory])

  // Filtrelenmiş ürünler
  const filteredItems = useMemo(() => {
    if (!categoryItems[activeCategory]) return []
    let items = categoryItems[activeCategory].slice().sort((a, b) => {
      return a.name.localeCompare(b.name, 'tr-TR', { sensitivity: 'base' })
    })
    
    if (selectedFilter !== 'all') {
      items = items.filter(item => {
        const name = item.name.toLowerCase()
        if (selectedFilter === 'ice coffee') {
          return name.includes('ice') || name.includes('iced')
        }
        if (selectedFilter === 'american') {
          return name.includes('american')
        }
        if (selectedFilter === 'café noir') {
          return name.includes('café') || name.includes('cafe')
        }
        if (selectedFilter === 'brewed coffee') {
          return name.includes('brewed')
        }
        if (selectedFilter === 'flavored coffee') {
          return name.includes('flavored')
        }
        return true
      })
    }
    return items
  }, [categoryItems, activeCategory, selectedFilter])

  // Toplam hesapla
  const orderTotal = useMemo(() => {
    return currentTableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [currentTableOrders])

  const orderItemCount = useMemo(() => {
    return currentTableOrders.length
  }, [currentTableOrders])

  const orderQuantityTotal = useMemo(() => {
    return currentTableOrders.reduce((sum, item) => sum + item.quantity, 0)
  }, [currentTableOrders])

  return (
    <div className="menu-view">
      <div className="menu-content-wrapper">
        {/* Sol Kategori Sidebar */}
        <div className="menu-category-sidebar">
          {visibleCategories.map((category) => {
            const Icon = getCategoryIcon(category.id)
            return (
              <button
                key={category.id}
                className={`category-sidebar-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon size={20} />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>

        <div className="menu-content">
          <div className="menu-header">
        <h2>Menü</h2>
        {isCustomerMode && (
          <div className="customer-table-selector-wrapper">
            {!selectedTable ? (
              <div className="table-selector-trigger" onClick={() => setShowTableSelector(true)}>
                <div className="trigger-content">
                  <div className="trigger-text">
                    <span className="trigger-label">Masa Seçin</span>
                    <span className="trigger-hint">Masa numaranızı seçerek hızlıca sipariş verebilirsiniz.</span>
                  </div>
                </div>
                <span className="trigger-arrow">›</span>
              </div>
            ) : (
              <div className="selected-table-card">
                <div className="selected-table-content">
                  <div className="selected-table-icon">
                    <Check size={20} />
                  </div>
                  <div className="selected-table-details">
                    <span className="selected-table-label">Seçili Masa</span>
                    <span className="selected-table-name">
                      {tables.find(t => t.id === selectedTable)?.floor} - Masa {tables.find(t => t.id === selectedTable)?.number}
                    </span>
                  </div>
                </div>
                {orders[selectedTable] && orders[selectedTable].length > 0 && (
                  <div className="selected-table-total">
                    {getTableTotal(selectedTable).toFixed(2)} ₺
                  </div>
                )}
                <button 
                  className="change-table-btn"
                  onClick={() => {
                    // Masa seçimini temizle ve modalı aç
                    onTableSelect && onTableSelect(null)
                    setShowTableSelector(true)
                  }}
                  title="Masa Değiştir"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {showTableSelector && (
              <div className="table-selector-modal" onClick={() => setShowTableSelector(false)}>
                <div className="table-selector-content" onClick={(e) => e.stopPropagation()}>
                  <div className="table-selector-header">
                    <h3>Masa Seçin</h3>
                    <button 
                      className="close-selector-btn"
                      onClick={() => setShowTableSelector(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="table-selector-body">
                    <div className="table-floor-tabs">
                      {Object.keys(tablesByFloor).map((floor) => (
                        <button
                          key={floor}
                          type="button"
                          className={`table-floor-tab ${activeFloor === floor ? 'active' : ''}`}
                          onClick={() => setActiveFloor(floor)}
                        >
                          {floor}
                        </button>
                      ))}
                    </div>
                    {activeFloor && tablesByFloor[activeFloor] && (
                      <div className="table-floor-section">
                        <div className="tables-grid-selector">
                          {tablesByFloor[activeFloor].map(table => {
                            const isOccupied = occupiedTables[table.id]
                            const isSelected = selectedTable === table.id
                            return (
                              <button
                                key={table.id}
                                className={`table-card-selector ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                                onClick={() => {
                                  if (isOccupied) {
                                    alert('Bu masa şu anda dolu. Lütfen başka bir masa seçin.')
                                    return
                                  }
                                  // Yeni masa seçildiğinde direkt seç
                                  onTableSelect && onTableSelect(table.id)
                                  setShowTableSelector(false)
                                }}
                                disabled={isOccupied}
                              >
                                <div className="table-card-number">{table.number}</div>
                                {isOccupied && (
                                  <div className="table-occupied-badge">
                                    <X size={14} />
                                    <span>Dolu</span>
                                  </div>
                                )}
                                {isSelected && !isOccupied && (
                                  <div className="table-selected-badge">
                                    <Check size={14} />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isCustomerMode && !selectedTable && (
        <div className="customer-table-prompt">
          <p>Günlük meze çeşitlerimizi tezgahımızdan görerek sipariş verebilirsiniz</p>
        </div>
      )}

      {/* Ürün Filtre Butonları */}
      {productFilters.length > 1 && (
        <div className="product-filters">
          {productFilters.map((filter) => (
            <button
              key={filter}
              className={`product-filter-btn ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter === 'all' ? 'Tümü' : filter}
            </button>
          ))}
        </div>
      )}

      <div className="menu-items-grid">
        {loadingCategoryId === activeCategory && !categoryItems[activeCategory] && (
          <div className="menu-loading-state">
            <p>Menü yükleniyor...</p>
          </div>
        )}
        {filteredItems.map((item) => {
          const isMezeActiveCategory = activeCategory === 'mezeler'
          // Mezeler kategorisinde açıklama ve detay kapalı olacak
          const hasDescription = Boolean(item.description) && !isMezeActiveCategory
          return (
            <div 
              key={item.id} 
              className={`menu-item-card ${hasDescription ? 'has-description' : ''}`}
            onClick={() => {
              if (!isMezeActiveCategory && hasDescription) {
                handleItemClick(item)
              }
            }}
            >
            {!isMezeActiveCategory && (
              <div className="menu-item-image">
                {item.image && item.image.trim() !== '' ? (
                  <>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
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
                    <div className="menu-item-image-fallback" style={{ display: 'none' }}>
                      🍽️
                    </div>
                  </>
                ) : (
                  <div className="menu-item-image-fallback">🍽️</div>
                )}
                {hasDescription && (
                  <div className="menu-item-info-icon">
                    <Info size={20} />
                  </div>
                )}
              </div>
            )}
            <div className="menu-item-info">
              <h3 className="menu-item-name">{item.name}</h3>
              {!isMezeActiveCategory && (
                <p className="menu-item-price">${item.price.toFixed(2)}</p>
              )}
            </div>
            {(!isCustomerMode || (isCustomerMode && selectedTable)) && (
              <div className="menu-item-quantity-controls">
                <button
                  className="quantity-btn minus"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isCustomerMode && !selectedTable) {
                      alert('Lütfen önce bir masa seçin!')
                      return
                    }
                    const currentQty = productQuantities[item.id] || 0
                    if (currentQty > 0 && onUpdateQuantity && selectedTable) {
                      onUpdateQuantity(selectedTable, item.id, -1)
                    }
                  }}
                  disabled={isCustomerMode && (!selectedTable || (productQuantities[item.id] || 0) === 0)}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={productQuantities[item.id] || 0}
                  readOnly
                  min="0"
                />
                <button
                  className="quantity-btn plus"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isCustomerMode && !selectedTable) {
                      alert('Lütfen önce bir masa seçin!')
                      return
                    }
                    if (onAddItem) {
                      onAddItem(item)
                    }
                  }}
                  disabled={isCustomerMode && !selectedTable}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          )
        })}
      </div>
      
      {showCreateButton && (
        <div className="menu-create-table">
          <button
            className="create-table-btn"
            onClick={onCreateTable}
          >
            {actionLabel}
          </button>
        </div>
      )}

        </div>
        </div>

        {/* Sağ Sipariş Özeti Sidebar */}
        {isCustomerMode && selectedTable && (
          <div className="menu-order-sidebar">
            <div className="order-sidebar-header">
              <div className="invoice-info">
                <p className="invoice-number">Invoice No: 123454 23/01/2024 | 14:00:23</p>
                <div className="invoice-company">
                  <span className="company-logo">Ep</span>
                  <div>
                    <p className="company-name">Easy POS</p>
                    <p className="company-email">easypos@gmail.com</p>
                  </div>
                </div>
                <p className="table-info">Table {tables.find(t => t.id === selectedTable)?.number || selectedTable}</p>
                <p className="order-info">Order: #{String(selectedTable).padStart(4, '0')}</p>
              </div>
            </div>
            <div className="order-sidebar-content">
              {currentTableOrders.length === 0 ? (
                <div className="empty-order-message">
                  <p>Henüz ürün eklenmedi</p>
                </div>
              ) : (
                <div className="order-items-list">
                  {currentTableOrders.map((orderItem) => (
                    <div key={orderItem.id} className="order-sidebar-item">
                      <div className="order-item-image-small">
                        {orderItem.image && orderItem.image.trim() !== '' ? (
                          <img src={orderItem.image} alt={orderItem.name} />
                        ) : (
                          <div className="order-item-image-fallback-small">🍽️</div>
                        )}
                      </div>
                      <div className="order-item-details">
                        <h4 className="order-item-name">{orderItem.name}</h4>
                        <p className="order-item-unit-price">${orderItem.price.toFixed(2)}</p>
                        <p className="order-item-size">Size: large</p>
                        <p className="order-item-total">${(orderItem.price * orderItem.quantity).toFixed(2)}</p>
                      </div>
                      <div className="order-item-actions">
                        <div className="order-quantity-controls">
                          <button
                            className="order-quantity-btn"
                            onClick={() => onUpdateQuantity && onUpdateQuantity(selectedTable, orderItem.id, -1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="order-quantity">{orderItem.quantity}</span>
                          <button
                            className="order-quantity-btn"
                            onClick={() => onUpdateQuantity && onUpdateQuantity(selectedTable, orderItem.id, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="order-remove-btn"
                          onClick={() => onUpdateQuantity && onUpdateQuantity(selectedTable, orderItem.id, -orderItem.quantity)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="order-sidebar-footer">
              <div className="order-total-section">
                <p className="order-total-label">Total</p>
                <p className="order-total-items">Items: {orderItemCount}, Quantity: {orderQuantityTotal}</p>
                <p className="order-total-amount">${orderTotal.toFixed(2)}</p>
              </div>
              <div className="order-action-buttons">
                <button className="print-invoice-btn">
                  <Printer size={18} />
                  Print Invoice
                </button>
                <button 
                  className="payments-btn"
                  onClick={() => onCompleteOrder && onCompleteOrder(selectedTable, orderNote)}
                  disabled={currentTableOrders.length === 0}
                >
                  <CreditCard size={18} />
                  Payments
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ürün Detay Modal - Framer stili */}
      {selectedItem && (
        <div 
          className="product-modal-overlay" 
          onClick={() => {
            setSelectedItem(null)
          }}
        >
          <div 
            className="product-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="product-modal-inner">
              {selectedItem.image && selectedItem.image.trim() !== '' ? (
                <div className="product-modal-image">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    loading="lazy"
                    decoding="async"
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
                  <div className="product-modal-image-fallback" style={{ display: 'none' }}>
                    🍽️
                  </div>
                </div>
              ) : (
                <div className="product-modal-image">
                  <div className="product-modal-image-fallback">🍽️</div>
                </div>
              )}
              <h2 className="product-modal-title">{selectedItem.name}</h2>
              {selectedItem.description && (
                <p className="product-modal-description">{selectedItem.description}</p>
              )}
              <div className="product-modal-price">
                {selectedItem.price.toFixed(2)}₺
              </div>
            </div>
            <button
              className="product-modal-close-btn"
              onClick={() => {
                setSelectedItem(null)
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default memo(MenuView)

