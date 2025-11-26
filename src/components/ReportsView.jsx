import React, { useState, useMemo } from 'react'
import './ReportsView.css'

const ReportsView = ({ stats, paymentRecords = [] }) => {
  const [timeFilter, setTimeFilter] = useState('günlük') // günlük, haftalık, aylık

  // Tarih filtreleme fonksiyonu
  const filterByTime = (records, filter) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'günlük':
        return records.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= today
        })
      case 'haftalık':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return records.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= weekAgo
        })
      case 'aylık':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return records.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= monthAgo
        })
      default:
        return records
    }
  }

  // Filtrelenmiş kayıtlar
  const filteredRecords = useMemo(() => {
    return filterByTime(paymentRecords, timeFilter)
  }, [paymentRecords, timeFilter])

  // Toplam ciro
  const totalRevenue = useMemo(() => {
    return filteredRecords.reduce((sum, record) => sum + record.total, 0)
  }, [filteredRecords])

  // Toplam sipariş sayısı
  const totalOrders = useMemo(() => {
    return filteredRecords.length
  }, [filteredRecords])

  // Ürün bazlı satış raporu
  const productSales = useMemo(() => {
    const productMap = {}
    filteredRecords.forEach(record => {
      record.items.forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0
          }
        }
        productMap[item.id].quantity += item.quantity
        productMap[item.id].revenue += item.total
      })
    })
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue)
  }, [filteredRecords])

  // Ödeme türü bazlı rapor
  const paymentMethodStats = useMemo(() => {
    const methodMap = {}
    filteredRecords.forEach(record => {
      if (!methodMap[record.paymentMethod]) {
        methodMap[record.paymentMethod] = {
          method: record.paymentMethod,
          count: 0,
          revenue: 0
        }
      }
      methodMap[record.paymentMethod].count += 1
      methodMap[record.paymentMethod].revenue += record.total
    })
    return Object.values(methodMap).sort((a, b) => b.revenue - a.revenue)
  }, [filteredRecords])

  // Müşteri sayısı (benzersiz hesap adları - Genel Hesap dahil)
  const uniqueCustomers = useMemo(() => {
    const customerSet = new Set()
    filteredRecords.forEach(record => {
      if (record.accountName) {
        customerSet.add(record.accountName)
      }
    })
    return customerSet.size
  }, [filteredRecords])

  // Ortalama sipariş tutarı
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="reports-view">
      <div className="reports-header">
        <h2>Raporlar</h2>
        <div className="time-filter-buttons">
          <button
            className={timeFilter === 'günlük' ? 'active' : ''}
            onClick={() => setTimeFilter('günlük')}
          >
            Günlük
          </button>
          <button
            className={timeFilter === 'haftalık' ? 'active' : ''}
            onClick={() => setTimeFilter('haftalık')}
          >
            Haftalık
          </button>
          <button
            className={timeFilter === 'aylık' ? 'active' : ''}
            onClick={() => setTimeFilter('aylık')}
          >
            Aylık
          </button>
        </div>
      </div>

      <div className="reports-content">
        {/* Genel İstatistikler */}
        <div className="report-card">
          <h3>Toplam Ciro</h3>
          <p className="report-value">{totalRevenue.toFixed(2)} ₺</p>
        </div>
        <div className="report-card">
          <h3>Toplam Sipariş</h3>
          <p className="report-value">{totalOrders}</p>
        </div>
        <div className="report-card">
          <h3>Ortalama Sipariş</h3>
          <p className="report-value">{averageOrder.toFixed(2)} ₺</p>
        </div>
        <div className="report-card">
          <h3>Müşteri Sayısı</h3>
          <p className="report-value">{uniqueCustomers}</p>
        </div>
      </div>

      {/* Ödeme Türü Bazlı Rapor */}
      <div className="report-section">
        <h3 className="section-title">Ödeme Türü Bazlı Rapor</h3>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Ödeme Türü</th>
                <th>Sipariş Sayısı</th>
                <th>Toplam Ciro</th>
                <th>Ortalama</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethodStats.length > 0 ? (
                paymentMethodStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{stat.method}</td>
                    <td>{stat.count}</td>
                    <td>{stat.revenue.toFixed(2)} ₺</td>
                    <td>{(stat.revenue / stat.count).toFixed(2)} ₺</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-message">Henüz ödeme kaydı yok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ürün Bazlı Satış Raporu */}
      <div className="report-section">
        <h3 className="section-title">Ürün Bazlı Satış Raporu</h3>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Satılan Adet</th>
                <th>Toplam Ciro</th>
                <th>Birim Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {productSales.length > 0 ? (
                productSales.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.revenue.toFixed(2)} ₺</td>
                    <td>{(product.revenue / product.quantity).toFixed(2)} ₺</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-message">Henüz ürün satışı yok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsView
