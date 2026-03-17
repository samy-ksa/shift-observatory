"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

export default function TermsOfUse() {
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
          {isAr ? "شروط الاستخدام" : "Terms of Use"}
        </h1>
        <p className="text-text-muted text-sm mb-10">
          {isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}
        </p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "1. قبول الشروط" : "1. Acceptance of Terms"}
            </h2>
            <p>
              {isAr
                ? "باستخدامك لمنصة مرصد شيفت، فإنك توافق على هذه الشروط والأحكام. إذا لم تقبل هذه الشروط، يرجى عدم استخدام المنصة."
                : "By accessing and using SHIFT Observatory, you agree to these terms and conditions. If you do not accept these terms, please do not use the platform."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "2. وصف الخدمة" : "2. Description of Service"}
            </h2>
            <p>
              {isAr
                ? "مرصد شيفت هو منصة معلوماتية تفاعلية تتتبع تأثير الذكاء الاصطناعي على سوق العمل في المملكة العربية السعودية. البيانات المقدمة هي لأغراض إعلامية وتحليلية فقط."
                : "SHIFT Observatory is an interactive information platform tracking AI's impact on the Saudi Arabian labor market. The data provided is for informational and analytical purposes only."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "3. إخلاء المسؤولية" : "3. Disclaimer"}
            </h2>
            <p>
              {isAr
                ? "المعلومات المقدمة على هذه المنصة لا تشكل نصيحة مهنية أو استثمارية أو وظيفية. درجات مخاطر الذكاء الاصطناعي هي تقديرات مبنية على نماذج أكاديمية ولا تضمن نتائج فعلية. يجب عدم اتخاذ قرارات مهنية أو مالية بناءً على هذه البيانات وحدها."
                : "The information provided on this platform does not constitute professional, investment, or career advice. AI risk scores are estimates based on academic models and do not guarantee actual outcomes. Professional or financial decisions should not be made based solely on this data."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "4. الملكية الفكرية" : "4. Intellectual Property"}
            </h2>
            <p>
              {isAr
                ? "جميع المحتويات والتصميمات والرسومات والبيانات المعروضة على هذه المنصة محمية بموجب قوانين حقوق الملكية الفكرية. يمنع النسخ أو إعادة النشر بدون إذن كتابي مسبق."
                : "All content, designs, graphics, and data displayed on this platform are protected under intellectual property laws. Reproduction or redistribution without prior written permission is prohibited."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "5. مصادر البيانات" : "5. Data Sources"}
            </h2>
            <p>
              {isAr
                ? "تعتمد المنصة على بيانات من مصادر عامة تشمل: الهيئة العامة للإحصاء (GASTAT)، المؤسسة العامة للتأمينات الاجتماعية (GOSI)، المنتدى الاقتصادي العالمي (WEF)، وأبحاث أكاديمية (Frey-Osborne، Eloundou، Felten). نبذل جهدنا لضمان الدقة لكن لا نضمن خلو البيانات من الأخطاء."
                : "The platform relies on data from public sources including: GASTAT, GOSI, World Economic Forum (WEF), and academic research (Frey-Osborne, Eloundou, Felten). We strive for accuracy but do not guarantee the data is error-free."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "6. تحديد المسؤولية" : "6. Limitation of Liability"}
            </h2>
            <p>
              {isAr
                ? "لا يتحمل مرصد شيفت أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو الاعتماد على البيانات المقدمة."
                : "SHIFT Observatory shall not be liable for any direct or indirect damages arising from the use of the platform or reliance on the data provided."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "7. القانون المعمول به" : "7. Governing Law"}
            </h2>
            <p>
              {isAr
                ? "تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية. أي نزاعات تخضع للاختصاص القضائي للمحاكم السعودية المختصة."
                : "These terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be subject to the jurisdiction of the competent Saudi courts."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "8. التعديلات" : "8. Amendments"}
            </h2>
            <p>
              {isAr
                ? "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يشكل استمرارك في استخدام المنصة بعد التعديلات قبولاً للشروط المحدثة."
                : "We reserve the right to modify these terms at any time. Your continued use of the platform after modifications constitutes acceptance of the updated terms."}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
