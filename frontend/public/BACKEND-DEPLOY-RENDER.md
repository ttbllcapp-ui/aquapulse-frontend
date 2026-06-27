# 🚀 Deploy AquaPulse Backend to Render.com (15 minutes)

> ÜCRETSIZ TIER kullanıyoruz. v1.0 trafik için yeterli. Trafik artarsa $7/ay'a yükseltirsin.

---

## Önkoşullar
- ✅ Render hesabı (ücretsiz: render.com → Sign up with GitHub)
- ✅ GitHub repo (backend kodumu push edeceğiz)
- ✅ MongoDB Atlas ücretsiz tier (cloud DB için)

---

## 🟢 Adım 1 — MongoDB Atlas Ücretsiz Cluster (5 dk)

1. https://www.mongodb.com/cloud/atlas/register → Sign up
2. "Create" → **M0 Free Tier** (512 MB)
3. Region: **AWS / us-east-1** (USA traffic için en yakın)
4. Cluster name: `aquapulse-prod`
5. **Database Access**:
   - Add New Database User → Authentication: Password
   - Username: `aquapulse_admin`
   - Password: kuvvetli bir şifre (kaydet!)
   - Privileges: **Atlas admin**
6. **Network Access**:
   - Add IP Address → **"Allow access from anywhere"** (`0.0.0.0/0`)
   (Production'da Render IP whitelist daha güvenli, şimdilik bu yeterli)
7. **Connect** → **Drivers** → Python → connection string'i kopyala:
   ```
   mongodb+srv://aquapulse_admin:<password>@aquapulse-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   `<password>` yerine az önce belirlediğin şifreyi yaz, kaydet.

---

## 🟢 Adım 2 — Backend'i GitHub'a Push (3 dk)

```bash
# Mac/PC terminalinde:
cd path/to/backend-folder
git init
git add .
git commit -m "AquaPulse backend v1.0"
git branch -M main
git remote add origin https://github.com/ttbllcapp-ui/aquapulse-backend.git
git push -u origin main
```

---

## 🟢 Adım 3 — Render'a Deploy (5 dk)

1. https://dashboard.render.com → **New +** → **Web Service**
2. **Connect a repository** → GitHub'la giriş yap → `aquapulse-backend` seç → Connect
3. Formu doldur:

| Alan | Değer |
|---|---|
| Name | `aquapulse-backend` |
| Region | **Oregon (US West)** veya Virginia (US East) |
| Branch | `main` |
| Root Directory | (boş bırak) |
| Runtime | **Python 3** |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Instance Type | **Free** |

4. **Environment Variables** bölümünde ekle:

| Key | Value |
|---|---|
| `MONGO_URL` | `mongodb+srv://aquapulse_admin:<password>@aquapulse-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | `aquapulse_prod` |
| `EMERGENT_LLM_KEY` | `sk-emergent-90d112c49444e9f569` |
| `GOOGLE_CLIENT_ID` | (opsiyonel, Google Sign-In için sonra ekle) |
| `APPLE_CLIENT_ID` | `com.ttbinternationalllc.aquapulse` |
| `CORS_ALLOWED_ORIGINS` | `*` |

5. **Create Web Service** butonuna tıkla → 3-5 dk bekle → ✅ "Live"
6. Üstteki URL'i kopyala. Örn: `https://aquapulse-backend.onrender.com`

---

## 🟢 Adım 4 — `eas.json`'ı Production URL ile Güncelle

`/app/frontend/eas.json` içindeki:
```json
"env": { "EXPO_PUBLIC_BACKEND_URL": "https://aquapulse-backend.onrender.com" }
```
satırını backend'inin gerçek URL'i ile güncelle. Sonra build alacağız.

---

## 🟢 Adım 5 — Test (1 dk)

Tarayıcıda aç:
- `https://aquapulse-backend.onrender.com/api/` → `{"ok":true}` görmeli
- `https://aquapulse-backend.onrender.com/docs` → FastAPI Swagger UI

✅ Çalışıyorsa hazırız.

---

## ⚠️ Ücretsiz Tier Notu

Render free tier'da backend 15 dk boyunca inaktif olursa **uyur** ve ilk istek 30 sn sürer (cold start). Bu v1.0 için kabul edilebilir.

Yayın günü trafik artarsa → Render Dashboard → Instance Type → **Starter $7/ay**'a yükselt. Cold start kalkar, daha hızlı CPU + RAM olur.

---

## ❓ Sorun olursa

`info@ttbinternationalllc.com` adresinden bana yaz, hızlı çözeriz.
