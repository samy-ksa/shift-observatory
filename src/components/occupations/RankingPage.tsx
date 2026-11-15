import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import { buildBreadcrumbLd, SITE_URL } from "@/lib/i18n/seo";
import { toSlug, type Occupation, type Sector } from "@/lib/occupations";
import { TEXT, RANKING_SLUGS, occupationName, sectorName, statusLabel, methodology, stats, topSectors, relatedSectors, type RankingSlug } from "@/lib/rankings";

type Props = { lang: Lang; title: string; path: string; rows: Occupation[]; sector?: Sector; ranking?: RankingSlug };
const num = (n: number) => n.toLocaleString("en-US");

function intro({ lang, rows, sector, ranking }: Props): string {
  const s = stats(rows);
  const n = num(s.count), avg = num(s.average), med = num(s.median);
  if (sector) return {
    en: `${sectorName(sector, lang)} has ${num(sector.total)} workers in the sector dataset, ${sector.pct_saudi}% of them Saudi, and a sector AI risk score of ${sector.ai_risk_score}/100. The occupation dataset lists ${n} roles here${s.count ? `, averaging ${avg}/100 in AI risk with a median monthly salary of ${med} SAR; ${s.substitution} are classified as substitution` : "; no occupation-level salary or risk average can be calculated"}.`,
    fr: `Le secteur ${sectorName(sector, lang)} compte ${num(sector.total)} travailleurs dans les données sectorielles, dont ${sector.pct_saudi} % de Saoudiens, avec un risque IA sectoriel de ${sector.ai_risk_score}/100. Le jeu détaillé recense ${n} métiers${s.count ? `, avec un risque moyen de ${avg}/100, un salaire mensuel médian de ${med} SAR et ${s.substitution} métiers classés en substitution` : " ; aucune moyenne par métier ni médiane salariale ne peut être calculée"}.`,
    ar: `يضم قطاع ${sectorName(sector, lang)} ${num(sector.total)} عاملاً وفق بيانات القطاعات، تبلغ نسبة السعوديين منهم ${sector.pct_saudi}٪، ودرجة مخاطر الذكاء الاصطناعي للقطاع ${sector.ai_risk_score}/100. تتضمن بيانات المهن التفصيلية ${n} مهنة${s.count ? `، بمتوسط مخاطر ${avg}/100 وراتب شهري وسيط ${med} ريال، منها ${s.substitution} مهنة مصنفة ضمن الاستبدال` : "؛ لذلك لا يمكن حساب متوسط المخاطر أو الراتب الوسيط للمهن"}.`,
  }[lang];
  const kind = ranking!;
  const facts: Record<RankingSlug, Record<Lang, string>> = {
    "jobs-most-at-risk-from-ai-saudi-arabia": { en: `Scores span ${s.min}–${s.max}/100; ${s.substitution} roles are classified as substitution.`, fr: `Les scores vont de ${s.min} à ${s.max}/100 ; ${s.substitution} métiers sont classés en substitution.`, ar: `تتراوح الدرجات بين ${s.min} و${s.max} من 100؛ وتصنّف ${s.substitution} مهنة ضمن الاستبدال.` },
    "jobs-safest-from-ai-saudi-arabia": { en: `The highest score still on this list is ${s.max}/100; ${s.count - s.substitution} roles are classified as augmentation.`, fr: `Le score maximal de cette liste est ${s.max}/100 ; ${s.count - s.substitution} métiers sont classés en renforcement.`, ar: `أعلى درجة في هذه القائمة هي ${s.max}/100؛ وتصنّف ${s.count - s.substitution} مهنة ضمن التعزيز.` },
    "jobs-reserved-for-saudis": { en: `All ${s.reserved} entries are reserved for Saudi nationals only; their risk scores span ${s.min}–${s.max}/100. Sector quotas are a different status and are excluded.`, fr: `Les ${s.reserved} métiers sont tous réservés aux ressortissants saoudiens ; leurs scores vont de ${s.min} à ${s.max}/100. Les quotas sectoriels ne figurent pas dans cette liste.`, ar: `جميع المهن الـ${s.reserved} محصورة على السعوديين فقط، وتتراوح درجات المخاطر بين ${s.min} و${s.max} من 100. لا تشمل القائمة المهن الخاضعة لحصص القطاعات.` },
    "highest-paid-jobs-saudi-arabia-ai-risk": { en: `The highest monthly median salary is ${num(Math.max(...rows.map((o) => o.salary_median_sar)))} SAR; ${s.reserved} listed roles are Saudi-only.`, fr: `Le salaire mensuel médian le plus élevé est de ${num(Math.max(...rows.map((o) => o.salary_median_sar)))} SAR ; ${s.reserved} métiers listés sont réservés aux Saoudiens.`, ar: `أعلى راتب شهري وسيط هو ${num(Math.max(...rows.map((o) => o.salary_median_sar)))} ريال؛ ${s.reserved} من المهن المدرجة محصورة على السعوديين.` },
  };
  const base = {
    en: `This list contains ${n} occupations from SHIFT Observatory’s Saudi dataset. Their average AI risk score is ${avg}/100 and their median of recorded monthly median salaries is ${med} SAR.`,
    fr: `Cette liste comprend ${n} métiers du jeu de données saoudien de SHIFT Observatory. Leur score de risque IA moyen est de ${avg}/100 et la médiane de leurs salaires mensuels médians enregistrés est de ${med} SAR.`,
    ar: `تضم هذه القائمة ${n} مهنة من بيانات مرصد شيفت للسعودية. يبلغ متوسط درجة مخاطر الذكاء الاصطناعي ${avg}/100، ووسيط الرواتب الشهرية الوسيطة المسجلة ${med} ريال.`,
  }[lang];
  return `${base} ${facts[kind][lang]}`;
}

