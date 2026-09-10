# Plan de migration i18n — SHIFT Observatory

**Statut :** PROPOSITION v2. Aucun code n'a été modifié.
**Auteur :** Claude (session 2026-04-30)
**Décideur :** Samy
**Sujet :** passer d'un système 1-URL/3-langues côté client à un router localisé `/[lang]/...` SSG.

**Changelog v2 (vs v1) :**
- Page count corrigé : **328**, pas 329 ni 339 (audit re-vérifié, justification §0).
- Décision slugs argumentée explicitement (§A.2).
- `<html lang>`/`<html dir>` posés en Server Component, pas plus de `HtmlLangSync` (§B.2 avec snippet).
- **Redirect racine en 301**, pas 302. Rôle du cookie redéfini (§B.4 + §C).
- **Section JSON-LD complète ajoutée** : FAQPage × 3 langs, BreadcrumbList, OG, OG images. Inclus dans la phase 3 — migration en un seul temps comme exigé (§F.2 + §G.3).
- **Estimation revue à 24-32h** (§G).
- **Section I (QA matrix pre-deploy)** ajoutée.
- **Section J (KPIs post-deploy J+0/+7/+14/+30)** ajoutée.
- **Section K (Plan B si migration échoue à J+30)** ajoutée.
- **Section H** réécrite en 6 questions verbatim numérotées.

---

## 0. État des lieux factuel (sondé dans le repo aujourd'hui)

Tout le reste du document s'appuie sur ces chiffres. Si l'un d'eux est faux, le plan est faux.

| Élément | Valeur mesurée | Source |
|---|---|---|
| **Routes statiques (1 URL chacune)** | **8** | `find src/app -name "page.tsx" \| grep -v "\["` → /, /career, /cookies, /prepare, /privacy, /profile, /relocate, /terms |
| `vs/[slug]` | **8 slugs** | `grep -E "^\s*slug:\s*['\"]" src/data/comparisons.ts` (numbeo, glassdoor, linkedin-salary, payscale, mercer, bayt, jadarat, lightcast). Note : v1 du plan disait 9, j'ai recompté en excluant la déclaration de type ligne 13. |
| `job/[slug]` | **237 slugs** | `master.json` : 100 high_risk + 137 low_risk |
| `relocate/[pair]` | **75 paires** | 15 origin × 5 saudi cities dans [src/data/relocation-data.ts](src/data/relocation-data.ts) |
| **TOTAL pages indexables** | **328** | (sitemap prod en compte 326 — manque /prepare et 1 vs récent. Bug séparé à fixer §C.4) |
| **Pages × 3 langues** | **984** | objectif post-migration |
| **Réponse à ta question Q6 (339 vs 329)** | **Ni l'un ni l'autre : c'est 328.** | "339" du memory est approximatif. "329" v1 du plan comptait 9 vs slugs au lieu de 8. Confirmé par `find src/app -name "page.tsx"` = 11 fichiers (8 statiques + 3 dynamiques). |
| Fichiers utilisant `useLang`/`useT` | 39 | `grep -rE "useLang\|useT" src` |
| Composants `'use client'` | 53 | `grep -rE "^'use client'" src` |
| Conditionnels `lang === "..."` | **267** | `grep -rE "lang\s*===" src/app src/components` |
| `<a href="/...">` ou `<Link href="/...">` durs | 34 | dont ~25 à modifier (PDFs `/reports/*` exclus) |
| `router.push("/...")` | 4 | LangToggle, CareerRecommender, MobileJobSearch, JobsDropdown |
| URLs hardcodées dans les dictionnaires | **0** | `grep -cE 'http\|/[a-z]+/' src/lib/i18n/*.ts` |
| **FAQPage `Question` entries actuelles** | **2 746** | 9×237 (job) + 8×75 (relocate) + 1×8 (vs) + 5 (prepare) — détails §F.2 |
| **Routes `/api/og`** | 3 | `/api/og`, `/api/og/career`, `/api/og/profile` — aucune ne supporte `?lang=` |
| **Schémas JSON-LD avec contenu textuel à localiser** | 4 templates (job, relocate/pair, vs, prepare) + layout | tous mélangent EN+FR sans AR. AR à écrire from scratch. |

**Comportement actuel observé en prod (curl) :**
- HTML servi en EN par défaut, langue commutée client-side après hydration.
- `<link rel="alternate" hrefLang>` injectés depuis [src/app/layout.tsx](src/app/layout.tsx) lignes 219-222, **pointent toujours vers la home, sur toutes les pages**.
- `<link rel="canonical">` correct par page (par `metadata.alternates.canonical`).
- Sitemap [src/app/api/sitemap/route.ts](src/app/api/sitemap/route.ts) déclare déjà 4 hreflang par URL, tous identiques → bruit pour Google.
- Middleware [src/middleware.ts](src/middleware.ts) : pose un cookie `shift_lang` selon `Accept-Language`, **ne réécrit jamais l'URL**.

**Ce qu'aucun fix hreflang ne peut résoudre dans cette architecture :** Googlebot indexe l'URL, pas le cookie. Avec 3 langues à la même URL, une seule version est indexable. C'est précisément le point qui ferme la mission précédente.

---

## A. Architecture cible

### A.1 Structure de dossiers

```
src/app/
├── [lang]/
│   ├── layout.tsx              ← Server Component : lit params.lang, set <html lang dir>, rend hreflang corrects, JSON-LD localisé
│   ├── page.tsx                ← /[lang]
│   ├── career/page.tsx         ← /[lang]/career
│   ├── cookies/page.tsx
│   ├── prepare/page.tsx        (+ client.tsx)
│   ├── privacy/page.tsx
│   ├── profile/page.tsx
│   ├── terms/page.tsx
│   ├── relocate/
│   │   ├── page.tsx            ← /[lang]/relocate
│   │   └── [pair]/page.tsx     ← /[lang]/relocate/<pair>
│   ├── vs/[slug]/page.tsx      ← /[lang]/vs/<slug>
│   └── job/[slug]/page.tsx     ← /[lang]/job/<slug>
├── api/                        ← inchangé (pas de préfixe lang)
├── layout.tsx                  ← root minimal (juste <html><body>{children}, fonts)
└── (root pages disparaissent — déplacées sous [lang])
```

