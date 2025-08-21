# Factory Gantt - Production Schedule Management

Modern, profesyonel bir fabrika iş emirleri yönetim sistemi. Gantt tarzı zaman çizelgesi ile üretim planlamasını görselleştirin ve yönetin.

## 🚀 Özellikler

### ✨ Modern UI/UX
- **Dark Theme**: Göz yormayan koyu tema
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Smooth Animations**: Akıcı geçişler ve animasyonlar
- **Professional Design**: Modern ve profesyonel tasarım

### 📊 Gantt Timeline
- **Multi-Machine View**: Birden fazla makine için şerit görünümü
- **Real-time Updates**: Gerçek zamanlı güncellemeler
- **Conflict Detection**: Çakışma tespiti ve uyarıları
- **Drag & Drop**: Sürükle bırak ile yeniden planlama (yakında)

### 🔍 Gelişmiş Filtreleme
- **Search**: Work Order ve ürün arama
- **Machine Filter**: Makine bazlı filtreleme
- **Work Order Filter**: İş emri bazlı filtreleme
- **Quick Stats**: Hızlı istatistikler

### 🎯 Kullanıcı Deneyimi
- **Toast Notifications**: Bildirim sistemi
- **Loading States**: Yükleme durumları
- **Error Handling**: Gelişmiş hata yönetimi
- **Keyboard Shortcuts**: Klavye kısayolları

### 📱 Responsive & Accessible
- **Mobile First**: Mobil öncelikli tasarım
- **Accessibility**: Erişilebilirlik standartları
- **Cross Browser**: Tüm modern tarayıcılarda çalışır

## 🛠️ Teknolojiler

### Frontend
- **React 18**: Modern React hooks ve features
- **TypeScript**: Tip güvenliği
- **Vite**: Hızlı build tool
- **CSS3**: Modern CSS features ve animations
- **ESLint**: Kod kalitesi

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: ORM
- **PostgreSQL**: Veritabanı
- **Alembic**: Database migrations

## 📦 Kurulum

### Backend Kurulumu

```bash
# Python virtual environment oluştur
python -m venv venv

# Virtual environment aktifleştir
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# (Opsiyonel) Seed verilerini geleceğe kaydır (ör. 48 saat)
$env:SEED_SHIFT_HOURS=48  # PowerShell
# export SEED_SHIFT_HOURS=48  # macOS/Linux

# Veritabanını seed et
python seed.py

# Uygulamayı çalıştır
python app.py
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## 🎮 Kullanım

### Klavye Kısayolları
- `Esc`: Seçimi temizle / Panel kapat
- `Ctrl + R`: Verileri yenile
- `Ctrl + Shift + C`: Tüm seçimleri temizle

## 🧩 API

### GET `/api/server_time`
Sunucunun UTC zamanını döner.

Yanıt 200
```json
{ "nowUtc": "2025-08-19T09:31:00Z" }
```

### GET `/api/work_orders`
Tüm iş emirlerini operasyonlarıyla birlikte döner.

Yanıt 200
```json
[
  {
    "id": "WO-1001",
    "product": "Widget A",
    "qty": 100,
    "operations": [
      {
        "id": "OP-1",
        "workOrderId": "WO-1001",
        "index": 1,
        "machineId": "M1",
        "name": "Cut",
        "start": "2025-08-20T09:00:00Z",
        "end": "2025-08-20T10:00:00Z"
      }
    ]
  }
]
```

### PUT `/api/operations/{operation_id}`
Tek bir operasyonun başlangıç/bitiş zamanını günceller.

İstek gövdesi
```json
{
  "start": "2025-08-20T10:10:00Z",
  "end":   "2025-08-20T12:00:00Z"
}
```

Başarılı yanıt 200
```json
{
  "message": "Operation updated successfully",
  "id": "OP-2",
  "start": "2025-08-20T10:10:00Z",
  "end": "2025-08-20T12:00:00Z"
}
```

Hata yanıtları (400)
- `Invalid ISO-8601 datetime. Use e.g. 2025-08-20T09:00:00Z`
- `End must be after start` (+ döndürülen `start`, `end`)
- `Start cannot be before now` (+ döndürülen `nowUtc`, `start`)
- `Precedence violation: must start at or after previous operation ends` (+ `previousOpId`, `previousEnd`)
- `Must end before next operation starts` (+ `nextOpId`, `nextStart`)
- `Lane exclusivity violation: overlaps with operation OP-3 on machine M1` (+ `overlapOpId`, `overlapStart`, `overlapEnd`)

## ⏱️ Zaman ve Saat Dilimi
- Tüm saatler ISO-8601 UTC formatında (`...Z`) döner ve beklenir.
- `server_time` uç noktası ile sunucu saatini okuyup UI'da gösterebilirsin.
- Seed verileri geçmişteyse `SEED_SHIFT_HOURS` ile geleceğe kaydırarak `R3 — Geçmiş yok` kuralına takılmayı önleyebilirsin.

## ✅ Doğrulama Kuralları
- **R1 — Öncelik (WO içinde)**: k işlemi, k-1 bittiğinde veya sonra başlamalı.
- **R2 — Hat ayrıcalığı**: Aynı makinede çakışma yasak.
- **R3 — Geçmiş yok**: Başlangıç, sunucu “şimdi”sinden eski olamaz. 