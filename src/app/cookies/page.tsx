"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

export default function CookiePolicy() {
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
          {isAr ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
        </h1>
        <p className="text-text-muted text-sm mb-10">
          {isAr ? "آخر تحديث: مارس 2026" : "Last updated: March 2026"}
        </p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "1. ما هي ملفات تعريف الارتباط؟" : "1. What Are Cookies?"}
            </h2>
            <p>
              {isAr
                ? "ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقع ويب. تساعدنا في تقديم تجربة أفضل وتحليل كيفية استخدام المنصة."
                : "Cookies are small text files stored on your device when you visit a website. They help us provide a better experience and analyze how the platform is used."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "2. أنواع ملفات تعريف الارتباط التي نستخدمها" : "2. Types of Cookies We Use"}
            </h2>

            <div className="space-y-4">
              <div className="bg-bg-card/40 rounded-md p-4 border border-white/5">
                <h3 className="font-semibold text-text-primary mb-1">
                  {isAr ? "ملفات أساسية (ضرورية)" : "Essential Cookies (Strictly Necessary)"}
                </h3>
                <p className="text-text-muted">
                  {isAr
                    ? "ضرورية لتشغيل المنصة. تشمل تفضيلات اللغة والتخزين المحلي للإعدادات. لا يمكن تعطيلها."
                    : "Required for the platform to function. Include language preferences and local storage settings. Cannot be disabled."}
                </p>
              </div>

              <div className="bg-bg-card/40 rounded-md p-4 border border-white/5">
                <h3 className="font-semibold text-text-primary mb-1">
                  {isAr ? "ملفات تحليلية" : "Analytics Cookies"}
                </h3>
                <p className="text-text-muted">
                  {isAr
                    ? "تساعدنا على فهم كيفية تفاعل الزوار مع المنصة من خلال جمع معلومات مجهولة الهوية. تشمل: Vercel Web Analytics."
                    : "Help us understand how visitors interact with the platform by collecting anonymized information. Include: Vercel Web Analytics."}
                </p>
              </div>

              <div className="bg-bg-card/40 rounded-md p-4 border border-white/5">
                <h3 className="font-semibold text-text-primary mb-1">
                  {isAr ? "ملفات وظيفية" : "Functional Cookies"}
                </h3>
                <p className="text-text-muted">
                  {isAr
                    ? "تمكّن وظائف محسّنة مثل تذكر تفضيلاتك (اللغة، الفلاتر المختارة، موافقة ملفات تعريف الارتباط)."
                    : "Enable enhanced functionality such as remembering your preferences (language, selected filters, cookie consent)."}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "3. إدارة ملفات تعريف الارتباط" : "3. Managing Cookies"}
            </h2>
            <p>
              {isAr
                ? "يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك. يرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف المنصة."
                : "You can control cookies through your browser settings. Please note that disabling certain cookies may affect platform functionality."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "4. ملفات تعريف الارتباط من أطراف ثالثة" : "4. Third-Party Cookies"}
            </h2>
            <p>
              {isAr
                ? "قد نستخدم خدمات من أطراف ثالثة (Vercel) قد تضع ملفات تعريف الارتباط الخاصة بها. نحن لا نتحكم في ملفات تعريف الارتباط هذه ونوصي بمراجعة سياسات الخصوصية الخاصة بهم."
                : "We may use third-party services (Vercel) that may place their own cookies. We do not control these cookies and recommend reviewing their respective privacy policies."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {isAr ? "5. تحديثات السياسة" : "5. Policy Updates"}
            </h2>
            <p>
              {isAr
                ? "قد نقوم بتحديث سياسة ملفات تعريف الارتباط من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة."
                : "We may update this cookie policy from time to time. Any changes will be posted on this page."}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