**Justifications :**
- Un seul `[lang]` dynamique englobe toute l'app. Pas de rewrite middleware compliqué.
- Le root `layout.tsx` reste mais devient minimal (fonts, providers globaux non-i18n). Tout ce qui dépend de la langue (hreflang, dir, lang attr, JSON-LD) descend dans `app/[lang]/layout.tsx`.
- Les `client.tsx` existants (déjà 7) restent comme co-location de leur `page.tsx`.

### A.2 Comment `generateStaticParams` gère 3 × 328 = 984 pages

Trois patterns selon le type de route :

1. **Routes statiques** (8 × 3 = 24 pages) — un `generateStaticParams` au niveau de `app/[lang]/layout.tsx` :
   ```ts
   export function generateStaticParams() {
     return [{ lang: "en" }, { lang: "fr" }, { lang: "ar" }];
   }
   ```

2. **Routes dynamiques** — produit cartésien dans le `generateStaticParams` de la page :
   ```ts
   export function generateStaticParams() {
     const langs = ["en", "fr", "ar"] as const;
     const slugs = getAllOccupations().map((o) => toSlug(o.name_en));
     return langs.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
   }
   ```
   - `job` : 3 × 237 = 711 pages
   - `vs` : 3 × 8 = 24 pages
   - `relocate/[pair]` : 3 × 75 = 225 pages

