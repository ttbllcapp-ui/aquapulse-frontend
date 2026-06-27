# 🎨 AquaPulse v1.1 — Design Reference Specs

> Bu dosya, kullanıcının onayladığı **v1.1 yeniden tasarım hedefleri**ni içerir.
> Reference görseller `/app/design-references/v1.1/` klasöründe.

**Onay tarihi:** 19 Mayıs 2026
**Onaylayan:** Kullanıcı (TTB International LLC)
**Hedef sürüm:** v1.1 (v1.0 App Store launch sonrası ilk büyük güncelleme)

---

## 🫀 1. BODY MAP (Yeniden Tasarım)

### Referans Görsel
`/app/design-references/v1.1/body-map-target.png`

### Tasarım Anahtar Detayları
| Eleman | Değer |
|---|---|
| Background | Koyu lacivert → siyah gradient (mevcut palette) |
| Insan figürü | **Mavi holografik / X-ray look** — parıltılı, neon mavi outline + iç dolgu glow |
| Pozisyon | Tam vücut, dik, simetrik, ekran ortasında |
| Organ kartları | **8 adet** (önceki versiyondaki sayı korunur), 4 sol + 4 sağ kolonda |
| Kart stili | Glassmorphism — translucent koyu mavi blok, ince beyaz/cyan outline, rounded ~24px |
| Tipografi | Organ adı: 36-40pt regular, beyaz<br>Yüzde: 56-64pt bold, beyaz |
| Bağlantı çizgileri | Her karttan vücut üzerindeki organa giden ince mavi glow line + uç nokta noktası |
| Status bar | iOS sistem barı görünür (9:41, sinyal, wifi, batarya) |
| Header | Geri ok (←) sol + "Body Map" ortada, beyaz |

