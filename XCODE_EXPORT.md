# AquaLife — Xcode Export & App Store Yayın Rehberi

Bu doküman Expo projenin yerel iOS projesini üretme, Xcode'da açma, iOS Widget / Apple Watch entegrasyonlarını eklemenin adımlarını içerir.

---

## 1) Önkoşullar (Mac)

- macOS (Monterey veya üzeri önerilir)
- Xcode 16+ (App Store'dan)
- Node.js 20+, Yarn, Watchman
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer hesabı (99 $/yıl)

---

## 2) Projeyi indir ve hazırla

1. **Emergent'tan GitHub'a Push**: Sol alt menüden "Save to GitHub" ile kendi hesabına push et.
2. Mac'te clone et:
```bash
   git clone https://github.com/<kullaniciadin>/<repo>.git aqualife
   cd aqualife/frontend
   yarn install
```

---

## 3) Expo prebuild ile native iOS projesi üret

```bash
cd frontend
npx expo prebuild --platform ios --clean
cd ios
pod install
cd ..
```

```bash
open ios/frontend.xcworkspace
```

---

## 4) App Bundle ID / Signing / Team

Xcode'da:
1. Sol kenarda **frontend** target'ı seç
2. **Signing & Capabilities** sekmesi
3. **Team**'i kendi Apple Developer hesabınla ayarla
4. **Bundle Identifier**'ı benzersiz yap
5. `app.json` içindeki `expo.ios.bundleIdentifier` değerini de aynı yap

---

## 5) İzinler

`app.json` → `expo.ios.infoPlist` zaten yapılandırıldı. Xcode'da `Info.plist` içinde aşağıdakilerin görünmesi gerekir:
- `NSUserNotificationsUsageDescription`

---

## 6) TestFlight / App Store'a yükleme

1. Xcode üst menü → **Product → Archive**
2. Archive tamamlanınca **Distribute App** → **App Store Connect** → **Upload**
3. [appstoreconnect.apple.com](https://appstoreconnect.apple.com)

---

## 7) iOS Widget (Home Screen)

1. Xcode → File → New → Target → **Widget Extension**
2. App Group ekle: `group.com.seninsirketin.aqualife`

---

## 8) Apple Watch companion app

1. Xcode → File → New → Target → **watchOS → App**
2. App Group'a Watch target'ını da ekle

---

## 9) App Store Assets

- **App Icon**: `assets/images/icon.png` (1024x1024)
- **Splash**: `assets/images/splash-icon.png`
- **Screenshots**: 6.7", 6.5", 5.5" cihazlar için en az 3'er görsel

---

## 10) Publish checklist

- [ ] Bundle ID eşleşiyor
- [ ] Version & Build number güncel
- [ ] Release build Archive hatasız
- [ ] TestFlight'ta test edildi

---

## 11) Sorun giderme

- **Pod install hatası**: `cd ios && pod repo update && pod install`
- **Signing error**: Xcode → Preferences → Accounts → Apple ID ekle
