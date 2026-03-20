"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

export default function PrivacyPolicy() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <main
      className="min-h-screen bg-bg-primary text-text-primary py-20 px-4 md:px-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-accent-primary text-sm hover:underline mb-8 inline-block"
        >
          ← {isAr ? "العودة للرئيسية" : lang === "fr" ? "Retour à l'observatoire" : "Back to Observatory"}
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "سياسة الخصوصية" : lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
        </h1>
        <p className="text-text-muted text-sm mb-10">
          {isAr ? "آخر تحديث: مارس 2026" : lang === "fr" ? "Dernière mise à jour : mars 2026" : "Last updated: March 2026"}
        </p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "1. المقدمة" : lang === "fr" ? "1. Introduction" : "1. Introduction"}
            </h2>
            <p>
              {isAr
                ? "مرحباً بك في مرصد شيفت (\"المنصة\"). نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند زيارتك لمنصتنا."
                : lang === "fr" ? "Bienvenue sur SHIFT Observatory (\u00ab la Plateforme \u00bb). Nous respectons votre vie priv\u00e9e et nous engageons \u00e0 prot\u00e9ger vos donn\u00e9es personnelles. Cette politique de confidentialit\u00e9 explique comment nous collectons, utilisons et prot\u00e9geons vos informations lorsque vous visitez notre plateforme."
                : "Welcome to SHIFT Observatory (\"the Platform\"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our platform."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "2. البيانات التي نجمعها" : lang === "fr" ? "2. Données que nous collectons" : "2. Data We Collect"}
            </h2>
            <p className="mb-2">
              {isAr
                ? "قد نجمع الأنواع التالية من المعلومات:"
                : lang === "fr" ? "Nous pouvons collecter les types d'informations suivants :"
                : "We may collect the following types of information:"}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>
                {isAr
                  ? "بيانات الاستخدام: الصفحات التي تمت زيارتها، والوقت المستغرق، ونوع المتصفح، والجهاز المستخدم"
                  : lang === "fr" ? "Données d'utilisation : pages visitées, temps passé, type de navigateur, informations sur l'appareil"
                  : "Usage data: pages visited, time spent, browser type, device information"}
              </li>
              <li>
                {isAr
                  ? "بيانات التحليل: بيانات مجهولة الهوية عبر ملفات تعريف الارتباط لتحسين أداء المنصة"
                  : lang === "fr" ? "Données analytiques : données anonymisées via des cookies pour améliorer les performances de la plateforme"
                  : "Analytics data: anonymized data via cookies to improve platform performance"}
              </li>
              <li>
                {isAr
                  ? "بيانات الاشتراك: عنوان البريد الإلكتروني في حالة الاشتراك في نشرتنا الإخبارية"
                  : lang === "fr" ? "Données d'abonnement : adresse e-mail si vous vous abonnez à notre newsletter"
                  : "Subscription data: email address if you subscribe to our newsletter"}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "3. كيف نستخدم بياناتك" : lang === "fr" ? "3. Comment nous utilisons vos données" : "3. How We Use Your Data"}
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>{isAr ? "تحسين وتطوير المنصة" : lang === "fr" ? "Améliorer et développer la plateforme" : "Improve and develop the platform"}</li>
              <li>{isAr ? "تحليل أنماط الاستخدام" : lang === "fr" ? "Analyser les comportements d'utilisation" : "Analyze usage patterns"}</li>
              <li>{isAr ? "إرسال النشرات الإخبارية (بموافقتك)" : lang === "fr" ? "Envoyer des newsletters (avec votre consentement)" : "Send newsletters (with your consent)"}</li>
              <li>{isAr ? "ضمان أمن وأداء المنصة" : lang === "fr" ? "Assurer la sécurité et les performances de la plateforme" : "Ensure platform security and performance"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "4. ملفات تعريف الارتباط" : lang === "fr" ? "4. Cookies" : "4. Cookies"}
            </h2>
            <p>
              {isAr
                ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يرجى مراجعة سياسة ملفات تعريف الارتباط الخاصة بنا للحصول على التفاصيل الكاملة."
                : lang === "fr" ? "Nous utilisons des cookies pour améliorer votre expérience. Veuillez consulter notre politique de cookies pour tous les détails."
                : "We use cookies to enhance your experience. Please refer to our Cookie Policy for full details."}
            </p>
            <Link href="/cookies" className="text-accent-primary hover:underline text-sm mt-1 inline-block">
              {isAr ? "سياسة ملفات تعريف الارتباط →" : lang === "fr" ? "Politique de cookies →" : "Cookie Policy →"}
            </Link>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "5. مشاركة البيانات" : lang === "fr" ? "5. Partage des données" : "5. Data Sharing"}
            </h2>
            <p>
              {isAr
                ? "لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة. قد نستخدم خدمات تحليل من أطراف ثالثة (مثل Vercel Analytics) التي تعالج بيانات مجهولة الهوية."
                : lang === "fr" ? "Nous ne vendons ni ne partageons vos données personnelles avec des tiers. Nous pouvons utiliser des services d'analyse tiers (tels que Vercel Analytics) qui traitent des données anonymisées."
                : "We do not sell or share your personal data with third parties. We may use third-party analytics services (such as Vercel Analytics) that process anonymized data."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "6. حقوقك" : lang === "fr" ? "6. Vos droits" : "6. Your Rights"}
            </h2>
            <p className="mb-2">
              {isAr
                ? "وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL) واللائحة العامة لحماية البيانات (GDPR)، لديك الحق في:"
                : lang === "fr" ? "En vertu de la loi saoudienne sur la protection des données personnelles (PDPL) et du Règlement général sur la protection des données (RGPD), vous avez le droit de :"
                : "Under the Saudi Personal Data Protection Law (PDPL) and the General Data Protection Regulation (GDPR), you have the right to:"}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>{isAr ? "الوصول إلى بياناتك الشخصية" : lang === "fr" ? "Accéder à vos données personnelles" : "Access your personal data"}</li>
              <li>{isAr ? "تصحيح البيانات غير الدقيقة" : lang === "fr" ? "Rectifier les données inexactes" : "Rectify inaccurate data"}</li>
              <li>{isAr ? "طلب حذف بياناتك" : lang === "fr" ? "Demander la suppression de vos données" : "Request deletion of your data"}</li>
              <li>{isAr ? "سحب الموافقة في أي وقت" : lang === "fr" ? "Retirer votre consentement à tout moment" : "Withdraw consent at any time"}</li>
              <li>{isAr ? "الاعتراض على معالجة البيانات" : lang === "fr" ? "Vous opposer au traitement des données" : "Object to data processing"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "7. أمن البيانات" : lang === "fr" ? "7. Sécurité des données" : "7. Data Security"}
            </h2>
            <p>
              {isAr
                ? "نتخذ تدابير أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف."
                : lang === "fr" ? "Nous mettons en \u0153uvre des mesures de sécurité appropriées pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés."
                : "We implement appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "8. الاتصال بنا" : lang === "fr" ? "8. Nous contacter" : "8. Contact Us"}
            </h2>
            <p>
              {isAr
                ? "لأي استفسارات تتعلق بالخصوصية، يرجى التواصل عبر: privacy@ksashiftobservatory.online"
                : lang === "fr" ? "Pour toute question relative à la confidentialité, veuillez nous contacter à : privacy@ksashiftobservatory.online"
                : "For any privacy-related inquiries, please contact us at: privacy@ksashiftobservatory.online"}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
