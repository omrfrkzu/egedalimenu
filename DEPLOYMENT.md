# Deployment Guide

## Backend Kurulumu

### 1. Veritabanı Oluşturma

```sql
CREATE DATABASE restaurant_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Migration Çalıştırma

```bash
mysql -u root -p restaurant_pos < server/database/migrations/001_create_orders_table.sql
```

### 3. Backend Bağımlılıkları

```bash
cd server
npm install
```

### 4. Environment Variables

`server/.env` dosyası oluşturun:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_pos
DB_PORT=3306

PORT=3001
NODE_ENV=production
TZ=Europe/Istanbul

CLIENT_URL=http://localhost:5173
```

### 5. Backend Başlatma

```bash
cd server
npm start
```

## Frontend Kurulumu

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Environment Variables (Opsiyonel)

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Development

```bash
npm run dev
```

### 4. Production Build

```bash
npm run build
```

## Production Deployment

### Backend (PM2 ile)

```bash
cd server
npm install -g pm2
pm2 start server.js --name restaurant-pos-api
pm2 save
pm2 startup
```

### Frontend (Nginx ile)

Nginx yapılandırması için `nginx.conf.example` dosyasını kullanın.

### Veritabanı Yedekleme

```bash
mysqldump -u root -p restaurant_pos > backup.sql
```

### Cron Job (Arşivleme - Opsiyonel)

30 günden eski kapanan siparişleri arşivlemek için:

```sql
DELETE FROM orders
WHERE closed_at IS NOT NULL
  AND closed_at < (NOW() - INTERVAL 30 DAY);
```

## Önemli Notlar

1. **Zaman Dilimi**: Tüm sistem `Europe/Istanbul (+03:00)` zaman diliminde çalışır.
2. **Açık Siparişler**: `closed_at IS NULL` olan siparişler asla silinmez.
3. **Real-time**: WebSocket bağlantısı için backend'in çalışıyor olması gerekir.
4. **CORS**: Backend CORS ayarlarını production URL'inize göre güncelleyin.


