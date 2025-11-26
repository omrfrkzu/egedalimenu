# Restoran POS Sistemi

Modern ve profesyonel bir Restoran Sipariş Paneli uygulaması.

## Özellikler

- 🎨 Modern ve minimal tasarım
- 📱 Tablet/dokunmatik ekran için optimize edilmiş
- 🍽️ Masa yönetimi (Boş, Dolu, Rezerveli durumları)
- 📋 Menü yönetimi (Kategoriler ve ürünler)
- 🛒 Sipariş paneli ve sipariş yönetimi
- 📊 Raporlar ve istatistikler
- ⚙️ Ayarlar

## Kurulum

```bash
npm install
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Teknolojiler

- React 18
- Vite
- Lucide React (İkonlar)
- CSS Variables (Tema yönetimi)

## Kullanım

1. **Masalar**: Masaları görüntüleyin ve seçin
2. **Menü**: Ürünleri kategorilere göre görüntüleyin
3. **Sipariş**: Seçili masaya ürün ekleyin ve siparişi onaylayın
4. **Siparişler**: Aktif siparişleri görüntüleyin
5. **Raporlar**: Günlük satış raporlarını görüntüleyin

## Production Deployment

### Build

```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşturulur.

### Sunucu Yapılandırması

SPA (Single Page Application) routing sorunlarını önlemek için sunucunuzun tüm route'ları `index.html`'e yönlendirmesi gerekir.

#### Apache (.htaccess)

`.htaccess` dosyası proje kök dizininde mevcuttur. Apache sunucunuzda `mod_rewrite` modülünün aktif olduğundan emin olun.

#### Nginx

`nginx.conf.example` dosyasındaki yapılandırmayı kullanın:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Netlify

`public/_redirects` dosyası otomatik olarak build sırasında kopyalanır. Ek yapılandırma gerekmez.

#### Vercel

`vercel.json` dosyası mevcuttur. Ek yapılandırma gerekmez.

### Önemli Notlar

- Production'da `/admin` ve `/garson` route'larına doğrudan erişim için sunucu yapılandırması şarttır
- Tüm route'lar `index.html`'e yönlendirilmelidir
- Static dosyalar (CSS, JS, images) doğrudan servis edilmelidir