3. **Décision slugs : EN dans les 3 langues. CONFIRMÉ.** (Réponse à ta question Q2.)

   **Argumentation :**
   - **Stabilité des liens externes.** Les URLs `/job/data-scientist`, `/relocate/cairo-to-riyadh` sont déjà indexées et linkées (forums, LinkedIn, etc.). Les traduire (`/ar/wadhifa/`...) casserait ces liens, perdrait l'autorité accumulée, et imposerait une cascade de redirects dont Google met du temps à converger.
   - **Référence sectorielle.** Stripe, LinkedIn, GitHub, Notion utilisent des slugs EN dans toutes leurs versions localisées. C'est l'idiome dominant du SEO multilingue.
   - **Coût × bénéfice défavorable.** Slugs traduits → mapping inverse (`/ar/<ar-slug>` doit retrouver l'occupation), tests trilingues, redirects pour les anciens slugs, gestion des collisions. Bénéfice SEO marginal vs slug EN dans une URL préfixée `/ar/...` (Google sait déjà que c'est de l'arabe par le préfixe).
   - **Si tu tiens à les traduire : V2.** On a un mécanisme de redirect propre une fois les bases posées. Pas avant.

   **Recommandation : on garde des slugs EN identiques sur les 3 langues. Pas négociable en V1.**

### A.3 Estimation build time

Mesure de référence à faire avant migration : `time npm run build` actuel sur cette machine. Hypothèse : SSG Next.js scale ~linéairement.

| Phase | Pages | Estimation |
|---|---|---|
| Avant | 328 | T (à mesurer en baseline) |
| Après | 984 | ~3T + overhead constant pour le crawl interne du build |

**Risques de coût Vercel :** sur un plan Hobby, le build limit est de 45 min — on est très loin. Sur Pro, idem. Le risque réel n'est pas le build mais la **bundle size partagée** : si chaque page importe les 3 dictionnaires (~2 236 lignes total), c'est OK car Next.js tree-shake et chaque page SSG n'inline que les chaînes qu'elle utilise. À vérifier au build.

**Mitigation si trop lent :** activer `experimental.staticGenerationMaxConcurrency` ou pré-générer uniquement les langues critiques et utiliser `dynamicParams: true` pour le reste (génération à la demande).

### A.4 `x-default`

**Recommandation : `x-default` → `/en/<path>`.** À toi de trancher (cf §H Q1).

Justifications :
- L'audience prioritaire pour le SEO est anglophone (search global, expats, chercheurs).
- L'arabe est ciblé via `ar` et `ar-SA` (à ajouter en post-migration).
- Le marché saoudien arabophone sera servi par `ar-SA` correctement, le marché anglophone international par `x-default = en`.

Alternative : `x-default = ar` si tu juges que le trafic SA arabophone est ta priorité absolue. Mais alors les non-arabophones tomberaient sur AR par défaut quand Google ne sait pas trancher — ça coûterait du trafic global.

---

## B. Refactor du système i18n

### B.1 Comment `useT`/`useLang` lit la lang

**Plan :** garder `useLang()` côté client mais l'alimenter via une **prop racine `lang` injectée par `app/[lang]/layout.tsx`** (un Server Component qui lit `params.lang`), au lieu de la détection navigator/cookie.

```tsx
// app/[lang]/layout.tsx (Server Component)
export default function LangLayout({
  children,
  params,
}: { children: ReactNode; params: { lang: Lang } }) {
  return (
    <LangProvider initialLang={params.lang}>
      {children}
    </LangProvider>
  );
}
```

```tsx
// src/lib/i18n/context.tsx (Client Component, modifié)
export function LangProvider({
  initialLang,
  children,
}: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  // suppression de detectLang() / useEffect
  // setLang ne change plus en place — il navigue (cf B.3)
  ...
}
```

**Impact concret :**
- Les **267 conditionnels `lang === "..."`** continuent de fonctionner sans modification (le hook retourne toujours la bonne valeur).
- Les **39 fichiers** qui consomment `useLang()` ne changent pas.
- C'est un changement local au LangProvider, pas un refactor en profondeur.

### B.2 Sort de `LangProvider` et `HtmlLangSync` — **réponse à Q3**

| Composant | Sort | Où sont posés `<html lang>` et `<html dir>` |
|---|---|---|
| `LangProvider` | **Conservé, modifié** | Reçoit `initialLang` en prop. |
| `HtmlLangSync` | **Supprimé** | Plus nécessaire, voir ci-dessous. |
| `LangContext` (l'export) | Conservé | |
| `formatNumber` (helper) | Conservé | |

**Confirmation : `<html lang>` ET `<html dir>` sont posés dans `app/[lang]/layout.tsx` (Server Component) avec une logique conditionnelle sur `params.lang`.** Le root `app/layout.tsx` ne contient plus de `<html>`.

Code exact prévu :

```tsx
// src/app/[lang]/layout.tsx — Server Component
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }, { lang: "ar" }];
}

export default function LangLayout({
  children,
  params,
}: { children: ReactNode; params: { lang: "en" | "fr" | "ar" } }) {
  const dir = params.lang === "ar" ? "rtl" : "ltr";
  return (
    <html lang={params.lang} dir={dir} className="...fonts...">
      <head>
        {/* hreflang générés ici depuis le pathname courant */}
        {/* JSON-LD localisé */}
      </head>
      <body>
        <LangProvider initialLang={params.lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
```

**Conséquence :** le HTML servi par Vercel a déjà `lang="ar" dir="rtl"` au premier byte — Googlebot voit la bonne langue, et il n'y a plus de FOUC client-side. C'est exactement le but de la migration.

Note technique : le root `app/layout.tsx` ne peut plus contenir `<html>` (Next.js 14 autorise un seul `<html>` par arbre). Il devient soit (a) un wrapper minimal qui rend juste `{children}`, soit (b) supprimé entièrement et `app/[lang]/layout.tsx` devient le root effectif (à vérifier avec la doc Next.js — je penche pour (a) pour garder la place aux providers globaux non-i18n type Analytics).

### B.3 Stratégie pour les composants client qui ont besoin de la lang

Ils continuent d'appeler `useLang()`. Rien ne change pour eux **en lecture**.

**En écriture (changer de langue) :** `setLang(l)` n'est plus une mutation locale du context — il **navigue vers la même page dans la nouvelle langue** :

```ts
// nouveau setLang dans LangProvider
const router = useRouter();
const pathname = usePathname();
const setLang = (l: Lang) => {
  // /en/relocate/cairo-to-riyadh → /fr/relocate/cairo-to-riyadh
  const newPath = pathname.replace(/^\/(en|fr|ar)/, `/${l}`);
  router.push(newPath);
};
```

**Le seul composant impacté est [src/components/ui/LangToggle.tsx](src/components/ui/LangToggle.tsx).**

### B.4 Que devient le middleware `Accept-Language` — **réponse à Q5**

**Décision : redirect racine en 301 (pas 302).** Le cookie `shift_lang` est réduit à un rôle minimal.

**Justification de la révision :**
- Avec un router localisé, **chaque langue a une URL canonique distincte**. Un visiteur qui veut une autre langue clique le toggle, qui appelle `router.push("/<newlang>/...")` — il navigue, il ne dépend plus du cookie pour "court-circuiter" un redirect.
- Donc l'argument 302 ("permettre un override par toggle") tombe. Le 301 transmet l'autorité SEO de l'URL non-préfixée vers `/en/<path>` (ce que Google indexait déjà), ce qui est l'effet voulu.
- Le risque de "cookie qui bloque le toggle" disparaît parce que **le toggle modifie l'URL, pas le cookie**.

**Nouveau rôle du cookie `shift_lang` :**
- **Conservé**, mais **uniquement** pour mémoriser la langue choisie lors d'une **future visite directe à la racine** (`/`) du site, sans préfixe.
- Set au moment du toggle (`setLang` peut écrire le cookie en plus de naviguer).
- Lu **uniquement** par le middleware quand le path n'a pas de préfixe lang.

**Nouveau middleware :**

```ts
export function middleware(req) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Si déjà préfixé /en/, /fr/, /ar/ → laisser passer
  if (/^\/(en|fr|ar)(\/|$)/.test(path)) return NextResponse.next();

  // Exclure assets et API
  if (path.startsWith("/api/") || path.startsWith("/_next/") ||
      path.startsWith("/reports/") || path === "/sitemap.xml" ||
      path === "/robots.txt") return NextResponse.next();

  // Détecter la langue cible
  const lang = req.cookies.get("shift_lang")?.value
            || detectFromAcceptLanguage(req.headers.get("accept-language"))
            || "en";

  url.pathname = `/${lang}${path === "/" ? "" : path}`;
  // 301 permanent — Google indexe la version préfixée
  return NextResponse.redirect(url, 301);
}
```

**Edge case "URL vs cookie" — réponse à Q2 (V1) / Q5 (V2) :** un user avec `cookie shift_lang=fr` qui clique un lien externe vers `/en/relocate`. **Décision recommandée : l'URL gagne.** Le cookie est ignoré quand un préfixe lang est déjà présent (le middleware s'arrête à la première condition `if`). Le user atterrit sur EN, le cookie reste FR. Cohérent avec "URL = source de vérité côté SEO". À toi de confirmer (cf §H Q2).

---

## C. Stratégie de redirects

### C.1 Redirects nécessaires

| Pattern | Statut | Cible | Source |
|---|---|---|---|
| `/` (et toutes les pages racine actuelles, sans préfixe) | **301** (middleware) | `/{detectedLang}/...` | détection cookie → Accept-Language → en |
| `/sitemap.xml` | 200 inchangé | inchangé | doit lister 984 URLs |
| `/robots.txt` | 200 inchangé | inchangé | |
| `/api/*` | 200 inchangé | inchangé | pas de préfixe lang |
| `/reports/*.pdf` | 200 inchangé | inchangé | assets statiques |
| `/compare` (déjà existant) | **301** mis à jour | `/en/career` | upgrade du redirect actuel |

### C.2 Éviter la régression SEO

**Le risque :** Google connaît `/relocate` qui pointe vers du contenu EN. Après migration, `/relocate` devient un 301 → `/en/relocate`. Pour Google, c'est OK, l'autorité est transférée à l'URL canonique.

**Pour minimiser les vibrations :**

1. **301 partout** sur les paths stables. La règle middleware ci-dessus s'en charge. Pas de redirects statiques en plus dans `next.config.mjs` (sauf `/compare` qui existe déjà).

2. **Submitter le nouveau sitemap à GSC le jour du deploy** (cf §J).

3. **Garder le canonical correct par page** : sur `/en/relocate`, `canonical = /en/relocate` (pas `/relocate`). Google traite le 301 et indexe la nouvelle URL.

### C.3 Plan de soumission GSC

→ déplacé en §J pour cohérence avec le plan de mesure.

### C.4 Bug sitemap actuel à corriger en passant

Le sitemap prod ne liste **que 326 URLs**, manque `/prepare` (absent de `STATIC_PAGES` dans [src/app/api/sitemap/route.ts](src/app/api/sitemap/route.ts) ligne 8-21) et le 8e vs slug. Le rewrite du sitemap §E.1 corrige ça mécaniquement.

---

## D. Refactor des liens internes

### D.1 Helper pour générer les liens localisés

```ts
// src/lib/i18n/links.ts (nouveau)
import type { Lang } from "./context";

export function localizedHref(lang: Lang, path: string): string {
  return `/${lang}${path === "/" ? "" : path}`;
}
```

```tsx
// src/lib/i18n/useLocalizedHref.ts (hook pour Client Components)
import { useLang } from "./context";
import { localizedHref } from "./links";

export function useLocalizedHref() {
  const { lang } = useLang();
  return (path: string) => localizedHref(lang, path);
}
```

Server Components : `localizedHref(params.lang, "/career")` direct.

### D.2 Liste des fichiers à modifier

**Hardcoded `<a href="/...">` (29 occurrences dans 11 fichiers) :**
- `src/app/page.tsx` (4 liens footer)
- `src/app/vs/[slug]/client.tsx` (6 liens)
- `src/app/relocate/[pair]/page.tsx` (1 lien)
- `src/app/relocate/client.tsx` (3 liens)
- `src/app/prepare/client.tsx` (5 liens)
- `src/app/job/[slug]/client.tsx` (5 liens)
- `src/app/privacy/client.tsx` (1 lien)
- `src/components/SmartPopup.tsx` (1 — vers `/reports/...pdf`, **conservé tel quel**)
- `src/components/EmailCapture.tsx` (1 — idem PDF, conservé)
- `src/components/career/CareerCTA.tsx` (1 lien)
- `src/components/career/CareerRecommender.tsx` (1 lien PDF, conservé)
- `src/components/profile/RiskProfileWizard.tsx` (1 lien PDF, conservé)
- `src/components/job/FindJobTab.tsx` (1 lien)
- `src/components/nav/JobsDropdown.tsx` (1 lien)
- `src/components/legal/CookieConsent.tsx` (1 lien)

**Total à modifier : ~25 liens internes.**

**Hardcoded `router.push("/...")` :**
- `src/components/ui/LangToggle.tsx:194`
- `src/components/career/CareerRecommender.tsx:269`
- `src/components/nav/MobileJobSearch.tsx:71`
- `src/components/nav/JobsDropdown.tsx:155`

**Total : 4 navigations programmatiques.**

### D.3 Stratégie pour les liens dans les dictionnaires

`0` URL hardcodée dans `en.ts/fr.ts/ar.ts`. Aucun travail.

---

## E. Sitemap + hreflang

### E.1 Nouvelle structure du sitemap

[src/app/api/sitemap/route.ts](src/app/api/sitemap/route.ts) doit être réécrit pour générer **984 entrées** (328 paths × 3 langues), chacune avec **5 hreflang** : `en`, `fr`, `ar`, `ar-SA`, `x-default`.

```ts
const LANGS: Lang[] = ["en", "fr", "ar"];
const HREFLANG_MAP: Record<Lang, string[]> = {
  en: ["en"],
  fr: ["fr"],
  ar: ["ar", "ar-SA"], // ar-SA cible spécifiquement KSA
};

function buildAlternates(path: string): string {
  const tags: string[] = [];
  for (const lang of LANGS) {
    const url = `${SITE_URL}/${lang}${path === "/" ? "" : path}`;
    for (const hl of HREFLANG_MAP[lang]) {
      tags.push(`<xhtml:link rel="alternate" hreflang="${hl}" href="${url}" />`);
    }
  }
  tags.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${path === "/" ? "" : path}" />`);
  return tags.join("\n    ");
}
```

### E.2 hreflang dans le HTML rendu

Centralisé via `metadata.alternates.languages` dans une fonction utilitaire :

```ts
// src/lib/i18n/seo.ts
const SITE = "https://www.ksashiftobservatory.online";

