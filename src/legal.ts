// Privacy Policy and Terms of Service content (TR + EN — fallback to EN)
import { LangCode } from './i18n';

const PRIVACY_TR = `AquaPulse Gizlilik Politikası

Son güncelleme: 3 Mayıs 2026

TTB International LLC ("biz", "bizim") olarak gizliliğinizi önemsiyoruz. Bu politika, AquaPulse uygulamasını kullandığınızda topladığımız ve işlediğimiz bilgileri açıklar.

1. TOPLANAN BİLGİLER
AquaPulse tamamen yerel (offline) çalışır. Sağlık ve hidrasyon verileriniz yalnızca cihazınızda saklanır:
• Vücut ağırlığınız (hedef hesaplama için)
• Su içme kayıtlarınız (zaman, miktar, içecek türü)
• Ülke ve dil tercihiniz
• Bildirim ayarlarınız

Sunucularımıza kişisel veri göndermiyoruz.

2. APPLE HEALTH ENTEGRASYONU (opsiyonel)
Apple Health'i etkinleştirirseniz, su tüketim verileriniz Apple Health'e kaydedilebilir. Bu veri Apple'ın kontrolünde kalır, biz erişmiyoruz.

3. BİLDİRİMLER
İzin verirseniz, su içme hatırlatıcıları için yerel bildirimler kullanırız. Bildirim içerikleri sunucularımıza gönderilmez.

4. ANALİTİK
Anonim kullanım istatistikleri (kaç gün açıldığı gibi) toplanabilir. Kişisel kimlik bilgisi paylaşılmaz.

5. ÜÇÜNCÜ TARAF SERVİSLER
• Apple HealthKit (opsiyonel)
• Apple Push Notification Service
• Hiçbir reklam ağı veya tracker kullanılmaz

6. ÇOCUKLAR
AquaPulse 13 yaş altı çocukların kullanımı için tasarlanmamıştır.

7. HAKLARINIZ
İstediğiniz zaman tüm verilerinizi Ayarlar > Sıfırla menüsünden silebilirsiniz.

8. İLETİŞİM
Sorularınız için: info@ttbinternationalllc.com

Bu politika değiştirilebilir. Güncellemeler bu sayfada yayınlanır.`;

const PRIVACY_EN = `AquaPulse Privacy Policy

Last updated: May 3, 2026

TTB International LLC ("we", "us") values your privacy. This policy explains the information we collect and process when you use AquaPulse.

1. INFORMATION COLLECTED
AquaPulse runs fully offline. Your health and hydration data is stored only on your device:
• Body weight (for goal calculation)
• Drink logs (time, amount, drink type)
• Country and language preference
• Notification settings

We do not send personal data to our servers.

2. APPLE HEALTH INTEGRATION (optional)
If you enable Apple Health, your water intake data may be saved to Apple Health. This data remains under Apple's control; we do not access it.

3. NOTIFICATIONS
If permitted, we use local notifications for water reminders. Notification content is not sent to our servers.

4. ANALYTICS
Anonymous usage stats (such as app opens) may be collected. No personal identifiers are shared.

5. THIRD-PARTY SERVICES
• Apple HealthKit (optional)
• Apple Push Notification Service
• No ad networks or trackers are used

6. CHILDREN
AquaPulse is not intended for use by children under 13.

7. YOUR RIGHTS
You can delete all your data anytime from Settings > Reset.

8. CONTACT
Questions: info@ttbinternationalllc.com

This policy may change. Updates will be posted on this page.`;

const TERMS_TR = `AquaPulse Kullanım Koşulları

Son güncelleme: 3 Mayıs 2026

AquaPulse uygulamasını ("Uygulama") kullanarak aşağıdaki şartları kabul etmiş olursunuz.

1. KULLANIM
AquaPulse, su tüketim takibi ve hatırlatıcı işlevi sunar. Tıbbi tavsiye yerine geçmez. Sağlık konularında profesyonel destek alın.

2. SAĞLIK UYARISI
Uygulamada gösterilen su hedefi ve hidrasyon önerileri genel bilgi amaçlıdır. Kişisel sağlık koşullarınıza uymayabilir. Önemli sağlık kararları için doktorunuza danışın.

3. HESAP VE GİZLİLİK
AquaPulse hesap kaydı gerektirmez. Veriler yerel olarak saklanır. Gizlilik politikamızı okuyun.

4. SORUMLULUK SINIRI
TTB International LLC, uygulamanın kullanımından doğan dolaylı veya doğrudan zararlardan sorumlu değildir.

5. FİKRİ MÜLKİYET
Tüm tasarım, kod ve içerikler TTB International LLC'ye aittir.

6. ÜCRETLİ ÖZELLİKLER (gelecekte)
Premium özellikler eklendiğinde, abonelik koşulları ayrıca belirtilecektir. App Store satın alım koşulları geçerlidir.

7. DEĞİŞİKLİKLER
Bu koşullar değiştirilebilir. Uygulamayı kullanmaya devam ederek yeni koşulları kabul edersiniz.

8. İLETİŞİM
info@ttbinternationalllc.com`;

const TERMS_EN = `AquaPulse Terms of Service

Last updated: May 3, 2026

By using AquaPulse ("App"), you agree to these terms.

1. USE
AquaPulse provides water intake tracking and reminders. It is not medical advice. Consult professionals for health concerns.

2. HEALTH DISCLAIMER
Water goals and hydration suggestions are general guidance. They may not suit your specific health condition. Consult your doctor for important health decisions.

3. ACCOUNT & PRIVACY
AquaPulse requires no account. Data is stored locally. Read our Privacy Policy.

4. LIMITATION OF LIABILITY
TTB International LLC is not liable for any direct or indirect damages arising from use of the app.

5. INTELLECTUAL PROPERTY
All design, code, and content belong to TTB International LLC.

6. PAID FEATURES (future)
When premium features are added, subscription terms will be specified separately. App Store purchase terms apply.

7. CHANGES
These terms may change. By continuing to use the app, you accept the new terms.

8. CONTACT
info@ttbinternationalllc.com`;

export function getPrivacyPolicy(lang: LangCode): string {
  if (lang === 'tr') return PRIVACY_TR;
  return PRIVACY_EN;
}

export function getTerms(lang: LangCode): string {
  if (lang === 'tr') return TERMS_TR;
  return TERMS_EN;
}
