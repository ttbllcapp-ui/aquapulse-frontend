# AquaLife — Su İçme Hatırlatıcı

Premium, doğa temalı WaterLlama alternatifi. React Native Expo (SDK 54) ile yazıldı.

## ✨ Tamamlanan Özellikler (v2)

### Temel
- **7 adımlı onboarding**: hoşgeldin → dil → ülke → kilo → hedef (iklim uyumlu auto-hesap) → uyku/uyanma → bildirim
- **Bugün ekranı**: animasyonlu yükselen su dalgası (reanimated SVG), parçacık kabarcıkları, splash ring animasyonu her eklemede, günlük %progress, hızlı ekleme (Su / Bardak / Çay / Kahve / Özel), motivasyon alıntısı, gün akışı listesi
- **İstatistik ekranı**: plant-growth seri sistemi (Tohum→Filiz→Yunus→Kaplumbağa→Balina), KPI kartları, 7-günlük ve 30-günlük bar chart, **haftalık rapor paylaşımı** (`react-native-view-shot` + `expo-sharing`)
- **Başarımlar**: 9 okyanus yaratığı rozeti
- **Ayarlar**: tüm konfig + 6 tema + 7 dil + 26 ülke

### Yeni v2 özellikleri
- 🌍 **7 dil desteği** (TR, EN, DE, FR, ES, IT, AR) — onboarding'de ve ayarlarda seçilebilir
- 🗺️ **26 ülke** — iklim-bazlı ekstra hidrasyon ml hedefi (BAE/SA +500ml, Türkiye +200ml, İskandinavya -100ml vb.)
- 🎨 **6 premium tema**: Okyanus (varsayılan), Gün Batımı, Orman, Mercan, Kuzey Işıkları, Aydınlık (açık mod)
- 🎵 **Ses efekti** su dökme — Web Audio API (web) + Haptics (native); ayarlardan kapatılabilir
- 💧 **Splash ring animasyonu** her içecek eklemede
- 📊 **Haftalık rapor paylaşımı** (stats ekranından)
- 💬 **Motivasyon yazıları** — her dilde 10 adet, günün sözü home ekranında, bildirimlerde rastgele motivasyon sözü
- ⚡ **Akıllı hedef artışı (ADAPTIVE GOAL)**: Kullanıcı günlük hedefi 7 gün üst üste tutturduğunda hedef otomatik +100 ml artar (ayarlardan açma/kapama)
- 🔔 **Bildirim mesajları** seçilen dilde gelir

### Arka planda hazır (Xcode tarafında aktif edilecek)
- 📱 iOS Widget — `XCODE_EXPORT.md` adım 7
- ⌚ Apple Watch — adım 8
- 🏥 Apple Health (HealthKit) — adım 9

## Teknoloji
- React Native Expo SDK 54, expo-router (file-based)
- AsyncStorage (offline-first, hesap gerekmez)
- react-native-reanimated (su dalga, splash, kabarcık)
- react-native-svg (dalga path'i)
- expo-linear-gradient, expo-notifications, expo-haptics
- lucide-react-native (ikonlar)
- react-native-view-shot + expo-sharing (rapor paylaşımı)

## Smart Business Enhancement
**Çok dilli + iklim-adaptif akıllı hidrasyon**: Kullanıcının ülkesine göre iklim-bazlı su hedefi (Dubai'de 500ml fazla, İsveç'te 100ml az). 7 dilde motivasyon + bildirim = global pazara hazır. Adaptive goal mekaniği 7 günlük başarı sonrası hedefi otomatik yükselterek atletik progression hissi verir — bu retention driver ile premium plan ikinci aşamada kolayca monetize edilebilir.

## Dosya Yapısı
```
/app/frontend/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx (router bootstrap)
│   ├── onboarding.tsx (7 adım)
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── stats.tsx (share ile)
│       ├── achievements.tsx
│       └── settings.tsx (theme/lang/country/adaptive)
└── src/
    ├── AppContext.tsx (state + palette + t)
    ├── types.ts
    ├── storage.ts (AsyncStorage + goal calc + streak)
    ├── i18n.ts (7 dil)
    ├── themes.ts (6 palet)
    ├── countries.ts (26 ülke + climateBoostMl)
    ├── quotes.ts (her dil için 10 alıntı)
    ├── notifications.ts (i18n reminders)
    ├── achievements.ts
    ├── sound.ts (Web Audio + Haptics)
    └── components/
        ├── WaterWave.tsx
        ├── Bubbles.tsx
        ├── SplashRing.tsx
        └── GlassCard.tsx
```

## Kullanım
Yerel ortam: Emergent preview URL — tunnel Expo Metro.
Kendi cihazına kurmak için `/app/XCODE_EXPORT.md` okuyup macOS'ta prebuild yap.

## Notlar
- Backend (FastAPI + MongoDB) şu an **kullanılmıyor** — uygulama tamamen offline. İleride multi-device sync istersen `/api/` endpoint'leri eklenebilir.
- iOS Widget / Apple Watch / Apple Health: native extension gerektirdiği için Expo preview'da test edilemez; Xcode'a export sonrası aktif edilir (rehber hazır).

---

## 🎨 v1.1 Design Targets (ONAYLI — 19 Mayıs 2026)

Kullanıcı 2 yeni tasarım referansı yükledi ve v1.1'de aşağıdaki değişikliklerin yapılmasını onayladı:

### 1. Body Map (yeniden tasarım)
- **Holographic / X-ray mavi insan figürü** (mevcut silüet yerine)
- **8 organ kartı** glassmorphism stilinde — 4 sol + 4 sağ kolon
- **"Blood" → "Liver" olarak değişti** (organ listesi: Brain, Heart, Lungs, Kidneys, Liver, Skin, Muscles, Bones)
- Vücuttan kartlara giden ince mavi glow bağlantı çizgileri
- Reference: `/app/design-references/v1.1/body-map-target.png`

### 2. Theme Selector (yeniden tasarım)
- **2×3 grid layout** (horizontal scroll değil)
- Manzara preview görselli kartlar (580×380 her biri)
- Seçili tema cyan glow + checkmark
- Tema listesi değişti:
  - Tutulanlar: Ocean, Sunset, Forest, Aurora
  - **Eklenenler: Coral (yeni), Light (yeni — ilk light mode)**
  - **Çıkarılan: Night**
- Reference: `/app/design-references/v1.1/theme-selector-target.png`

### Detaylı Spec
Tam implementation rehberi: `/app/design-references/v1.1/SPEC.md`

### Zamanlama
- v1.0 mevcut tasarımıyla App Store'a submit edilecek (DEĞİŞTİRİLMEYECEK)
- v1.1 bu yeniden tasarımları içerecek (App Store onayı + 2-3 hafta içinde)
- Tahmini geliştirme süresi: ~7-9 saat (BodySilhouette rewrite + Theme grid + Light mode palette + 6 preview asset + i18n)


