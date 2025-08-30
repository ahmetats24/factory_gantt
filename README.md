# 🏭 Factory Gantt - Üretim Planlama Uygulaması

Modern, Gantt-style zaman çizelgesi ile fabrika iş emirlerini yöneten, görsel ve teknik olarak güçlü bir üretim planlama web uygulaması.

---

## 🚀 Özellikler

### 🖥️ Frontend

- **React 18 + Vite + TypeScript** ile geliştirilmiş modern arayüz
- **Responsive** (mobil/tablet/masaüstü) uyumlu
- **Dark Mode** ve animasyon desteği
- Gantt-style **zaman çizelgesi**
- Gerçek zamanlı güncellemeler (backend entegrasyonu hazır)
- Filtreleme, arama ve klavye kısayolları

### 🧠 Backend

- **Flask 3** + **SQLAlchemy 2.0**
- **PostgreSQL** veritabanı kullanımı
- **Alembic** ile migration yönetimi
- **Veri doğrulama kuralları** (öncelik, çakışma, geçmiş zaman kontrolü)
- CORS ve .env desteği
- Test endpoint: `GET /health`

---

## 📦 Kurulum

### 1. Gerekli Araçlar

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (lokal kurulum veya docker)
- `git`, `pip`, `npm`

---

### 2. Backend Kurulumu

````bash
# Reposu klonla
git clone https://github.com/ahmetats24/factory_gantt.git
cd factory_gantt

# Virtual environment oluştur
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)

# Paketleri yükle
pip install -r requirements.txt


`.env` örneği:

```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/factory_db
````

PostgreSQL çalışıyor olmalı ve `factory_db` veritabanı oluşturulmuş olmalı.

---

### 3. Veritabanı Kurulumu

```bash
# Flask uygulamasını belirt
export FLASK_APP=app.py  # Windows PowerShell: $env:FLASK_APP="app.py"

# Migration dosyalarını uygula
flask db upgrade
```

---

### 4. Seed Verisi Yükleme

```bash
# (İsteğe bağlı) Verileri geleceğe kaydırmak için (örn. 48 saat ileri)
export SEED_SHIFT_HOURS=48

# Seed verisini yükle
python seed.py
```

Bu işlem `seed.json` dosyasındaki verileri veritabanına yükler.

---

### 5. Backend'i Başlat

```bash
python app.py
# → http://localhost:5000
```

---

### 6. Frontend Kurulumu (Yeni terminal açıp çalıştırıyoruz. Terminal=>New Terminal)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🧪 Seed Verisi

Proje dizininde bir `seed.json` dosyası bulunmalı. Örnek:

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
				"name": "Cutting",
				"start": "2025-08-20T09:00:00Z",
				"end": "2025-08-20T10:00:00Z"
			}
		]
	}
]
```

Gizli tutmak için `.gitignore` içerisine `seed.json` eklenebilir.

---

## 📡 API Uç Noktaları

### `GET /api/server_time`

```json
{ "nowUtc": "2025-08-30T08:15:00Z" }
```

### `GET /api/work_orders`

Tüm iş emirleri ve operasyonlarını listeler.

### `PUT /api/operations/<op_id>`

Operasyon zamanlarını günceller.  
Gönderilecek örnek veri:

```json
{
	"start": "2025-08-30T10:00:00Z",
	"end": "2025-08-30T12:00:00Z"
}
```

#### Geçerli kontrol hataları:

- Zaman formatı yanlış
- `end <= start`
- Geçmişe zaman girildi
- Makine çakışmaları
- Sıra ihlali (önceki/sonraki operasyonla uyumsuzluk)

---

## ⏱️ Doğrulama Kuralları

| Kural | Açıklama                                                                 |
| ----- | ------------------------------------------------------------------------ |
| R1    | İş emri içindeki sıralama korunmalı (önceki bitmeden sonraki başlayamaz) |
| R2    | Aynı makinede zaman çakışması olamaz                                     |
| R3    | Başlangıç zamanı geçmiş olamaz                                           |

---

## 🧩 Klavye Kısayolları

| Kısayol            | İşlev                 |
| ------------------ | --------------------- |
| `Esc`              | Seçimi temizle        |
| `Ctrl + R`         | Verileri yenile       |
| `Ctrl + Shift + C` | Tüm seçimleri temizle |

---

## 🔎 Geliştirici Notları

- Saatler ISO-8601 UTC (`Z`) formatındadır
- Sunucu saati `GET /api/server_time` üzerinden okunabilir
- Kod kalitesi: `PEP8`, `ESLint`, `TypeScript strict`

---

## 🛠️ Teknolojiler

### Backend

- Flask 3
- Flask-SQLAlchemy
- Alembic (migration)
- PostgreSQL
- Python 3.10+
- dotenv

### Frontend

- React 18 + Vite
- TypeScript
- TailwindCSS (opsiyonel)
- Zustand (state)
- Framer Motion
- ESLint

---

## 🧑‍💻 Geliştiriciler

- Ahmet ATEŞ

---

## 📜 Lisans

MIT Lisansı
