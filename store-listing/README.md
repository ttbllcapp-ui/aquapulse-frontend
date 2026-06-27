# AquaPulse — App Store Submission Package

This folder contains everything you need to submit AquaPulse to the iOS App Store.

## Files

- `app-store-description-tr.md` — Turkish App Store description, keywords, promo text
- `app-store-description-en.md` — English App Store description, keywords, promo text
- `app-privacy-data-types.md` — Apple App Privacy form answers
- `app-store-connect-checklist.md` — Step-by-step submission checklist
- `screenshots/` — 5 marketing screenshots at 1290×2796 (iPhone 6.7")

## How to publish (quick guide)

1. **Backend production hosting**: Deploy `/app/backend` to Render or Railway. Get the public URL.
2. **Update `eas.json`** with `EXPO_PUBLIC_BACKEND_URL` set to your production backend URL.
3. **Legal site**: Push `/app/legal/*` to a GitHub repo named `aquapulse-legal` and enable GitHub Pages on main branch.
4. **EAS Build**: Run `npx eas-cli build --platform ios --profile production`.
5. **App Store Connect**: Follow `app-store-connect-checklist.md`.
6. **Submit**: `npx eas-cli submit --platform ios --latest` or upload via Transporter.
7. Wait ~24-48 hours for Apple review.

## Contact info

Company: TTB International LLC
Email: info@ttbinternationalllc.com
Bundle ID: com.ttbinternationalllc.aquapulse
App Name: AquaPulse — Water Tracker
Version: 1.0.0 (Build 1)
