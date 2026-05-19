# 🚀 AquaPulse — FINAL Build & Submit Guide

> Bu doküman App Store'a yayınlamak için kalan tüm adımları sıralar.
> Tahmini toplam süre: **1.5 saat** (paralel iş + EAS build bekleme dahil)

---

## 📦 Mevcut Durum (HAZIR)

| Asset | Detay |
|---|---|
| Bundle ID | `com.ttbinternationalllc.aquapulse` (Identifiers'da kayıtlı ✅) |
| Apple Team ID | `9DXUAKJ7WA` (Wyoming, TTB INTERNATIONAL LLC) |
| ASC App ID | `6770733097` |
| Apple ID | `ttbllcapp@gmail.com` |
| GitHub username | `ttbllcapp-ui` |
| `app.json` | Production-ready (v1.0.0, build 1) |
| `eas.json` | Production submit config dolu |
| App icon (1024×1024) | İndigo gradient kristal cam ✅ |
| 5 App Store screenshots TR | Hazır `/app/store-listing/screenshots/appstore/` |
| 5 App Store screenshots EN | Hazır `/app/store-listing/screenshots/appstore_en/` |
| Privacy / Terms / Support HTML | `/app/legal/` |
| App Store metinleri TR + EN | `/app/store-listing/` |
| In-app Rate / Share / Feedback | `src/engagement.ts` ✅ |
| Founding Member tracking | ✅ |
| Hesap silme (Apple zorunlu) | ✅ |
| Backend kodu | `/app/backend/` (Render'a push hazır) |

---

## ✅ ÖNCEKİ ADIMLAR (TAMAMLANDI)
- [x] Apple Developer hesabı + DUNS + onay
- [x] Bundle ID Identifier kaydı
- [x] App Store Connect'te app kaydı
- [x] Apple Team ID + ASC App ID alındı
- [x] eas.json güncellendi

---

## 🔵 ŞIMDIKI ADIM 1 — Backend'i Render'a Deploy Et (15 dk)

Detaylı kılavuz: `/app/store-listing/BACKEND-DEPLOY-RENDER.md`

### Hızlı özet:
1. **MongoDB Atlas** → free M0 cluster aç (us-east-1)
2. Connection string'i kopyala
3. **Backend kodu** GitHub'a push: `aquapulse-backend` repo
4. **Render.com** → New Web Service → repo'yu bağla
5. Build cmd: `pip install -r requirements.txt`
6. Start cmd: `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. Env vars: `MONGO_URL`, `DB_NAME=aquapulse_prod`, `EMERGENT_LLM_KEY=sk-emergent-90d112c49444e9f569`, `APPLE_CLIENT_ID=com.ttbinternationalllc.aquapulse`
8. Deploy → 5 dk → URL'i kopyala (örn: `https://aquapulse-backend.onrender.com`)

**Tamamlandıktan sonra bana URL'i yaz, `eas.json`'a yerleştireyim.**

---

## 🟢 ŞIMDIKI ADIM 2 — Legal Sayfaları GitHub Pages'a Push (5 dk)

`/app/store-listing/aquapulse-legal.zip` dosyasını indir, aç.

```bash
# Mac/PC terminalinde:
cd path/to/extracted/legal/
git init
git add .
git commit -m "AquaPulse legal pages v1.0"
git branch -M main
git remote add origin https://github.com/ttbllcapp-ui/aquapulse-legal.git
git push -u origin main
```

GitHub repo → Settings → Pages → **Source: main / root** → Save  
2 dakika sonra canlı:
- `https://ttbllcapp-ui.github.io/aquapulse-legal/privacy.html`
- `https://ttbllcapp-ui.github.io/aquapulse-legal/terms.html`
- `https://ttbllcapp-ui.github.io/aquapulse-legal/support.html`

**Tarayıcıda aç, çalıştığını doğrula → bana "legal canlı" yaz**

---

## 🟡 ŞIMDIKI ADIM 3 — EAS Build Çalıştır (cloud'da 20-30 dk)

Mac/PC'de Node.js 18+ kurulu olmalı.

```bash
# 1. EAS CLI yükle (bir kerelik)
npm install -g eas-cli

# 2. /app/frontend/ klasörüne git
cd path/to/aquapulse/frontend

# 3. Expo hesabına giriş yap
eas login
#    Expo hesabın yoksa expo.dev → Sign up (ücretsiz)

# 4. Projeyi EAS'a bağla (bir kerelik)
eas init
#    > Soruyor: "Existing project found in app.json/extra. Use it?" → YES (eğer çıkarsa)
#    > VEYA: yeni project oluşturmak için onay ver

# 5. PRODUCTION BUILD başlat
eas build --platform ios --profile production
#    Expo bulutta IPA üretir (~20-30 dk)
#    Sonunda link verir: build durumunu görebilirsin
#    BAŞARILI olduğunda: "IPA built. Submit?"
```

### EAS Build sırasında Apple credential'ları soracak:
- Apple ID: `ttbllcapp@gmail.com` (eas.json'dan otomatik)
- App-specific password gerekir → https://appleid.apple.com → Sign-In and Security → App-Specific Passwords → "+" → name: "EAS Build" → kopyala-yapıştır
- Yeni distribution cert + provisioning profile otomatik oluşturulur
- "Allow access?" → YES

---

## 🟣 ŞIMDIKI ADIM 4 — IPA'yı App Store Connect'e Yükle (5 dk)

EAS build bittikten sonra:

```bash
eas submit --platform ios --latest
```

Bu komut:
- En son build'i alır
- App Store Connect'e otomatik yükler (Transporter)
- ~5 dk içinde "Processing" → "Ready to Submit" durumuna geçer

App Store Connect → My Apps → AquaPulse → TestFlight → Builds → build'in görünmesini bekle (~10 dk)

---

## 📝 ŞIMDIKI ADIM 5 — App Store Connect Formunu Doldur (20 dk)

Doküman: `/app/store-listing/app-store-connect-checklist.md`

### 5.1 — App Information
- Category: **Health & Fitness** (Primary) + **Lifestyle** (Secondary)
- Subtitle (EN): `Smart hydration & AI coach`
- Subtitle (TR): `Akıllı su takibi & AI koç`
- Content Rights: **No third-party content**
- Age Rating: **4+** (no questionable content)

### 5.2 — Pricing
- Price: **Free**
- Availability: **All countries** (Apple worldwide)
- Pre-Orders: Off

### 5.3 — App Privacy (en kritik kısım)
Doküman: `/app/store-listing/app-privacy-data-types.md`  
Apple'ın sorduğu her veri tipi için "Data Used to Track You" = **NO**

Veri tipleri:
- ✅ Email, Name, User ID — Linked to user, NOT for tracking
- ✅ Health (water intake), Fitness (streak) — Linked to user, NOT for tracking  
- ✅ User Content (chat messages) — Linked to user, NOT for tracking
- ❌ Location, Camera, Photos, Microphone, Browsing, Ads, Financial — **NOT collected**

### 5.4 — Version 1.0.0 (gönderim sayfası)
- **Promotional Text** (EN): `100% free hydration tracker with AI coach, body water map, family mode. Built by health-obsessed designers. Built to make every sip count.`
- **Description** (EN): `/app/store-listing/app-store-description-en.md` içindeki uzun açıklamayı kopyala
- **Keywords** (EN): `water,hydration,tracker,reminder,drink,thirst,health,fitness,wellness,coach,family,glass`
- **Support URL**: `https://ttbllcapp-ui.github.io/aquapulse-legal/support.html`
- **Marketing URL** (optional): `https://ttbllcapp-ui.github.io/aquapulse-legal/`
- **Privacy Policy URL**: `https://ttbllcapp-ui.github.io/aquapulse-legal/privacy.html`

### 5.5 — Screenshots (en sevileceğin kısım 😄)
**iPhone 6.7" Display** (zorunlu):
- 5 PNG dosyasını sırayla yükle: `/app/store-listing/screenshots/appstore_en/01_home.png` → `05_settings.png`
- Drag & drop ile bile yüklenebilir

**iPhone 6.5" Display** (opsiyonel, Apple auto-fallback yapar)
**iPad** (sadece iPad target değilse atla)

### 5.6 — App Review Information
- Sign-in: **Yes**, Demo Google account: `aquapulse_demo@gmail.com` / `Aqua@2025!` (sen önceden gmail.com'da oluştur, Google Sign-In ile test edebilsinler)
- VEYA: **"Sign-in NOT required to test core features"** seç + reviewer notes'a yaz:

```
AquaPulse is a free water-tracking app with optional Family Mode requiring sign-in.

Guest mode demonstrates ALL core features (water logging, AquaCoach AI, Body Water Map, Water Breath meditation, Settings) without any account:
  Welcome → Tap "Continue as Guest" → Onboarding (10 steps) → Home

Family Mode and cross-device sync require sign-in with Apple or Google.
Account deletion: Settings → "Permanently delete my account" → type DELETE.

This app is 100% free, no in-app purchases, no advertising. We do not use HealthKit, Camera, Microphone, or Location.

Contact for any questions: info@ttbinternationalllc.com
```

### 5.7 — Export Compliance (build'i seçtikten sonra)
- "Does your app use encryption?" → **No** (we set `ITSAppUsesNonExemptEncryption: false` in app.json) → bu soruyu atlayacak

### 5.8 — Submit for Review
Sayfanın en üstündeki **"Add for Review"** → **"Submit to App Review"**

---

## ⏰ İncelemeyi Bekle (24-48 saat)

- Apple her gün e-posta ile durum bildirir
- Olası durumlar:
  - **Waiting for Review** (kuyrukta)
  - **In Review** (incelemede, ~6-12 saat)
  - **Pending Developer Release** ← bizim için bu hedef (yayını kontrolümüze alalım)
  - **Ready for Sale** ← yayında!

**Eğer reject gelirse:**
- E-postada **Resolution Center** linki olur
- Reviewer'ın sorduğu soruyu cevapla veya küçük bir fix yap
- Aynı build'i tekrar gönderebilirsin (yeni build gerekmez)

---

## 🎉 Yayın Günü (Apple "Approved" diyince)

1. **App Store Connect** → My Apps → AquaPulse → "Release this version"
2. ~30 dk sonra App Store'da **canlı** olur
3. **Hemen yap:**
   - Bağlantıyı (Apple ID'den) `https://apps.apple.com/app/id6770733097` test et
   - Sosyal medya post zamanlamasını başlat (LAUNCH-STRATEGY.md'deki saatlere göre)
   - Beta tester listesine "AquaPulse is live, please leave a review" maili at
   - Product Hunt'a gönder

---

## 🆘 Sorun Olursa

`info@ttbinternationalllc.com` adresinden bana yaz, paralelden çözeyim.

### Bilinen Olası Sorunlar:
1. **EAS Build fail**: çoğunlukla "missing distribution certificate" → `eas credentials --platform ios` ile yeni cert oluştur
2. **MongoDB connection refused**: Network Access → IP whitelist `0.0.0.0/0` ekle
3. **Apple "Privacy Policy URL not reachable"**: GitHub Pages yayında ve URL doğru olduğunu doğrula
4. **App Store reject "Guideline 5.1.1(v) Account Deletion"**: bu zaten implement edildi ✅, reviewer'a Settings sayfasını göster (notes'da)

---

## 📊 Bu Versiyonun Özeti

**Version 1.0.0** — İlk yayın, 100% free, USA-first
- Misyon: 25K+ download, 500+ review, feedback toplama
- Süre: 90 gün
- Sonra: v1.1 paid sürümü ile monetize et (Founding Members lifetime-free)

Hadi başlayalım 🌊🚀
