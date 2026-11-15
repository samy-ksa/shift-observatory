import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates } from "@/lib/i18n/seo";
import { RANKING_SLUGS, TEXT, rankingOccupations, stats, type RankingSlug } from "@/lib/rankings";
import RankingPage from "@/components/occupations/RankingPage";

const LANGS: Lang[] = ["en", "fr", "ar"];
function validSlug(slug: string): slug is RankingSlug { return RANKING_SLUGS.includes(slug as RankingSlug); }
export function generateStaticParams() { return LANGS.flatMap((lang) => RANKING_SLUGS.map((slug) => ({ lang, slug }))); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!validSlug(slug)) return {};
  const title = TEXT[lang].headings[slug];
  const s = stats(rankingOccupations(slug));
  const description = {
    en: `Compare ${s.count} Saudi occupations by AI risk, monthly median salary and Nitaqat status. Average risk: ${s.average}/100.`,
    fr: `Comparez ${s.count} métiers saoudiens selon le risque IA, le salaire mensuel médian et le statut Nitaqat. Risque moyen : ${s.average}/100.`,
    ar: `قارن بين ${s.count} مهنة في السعودية حسب مخاطر الذكاء الاصطناعي والراتب الشهري الوسيط وحالة نطاقات. متوسط المخاطر: ${s.average}/100.`,
  }[lang];
  return { title, description, alternates: buildLanguageAlternates(lang, `/rankings/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = await params;
  if (!validSlug(slug)) notFound();
  return <RankingPage lang={lang} ranking={slug} path={`/rankings/${slug}`} title={TEXT[lang].headings[slug]} rows={rankingOccupations(slug)} />;
}
