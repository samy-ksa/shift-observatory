import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import { localizedHref } from "@/lib/i18n/links";
import { buildBreadcrumbLd, buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";
import { decisions, localizedDecision, themeOf, themes, ui, type Decision } from "@/lib/saudization";

const PATH = "/saudization-tracker";
const langs: Lang[] = ["en", "fr", "ar"];
export function generateStaticParams() { return langs.map(lang => ({ lang })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: ui[lang].title, description: ui[lang].description, alternates: buildLanguageAlternates(lang, PATH) };
}
const dateValue = (date: string) => Date.parse(`${date}T00:00:00Z`);
const dateText = (date: string | null, lang: Lang) => date ? new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-ca-gregory" : lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(dateValue(date))) : ui[lang].unknown;
const sourceName = (url: string) => {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "spa.gov.sa") return "Saudi Press Agency (SPA)";
  if (host === "hrsd.gov.sa") return "HRSD";
  return host;
};
const conflicts: Record<string, Record<Lang, string>> = {
  "engineering-30pct-46-professions": { en: "the announcement date: Argaam records 4 January, while the HRSD page shows 21 January and cites a 2025 decision date.", fr: "la date d’annonce : Argaam indique le 4 janvier, la page HRSD le 21 janvier et une décision datée de 2025.", ar: "تاريخ الإعلان: أرجام تذكر 4 يناير، وصفحة الوزارة تعرض 21 يناير وتشير إلى قرار صدر في 2025." },
  "procurement-70pct-12-professions": { en: "the announcement and implementation dates: HRSD gives an earlier decision date and implementation on 31 May.", fr: "les dates d’annonce et d’application : HRSD indique une décision antérieure et un début d’application le 31 mai.", ar: "تاريخ الإعلان والتنفيذ: تشير الوزارة إلى قرار سابق وبدء التطبيق في 31 مايو." },
  "marketing-sales-60pct": { en: "19 January versus 19 April as the effective date; this timeline uses HRSD’s implementation notice of 19 April.", fr: "l’entrée en vigueur au 19 janvier ou au 19 avril ; cette chronologie retient l’avis d’application HRSD du 19 avril.", ar: "تاريخ التطبيق بين 19 يناير و19 أبريل؛ ويعتمد هذا الجدول إشعار الوزارة بالتطبيق في 19 أبريل." },
  "accounting-50pct": { en: "the year in which the progressive path reaches 70%.", fr: "l’année à laquelle le parcours progressif atteint 70 %.", ar: "السنة التي يصل فيها المسار التدريجي إلى 70٪." },
  "sports-centres-gyms-15pct": { en: "the 2025 announcement date recorded by secondary material and HRSD page metadata.", fr: "la date d’annonce de 2025 entre les sources secondaires et les métadonnées de la page HRSD.", ar: "تاريخ إعلان 2025 بين المصادر الثانوية وبيانات صفحة الوزارة." },
  "nitaqat-mutawar-phase2-2026-2028": { en: "a precise effective date in April 2026; HRSD does not give one.", fr: "une date précise d’application en avril 2026 ; HRSD n’en donne aucune.", ar: "تاريخ بدء محدد في أبريل 2026؛ ولم تحدده الوزارة." },
  "admin-support-50-grace-ends": { en: "4 versus 5 October 2026 for the end of the grace period; this dataset uses 4 October.", fr: "le 4 ou le 5 octobre 2026 pour la fin du délai de grâce ; les données retiennent le 4 octobre.", ar: "انتهاء المهلة في 4 أو 5 أكتوبر 2026؛ وتعتمد البيانات 4 أكتوبر." },
  "tourism-28-professions-phase1": { en: "how a separately reported general tourism quota relates to the HRSD phases.", fr: "l’articulation entre un quota touristique général rapporté séparément et les phases HRSD.", ar: "علاقة حصة توطين سياحية عامة وردت منفصلة بمراحل الوزارة." },
  "project-management-70pct": { en: "the announcement date (16 August) and the ministerial decision date (13 August).", fr: "la date d’annonce (16 août) et celle de la décision ministérielle (13 août).", ar: "تاريخ الإعلان (16 أغسطس) وتاريخ القرار الوزاري (13 أغسطس)." },
};
function faq(lang: Lang, future: Decision[]) {
  const official = decisions.filter(d => d.confidence === "confirmed by primary source").length;
  const withDate = decisions.filter(d => d.effective).length;
  const missingAnnouncement = decisions.filter(d => !d.announced).length;
  return {
    en: [
      ["How many decisions are tracked?", `${decisions.length} decisions are tracked; ${withDate} have a stated effective date.`],
      ["How many effective dates are still ahead?", `${future.length} effective dates fall after this page's build date.`],
      ["How many decisions have an official source?", `${official} entries are marked confirmed by a primary source; ${decisions.length - official} are marked confirmed by two media sources.`],
      ["How many announcement dates are missing?", `${missingAnnouncement} entry has no established announcement date in the dataset.`],
    ],
    fr: [
      ["Combien de décisions sont suivies ?", `${decisions.length} décisions sont suivies ; ${withDate} ont une date d’application indiquée.`],
      ["Combien de dates d’application restent à venir ?", `${future.length} dates d’application sont postérieures à la date du build.`],
      ["Combien de décisions ont une source officielle ?", `${official} fiches sont confirmées par une source primaire ; ${decisions.length - official} par deux médias.`],
      ["Combien de dates d’annonce manquent ?", `${missingAnnouncement} fiche n’a pas de date d’annonce établie dans les données.`],
    ],
    ar: [
      ["كم قرارًا يتتبعه هذا الجدول؟", `يتتبع ${decisions.length} قرارًا؛ ولدى ${withDate} منها تاريخ تطبيق محدد.`],
      ["كم موعد تطبيق لا يزال قادمًا؟", `هناك ${future.length} مواعيد تطبيق بعد تاريخ إنشاء الصفحة.`],
      ["كم قرارًا تدعمه جهة رسمية؟", `صُنّف ${official} قرارًا على أنه مؤكد بمصدر أساسي، و${decisions.length - official} بمصدرين إعلاميين.`],
      ["كم تاريخ إعلان غير معروف؟", `لا يوجد تاريخ إعلان مؤكد في البيانات لعدد ${missingAnnouncement} من القرارات.`],
    ],
  }[lang].map(([q, a]) => ({ q, a }));
}
function impact(lang: Lang) {
  return {
    en: ["Employers with at least 3 workers in the listed project management roles face the 70% rate from 14 February 2027.", "Employers with at least 5 workers in the 94 technical engineering roles face the 35% rate from 9 May 2027.", "For Saudi workers, Nitaqat full-count wage thresholds move to SAR 5,000 in 2027 and SAR 6,000 in 2028.", "A Saudi contract must be electronically documented on Qiwa to count in Nitaqat from 15 April 2026."],
    fr: ["Les établissements comptant au moins 3 salariés dans les métiers de gestion de projet visés sont concernés par le taux de 70 % dès le 14 février 2027.", "Ceux comptant au moins 5 salariés dans les 94 métiers techniques de l’ingénierie sont concernés par le taux de 35 % dès le 9 mai 2027.", "Pour les salariés saoudiens, les seuils de salaire pour un comptage entier dans Nitaqat passent à 5 000 SAR en 2027 puis 6 000 SAR en 2028.", "Depuis le 15 avril 2026, un contrat saoudien doit être documenté électroniquement sur Qiwa pour être compté dans Nitaqat."],
    ar: ["تسري نسبة التوطين البالغة 70٪ من 14 فبراير 2027 على المنشآت التي تضم 3 عاملين أو أكثر في مهن إدارة المشاريع المشمولة.", "تسري نسبة 35٪ من 9 مايو 2027 على المنشآت التي تضم 5 عاملين أو أكثر في المهن الفنية الهندسية الـ94.", "يرتفع حد الأجر لاحتساب العامل السعودي كاملًا في نطاقات إلى 5000 ريال في 2027 ثم 6000 ريال في 2028.", "منذ 15 أبريل 2026، يلزم توثيق عقد العامل السعودي إلكترونيًا في قوى لاحتسابه ضمن نطاقات."],
  }[lang];
}
export default async function Page({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = ui[lang];
  const buildDate = new Date().toISOString().slice(0, 10);
  const today = dateValue(buildDate);
  const future = decisions.filter(d => d.effective && dateValue(d.effective) > today).sort((a, b) => a.effective!.localeCompare(b.effective!));
  const chronological = [...decisions].sort((a, b) => (b.announced ?? b.effective ?? "").localeCompare(a.announced ?? a.effective ?? ""));
  const dates = decisions.flatMap(d => [d.announced, d.effective].filter((x): x is string => Boolean(x))).sort();
  const questions = faq(lang, future);
  const url = `${SITE_URL}/${lang}${PATH}`;
  const cite = `SHIFT Observatory, “${t.title}”, ${dateText(buildDate, lang)}, ${url}`;
  const intro = {
    en: `This tracker brings together ${decisions.length} sourced Saudization and Nitaqat decisions. The covered dates run from ${dateText(dates[0], lang)} to ${dateText(dates[dates.length - 1], lang)}. ${future.length ? `The nearest effective dates are ${future.slice(0, 3).map(d => `${localizedDecision(d, lang).title} (${dateText(d.effective, lang)})`).join("; ")}.` : "No effective date remains after this build."}`,
    fr: `Cette chronologie rassemble ${decisions.length} décisions sourcées de saoudisation et de Nitaqat. Les dates couvertes vont du ${dateText(dates[0], lang)} au ${dateText(dates[dates.length - 1], lang)}. ${future.length ? `Les échéances les plus proches sont : ${future.slice(0, 3).map(d => `${localizedDecision(d, lang).title} (${dateText(d.effective, lang)})`).join(" ; ")}.` : "Aucune échéance ne reste à venir après ce build."}`,
    ar: `يجمع هذا المتتبع ${decisions.length} قرارًا موثقًا بشأن التوطين ونطاقات. تمتد التواريخ المشمولة من ${dateText(dates[0], lang)} إلى ${dateText(dates[dates.length - 1], lang)}. ${future.length ? `أقرب مواعيد التطبيق: ${future.slice(0, 3).map(d => `${localizedDecision(d, lang).title} (${dateText(d.effective, lang)})`).join("؛ ")}.` : "لا توجد مواعيد تطبيق بعد تاريخ إنشاء هذه الصفحة."}`,
  }[lang];
  const dataset = { "@context": "https://schema.org", "@type": "Dataset", name: t.title, description: t.description, temporalCoverage: "2026-01-01/2026-12-31", license: "https://creativecommons.org/licenses/by/4.0/", identifier: "https://doi.org/10.5281/zenodo.24244514", sameAs: ["https://doi.org/10.5281/zenodo.24244514", "https://github.com/samy-ksa/saudization-tracker-data"], creator: { "@type": "Organization", name: "SHIFT Observatory" }, distribution: [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE_URL}/data/saudization-decisions.json` }, { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE_URL}/data/saudization-decisions.csv` }] };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const breadcrumb = buildBreadcrumbLd(lang, [{ name: t.title, path: PATH }]);
  return <>
    {[dataset, faqLd, breadcrumb].map((ld, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />)}
    <main className="max-w-5xl mx-auto px-4 py-10 text-text-primary" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t.title}</h1>
      <p className="text-text-secondary leading-relaxed mb-8 max-w-3xl">{intro}</p>
      <section className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-5 mb-10"><h2 className="text-xl font-semibold mb-4">{t.upcoming}</h2><ul className="space-y-3">{future.map(d => <li key={d.id} className="text-sm"><a className="text-cyan-400 hover:underline" href={`#${d.id}`}>{localizedDecision(d, lang).title}</a> · <time dateTime={d.effective!}>{dateText(d.effective, lang)}</time> · {t.days(Math.ceil((dateValue(d.effective!) - today) / 86400000))}</li>)}</ul>{future.length === 0 && <p className="text-text-secondary">{lang === "fr" ? "Aucune échéance à venir dans les données." : lang === "ar" ? "لا توجد مواعيد قادمة في البيانات." : "No upcoming dates in the dataset."}</p>}</section>
      <nav className="mb-10 border border-white/10 rounded-lg p-5" aria-label={t.timeline}><h2 className="text-lg font-semibold mb-3">{t.timeline}</h2><ul className="flex flex-wrap gap-4">{themes.map(theme => <li key={theme}><a className="text-cyan-400 hover:underline" href={`#${theme}`}>{t.theme[theme]}</a></li>)}</ul></nav>
      {themes.map(theme => <section key={theme} id={theme} className="mb-12 scroll-mt-24"><h2 className="text-xl font-semibold mb-5 border-b border-white/10 pb-2">{t.theme[theme]}</h2><ol className="space-y-5">{chronological.filter(d => themeOf(d.id) === theme).map(d => <li id={d.id} key={d.id} className="rounded-lg border border-white/10 p-5 scroll-mt-24"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-lg font-semibold max-w-2xl">{localizedDecision(d, lang).title}</h3><span className="text-xs border border-white/20 rounded-full px-2 py-1">{d.confidence === "confirmed by primary source" ? t.official : t.media}</span></div><dl className="grid sm:grid-cols-2 gap-2 text-sm my-4"><div><dt className="text-text-muted">{t.announced}</dt><dd><time dateTime={d.announced ?? undefined}>{dateText(d.announced, lang)}</time></dd></div><div><dt className="text-text-muted">{t.effective}</dt><dd><time dateTime={d.effective ?? undefined}>{dateText(d.effective, lang)}</time></dd></div><div><dt className="text-text-muted">{t.authority}</dt><dd>{d.authority}</dd></div><div><dt className="text-text-muted">{t.scope}</dt><dd>{d.scope}</dd></div></dl><p className="text-text-secondary text-sm leading-relaxed mb-3">{localizedDecision(d, lang).summary}</p>{conflicts[d.id] && <p className="text-amber-200/80 text-xs mb-3">{t.sourcesDiffer} {conflicts[d.id][lang]}</p>}<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm"><a href={d.source_primary} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{t.primary}: {sourceName(d.source_primary)}</a><a href={d.source_secondary} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{t.secondary}: {sourceName(d.source_secondary)}</a></div></li>)}</ol></section>)}
      <section className="mb-10"><h2 className="text-xl font-semibold mb-4">{t.impact}</h2><h3 className="font-medium mb-2">{t.employer} / {t.employee}</h3><ul className="list-disc list-inside space-y-2 text-sm text-text-secondary">{impact(lang).map(item => <li key={item}>{item}</li>)}</ul><p className="text-xs text-text-muted mt-4">{t.legal}</p></section>
      <section className="mb-10"><h2 className="text-xl font-semibold mb-3">{t.cite}</h2><blockquote className="border-s-2 border-cyan-500 ps-4 text-sm text-text-secondary break-all">{cite}</blockquote><p className="mt-4 text-sm">{t.download}: <a className="text-cyan-400 hover:underline" href="/data/saudization-decisions.json" download>JSON</a> · <a className="text-cyan-400 hover:underline" href="/data/saudization-decisions.csv" download>CSV</a></p><p className="text-xs text-text-muted mt-3"><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline">CC BY 4.0</a> — {t.attribution} <Link href={localizedHref(lang, PATH)} className="text-cyan-400 underline">{t.title}</Link></p></section>
      <section className="mb-10"><h2 className="text-xl font-semibold mb-3">{t.method}</h2><p className="text-sm text-text-secondary leading-relaxed">{{ en: "Official sources are preferred, especially SPA, HRSD and HRDF. Where an official statement is unavailable, two independent media sources are required. The confidence badge records which rule supports each entry. Dates with disagreement are identified on their cards; missing dates remain blank in the data.", fr: "Les sources officielles sont privilégiées, en particulier SPA, HRSD et HRDF. À défaut de communiqué officiel, deux sources médiatiques indépendantes sont requises. Le badge de confiance indique la règle appliquée à chaque fiche. Les divergences de dates figurent sur les fiches ; les dates inconnues restent vides dans les données.", ar: "تُقدَّم المصادر الرسمية، ولا سيما وكالة الأنباء السعودية ووزارة الموارد البشرية والتنمية الاجتماعية وصندوق تنمية الموارد البشرية. عند غياب بيان رسمي، يلزم مصدران إعلاميان مستقلان. توضح شارة الثقة قاعدة توثيق كل قرار، وتُذكر اختلافات التواريخ في البطاقات بينما تبقى التواريخ غير المعروفة فارغة في البيانات." }[lang]}</p><p className="text-xs text-text-muted mt-3">{t.updated}: <time dateTime={buildDate}>{dateText(buildDate, lang)}</time>.</p></section>
      <section><h2 className="text-xl font-semibold mb-4">{t.faq}</h2><div className="space-y-5">{questions.map(({ q, a }) => <div key={q}><h3 className="font-medium mb-1">{q}</h3><p className="text-sm text-text-secondary">{a}</p></div>)}</div></section>
    </main>
  </>;
}
