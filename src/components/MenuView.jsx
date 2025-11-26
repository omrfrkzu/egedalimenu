import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Check, X, Minus, Info } from 'lucide-react'
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
  const [menuData, setMenuData] = useState([])
  const [loading, setLoading] = useState(true)
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
  
  const getTableTotal = (tableId) => {
    const tableOrders = orders[tableId] || []
    return tableOrders.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Menü verilerini yükle
  useEffect(() => {
    fetch('/menu-data-clean.json')
      .then(res => res.json())
      .then(data => {
        setMenuData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Menü verileri yüklenirken hata:', err)
        setLoading(false)
      })
  }, [])

  // Kategorileri ve menü öğelerini dinamik olarak oluştur
  const { categories, menuItems } = useMemo(() => {
    if (!menuData || menuData.length === 0) {
      return { categories: [], menuItems: {} }
    }
    // Kategorileri topla
    const categorySet = new Set()
    menuData.forEach(item => {
      if (!item.category) return

      const isMezeCategory = item.category.toLocaleLowerCase('tr-TR') === 'mezeler'
      // Mezeler kategorisi sadece admin tarafından görülebilsin
      if (isMezeCategory && !isAdmin) {
        return
      }

      if (item.category) {
        categorySet.add(item.category)
      }
    })
    
    const categoryList = Array.from(categorySet).map((cat, index) => ({
      id: cat.toLowerCase().replace(/\s+/g, '-'),
      label: cat
    }))
    
    // İlk kategoriyi varsayılan olarak ayarla
    const defaultCategory = categoryList[0]?.id || ''
    
    // Menü öğelerini kategorilere göre grupla
    const groupedItems = {}
    menuData.forEach((item, index) => {
      if (!item.category) return

      const isMezeCategory = item.category.toLocaleLowerCase('tr-TR') === 'mezeler'
      // Mezeler kategorisindeki ürünler admin değilse tamamen gizlenir
      if (isMezeCategory && !isAdmin) {
        return
      }

      const categoryId = item.category.toLowerCase().replace(/\s+/g, '-')
      if (!groupedItems[categoryId]) {
        groupedItems[categoryId] = []
      }
      
      // Fiyatı parse et (₺ işaretini kaldır ve sayıya çevir)
      const priceStr = item.price?.replace(/[₺\s]/g, '') || '0'
      const price = parseFloat(priceStr) || 0
      
      // Görsel URL'sini koru - sadece gerçekten geçersiz URL'leri filtrele
      let imageUrl = item.image || ''
      // Geçerli URL'leri koru (http://, https://, veya / ile başlayan)
      // Sadece "ges/" gibi kısmi ve geçersiz URL'leri filtrele
      if (imageUrl && 
          !imageUrl.startsWith('http://') && 
          !imageUrl.startsWith('https://') && 
          !imageUrl.startsWith('/') &&
          imageUrl.startsWith('ges/')) {
        // Sadece "ges/" ile başlayan ve http/https olmayan URL'leri filtrele
        imageUrl = ''
      }
      
      groupedItems[categoryId].push({
        id: index + 1,
        name: formatProductName(item.name),
        price: price,
        image: imageUrl,
        description: item.description || '',
        slug: item.slug || '',
        category: item.category,
        categoryCode: item.categoryCode || ''
      })
    })
    
    return {
      categories: categoryList,
      menuItems: groupedItems,
      defaultCategory
    }
  }, [menuData, isAdmin])

  const [activeCategory, setActiveCategory] = useState('')
  const [showTableSelector, setShowTableSelector] = useState(false)

  // Kategori değiştiğinde ilk kategoriyi ayarla
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

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

  const handleItemClick = (item) => {
    if (!item.description) return
    setSelectedItem(item)
  }

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

  return (
    <div className="menu-view">
      <div className="menu-content-wrapper">
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

      <div className="categories-scroll">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="menu-items-grid">
        {menuItems[activeCategory]?.map((item) => {
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
            <div className="menu-item-image">
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
            <div className="menu-item-info">
              <h3 className="menu-item-name">{item.name}</h3>
              {!isMezeActiveCategory && (
                <p className="menu-item-price">{item.price.toFixed(2)} ₺</p>
              )}
            </div>
            {(!isCustomerMode || (isCustomerMode && selectedTable)) && (
              <button
                className={`menu-item-add-btn ${addedItems.has(item.id) ? 'added' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isCustomerMode && !selectedTable) {
                    alert('Lütfen önce bir masa seçin!')
                    return
                  }
                  onAddItem(item)
                  // Tik işareti göster
                  setAddedItems(prev => new Set(prev).add(item.id))
                  // 2 saniye sonra tik işaretini kaldır
                  setTimeout(() => {
                    setAddedItems(prev => {
                      const newSet = new Set(prev)
                      newSet.delete(item.id)
                      return newSet
                    })
                  }, 2000)
                }}
                disabled={isCustomerMode && !selectedTable}
              >
                {addedItems.has(item.id) ? (
                  <>
                    <Check size={18} />
                    Eklendi
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Ekle
                  </>
                )}
              </button>
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

      {/* Ürün Detay Modal - Admin panel stili */}
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
            <div className="product-modal-header">
              <div className="product-modal-title">
                <div className="product-modal-icon">🍽️</div>
                <div>
                  <span className="product-modal-label">Ürün Detayı</span>
                  <h3>{selectedItem.name}</h3>
                </div>
              </div>
              <button 
                className="product-modal-close"
                onClick={() => {
                  setSelectedItem(null)
                }}
                aria-label="Ürün detayını kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="product-modal-body">
              <div className="product-modal-hero">
                <div className="product-modal-image">
                  {selectedItem.image && selectedItem.image.trim() !== '' ? (
                    <>
                      <img 
                        src={selectedItem.image} 
                        alt={selectedItem.name}
                        onError={(e) => {
                          if (e.target && e.target.nextSibling) {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="product-modal-image-fallback" style={{ display: 'none' }}>
                        🍽️
                      </div>
                    </>
                  ) : (
                    <div className="product-modal-image-fallback">🍽️</div>
                  )}
                </div>

                <div className="product-modal-info">
                  {selectedItem.category && (
                    <span className="product-modal-category">{selectedItem.category}</span>
                  )}
                  <h2 className="product-modal-name">{selectedItem.name}</h2>
                  {selectedItem.description && (
                    <p className="product-modal-description">{selectedItem.description}</p>
                  )}

                  <div className="product-modal-price-card">
                    <span>Fiyat</span>
                    <strong>{selectedItem.price.toFixed(2)} ₺</strong>
                  </div>
                </div>
              </div>

              <div className="product-modal-footer">
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
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default MenuView

