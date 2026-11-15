import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates } from "@/lib/i18n/seo";
import { getSector } from "@/lib/occupations";
import { SECTORS, sectorName, occupationsInSector } from "@/lib/rankings";
import RankingPage from "@/components/occupations/RankingPage";

const LANGS: Lang[] = ["en", "fr", "ar"];
export function generateStaticParams() { return LANGS.flatMap((lang) => SECTORS.map((s) => ({ lang, id: s.id }))); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params;
  const sector = getSector(id);
  if (!sector) return {};
  const title = sectorName(sector, lang);
  const count = occupationsInSector(id).length;
  const description = {
    en: `${title}: ${count} detailed occupations, ${sector.total.toLocaleString("en-US")} sector workers, ${sector.pct_saudi}% Saudi and AI risk ${sector.ai_risk_score}/100.`,
    fr: `${title} : ${count} métiers détaillés, ${sector.total.toLocaleString("en-US")} travailleurs, ${sector.pct_saudi} % de Saoudiens et risque IA ${sector.ai_risk_score}/100.`,
    ar: `${title}: ${count} مهنة مفصلة، ${sector.total.toLocaleString("en-US")} عامل في القطاع، ${sector.pct_saudi}٪ سعوديون، ومخاطر الذكاء الاصطناعي ${sector.ai_risk_score}/100.`,
  }[lang];
  return { title, description, alternates: buildLanguageAlternates(lang, `/sector/${id}`), ...(count < 5 ? { robots: { index: false, follow: true } } : {}) };
}

export default async function Page({ params }: { params: Promise<{ lang: Lang; id: string }> }) {
  const { lang, id } = await params;
  const sector = getSector(id);
  if (!sector) notFound();
  return <RankingPage lang={lang} sector={sector} path={`/sector/${id}`} title={sectorName(sector, lang)} rows={occupationsInSector(id).sort((a, b) => b.composite - a.composite)} />;
}
