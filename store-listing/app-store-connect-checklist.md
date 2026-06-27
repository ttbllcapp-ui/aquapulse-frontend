# App Store Connect — Submission Checklist for AquaPulse

Use this checklist when filling out App Store Connect to submit AquaPulse for review.

## 0) Before You Start
- [ ] Apple Developer account active (TTB International LLC, DUNS verified) ✅
- [ ] Sign agreements in App Store Connect → Agreements, Tax, Banking → Paid Applications (you can skip this since app is free)
- [ ] Apple Team ID handy (Membership page, e.g. `ABCDE12345`)

## 1) Create New App
- Name: **AquaPulse — Water Tracker**
- Primary Language: **English (U.S.)**
- Bundle ID: **com.ttbinternationalllc.aquapulse** (must match app.json)
- SKU: **aquapulse-ios-2025**
- User Access: **Full Access**

## 2) App Information
- Subtitle (EN): **Smart hydration & AI coach**
- Subtitle (TR): **Akıllı su takibi & AI koç**
- Category: **Health & Fitness** (Primary) / **Lifestyle** (Secondary)
- Content Rights: **No, it does not contain, show, or access third-party content**
- Age Rating: **4+**

## 3) Pricing & Availability
- Price: **Free (USD 0.00)**
- Availability: **All countries**
- Pre-Orders: Off

## 4) App Privacy (use docs/app-privacy-data-types.md)
- Data collected: Email, Name, User Content, Health, Fitness, User ID
- Used for tracking: **NO** for all
- Linked to user: YES for all

## 5) Version Information (1.0.0)
- Promotional Text (EN/TR): see store-listing/*.md
- Description (EN/TR): see store-listing/*.md
- Keywords (EN): water,hydration,tracker,reminder,health,fitness,coach,glass,family,wellness,drink,thirst
- Keywords (TR): su,hidrasyon,water,tracker,hydration,sağlık,fitness,reminder,bardak,coach,family,wellness
- Support URL: https://ttbllcapp-ui.github.io/aquapulse-legal/support.html
- Marketing URL (optional): https://ttbllcapp-ui.github.io/aquapulse-legal/
- Privacy Policy URL: https://ttbllcapp-ui.github.io/aquapulse-legal/privacy.html
- License Agreement: standard EULA (Apple default) OR custom Terms URL above

## 6) App Review Information
- First name / Last name / Phone / Email — yours
- Sign-in required: **YES (optional for full feature test)**
- Demo account: provide a Google sign-in test email + password
- Notes for reviewer:
  > AquaPulse is a free water-tracking app with optional Family Mode requiring sign-in. 
  > Guest mode lets you fully test the core flow without any account: Welcome → Guest → Onboarding → Home.
  > To test Family Mode and AI Coach across devices, please sign in with the demo Google account provided. 
  > The app is fully free, no in-app purchases, no ads.
  > Account deletion is in-app at Settings → "Permanently delete my account".

## 7) Screenshots (5 minimum, 10 max)
- iPhone 6.7" (iPhone 14/15/16 Pro Max): 1290 x 2796
- iPhone 6.5" (iPhone 11 Pro Max/XS Max): 1242 x 2688 — auto-generated from 6.7"
- We provide 5 screenshots; see /app/store-listing/screenshots/

## 8) Build
- Upload via EAS: `eas submit --platform ios --latest`
- Or upload IPA via Transporter.app from the EAS build artifact
- Select build in App Store Connect → Version → Build

## 9) Submit for Review
- Export Compliance: **No, my app doesn't use any encryption** → because `ITSAppUsesNonExemptEncryption: false` is set
- Content Rights: No
- Advertising Identifier: No
- Submit

## 10) After Submission
- Apple reviews in ~24-48 hours
- If rejected: read reviewer notes carefully, fix, resubmit (same build OR new build)
- If approved: tap "Release this version" to push to App Store immediately

## Useful EAS Commands
```bash
npx eas-cli login
npx eas-cli init --id REPLACE_WITH_EAS_PROJECT_ID
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```
