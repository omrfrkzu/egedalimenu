import React from 'react'
import './SettingsView.css'

const SettingsView = () => {
  return (
    <div className="settings-view">
      <div className="settings-header">
        <h2>Ayarlar</h2>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <h3>Genel Ayarlar</h3>
          <div className="settings-item">
            <label>Restoran Adı</label>
            <input type="text" defaultValue="Restoran POS" />
          </div>
          <div className="settings-item">
            <label>Vergi Oranı (%)</label>
            <input type="number" defaultValue="20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsView

