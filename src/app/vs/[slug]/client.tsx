"use client";

import { useLang } from "@/lib/i18n/context";
import LangToggle from "@/components/ui/LangToggle";
import type { ComparisonData } from "@/data/comparisons";

function StatusBadge({ status, detail }: { status: "yes" | "partial" | "no"; detail: string }) {
  const colors = { yes: "text-green-400", partial: "text-amber-400", no: "text-red-400" };
  const icons = { yes: "\u2713", partial: "~", no: "\u2717" };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-lg font-bold ${colors[status]}`}>{icons[status]}</span>
      <span className="text-[10px] text-gray-500 leading-tight">{detail}</span>
    </div>
  );
}

export default function VSClient({ data }: { data: ComparisonData }) {
  const { lang } = useLang();
  const isFr = lang === "fr";

  return (
    <main className="min-h-screen bg-bg-primary text-white">
      <LangToggle />
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-cyan-400 transition-colors">
            {isFr ? "Tableau de bord" : "Dashboard"}
          </a>
          <span>/</span>
          <span className="text-gray-300">SHIFT vs {data.competitor}</span>
        </nav>

        {/* Hero */}
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
          SHIFT Observatory <span className="text-gray-500">vs</span>{" "}
          <span className="text-cyan-400">{data.competitor}</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-2xl">
          {isFr ? data.competitor_description_fr : data.competitor_description_en}
        </p>

        {/* Feature comparison table */}
        <div className="border border-gray-800 rounded-lg overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-gray-900/80 px-4 py-3 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
            <span>{isFr ? "Fonctionnalite" : "Feature"}</span>
            <span className="text-center">SHIFT</span>
            <span className="text-center">{data.competitor}</span>
          </div>

          {data.features.map((feature, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 px-4 py-3 text-sm border-b border-gray-800/50 ${
                i % 2 === 0 ? "bg-gray-900/20" : ""
              }`}
            >
              <div className="text-gray-300 pr-2">
                {isFr ? feature.feature_fr : feature.feature_en}
              </div>
              <div className="text-center">
                <StatusBadge
                  status={feature.shift}
                  detail={isFr ? feature.shift_detail_fr : feature.shift_detail_en}
                />
              </div>
              <div className="text-center">
                <StatusBadge
                  status={feature.competitor}
                  detail={isFr ? feature.competitor_detail_fr : feature.competitor_detail_en}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="border border-cyan-500/30 rounded-lg p-6 mb-8 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <h2 className="text-lg font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
            Verdict
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {isFr ? data.verdict_fr : data.verdict_en}
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
            {isFr ? "Questions frequentes" : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-4">
            {(isFr ? data.faq_fr : data.faq_en).map((faq, i) => (
              <div key={i} className="border border-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-2">{faq.question}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center border border-gray-800 rounded-lg p-8 bg-gray-900/30">
          <h2 className="text-xl font-bold text-white mb-3">
            {isFr ? "Essayez SHIFT Observatory gratuitement" : "Try SHIFT Observatory for Free"}
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            {isFr
              ? "237 metiers analyses, calculateur de relocation, checklist pre-depart — 100% gratuit."
              : "237 occupations scored, relocation calculator, pre-departure checklist — 100% free."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
              {isFr ? "Ouvrir le tableau de bord" : "Open Dashboard"} →
            </a>
            <a href="/relocate" className="border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 px-6 py-3 rounded-lg transition-colors">
              {isFr ? "Calculateur de relocation" : "Relocation Calculator"}
            </a>
            <a href="/prepare" className="border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 px-6 py-3 rounded-lg transition-colors">
              {isFr ? "Checklist depart" : "Departure Checklist"}
            </a>
          </div>
        </div>

        {/* Internal links */}
        <div className="mt-8 text-xs text-gray-500">
          <p className="mb-2">{isFr ? "Explorez egalement :" : "Also explore:"}</p>
          <div className="flex flex-wrap gap-3">
            <a href="/job/data-entry-keyers" className="text-cyan-400 hover:underline">Data Entry Keyers</a>
            <a href="/job/registered-nurses" className="text-cyan-400 hover:underline">Registered Nurses</a>
            <a href="/job/software-developers" className="text-cyan-400 hover:underline">Software Developers</a>
            <a href="/career" className="text-cyan-400 hover:underline">{isFr ? "Recommandation carriere" : "Career Recommender"}</a>
          </div>
        </div>
      </div>
    </main>
  );
}
