# Restaurant POS Backend Server

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
cd server
npm install
```

2. `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayın):
```bash
cp .env.example .env
```

3. Veritabanını oluşturun:
```sql
CREATE DATABASE restaurant_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Migration'ı çalıştırın:
```bash
mysql -u root -p restaurant_pos < database/migrations/001_create_orders_table.sql
```

5. `.env` dosyasını düzenleyin ve veritabanı bilgilerinizi girin.

6. Sunucuyu başlatın:
```bash
npm start
# veya development için:
npm run dev
```

## API Endpoints

### GET /api/orders/open
Açık siparişleri getirir (closed_at IS NULL).

Query params:
- `table_id` (optional): Belirli bir masa için filtrele

### GET /api/orders/closed
Kapanan siparişleri getirir.

Query params:
- `table_id` (optional): Belirli bir masa için filtrele
- `limit` (optional, default: 50): Sonuç sayısı

### POST /api/orders
Yeni sipariş oluşturur.

Body:
```json
{
  "table_id": 1,
  "items": [
    {
      "id": "item-1",
      "name": "Ürün Adı",
      "price": 100.00,
      "quantity": 2
    }
  ],
  "note": "Özel not (optional)"
}
```

### POST /api/orders/:id/close
Siparişi kapatır (masa kapat).

Body:
```json
{
  "status": "paid" // veya "cancelled"
}
```

### GET /api/orders/:id
Tek bir siparişi getirir.

## WebSocket Events

Sunucu `admin:orders` kanalına şu event'leri gönderir:

- `order:created` - Yeni sipariş oluşturulduğunda
- `order:closed` - Sipariş kapatıldığında

Client'ın `join:admin` event'i ile kanala katılması gerekir.

## Zaman Dilimi

Tüm zaman işlemleri `Europe/Istanbul (+03:00)` zaman diliminde çalışır.