export function buildLanguageAlternates(currentLang: Lang, path: string) {
  return {
    canonical: `${SITE}/${currentLang}${path === "/" ? "" : path}`,
    languages: {
      "en": `${SITE}/en${path === "/" ? "" : path}`,
      "fr": `${SITE}/fr${path === "/" ? "" : path}`,
      "ar": `${SITE}/ar${path === "/" ? "" : path}`,
      "ar-SA": `${SITE}/ar${path === "/" ? "" : path}`,
      "x-default": `${SITE}/en${path === "/" ? "" : path}`,
    },
  };
}
```

Chaque `generateMetadata` consomme ça :
```ts
return {
  ...
  alternates: buildLanguageAlternates(params.lang, `/job/${params.slug}`),
};
```

---

## F. Risques et points durs

### F.1 Composants qui pourraient casser silencieusement

1. **`HtmlLangSync` supprimé** : grep `documentElement.lang` et `documentElement.dir` côté client avant suppression pour vérifier qu'aucun consommateur exotique ne lit ces attributs en JS. Si oui : refactorer pour passer par `useLang()`.
2. **`useLang()` : setLang est désormais une navigation.** Si un composant fait `setLang('fr')` et s'attendait à ce que le DOM se mette à jour sans recharger la page, il faut vérifier qu'aucune logique métier ne dépend de l'absence de navigation.
3. **Pages sans `client.tsx`** (career, profile) : leur composant racine est un Server Component qui passe par des hooks client. Vérifier que `params.lang` est bien drillé jusqu'aux client components.
4. **Edge case URL vs cookie** déjà couvert en §B.4.

### F.2 JSON-LD : portée complète de la localisation — **réponse à Q4**

**La migration inclut OBLIGATOIREMENT la localisation des structured data.** Pas de "deux temps". Audit factuel :

| Schéma | Pages affectées | Questions/items existants | Statut actuel | Travail à faire |
|---|---|---|---|---|
| **WebApplication** (layout) | 1 (root) | 1 schema | EN-only, statique | Localiser `name`, `description`, `inLanguage` selon `params.lang` |
| **Dataset** (layout) | 1 (root) | 1 schema | EN-only, statique | Localiser `name`, `description`, `keywords` |
| **FAQPage `/job/[slug]`** | 237 | 9 questions/page (6 EN + 3 FR mergées) | EN+FR mergées dans 1 FAQPage (hack) | Splitter en 3 FAQPage par langue (1 par URL). **Écrire 6 questions AR par occupation = 1 422 nouvelles questions AR.** |
| **FAQPage `/relocate/[pair]`** | 75 | 8 questions/page (audit ligne 168) | EN+FR mergées | Splitter EN/FR. **Écrire 8 questions AR par paire = 600 nouvelles AR.** |
| **FAQPage `/vs/[slug]`** | 8 | ~1 question/page | EN-only | Localiser FR + écrire AR. **~16 nouvelles questions FR+AR.** |
| **FAQPage `/prepare`** | 1 | 5 questions | EN-only | Localiser FR + écrire AR. **10 nouvelles.** |
| **BreadcrumbList** | 320 (job + relocate + vs) | items stables | EN-only | Localiser le `name` de chaque item (ex. "Home" → "الرئيسية") |
| **Occupation schema** | 237 | 1/page | déjà multilingue (`alternateName` AR/FR) | OK, juste s'assurer que la `description` principale est dans `params.lang` |

**Total questions FAQPage à écrire ou re-localiser :**
- AR à créer from scratch : **~2 048 questions** (1 422 job + 600 relocate + 16 vs + 10 prepare)
- FR à créer from scratch (vs, prepare) : **~26 questions**
- Total nouveau contenu FAQ : **~2 074 questions**.

**Ton estimation "1 600" était proche.** La réalité est ~2 000-2 100. Cette charge est intégrée à l'estimation de §G (phase 3).

**Stratégie de génération du contenu AR :**
- Les questions sont **paramétriques** (template + variables). Ex. job/[slug] a 6 patterns × {composite, salary, etc.} interpolés. Pas 1 422 questions à écrire à la main, mais **6 patterns AR à écrire**, instanciés 237× par le code.
- Idem relocate : 8 patterns AR × 75 paires = 8 patterns AR à écrire à la main.
- Total réel à écrire à la main : **~22 patterns AR + ~5 patterns FR pour vs/prepare**.
- L'estimation §G compte 6h pour cette traduction (avec relecture).

**OG tags & OG images — réponse à Q4 partielle :**
- **OG tags** (`og:title`, `og:description`, `og:locale`) : localisés par `generateMetadata` selon `params.lang`. Inclus dans la phase 3.
- **OG images** : 3 routes (`/api/og`, `/api/og/career`, `/api/og/profile`) qui rendent une image PNG. Aujourd'hui EN-only. **Inclus en phase 3.5** : ajouter un param `?lang=` lu par chaque route, et passer cette URL dans `metadata.openGraph.images` selon `params.lang`. Coût : ~2h pour 3 routes (les patterns d'image se ressemblent).

### F.3 Build time / bundle / coût

- Build time : ×3.
- Bundle JS : pas d'impact direct.
- Coût Vercel : négligeable.

### F.4 Pages déjà indexées pendant la transition

- ~328 URLs indexées actuellement.
- Pendant 2-8 semaines, Google va re-crawler. Les positions peuvent vibrer.
- Mitigation : 301 stable + sitemap correct + hreflang propre dès J+0.

---

## G. Ordre d'exécution recommandé

**Total estimé révisé : 24-32 heures** (vs 12-18h en v1, **réponse à Q7**).

**Justification de la révision (réponse à Q7) :**

| Bloc | v1 | v2 | Pourquoi |
|---|---|---|---|
| Refactor i18n provider | 2h | 2h | Inchangé |
| Création arborescence `[lang]` | 3h | 3h | Inchangé |
| Migration des 11 page.tsx + clients | 4-6h | 5-7h | Tests trilingues plus rigoureux |
| Liens internes (~25 + 4 router.push) | inclus | 1-2h | Sous-estimé en v1 |
| **Sitemap + helper SEO + hreflang** | inclus | 2h | OK |
| **JSON-LD localisation (FAQPage × 4 templates AR)** | **0** | **6-8h** | **Manquait totalement en v1** |
| **OG images localisées (3 routes)** | 0 | 2h | Manquait |
| Middleware refactor + redirects | 1h | 1-2h | Légèrement sous-estimé |
| **QA pre-deploy (matrice + crawl)** | 0 | 2-3h | Manquait |
| Bascule + cleanup | 2h | 2h | OK |
| **Total** | **12-18h** | **24-32h** | |

**Ce qui me rend confiant à 24-32h (et pas 40h+) :**
- Les patterns FAQ sont peu nombreux (22 AR + 5 FR à écrire à la main, pas 2 000). Le template Engine fait le reste.
- 0 URL dans les dictionnaires. Pas de chasse aux références cachées.
- 267 conditionnels `lang === ...` n'ont **aucune** modification à subir : ils continuent de marcher tels quels.
- Le pattern de migration est répétitif à partir de la 2e route : copier-adapter-tester.

**Ce qui pourrait faire glisser au-delà de 32h :**
- Découverte d'un composant qui lit `document.documentElement.lang` (à grepper en phase 1 — risque mitigeable avant exécution).
- Bug Next.js sur `[lang]` + `metadata.alternates.languages` (cas connu : Next 14.x avait des edge cases sur l'ordre d'évaluation).
- Re-relecture des FAQs AR par toi → si tu rejettes les patterns, +4-6h.

**Découpé en 5 phases, chacune avec point de validation et de rollback.**

### Phase 1 — Préparation, zéro impact prod (1-2h)
- Mesurer build time baseline.
- Créer `src/lib/i18n/links.ts` + `seo.ts` **sans les utiliser**.
- Grepper `documentElement.lang` et `documentElement.dir` pour vérifier qu'aucun consommateur exotique n'existe.
- **Validation :** build local OK, pas de changement runtime.
- **Rollback :** `git checkout`. Trivial.

### Phase 2 — Création de l'arborescence `[lang]` en parallèle (3-4h)
- Sans supprimer les anciennes routes, créer `app/[lang]/layout.tsx` + `app/[lang]/page.tsx` minimal qui rend juste `Hello {params.lang}`.
- Configurer `generateStaticParams`, vérifier que `lang`/`dir` arrivent bien dans le HTML rendu.
- Vérifier les 3 langues répondent en local sur `/en`, `/fr`, `/ar`.
- **Validation :** anciennes routes inchangées + nouvelles routes répondent correctement.
- **Rollback :** suppression du dossier `[lang]`. Aucune ancienne route touchée.

### Phase 3 — Migration progressive route par route + JSON-LD (12-15h)
**Ordre proposé** :
1. `/cookies`, `/privacy`, `/terms` (statiques, courtes, peu de JSON-LD).
2. `/profile`, `/prepare`, `/relocate` (avec client component).
3. `/vs/[slug]` (8 pages, FAQPage minimaliste).
4. `/relocate/[pair]` (75 pages, FAQPage 8 questions × 3 langs).
5. `/job/[slug]` (237 pages, FAQPage 6 questions × 3 langs + Occupation schema).
6. `/` (la home, en dernier car entrypoint).
7. `/career`.

**Pour chaque route migrée :**
- Copier dans `app/[lang]/<route>/`.
- Adapter `generateStaticParams`, `generateMetadata` (avec `buildLanguageAlternates`).
- **Localiser le JSON-LD** (FAQPage par langue, BreadcrumbList par langue, OG par langue).
- Modifier `<a href>` → `localizedHref()`.
- Tester : `curl localhost:3000/en/<route>`, `/fr/<route>`, `/ar/<route>`.
- **Ne pas supprimer l'ancienne route encore.**

**Phase 3.5 — OG images localisées (2h, peut être faite en parallèle de 3)**
- Modifier les 3 routes `/api/og/*` pour accepter `?lang=` et adapter le rendu.
- Mettre à jour `metadata.openGraph.images` dans chaque page pour passer `?lang=${params.lang}`.

**Validation après chaque route :** build OK + curl 3 langs + Rich Results Test (https://search.google.com/test/rich-results) sur 1 URL par template.
**Rollback :** `git checkout` la route migrée.

### Phase 4 — Bascule (2-3h)
- Modifier le middleware (redirect 301 racine, cf B.4).
- Supprimer les anciennes routes.
- Modifier `LangToggle` pour naviguer.
- Modifier `LangProvider` (suppression `detectLang`, ajout `initialLang`).
- Supprimer `HtmlLangSync`.
- Régénérer le sitemap.
- Mettre à jour le redirect `/compare` → `/en/career`.
- **Lancer la matrice QA §I avant de considérer la phase complète.**
- **Validation :** matrice QA verte + build OK + crawl script OK.
- **Rollback :** `git revert` la phase. En prod : `vercel rollback`.

### Phase 5 — Deploy + monitoring (2h + 4 semaines surveillance)
- Deploy après validation visuelle de la preview Vercel.
- Soumettre sitemap à GSC.
- Forcer indexation `/en/`, `/ar/`, `/fr/`.
- Surveillance KPI selon §J.
- **Point de no-return :** une fois le sitemap soumis et Google a commencé à re-indexer, revenir en arrière coûte autant qu'aller en avant. Donc valider exhaustivement avant.

---

## H. Questions ouvertes — VERBATIM, NUMÉROTÉES (réponse à Q1)

**Aucune ligne de code ne sera écrite tant que ces 6 questions ne sont pas tranchées.**

**Q1. `x-default` doit-il pointer vers `/en/<path>` ou `/ar/<path>` ?**
Recommandation : **EN**. Justification : audience SEO globale anglophone prioritaire ; le marché SA arabophone est ciblé spécifiquement par `ar-SA`.

**Q2. Edge case "URL vs cookie" : un user avec cookie `shift_lang=fr` qui clique un lien externe vers `/en/relocate` — on respecte l'URL ou le cookie ?**
Recommandation : **respecter l'URL**. Le cookie est ignoré quand un préfixe lang est déjà présent dans le path. Cohérent avec YouTube/Wikipedia/Stripe.

**Q3. Slugs traduits par langue (ex. `/ar/wadhifa/<ar-slug>`) — V1 ou V2 ?**
Recommandation : **V2 (jamais, sauf besoin métier explicite)**. En V1 : slugs EN identiques sur les 3 langues. Justification §A.2.

**Q4. Image OG par langue (3 routes `/api/og/*` à modifier) — V1 ou V2 ?**
Recommandation : **V1 inclus en phase 3.5** (cf §F.2). +2h. À toi de décider si tu veux retarder.

**Q5. GSC : une propriété domaine ou plusieurs propriétés par préfixe ?**
Recommandation : **une seule propriété domaine.** Les hreflang correctement déclarés permettent à GSC de segmenter par langue dans les rapports International Targeting.

**Q6. Quand on commence ?**
Pas avant ta validation explicite de ce plan v2.

---

## I. Matrice QA pre-deploy — réponse à Q8

### I.1 Matrice manuelle : 3 langues × 6 templates = 18 vérifications

À exécuter **avant le deploy de la phase 4**. Aucune case rouge tolérée.

| Template | Page test | EN | FR | AR | Vérifications |
|---|---|---|---|---|---|
| Home | `/<lang>/` | ☐ | ☐ | ☐ | (1) `<html lang>` correct, (2) `<html dir>` correct (rtl pour ar), (3) titre dans la bonne langue, (4) hreflang × 5 corrects, (5) canonical correct, (6) JSON-LD WebApplication localisé |
| Static (long) | `/<lang>/relocate` | ☐ | ☐ | ☐ | idem + (7) tous les liens internes pointent vers `/<lang>/...` |
| Static (court) | `/<lang>/cookies` | ☐ | ☐ | ☐ | idem |
| Dynamic vs | `/<lang>/vs/numbeo` | ☐ | ☐ | ☐ | idem + (8) FAQPage dans la bonne langue, (9) BreadcrumbList localisé |
| Dynamic relocate | `/<lang>/relocate/cairo-to-riyadh` | ☐ | ☐ | ☐ | idem + (10) Occupation schema FAQPage localisée |
| Dynamic job | `/<lang>/job/data-scientist` | ☐ | ☐ | ☐ | idem + (11) Occupation schema, (12) titre/desc dynamiques OK |

### I.2 Crawl automatisé des 984 URLs

Script à écrire dans la phase 4 (avant deploy). Pseudocode :

```ts
// scripts/crawl-i18n-check.mjs
import { ORIGIN_CITIES, SAUDI_CITIES } from "../src/data/relocation-data.ts";
import { getAllOccupations, toSlug } from "../src/lib/occupations.ts";
import { getAllComparisonSlugs } from "../src/data/comparisons.ts";

const SITE = process.env.CHECK_URL || "http://localhost:3000";
const LANGS = ["en", "fr", "ar"];
const STATIC = ["/", "/career", "/cookies", "/prepare", "/privacy", "/profile", "/relocate", "/terms"];
const PATHS = [
  ...STATIC,
  ...getAllComparisonSlugs().map(s => `/vs/${s}`),
  ...getAllOccupations().map(o => `/job/${toSlug(o.name_en)}`),
  ...ORIGIN_CITIES.flatMap(o => SAUDI_CITIES.map(s => `/relocate/${o.id}-to-${s.id}`)),
];

let failures = [];
for (const lang of LANGS) {
  for (const path of PATHS) {
    const url = `${SITE}/${lang}${path === "/" ? "" : path}`;
    const html = await fetch(url).then(r => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.text(); });
    const checks = {
      status200: true, // déjà vérifié par le throw
      htmlLang: new RegExp(`<html[^>]*lang="${lang}"`).test(html),
      htmlDir: new RegExp(`<html[^>]*dir="${lang === "ar" ? "rtl" : "ltr"}"`).test(html),
      hreflangEn: html.includes(`hrefLang="en" href="${SITE}/en${path === "/" ? "" : path}"`),
      hreflangFr: html.includes(`hrefLang="fr" href="${SITE}/fr${path === "/" ? "" : path}"`),
      hreflangAr: html.includes(`hrefLang="ar" href="${SITE}/ar${path === "/" ? "" : path}"`),
      hreflangArSa: html.includes(`hrefLang="ar-SA" href="${SITE}/ar${path === "/" ? "" : path}"`),
      hreflangXDefault: html.includes(`hrefLang="x-default" href="${SITE}/en${path === "/" ? "" : path}"`),
      canonical: html.includes(`rel="canonical" href="${SITE}/${lang}${path === "/" ? "" : path}"`),
    };
    for (const [name, ok] of Object.entries(checks)) {
      if (!ok) failures.push({ url, name });
    }
  }
}

console.log(`Checked ${LANGS.length * PATHS.length} URLs.`);
console.log(`Failures: ${failures.length}`);
if (failures.length) {
  console.error(failures.slice(0, 20));
  process.exit(1);
}
```

**Critère d'acceptation phase 4 :** `node scripts/crawl-i18n-check.mjs` exit 0 contre `localhost:3000` après build, ET contre la preview Vercel après deploy de prévisualisation.

### I.3 Tests Rich Results

Avant deploy prod, passer 1 URL par template par langue (6 × 3 = 18) dans https://search.google.com/test/rich-results et confirmer 0 erreur sur :
- WebApplication
- FAQPage
- BreadcrumbList
- Occupation (sur /job)

**Si une seule erreur Rich Results : pas de deploy.**

---

## J. Plan de mesure post-deploy — réponse à Q9

Tableau des KPI à surveiller dans **GSC + Vercel Analytics**, avec valeurs cibles ou seuils d'alerte.

| Jalon | KPI | Cible / Seuil d'alerte | Action si seuil franchi |
|---|---|---|---|
| **J+0 (jour du deploy)** | Sitemap soumis dans GSC | sitemap accepté, "Discovered URLs" augmente | Si sitemap rejeté : revoir le XML, soumettre à nouveau |
| | URL Inspection sur `/en/`, `/fr/`, `/ar/` | "URL is on Google" ou "Submitted" | Si "Discovered – currently not indexed" : Request Indexing manuel |
| | Crawl errors prod | 0 (404 5xx) | Si > 0 : `vercel rollback`, investigation |
| | International Targeting (GSC) | 0 erreur hreflang | Si erreur : fix dans les 24h |
| **J+7** | URLs indexées (préfixées) | ≥ 30% des 984 URLs | Si < 10% : Request Indexing par lots |
| | URLs marquées "Page with redirect" (anciennes) | 100-300 (cohérent avec ~328 anciennes) | Normal et non-pénalisant |
| | Impressions GSC global | ≥ 70% du baseline pré-migration | Si < 50% : alerte rouge, investiguer (mauvais hreflang ? content not localized?) |
| | Impressions GSC Arabie Saoudite | ≥ baseline (167/90j ≈ 13/7j) | Si trafic arabe nul : pas encore concluant à J+7 |
| **J+14** | URLs indexées (préfixées) | ≥ 70% des 984 URLs | |
| | CTR moyen | dans ±20% du baseline | Si chute >30% : revoir titles/descriptions par lang |
| | Clics SA (90j rolling) | trajectoire ascendante | Si toujours 0 clic SA : drapeau jaune |
| **J+30** | URLs indexées | ≥ 90% | |
| | Impressions SA (30j) | ≥ 200 (vs 167/90j actuellement, donc rythme x3) | Voir §K si non |
| | **Clics SA (30j)** | **≥ 5** | **Voir §K si 0** |
| | Position moyenne AR sur "اقتصاد السعودية وظائف" et requêtes Saudi | top 30 sur ≥ 5 requêtes | Sinon : revoir contenu AR |

**Outils de surveillance recommandés :**
- GSC Performance, filtrer par Country = Saudi Arabia, Search appearance.
- GSC Coverage : suivre le ratio Indexed/Submitted.
- GSC International Targeting : 0 erreur tolérée.
- Vercel Analytics : trafic par pays, par chemin.

---

## K. Plan B — si à J+30 GSC montre toujours 0 clic SA — réponse à Q10

### K.1 Critère d'échec ferme

**La migration est jugée insuffisante si TOUTES les conditions sont vraies à J+30 :**
1. Les 984 URLs sont indexées à ≥ 90% (donc Google a vu et accepté les versions AR).
2. International Targeting GSC : 0 erreur hreflang.
3. Impressions sur GSC pour les URLs `/ar/*` (toutes langues confondues) ≥ 100.
4. **Clics depuis la SA (toutes URLs) = 0 ou < 3.**

Si (1)+(2)+(3) sont OK mais (4) reste à 0 → **le problème n'est pas l'architecture i18n. C'est le contenu, le titre, le mot-clé ciblé, ou la concurrence.**

### K.2 Trois hypothèses post-mortem à investiguer dans cet ordre

**H1. Le contenu AR est techniquement servi mais sémantiquement faible ou mal ciblé.**
- Test : extraire les top queries AR via GSC (même à 0 clic, il y a souvent des impressions) et vérifier si le contenu de la page correspond à l'intention.
- Action : audit éditorial AR par un natif. Le `useT` traduit l'UI mais les FAQ AR auront été écrits par moi via patterns — qualité à challenger.

**H2. Les concurrents (Bayt, Glassdoor, sites gouvernementaux SA) dominent sur les requêtes locales.**
- Test : Ahrefs / SEMrush sur 10 requêtes cibles AR-SA pour identifier qui ranke top 3.
- Action : si concurrents type bayt.com saturent → la stratégie SEO classique ne suffit pas. Pivoter vers (a) Google Ads ciblés, (b) backlinks depuis sites SA, (c) angle de contenu différencié (data unique de SHIFT vs commodity de Bayt).

**H3. Le marché SA arabophone ne cherche pas ce que SHIFT propose en arabe.**
- Test : Google Trends SA sur les keywords cibles. Si volume faible en AR mais élevé en EN → la diaspora arabe cherche en EN, pas en AR.
- Action : recentrer le SEO arabe sur le marché Égypte / Maghreb / Levant qui partage le keyword AR. Et accepter que SA = marché EN-first même pour les Saoudiens.

### K.3 Action concrète à J+30

Si critère d'échec atteint :
1. Bloquer toute itération supplémentaire sur l'i18n.
2. Audit éditorial AR (1 jour de freelance natif arabe — budget ~300€).
3. Audit concurrentiel Ahrefs (1 jour analyse).
4. Décision Samy : continuer en SEO organique avec recentrage de contenu (H1+H2) OU pivoter vers acquisition payante (Google Ads SA).

**La migration i18n est une condition nécessaire, pas suffisante.** Elle ouvre la porte ; elle ne garantit pas que les visiteurs SA trouvent et cliquent. K.3 reconnaît ça honnêtement.

---

**Fin du plan v2.** Aucune ligne de code n'a été modifiée. À toi de relire les §H questions Q1-Q6, le découpage §G, les seuils §J/§K, et de me dire si tu valides ou demandes encore une révision.
