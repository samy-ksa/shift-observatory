"use client";

import { useLang } from "@/lib/i18n/context";

export default function AboutAuthor() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <div className="border-t border-gray-800 pt-8 mt-12 max-w-3xl mx-auto px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className={`flex items-start gap-5 ${isAr ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
          <span className="text-cyan-400 font-bold text-lg">SA</span>
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p className="text-cyan-400 text-[10px] uppercase tracking-[0.15em] font-semibold mb-1">
            {isAr ? "عن المؤلف" : lang === "fr" ? "À propos de l'auteur" : "About the Author"}
          </p>
          <p className="text-white font-medium text-lg leading-tight">
            {isAr ? "سامي العلولو" : "Samy Aloulou"}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-2">
            {isAr ? (
              <>
                رائد أعمال فرنسي مقيم في الرياض، المملكة العربية السعودية. الرئيس التنفيذي لشركة{" "}
                <span className="text-gray-300">Monitoring Force Gulf</span>، شركة استشارية فرنسية-سعودية تدعم شركات علوم الحياة في دخول أسواق الخليج وأوروبا.
              </>
            ) : lang === "fr" ? (
              <>
                Entrepreneur français basé à Riyad, Arabie saoudite. PDG de{" "}
                <span className="text-gray-300">Monitoring Force Gulf</span>, cabinet de conseil franco-saoudien accompagnant les entreprises des sciences de la vie sur les marchés du Golfe et européens.
              </>
            ) : (
              <>
                French entrepreneur based in Riyadh, Saudi Arabia. CEO of{" "}
                <span className="text-gray-300">Monitoring Force Gulf</span>, a Franco-Saudi
                consulting firm supporting life sciences companies entering the Gulf and European
                markets.
              </>
            )}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-2">
            {isAr
              ? "بُني مرصد شيفت من قناعة راسخة: التحول في القوى العاملة بفعل الذكاء الاصطناعي يتسارع أكثر مما يستعد له معظم المنظمات والمهنيين. هذه المنصة موجودة لجعل هذا التحول مرئياً وقابلاً للقياس والتنفيذ — خاصة في المملكة العربية السعودية، حيث رؤية 2030 وتبني الذكاء الاصطناعي يعيدان تشكيل سوق العمل في آن واحد."
              : lang === "fr"
              ? "SHIFT Observatory est né d'une conviction : la transformation du marché du travail par l'IA s'accélère plus vite que ce à quoi la plupart des organisations et des professionnels se préparent. Ce tableau de bord existe pour rendre cette transformation visible, mesurable et exploitable — en particulier en Arabie saoudite, où la Vision 2030 et l'adoption de l'IA remodèlent simultanément le marché du travail."
              : "SHIFT Observatory was built from a conviction: AI-driven workforce transformation is accelerating faster than most organizations and professionals are preparing for. This dashboard exists to make that shift visible, measurable, and actionable — especially in Saudi Arabia, where Vision 2030 and AI adoption are reshaping the labor market simultaneously."}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {isAr
              ? "بُني ويُدار بشكل مستقل. البيانات من: التأمينات الاجتماعية، المنتدى الاقتصادي العالمي، ماكنزي، وزارة الموارد البشرية، وPerplexity AI."
              : lang === "fr"
              ? "Conçu et maintenu de manière indépendante. Données issues de : GOSI, WEF, McKinsey, HRSD et Perplexity AI."
              : "Built and maintained independently. Data sourced from GOSI, WEF, McKinsey, HRSD, and Perplexity AI."}
          </p>

          {/* Links */}
          <div className={`flex items-center gap-5 mt-3 ${isAr ? "flex-row-reverse" : ""}`}>
            <a
              href="https://linkedin.com/in/samyaloulou"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              linkedin.com/in/samyaloulou
            </a>
            <a
              href="mailto:samy@monitoringforcegulf.com"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              samy@monitoringforcegulf.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
