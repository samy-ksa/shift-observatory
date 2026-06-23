/**
 * Server-rendered article view for insights + pulse pages.
 *
 * Renders the engine's structured content: an AI-citable lede (top, crawlable),
 * H2 question sections, FAQ, key takeaway, sources, and a named author byline
 * (E-E-A-T). RTL-aware for Arabic. Minimal dependency-free prose renderer for the
 * markdown stored in section bodies (paragraphs, bullet lists, **bold**).
 */
import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n/context";
import type { ArticleLangContent, ArticleRecord } from "@/lib/insights";

const UI: Record<Lang, { faq: string; sources: string; by: string; takeaway: string; published: string }> = {
  en: { faq: "Frequently asked questions", sources: "Sources", by: "By", takeaway: "Key takeaway", published: "Published" },
  fr: { faq: "Questions fréquentes", sources: "Sources", by: "Par", takeaway: "À retenir", published: "Publié le" },
  ar: { faq: "الأسئلة الشائعة", sources: "المصادر", by: "بقلم", takeaway: "الخلاصة", published: "نُشر في" },
};

// --- minimal inline markdown (**bold** + [text](url)) → React nodes.
// Internal links (paths starting with "/") are prefixed with the current locale.
function inline(text: string, keyPrefix: string, lang: Lang) {
  // split on links first, then handle bold within the remaining text
  const linkParts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  const out: ReactNode[] = [];
  linkParts.forEach((seg, li) => {
    const m = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const label = m[1];
      let href = m[2];
      if (href.startsWith("/") && !href.startsWith(`/${lang}/`)) href = `/${lang}${href}`;
      const external = /^https?:\/\//.test(m[2]);
      out.push(
        <a
          key={`${keyPrefix}-a${li}`}
          href={href}
          className="underline hover:text-text-primary"
          {...(external ? { rel: "noopener", target: "_blank" } : {})}
        >
          {label}
        </a>,
      );
      return;
    }
    seg.split(/(\*\*[^*]+\*\*)/g).forEach((p, bi) => {
      if (!p) return;
      if (p.startsWith("**") && p.endsWith("**")) {
        out.push(<strong key={`${keyPrefix}-b${li}-${bi}`}>{p.slice(2, -2)}</strong>);
      } else {
        out.push(<span key={`${keyPrefix}-s${li}-${bi}`}>{p}</span>);
      }
    });
  });
  return out;
}

// --- block-level: paragraphs + bullet lists
function Prose({ body, idPrefix, lang }: { body: string; idPrefix: string; lang: Lang }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^[-*]\s+/.test(l.trim()));
        if (isList) {
          return (
            <ul key={`${idPrefix}-ul${bi}`} className="list-disc ms-6 my-3 space-y-1">
              {lines.map((l, li) => (
                <li key={`${idPrefix}-li${bi}-${li}`}>{inline(l.trim().replace(/^[-*]\s+/, ""), `${idPrefix}-${bi}-${li}`, lang)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={`${idPrefix}-p${bi}`} className="my-3 leading-relaxed">
            {inline(block, `${idPrefix}-${bi}`, lang)}
          </p>
        );
      })}
    </>
  );
}

export default function ArticleView({
  rec,
  content,
  lang,
}: {
  rec: ArticleRecord;
  content: ArticleLangContent;
  lang: Lang;
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = UI[lang];
  const dateStr = new Date(rec.published_at || rec.date).toLocaleDateString(
    lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article
      className="max-w-3xl mx-auto px-4 py-10 text-text-primary"
      dir={dir}
      lang={lang}
    >
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{content.title}</h1>
        <p className="mt-3 text-sm text-text-secondary">
          {t.by}{" "}
          {rec.author_url ? (
            <a href={rec.author_url} className="underline hover:text-text-primary">{rec.author}</a>
          ) : (
            <span>{rec.author}</span>
          )}
          {rec.author_title ? <span> — {rec.author_title}</span> : null}
          {" · "}
          {t.published} {dateStr}
        </p>
      </header>

      {rec.hero_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rec.hero_image} alt={content.title} className="w-full rounded-lg mb-6" />
      ) : null}

      {/* AI-citable lede — first crawlable answer, self-contained */}
      <section aria-label="Summary" className="mb-8">
        <p className="text-base md:text-lg leading-relaxed text-text-secondary">{content.lede}</p>
      </section>

      {content.h2_sections.map((sec, i) => (
        <section key={`sec-${i}`} className="mb-6">
          <h2 className="text-2xl font-semibold mt-8 mb-2">{sec.q}</h2>
          <Prose body={sec.body} idPrefix={`sec${i}`} lang={lang} />
        </section>
      ))}

      {content.key_takeaway ? (
        <aside className="my-8 border-s-4 border-accent-primary ps-4 py-2 bg-bg-secondary/40 rounded-e">
          <p className="font-semibold mb-1">{t.takeaway}</p>
          <p className="leading-relaxed">{content.key_takeaway}</p>
        </aside>
      ) : null}

      {content.faq?.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">{t.faq}</h2>
          <dl className="space-y-4">
            {content.faq.map((qa, i) => (
              <div key={`faq-${i}`}>
                <dt className="font-semibold">{qa.q}</dt>
                <dd className="mt-1 text-text-secondary leading-relaxed">{qa.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {content.sources?.length ? (
        <section className="mt-10 text-sm text-text-secondary">
          <h2 className="text-base font-semibold mb-2">{t.sources}</h2>
          <ul className="list-disc ms-6 space-y-1">
            {content.sources.map((s, i) => (
              <li key={`src-${i}`}>
                {s.url && s.url.startsWith("http") ? (
                  <a href={s.url} className="underline hover:text-text-primary" rel="nofollow noopener" target="_blank">{s.label}</a>
                ) : (
                  <span>{s.label}{s.url ? ` — ${s.url}` : ""}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