function faq(lang: Lang, rows: Occupation[], sector?: Sector) {
  const s = stats(rows);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const data = {
    en: [
      [`How many occupations are listed?`, `${s.count} occupations are listed${sector ? ` for ${sectorName(sector, lang)}` : ""}.`],
      [`What is their average AI risk score?`, `${s.count ? `The ${s.count} listed occupations average ${s.average}/100, ranging from ${s.min} to ${s.max}/100.` : `No occupation-level score is available for this sector; the sector-level score is ${sector?.ai_risk_score}/100.`}`],
      [`What is the median monthly salary?`, `${s.count ? `The median of ${s.count} recorded occupation median salaries is ${num(s.median)} SAR per month.` : `No occupation-level salary is recorded for this sector.`}`],
      [`How many roles are reserved for Saudis?`, `${s.reserved} of ${s.count} listed occupations are reserved for Saudi nationals only${first && last ? `; the list starts with ${occupationName(first, lang)} and ends with ${occupationName(last, lang)}` : ""}.`],
    ],
    fr: [
      [`Combien de métiers sont listés ?`, `${s.count} métiers sont listés${sector ? ` pour ${sectorName(sector, lang)}` : ""}.`],
      [`Quel est leur risque IA moyen ?`, s.count ? `La moyenne des ${s.count} métiers est de ${s.average}/100, avec des scores de ${s.min} à ${s.max}/100.` : `Aucun score par métier n’est disponible ; le score sectoriel est de ${sector?.ai_risk_score}/100.`],
      [`Quel est le salaire mensuel médian ?`, s.count ? `La médiane des salaires médians enregistrés pour ${s.count} métiers est de ${num(s.median)} SAR par mois.` : `Aucun salaire par métier n’est enregistré pour ce secteur.`],
      [`Combien de métiers sont réservés aux Saoudiens ?`, `${s.reserved} des ${s.count} métiers listés sont réservés aux ressortissants saoudiens${first && last ? ` ; la liste commence par ${occupationName(first, lang)} et se termine par ${occupationName(last, lang)}` : ""}.`],
    ],
    ar: [
      [`كم مهنة مدرجة؟`, `تضم القائمة ${s.count} مهنة${sector ? ` في قطاع ${sectorName(sector, lang)}` : ""}.`],
      [`ما متوسط مخاطر الذكاء الاصطناعي؟`, s.count ? `متوسط درجات المهن الـ${s.count} هو ${s.average}/100، وتتراوح الدرجات بين ${s.min} و${s.max} من 100.` : `لا توجد درجات مفصلة للمهن في هذا القطاع؛ ودرجة القطاع هي ${sector?.ai_risk_score}/100.`],
      [`ما الراتب الشهري الوسيط؟`, s.count ? `وسيط الرواتب الوسيطة المسجلة للمهن الـ${s.count} هو ${num(s.median)} ريال شهرياً.` : `لا تتوفر رواتب مفصلة للمهن في هذا القطاع.`],
      [`كم مهنة محصورة على السعوديين؟`, `تحمل ${s.reserved} من أصل ${s.count} مهنة مدرجة محصورة على السعوديين فقط${first && last ? `؛ تبدأ القائمة بمهنة ${occupationName(first, lang)} وتنتهي بمهنة ${occupationName(last, lang)}` : ""}.`],
    ],
  }[lang];
  return data.map(([q, a]) => ({ q, a }));
}

