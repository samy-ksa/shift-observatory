import type { Lang } from "@/lib/i18n/context";

/**
 * [lang] root page — Phase 2 smoke test.
 *
 * This page exists solely to validate that /en, /fr, /ar resolve as 3 distinct
 * static routes and that params.lang reaches Server Components correctly.
 *
 * Phase 3 will replace this with the real home page content, migrated from
 * src/app/page.tsx.
 */

export default async function LangHomePhase2({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>i18n migration — Phase 2 scaffold</h1>
      <p>
        Current lang param: <strong>{lang}</strong>
      </p>
      <p>
        This page proves that <code>/{lang}</code> routes resolve and params drill
        correctly. It will be replaced by the real home in Phase 3.
      </p>
    </main>
  );
}