### Organlar ve Default Yüzdeler (referans görsel)
| Organ | % (örnek state) |
|---|---|
| 🧠 Brain | 72% |
| ❤️ Heart | 78% |
| 🫁 Lungs | 65% |
| 🫘 Kidneys | 69% |
| 🍵 Liver | **68%** *(YENİ — v1.0'da yoktu, eklenecek)* |
| ✋ Skin | 64% |
| 💪 Muscles | 74% |
| 🦴 Bones | 71% |

> ⚠️ **Kritik değişiklik:** v1.0'da "Blood" vardı, v1.1'de **"Liver" ile değiştirilecek** (referans görseldeki düzene uygun).

### Implementation Notes
- Mevcut `BodySilhouette.tsx` component'i tamamen yeniden yazılacak
- Holographic effect için **react-native-svg** + radial gradient + blur filter
- "Just drank — water is spreading" animasyonu küçük bir glow dalgası olarak korunsun (göğüs merkezinde parıltı)
- Animasyon: figür hafif "breathing" (1.0 → 1.02 scale, 4 sn loop)

---

## 🎨 2. THEME SELECTOR (Yeniden Tasarım)

### Referans Görsel
`/app/design-references/v1.1/theme-selector-target.png`

### Tasarım Anahtar Detayları
| Eleman | Değer |
|---|---|
| Layout | **2×3 grid** (önceki tek sıra horizontal scroll yerine) |
| Tema kartları | Her biri ~580×380px rounded, gerçekçi manzara preview görseli ile |
| Seçili tema | **Cyan/beyaz dış glow + checkmark** (sol üst Ocean'da görüldüğü gibi) |
| Header | "🎨 Theme" ikonu + başlık, sol üstte |
| Background | Mevcut koyu lacivert palette |
| Boşluk | Kartlar arası ~24px, dış padding ~32px |

### Tema Listesi (v1.1)
| # | İsim | Görsel | Renk Anahtarı |
|---|---|---|---|
| 1 | **Ocean** ✓ (default) | Mavi gece denizi + sis dağları | Indigo/Blue |
| 2 | **Sunset** | Turuncu/kırmızı gün batımı, su yansıması | Orange/Coral |
| 3 | **Forest** | Yeşil çam ormanı, sis | Green/Teal |
| 4 | **Coral** *(YENİ)* | Pembe/magenta gün batımı dağ | Pink/Magenta |
| 5 | **Aurora** | Mor/pembe dağ, kuzey ışıkları | Purple/Magenta |
| 6 | **Light** *(YENİ — açık tema)* | Açık mavi gökyüzü + deniz | Sky Blue (light mode) |

> ⚠️ **Kritik değişiklikler:**
> - v1.0'daki **"Night" teması Coral ile değiştirilecek** (daha sıcak alternatif)
> - **"Light" teması yeni eklenecek** — ilk açık tema (Settings → Theme'de "Auto with system" seçeneği de eklenebilir)

### Implementation Notes
- Mevcut `themes.ts` dosyasında preset'ler güncellenecek (Coral + Light eklenecek, Night kaldırılacak)
- Her tema için `assets/themes/{theme}-preview.png` boyutu 580×380 olacak (yüksek kalite manzara, Unsplash/AI-generated)
- Theme grid component: `app/(tabs)/settings.tsx` içinde mevcut horizontal scroll → 2-column FlatList'e dönüştürülecek
- Light tema için **palette dosyasında ayrı bir set** gerekecek (text colors invert, bg light)
- iOS system dark/light mode follow option için `useColorScheme()` hook'u eklenecek

---

## 📋 v1.1 Implementation Checklist

### Body Map
- [ ] `src/components/BodySilhouette.tsx` — full rewrite (SVG holographic figure)
- [ ] `app/body-map.tsx` — 8 kart layout (4 sol + 4 sağ)
- [ ] Glassmorphism card component (`src/components/OrganCard.tsx` yeni)
- [ ] "Blood" → "Liver" rename (logic + i18n keys 18 dilde)
- [ ] Breathing animation (Reanimated)
- [ ] Connection lines from cards → body points (SVG path)

### Theme Selector
- [ ] `src/themes.ts` — "Night" sil, "Coral" + "Light" ekle
- [ ] `assets/themes/` — 6 yeni preview görseli (580×380, AI-generated landscapes)
- [ ] `app/(tabs)/settings.tsx` — Theme section 2×3 grid'e geçir
- [ ] Light mode palette desteği (text/bg ayrı set)
- [ ] (Opsiyonel) "Auto · Match System" toggle

### i18n
- [ ] 18 dilde `theme_coral`, `theme_light`, `organ_liver` çevirileri ekle

### Test
- [ ] Theme switching test (5 → 6 tema)
- [ ] Body Map yeni layout test (8 organ, animasyon, connection lines)
- [ ] Light mode'da tüm ekranların okunabilirliği test

---

## 📅 Zaman Tahmini

| Görev | Süre |
|---|---|
| BodySilhouette holographic rewrite | ~3-4 saat |
| Theme selector 2×3 grid + Light mode | ~2-3 saat |
| 6 tema preview görseli üretimi | ~1 saat |
| i18n + Liver/Coral/Light çevirileri | ~30 dk |
| Test + polish | ~1 saat |
| **Toplam** | **~7-9 saat** |

---

## 🚨 v1.0 Etkisi

Bu değişiklikler **v1.0 launch'ı etkilemez** — v1.0 mevcut tasarımıyla App Store'a gidecek. v1.1, App Store onayı sonrası **2-3 hafta içinde** çıkarılacak güncelleme olarak planlandı.

App Store review hızlandırma stratejisi:
1. v1.0 → submit (mevcut tasarım)
2. Apple onayı → store'da yayın (24-48 saat)
3. v1.1 paralel geliştirme başlar
4. İlk 100-500 kullanıcı feedback'i + yeni tasarım = v1.1 submit
5. v1.1 release notes: "Brand new Body Map · 2 new themes · Light mode"

---

## 📎 Referans Görsel Lokasyonları
- `/app/design-references/v1.1/body-map-target.png` (296 KB)
- `/app/design-references/v1.1/theme-selector-target.png` (417 KB)

Bu dosyalar git'e dahil edilmez (binary asset), local design referansıdır.
