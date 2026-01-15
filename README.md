# Egedalı Gurme Restaurant - Menu & Admin Panel

A modern restaurant menu ordering system with admin panel to track orders.

## Features

### Customer Menu (index.html)
- Browse menu items by category (Sandwiches, Appetizers, Breakfast, etc.)
- Search functionality
- Add items to cart
- Select table location (Upper Floor, Lower Floor, Garden)
- Complete orders with table assignment
- Responsive design for mobile and desktop

### Admin Panel (admin.html)
- **Yeni Sipariş Oluşturma:**
  - Masa seçimi (Üst Kat, Alt Kat, Bahçe)
  - Menüden ürün seçimi
  - Sipariş sepeti
  - Sipariş oluşturma
- **Hazırlanıyor Kısmı:**
  - Tüm aktif siparişleri görüntüleme
  - İstatistik paneli:
    - Toplam sipariş sayısı
    - Toplam gelir
    - Ortalama sipariş tutarı
    - Aktif masa sayısı
  - Sipariş detayları:
    - Masa konumu ve numarası
    - Sipariş zamanı
    - Sipariş edilen ürünler ve miktarları
    - Toplam tutar
    - Sipariş durumu (Hazırlanıyor)
  - Siparişi tamamlama
  - Siparişi silme
  - Tüm siparişleri temizleme
  - Her 30 saniyede otomatik yenileme
  - Manuel yenileme butonu

## How to Use

### For Customers
1. Open `index.html` in your browser
2. Browse menu items or use search
3. Click on items to view details
4. Add items to cart using "Sepete Ekle" button
5. Click cart icon to review order
6. Select a table from the dropdown
7. Click "Siparişi Tamamla" to submit order

### For Admin (Garson)
1. `admin.html` sayfasını açın
2. **Yeni Sipariş Oluşturma:**
   - Masa seçin (Üst Kat/Alt Kat/Bahçe)
   - Menü kategorisinden ürün seçin
   - Ürünleri sepete ekleyin
   - "Sipariş Oluştur" butonuna tıklayın
3. **Siparişleri Takip Etme:**
   - "Siparişler" sekmesine geçin
   - Hazırlanan tüm siparişleri görüntüleyin
   - Sipariş hazır olduğunda "Tamamlandı" butonuna tıklayın
   - Gerekirse "Sil" butonu ile siparişi iptal edin
4. **İstatistikler:**
   - Toplam sipariş sayısını görüntüleyin
   - Toplam geliri takip edin
   - Aktif masa sayısını kontrol edin

## Technical Details

- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Storage:** LocalStorage for persistent data
- **No backend required** - all data stored in browser

## Files Structure

```
egedali-menu/
├── index.html          # Customer menu page
├── admin.html          # Admin panel page
├── script.js           # Customer menu functionality
├── admin.js            # Admin panel functionality
├── styles.css          # Custom styles and animations
└── README.md           # Documentation
```

## Data Storage

Orders are stored in localStorage with the following structure:
```javascript
{
  id: timestamp,
  timestamp: ISO date string,
  table: { category: string, number: string },
  items: [{ id, name, price, quantity, image }],
  total: number,
  status: 'preparing' // Hazırlanıyor durumu
}
```

## Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- LocalStorage API
- CSS Grid & Flexbox
- Tailwind CSS

## Önemli Notlar

- Veriler tarayıcının localStorage'unda saklanır
- Tarayıcı verilerini temizlemek tüm siparişleri siler
- Her tarayıcı/cihaz ayrı sipariş deposuna sahiptir
- Sunucu taraflı işleme gerekmez
- **Garsonlar admin panelinden** yeni sipariş oluşturabilir
- **Müşteriler ana sayfadan** kendi siparişlerini verebilir
- Tüm siparişler "Hazırlanıyor" bölümüne düşer
- Hazır olan siparişler "Tamamlandı" butonu ile tamamlanır
