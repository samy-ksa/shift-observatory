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
          ← {isAr ? "العودة للرئيسية" : "Back to Observatory"}
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="text-text-muted text-sm mb-10">
          {isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}
        </p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "1. المقدمة" : "1. Introduction"}
            </h2>
            <p>
              {isAr
                ? "مرحباً بك في مرصد شيفت (\"المنصة\"). نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند زيارتك لمنصتنا."
                : "Welcome to SHIFT Observatory (\"the Platform\"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our platform."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "2. البيانات التي نجمعها" : "2. Data We Collect"}
            </h2>
            <p className="mb-2">
              {isAr
                ? "قد نجمع الأنواع التالية من المعلومات:"
                : "We may collect the following types of information:"}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>
                {isAr
                  ? "بيانات الاستخدام: الصفحات التي تمت زيارتها، والوقت المستغرق، ونوع المتصفح، والجهاز المستخدم"
                  : "Usage data: pages visited, time spent, browser type, device information"}
              </li>
              <li>
                {isAr
                  ? "بيانات التحليل: بيانات مجهولة الهوية عبر ملفات تعريف الارتباط لتحسين أداء المنصة"
                  : "Analytics data: anonymized data via cookies to improve platform performance"}
              </li>
              <li>
                {isAr
                  ? "بيانات الاشتراك: عنوان البريد الإلكتروني في حالة الاشتراك في نشرتنا الإخبارية"
                  : "Subscription data: email address if you subscribe to our newsletter"}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "3. كيف نستخدم بياناتك" : "3. How We Use Your Data"}
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>{isAr ? "تحسين وتطوير المنصة" : "Improve and develop the platform"}</li>
              <li>{isAr ? "تحليل أنماط الاستخدام" : "Analyze usage patterns"}</li>
              <li>{isAr ? "إرسال النشرات الإخبارية (بموافقتك)" : "Send newsletters (with your consent)"}</li>
              <li>{isAr ? "ضمان أمن وأداء المنصة" : "Ensure platform security and performance"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "4. ملفات تعريف الارتباط" : "4. Cookies"}
            </h2>
            <p>
              {isAr
                ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يرجى مراجعة سياسة ملفات تعريف الارتباط الخاصة بنا للحصول على التفاصيل الكاملة."
                : "We use cookies to enhance your experience. Please refer to our Cookie Policy for full details."}
            </p>
            <Link href="/cookies" className="text-accent-primary hover:underline text-sm mt-1 inline-block">
              {isAr ? "سياسة ملفات تعريف الارتباط →" : "Cookie Policy →"}
            </Link>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "5. مشاركة البيانات" : "5. Data Sharing"}
            </h2>
            <p>
              {isAr
                ? "لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة. قد نستخدم خدمات تحليل من أطراف ثالثة (مثل Vercel Analytics) التي تعالج بيانات مجهولة الهوية."
                : "We do not sell or share your personal data with third parties. We may use third-party analytics services (such as Vercel Analytics) that process anonymized data."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "6. حقوقك" : "6. Your Rights"}
            </h2>
            <p className="mb-2">
              {isAr
                ? "وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL) واللائحة العامة لحماية البيانات (GDPR)، لديك الحق في:"
                : "Under the Saudi Personal Data Protection Law (PDPL) and the General Data Protection Regulation (GDPR), you have the right to:"}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>{isAr ? "الوصول إلى بياناتك الشخصية" : "Access your personal data"}</li>
              <li>{isAr ? "تصحيح البيانات غير الدقيقة" : "Rectify inaccurate data"}</li>
              <li>{isAr ? "طلب حذف بياناتك" : "Request deletion of your data"}</li>
              <li>{isAr ? "سحب الموافقة في أي وقت" : "Withdraw consent at any time"}</li>
              <li>{isAr ? "الاعتراض على معالجة البيانات" : "Object to data processing"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "7. أمن البيانات" : "7. Data Security"}
            </h2>
            <p>
              {isAr
                ? "نتخذ تدابير أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف."
                : "We implement appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "8. الاتصال بنا" : "8. Contact Us"}
            </h2>
            <p>
              {isAr
                ? "لأي استفسارات تتعلق بالخصوصية، يرجى التواصل عبر: privacy@ksashiftobservatory.online"
                : "For any privacy-related inquiries, please contact us at: privacy@ksashiftobservatory.online"}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
