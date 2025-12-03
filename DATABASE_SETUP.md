# Veritabanı Kurulum Rehberi

## ✅ SQLite (Otomatik Kurulum - Önerilen)

SQLite veritabanı otomatik olarak kuruldu! Herhangi bir ek işlem yapmanıza gerek yok.

### Veritabanı Dosyası
- Konum: `server/database/restaurant_pos.db`
- Bu dosya otomatik olarak oluşturuldu

### Kullanım
Backend'i başlattığınızda SQLite otomatik olarak kullanılacak:

```bash
cd server
npm start
```

## 🔧 MySQL Kurulumu (Opsiyonel - Production için)

Eğer MySQL kullanmak isterseniz:

### 1. MySQL Kurulumu

**Windows:**
- [MySQL Installer](https://dev.mysql.com/downloads/installer/) indirin ve kurun
- Veya XAMPP/WAMP kullanabilirsiniz

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql
```

### 2. Veritabanı Oluşturma

```sql
CREATE DATABASE restaurant_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Migration Çalıştırma

```bash
mysql -u root -p restaurant_pos < server/database/migrations/001_create_orders_table.sql
```

### 4. Environment Variables

`server/.env` dosyasını düzenleyin:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_pos
DB_PORT=3306
```

## 📊 Veritabanı Türü Seçimi

### SQLite (Varsayılan)
- ✅ Kurulum gerektirmez
- ✅ Dosya tabanlı (taşınabilir)
- ✅ Development için ideal
- ❌ Production için önerilmez (çoklu kullanıcı senaryolarında)

### MySQL
- ✅ Production için önerilir
- ✅ Çoklu kullanıcı desteği
- ✅ Daha iyi performans
- ❌ Kurulum gerektirir

## 🔄 Veritabanı Türünü Değiştirme

`server/.env` dosyasında `DB_TYPE` değişkenini değiştirin:

```env
# SQLite için
DB_TYPE=sqlite

# MySQL için
DB_TYPE=mysql
```

## 📝 Veritabanı Sıfırlama

### SQLite
```bash
# Veritabanı dosyasını silin
rm server/database/restaurant_pos.db

# Yeniden oluşturun
cd server
npm run init-db
```

### MySQL
```sql
DROP DATABASE restaurant_pos;
CREATE DATABASE restaurant_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql -u root -p restaurant_pos < server/database/migrations/001_create_orders_table.sql
```

## ✅ Kurulum Kontrolü

Veritabanının doğru kurulduğunu kontrol etmek için:

```bash
cd server
npm start
```

Başarılı mesajı görmelisiniz:
- SQLite: `✅ SQLite database initialized`
- MySQL: `✅ MySQL database connected successfully`

## 🐛 Sorun Giderme

### SQLite hatası
- `server/database/` klasörünün yazma izni olduğundan emin olun
- `npm run init-db` komutunu tekrar çalıştırın

### MySQL bağlantı hatası
- MySQL servisinin çalıştığından emin olun
- `.env` dosyasındaki bilgileri kontrol edin
- Firewall ayarlarını kontrol edin


