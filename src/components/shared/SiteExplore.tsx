import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import { localizedHref } from "@/lib/i18n/links";
import { getAllInsights, getAllPulse, getLangContent } from "@/lib/insights";

/**
 * Site-wide crawlable navigation, rendered by the [lang] layout under every page.
 *
 * Why (GSC 26/09): most pages had no footer at all, the /job hub was linked from
 * nowhere and every /insights + /pulse article was an orphan — Google reported
 * them "unknown" months after publication. Plain server-rendered <a> tags only.
 */
const LABELS: Record<Lang, { explore: string; analyses: string; hubs: [string, string][] }> = {
  en: {
    explore: "Explore",
    analyses: "Analyses & reports",
    hubs: [
      ["/job", "All 237 occupations"],
      ["/career", "Career paths"],
      ["/relocate", "Relocation calculator"],
      ["/prepare", "Prepare your move"],
    ],
  },
  fr: {
    explore: "Explorer",
    analyses: "Analyses et rapports",
    hubs: [
      ["/job", "Les 237 métiers"],
      ["/career", "Parcours de carrière"],
      ["/relocate", "Calculateur d'expatriation"],
      ["/prepare", "Préparer son départ"],
    ],
  },
  ar: {
    explore: "استكشف",
    analyses: "تحليلات وتقارير",
    hubs: [
      ["/job", "جميع المهن الـ 237"],
      ["/career", "المسارات المهنية"],
      ["/relocate", "حاسبة الانتقال"],
      ["/prepare", "الاستعداد للانتقال"],
    ],
  },
};

export default function SiteExplore({ lang }: { lang: Lang }) {
  const l = LABELS[lang];
  const articles = [
    ...getAllInsights().map((a) => ({ href: `/insights/${a.slug}`, date: a.date, rec: a })),
    ...getAllPulse().map((a) => ({ href: `/pulse/${a.date}`, date: a.date, rec: a })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);

  return (
    <nav
      aria-label={l.explore}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="border-t border-white/5 px-4 py-10"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="text-text-primary font-semibold mb-3">{l.explore}</p>
          <ul className="space-y-2">
            {l.hubs.map(([path, label]) => (
              <li key={path}>
                <Link
                  href={localizedHref(lang, path)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {articles.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-text-primary font-semibold mb-3">{l.analyses}</p>
            <ul className="space-y-2">
              {articles.map(({ href, rec }) => {
                const c = getLangContent(rec, lang);
                if (!c) return null;
                return (
                  <li key={href}>
                    <Link
                      href={localizedHref(lang, href)}
                      className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {c.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