export default function RankingPage(props: Props) {
  const { lang, title, path, rows, sector, ranking } = props;
  const t = TEXT[lang];
  const questions = faq(lang, rows, sector);
  const jobHubLabel = { en: "Browse all occupations", fr: "Parcourir tous les métiers", ar: "تصفح جميع المهن" }[lang];
  const breadcrumb = buildBreadcrumbLd(lang, [{ name: jobHubLabel, path: "/job" }, { name: title, path }]);
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: title, numberOfItems: rows.length, itemListElement: rows.map((o, i) => ({ "@type": "ListItem", position: i + 1, name: occupationName(o, lang), url: `${SITE_URL}/${lang}/job/${toSlug(o.name_en)}` })) };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const otherRankings = RANKING_SLUGS.filter((slug) => slug !== ranking).slice(0, 2);
  const sectors = sector ? relatedSectors(sector.id) : topSectors(rows);
  return <>
    {[breadcrumb, itemList, faqLd].map((ld, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />)}
    <main className="max-w-5xl mx-auto px-4 py-10 text-text-primary" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{title}</h1>
      <p className="text-text-secondary leading-relaxed mb-8 max-w-3xl">{intro(props)}</p>
      {sector && <p className="text-sm text-text-secondary mb-5">{t.sectors}: {num(sector.total)} · {sector.pct_saudi}% · {sector.ai_risk_score}/100</p>}
      <div className="overflow-x-auto rounded-lg border border-white/10"><table className="w-full text-sm text-start border-collapse"><thead className="bg-white/5"><tr>{[t.rank, t.occupation, t.risk, t.category, t.salary, t.status].map((h) => <th key={h} scope="col" className="p-3 text-start font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((o, i) => <tr key={toSlug(o.name_en)} className="border-t border-white/10"><td className="p-3 tabular-nums">{i + 1}</td><td className="p-3"><Link className="text-cyan-400 hover:underline" href={`/${lang}/job/${toSlug(o.name_en)}`}>{occupationName(o, lang)}</Link></td><td className="p-3 tabular-nums">{o.composite}/100</td><td className="p-3">{t[o.category]}</td><td className="p-3 tabular-nums">{num(o.salary_median_sar)}</td><td className="p-3">{statusLabel(o.nitaqat_status, lang)}</td></tr>)}{rows.length === 0 && <tr><td colSpan={6} className="p-4 text-text-secondary">{t.none}</td></tr>}</tbody></table></div>
      <section className="mt-10"><h2 className="text-xl font-semibold mb-4">{t.faq}</h2><div className="space-y-5">{questions.map(({ q, a }) => <div key={q}><h3 className="font-medium mb-1">{q}</h3><p className="text-sm text-text-secondary">{a}</p></div>)}</div></section>
      <section className="mt-10"><h2 className="text-xl font-semibold mb-3">{t.method}</h2><p className="text-sm text-text-secondary leading-relaxed">{methodology(lang, rows)}</p>{ranking === "jobs-reserved-for-saudis" && <p className="text-sm text-text-secondary mt-3">{t.reserved} · {t.quota} · {t.open}.</p>}</section>
      <nav className="mt-10 pt-6 border-t border-white/10" aria-label={t.related}><h2 className="text-xl font-semibold mb-3">{t.related}</h2><div className="flex flex-wrap gap-x-6 gap-y-2">{otherRankings.map((slug) => <Link key={slug} className="text-cyan-400 hover:underline" href={`/${lang}/rankings/${slug}`}>{t.headings[slug]}</Link>)}{sectors.map((s) => <Link key={s.id} className="text-cyan-400 hover:underline" href={`/${lang}/sector/${s.id}`}>{sectorName(s, lang)}</Link>)}</div></nav>
    </main>
  </>;
}
