# PHP Admin Panel Setup Guide

## Dosya Yapısı

```
/
├── index.html              # Public menu page (reads from /data/menu.json)
├── script.js               # Updated to load from server
├── admin/
│   ├── admin.html          # Admin panel (protected)
│   ├── admin.js            # Admin panel JavaScript
│   ├── login.php           # Login page
│   └── auth-check.php      # Authentication check
├── api/
│   ├── login.php           # Login API endpoint
│   ├── logout.php          # Logout endpoint
│   ├── save-menu.php       # Save menu API (protected)
│   ├── check-auth.php      # Check authentication
│   └── get-menu.php        # Get menu API
├── data/
│   ├── menu.json           # Menu data file (protected)
│   └── .htaccess           # Protect JSON files
└── .htaccess               # Root protection
```

## Giriş Bilgileri

- **Kullanıcı Adı:** `admin`
- **Şifre:** `supersecret`

## Kurulum Adımları

1. **Dosya İzinleri:**
   - `data/` klasörüne yazma izni verin (755 veya 775)
   - `data/menu.json` dosyasına yazma izni verin (644 veya 664)

2. **Apache Yapılandırması:**
   - `.htaccess` dosyalarının çalışması için `mod_rewrite` ve `mod_headers` modüllerinin aktif olması gerekir
   - Hostinger ve Turhost'ta genellikle aktif gelir

3. **PHP Ayarları:**
   - PHP 7.4 veya üzeri gerekir
   - `session` desteği aktif olmalı

## Kullanım

1. **Public Menu:** `https://www.egedalimenu.com/` - Menüyü görüntüle
2. **Admin Panel:** `https://www.egedalimenu.com/admin/` - Admin paneline giriş
3. **Login:** Logo'ya tıklayarak veya `/admin/login.php` adresinden giriş yapın

## Özellikler

- ✅ Server-side menu storage (JSON file)
- ✅ PHP session-based authentication
- ✅ Protected admin panel
- ✅ Protected API endpoints
- ✅ UTF-8 safe JSON encoding
- ✅ Cache-Control headers
- ✅ Turkish character support

## Güvenlik Notları

- `data/menu.json` dosyası doğrudan erişime kapalıdır
- Admin panel ve API endpoint'leri session kontrolü yapar
- `.htaccess` dosyaları ile ekstra koruma sağlanır

## Sorun Giderme

1. **Menü yüklenmiyor:**
   - `data/menu.json` dosyasının var olduğundan emin olun
   - Dosya izinlerini kontrol edin
   - PHP hata loglarını kontrol edin

2. **Admin panele giriş yapılamıyor:**
   - Session desteğinin aktif olduğundan emin olun
   - Cookie'lerin engellenmediğinden emin olun

3. **Menü kaydedilemiyor:**
   - `data/` klasörüne yazma izni verin
   - PHP hata loglarını kontrol edin
