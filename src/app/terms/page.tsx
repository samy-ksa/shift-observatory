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
          ← {isAr ? "العودة للرئيسية" : lang === "fr" ? "Retour à l'observatoire" : "Back to Observatory"}
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "شروط الاستخدام" : lang === "fr" ? "Conditions d'utilisation" : "Terms of Use"}
        </h1>
        <p className="text-text-muted text-sm mb-10">
          {isAr ? "آخر تحديث: مارس 2026" : lang === "fr" ? "Dernière mise à jour : mars 2026" : "Last updated: March 2026"}
        </p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "1. قبول الشروط" : lang === "fr" ? "1. Acceptation des conditions" : "1. Acceptance of Terms"}
            </h2>
            <p>
              {isAr
                ? "باستخدامك لمنصة مرصد شيفت، فإنك توافق على هذه الشروط والأحكام. إذا لم تقبل هذه الشروط، يرجى عدم استخدام المنصة."
                : lang === "fr" ? "En accédant et en utilisant SHIFT Observatory, vous acceptez ces conditions générales. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme."
                : "By accessing and using SHIFT Observatory, you agree to these terms and conditions. If you do not accept these terms, please do not use the platform."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "2. وصف الخدمة" : lang === "fr" ? "2. Description du service" : "2. Description of Service"}
            </h2>
            <p>
              {isAr
                ? "مرصد شيفت هو منصة معلوماتية تفاعلية تتتبع تأثير الذكاء الاصطناعي على سوق العمل في المملكة العربية السعودية. البيانات المقدمة هي لأغراض إعلامية وتحليلية فقط."
                : lang === "fr" ? "SHIFT Observatory est une plateforme d'information interactive qui suit l'impact de l'IA sur le marché du travail en Arabie saoudite. Les données fournies sont uniquement à des fins d'information et d'analyse."
                : "SHIFT Observatory is an interactive information platform tracking AI's impact on the Saudi Arabian labor market. The data provided is for informational and analytical purposes only."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "3. إخلاء المسؤولية" : lang === "fr" ? "3. Avertissement" : "3. Disclaimer"}
            </h2>
            <p>
              {isAr
                ? "المعلومات المقدمة على هذه المنصة لا تشكل نصيحة مهنية أو استثمارية أو وظيفية. درجات مخاطر الذكاء الاصطناعي هي تقديرات مبنية على نماذج أكاديمية ولا تضمن نتائج فعلية. يجب عدم اتخاذ قرارات مهنية أو مالية بناءً على هذه البيانات وحدها."
                : lang === "fr" ? "Les informations fournies sur cette plateforme ne constituent pas des conseils professionnels, d'investissement ou de carrière. Les scores de risque IA sont des estimations basées sur des modèles académiques et ne garantissent pas de résultats réels. Les décisions professionnelles ou financières ne doivent pas être prises uniquement sur la base de ces données."
                : "The information provided on this platform does not constitute professional, investment, or career advice. AI risk scores are estimates based on academic models and do not guarantee actual outcomes. Professional or financial decisions should not be made based solely on this data."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "4. الملكية الفكرية" : lang === "fr" ? "4. Propriété intellectuelle" : "4. Intellectual Property"}
            </h2>
            <p>
              {isAr
                ? "جميع المحتويات والتصميمات والرسومات والبيانات المعروضة على هذه المنصة محمية بموجب قوانين حقوق الملكية الفكرية. يمنع النسخ أو إعادة النشر بدون إذن كتابي مسبق."
                : lang === "fr" ? "Tous les contenus, designs, graphiques et données affichés sur cette plateforme sont protégés par les lois sur la propriété intellectuelle. La reproduction ou la redistribution sans autorisation écrite préalable est interdite."
                : "All content, designs, graphics, and data displayed on this platform are protected under intellectual property laws. Reproduction or redistribution without prior written permission is prohibited."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "5. مصادر البيانات" : lang === "fr" ? "5. Sources de données" : "5. Data Sources"}
            </h2>
            <p>
              {isAr
                ? "تعتمد المنصة على بيانات من مصادر عامة تشمل: الهيئة العامة للإحصاء (GASTAT)، المؤسسة العامة للتأمينات الاجتماعية (GOSI)، المنتدى الاقتصادي العالمي (WEF)، وأبحاث أكاديمية (Frey-Osborne، Eloundou، Felten). نبذل جهدنا لضمان الدقة لكن لا نضمن خلو البيانات من الأخطاء."
                : lang === "fr" ? "La plateforme s'appuie sur des données provenant de sources publiques incluant : GASTAT, GOSI, le Forum économique mondial (WEF) et des recherches académiques (Frey-Osborne, Eloundou, Felten). Nous nous efforçons d'assurer l'exactitude mais ne garantissons pas que les données sont exemptes d'erreurs."
                : "The platform relies on data from public sources including: GASTAT, GOSI, World Economic Forum (WEF), and academic research (Frey-Osborne, Eloundou, Felten). We strive for accuracy but do not guarantee the data is error-free."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "6. تحديد المسؤولية" : lang === "fr" ? "6. Limitation de responsabilité" : "6. Limitation of Liability"}
            </h2>
            <p>
              {isAr
                ? "لا يتحمل مرصد شيفت أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو الاعتماد على البيانات المقدمة."
                : lang === "fr" ? "SHIFT Observatory ne saurait être tenu responsable de tout dommage direct ou indirect résultant de l'utilisation de la plateforme ou de la confiance accordée aux données fournies."
                : "SHIFT Observatory shall not be liable for any direct or indirect damages arising from the use of the platform or reliance on the data provided."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "7. القانون المعمول به" : lang === "fr" ? "7. Droit applicable" : "7. Governing Law"}
            </h2>
            <p>
              {isAr
                ? "تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية. أي نزاعات تخضع للاختصاص القضائي للمحاكم السعودية المختصة."
                : lang === "fr" ? "Ces conditions sont régies par les lois du Royaume d'Arabie saoudite. Tout litige sera soumis à la juridiction des tribunaux saoudiens compétents."
                : "These terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be subject to the jurisdiction of the competent Saudi courts."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "8. التعديلات" : lang === "fr" ? "8. Modifications" : "8. Amendments"}
            </h2>
            <p>
              {isAr
                ? "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يشكل استمرارك في استخدام المنصة بعد التعديلات قبولاً للشروط المحدثة."
                : lang === "fr" ? "Nous nous réservons le droit de modifier ces conditions à tout moment. Votre utilisation continue de la plateforme après les modifications constitue une acceptation des conditions mises à jour."
                : "We reserve the right to modify these terms at any time. Your continued use of the platform after modifications constitutes acceptance of the updated terms."}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
