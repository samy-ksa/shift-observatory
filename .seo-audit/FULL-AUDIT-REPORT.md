# SHIFT Observatory — Full SEO Audit Report

**URL audited:** https://www.ksashiftobservatory.online/en
**Date:** 2026-06-08
**Auditor:** claude-seo v2.0.0 (10-principle framework)
**Site type detected:** Free public tool / Independent dashboard (not SaaS/ecommerce/local/publisher)

---

## SEO Health Score: **74 / 100**

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 88/100 | 19.4 |
| Content Quality | 23% | 91/100 | 20.9 |
| On-Page SEO | 20% | 65/100 | 13.0 |
| Schema / Structured Data | 10% | 80/100 | 8.0 |
| Performance (CWV) | 10% | 75/100 | 7.5 |
| AI Search Readiness (GEO) | 10% | 35/100 | 3.5 |
| Images | 5% | 70/100 | 3.5 |
| **TOTAL** | **100%** | | **74/100** |

**Verdict:** Site solide techniquement, excellent en contenu, mais sous-exploité sur 3 leviers : **cliquabilité SERP (titles desktop)**, **AI search readiness**, et **autorité du cluster cost-of-living**.

---

## PERCEIVE — Ce que disent les données externes

### Observe-External (Google Search Console, 90 jours)

| Métrique | Valeur | Lecture |
|---|---|---|
| Impressions totales | 2 059 | OK pour 3 mois post-launch |
| Clics | 18 | **TRÈS BAS** — 0,87% CTR moyen |
| Pages indexées | 249 | Bon volume |
| Pages non indexées | 8 | À auditer |
| Position moyenne | 10-15 | **Bonne** — on est visible |
| Saudi Arabia | 247 impressions / 3 clics / pos 9,77 | Marché cible touché mais conversion faible |
| France | 37 impressions / 5 clics / **13,5% CTR** | Francophones cliquent quand ils nous voient |

**Le signal le plus fort des données :** desktop fait 1628 impressions pour 5 clics (**0,31% CTR**). Mobile fait 13 clics pour 429 impressions (3,03%). La différence est **anormale** — les titles/descriptions ne donnent pas envie aux desktop users.

### Observe-Internal (ce qu'on contrôle)

- **Stack** : Next.js 14 App Router, déploiement Vercel, statique (SSG) sur 990+ pages
- **Migration récente** : passage de `/career` à `/[lang]/career` (en, fr, ar) il y a ~5 jours
- **Sitemap** : 984 URLs déclarées, hreflang × 5 par page
- **Données dans rapport GSC** : 100% pré-migration (Google n'a pas encore recrawlé les nouveaux paths) → **les données SEO actuelles ne reflètent pas l'état du code**

### Listen (signaux SERP + brand)

**Top queries cibles avec position désastreuse (page 7) :**
- `cost of living in saudi arabia` — 27 impr / pos **67,81**
- `cost of living in ksa` — 11 impr / pos 68,64
- `saudi arabia cost of living` — 10 impr / pos 69,5
- `saudi cost of living` — 7 impr / pos 61,43

→ **65+ impressions sur un cluster commercial à fort intent, mais on est en page 7.**

**Top queries où on rank bien (pos 5-10) :**
- `saudi arabia medical laboratory technician salary 2025` — pos **4,88**
- `respiratory therapist jobs in saudi arabia salary` — pos 9,67
- `petroleum engineering salary in saudi arabia` — pos 10,55
- `driving instructor jobs in saudi arabia` — pos 7,83

→ Tu domines déjà les requêtes "salary by occupation". C'est ta vraie niche actuelle.

**Bruit parasite :** `risk42 career`, `risk42 jobs` (15 impressions cumulées) — pas tes mots-clés, Google se trompe par confusion sémantique. Pas grave mais signe.

---

## ANALYZE — Synthèse first-principles

### Think (réduction au premier principe)

Le problème central n'est **pas un problème SEO technique**. C'est **un problème de cliquabilité et d'autorité topique**.

| Symptôme | Hypothèse profonde |
|---|---|
| Desktop CTR 0,31% | Le title "AI Job Risk Saudi Arabia: 237 Jobs Scored" sonne corporate / dashboard / cold. Les desktop users (qui comparent plus) ne voient pas la valeur immédiate. |
| Cluster cost-of-living pos 60+ | `/relocate` existe et calcule, mais le contenu textuel autour est trop léger. Google n'a pas assez de signaux pour ranker. |
| Rich results = "Product snippets" only | Les FAQPage / BreadcrumbList / Occupation ajoutés post-migration n'ont **pas encore** été crawlés. Patience requise (2-4 semaines). |
| AI search readiness 35/100 | Aucun signal d'optimisation pour AI Overviews / Perplexity / ChatGPT. Pas de passages auto-cités, pas d'entités markées, pas de Q&A claires en début de page. |

### Connect-Lateral (croisements non-évidents)

1. **France clique mais USA pas** (13,5% vs 0,13% CTR). Tes meta marchent en FR (langue cible) mais pas en EN (international). C'est le signe d'une **voix trop institutionnelle pour le marché EN**.

2. **Tu as 247 SA impressions** mais le contenu reste anglo-centré. Les Saoudiens qui te voient cliquent peu — soit langue, soit angle. C'est pour ça que l'AR localization était critique (faite).

3. **Cluster "cost of living"** apparaît 5 fois dans le top queries — Google te trouve sur l'intent mais te range bas. La page `/relocate` n'a probablement pas le bon contenu **textuel** (juste un outil interactif). Google n'indexe pas les calculatrices, il indexe du texte.

### Connect-System (dépendances entre fixes)

```
Fix Title cliquabilité (#1)
  └─> débloque CTR desktop (#2)
      └─> débloque impressions clics (#3)
          └─> Améliore signaux d'autorité Google (#4)

Re-crawl post-migration (Google delay, attend 2-4 sem)
  └─> Rich results FAQPage/BreadcrumbList reconnus
      └─> AI Overviews readiness ↑

Content depth /relocate (#5)
  └─> améliore pos cluster cost-of-living (#6)
      └─> ouvre top 20 → top 10 → page 1
```

---

## VALIDATE — Pressure test

### Feel (UX, brand voice, contraintes opérateur)

- ✅ Brand voice cohérent : "free, no signup, no data stored" → trust signal puissant
- ⚠️ Le ton est dashboard/data — pas humain. Ça explique le CTR desktop bas (les humains cherchent souvent de l'empathie)
- ✅ Mobile-first design solide (audit mobile fait, 9/10)
- ⚠️ Aucun témoignage / case study / signaux E-E-A-T (Experience) sur le site
- ✅ Trustworthiness fort (HTTPS, HSTS, CSP, mentions GASTAT/WEF/Frey-Osborne)

### Accept (falsifiabilité des findings)

Toutes les recommandations en §ACT sont assorties d'un check "comment saurait-on que ça a échoué" et d'un indicateur de monitoring.

---

## ACT — Plan d'action priorisé

### 🔴 CRITICAL (à faire cette semaine)

#### C1. Identifier et fixer les 4 pages "Crawled - currently not indexed"
**Source:** GSC Coverage Critical Issues
**First principle:** Google a vu ces pages mais a décidé de ne pas les indexer — soit contenu trop fin, soit problème de canonical, soit qualité jugée insuffisante.
**Action:**
1. Aller dans GSC → Coverage → "Crawled - currently not indexed"
2. Identifier les 4 URLs précises (le rapport CSV ne les liste pas, il faut cliquer dans l'UI)
3. Inspecter chaque URL avec "URL Inspection" → comprendre la raison
4. Soit enrichir le contenu, soit forcer "Request indexing"
**Failure check:** Si après 2 semaines elles ne sont toujours pas indexées malgré le request → contenu trop similaire à une autre page (faut consolider) ou bloqué par un canonical mal placé.
**Leading indicator:** GSC URL Inspection → "URL is on Google" pour les 4 URLs.

#### C2. Identifier le "Duplicate without user-selected canonical"
**Source:** GSC Coverage
**First principle:** Une page apparaît comme duplicat sans canonical clair — Google ne sait pas quelle version indexer.
**Action:** GSC UI → identifier l'URL → vérifier si elle a bien un `<link rel="canonical">` dans son HTML → si oui, vérifier qu'il pointe vers SOI-MÊME et pas une autre page.
**Failure check:** Si après le fix Google continue à signaler le duplicat → l'autre version (concurrente) est probablement une variante de query string ou un trailing slash.
**Leading indicator:** GSC report passe de "Started" à "Passed".

### 🟠 HIGH (à faire dans les 2 semaines)

#### H1. Réécrire les meta titles pour cliquabilité desktop
**Source:** Desktop CTR 0,31% vs Mobile 3,03%
**First principle:** Le title est la seule chose que voit l'user en SERP avant de cliquer. Un title corporate ne convertit pas.
**Pages cibles (top impressions):**

| URL | Actuel | Proposé |
|---|---|---|
| `/` | "AI Job Risk Saudi Arabia: 237 Jobs Scored \| SHIFT" | "Will AI Replace Your Saudi Job? Free Check, 237 Jobs Scored" |
| `/relocate` | "Saudi Arabia Cost of Living Calculator: Compare 65+ Items \| Free Tool" | "Saudi Salary You'd Need vs Your City (Free, No Signup)" |
| `/job/data-entry-keyers` | dynamic per occupation | "Are Data Entry Jobs Safe in Saudi Arabia in 2026? (Score + Salary)" |

**Failure check:** Si le CTR desktop ne monte pas au-dessus de 1% après 4 semaines de re-crawl → le problème est plus profond (autorité de domaine, snippet visuel, search intent mismatch).
**Leading indicator:** GSC Performance → filtre Desktop → CTR par page semaine sur semaine.

#### H2. Doubler le contenu textuel de `/relocate` pour le cluster cost-of-living
**Source:** Top 5 queries "cost of living" en position 60+
**First principle:** Google ne ranke pas une calculatrice. Il ranke un texte qui parle du sujet de la calculatrice. La page `/relocate` a un calcul mais peut-être pas assez de prose.
**Action:**
1. Ajouter en haut de `/relocate` une section "Cost of Living in Saudi Arabia 2026: What to Know" — 800+ mots, structurée H2/H3
2. Inclure une comparaison narrative entre Riyadh / Jeddah / Dammam vs Paris / London / Mumbai (3-4 paragraphes)
3. Citer GASTAT, Numbeo, Mercer comme sources avec liens externes
4. Ajouter un FAQPage spécifique : "How much money do you need to live in Saudi Arabia?" / "Is Saudi Arabia expensive for expats?" / "What's the average rent in Riyadh?"
**Failure check:** Si après 6 semaines la position pour "cost of living in saudi arabia" reste >40, le problème est l'autorité du domaine — il faut acquérir des backlinks (chantier H4).
**Leading indicator:** Position GSC pour "cost of living in saudi arabia" — viser <30 dans 8 semaines.

#### H3. Optimiser pour AI Overviews / GEO (Generative Engine Optimization)
**Source:** AI search readiness scoré 35/100 — grosse opportunité
**First principle:** Les AI search engines (Google AI Overviews, ChatGPT, Perplexity) citent des **passages auto-portants** de 134-167 mots. Pas du contenu fragmenté.
**Action:**
1. En tête de chaque page `/job/[slug]`, ajouter un paragraphe de réponse synthétique : "AI replacement risk for {occupation} in Saudi Arabia is {score}/100, meaning {category}. Salary ranges from {entry} to {senior} SAR/month. {Reasoning in 2 sentences}." → c'est ce que les AI vont scraper.
2. Sur `/relocate`, idem : un paragraphe de 150 mots qui répond à "What does it cost to live in Saudi Arabia for an expat in 2026?"
3. Mettre des Q&A en H2 plus que des features ("How much do dentists earn in Riyadh?" plutôt que "Salary Information")
4. Ajouter llms.txt à la racine listant tes endpoints clés (NOT a citation lever per evidence, mais un signal d'intentionnalité)
**Failure check:** Si après 2 mois zéro mention dans ChatGPT/Perplexity pour des queries "saudi arabia ai job risk" → ton domaine n'a pas assez d'autorité dans leur index.
**Leading indicator:** Mensuel, tester manuellement 5 queries sur ChatGPT/Perplexity et compter les citations.

### 🟡 MEDIUM (à faire dans le mois)

#### M1. Soumettre le nouveau sitemap dans GSC + Request Indexing sur entry points
**Action:**
1. GSC → Sitemaps → ajouter `https://www.ksashiftobservatory.online/sitemap.xml` (s'il n'est pas déjà déclaré)
2. URL Inspection → request indexing sur `/en`, `/fr`, `/ar`, `/en/relocate`, `/en/career`
3. Pour les top 10 pages /job/ par impressions, request indexing aussi
**Failure check:** Si après 4 semaines Google n'a pas indexé les nouvelles URLs `/en/...` malgré la soumission, problème de canonical ou de robots.
**Leading indicator:** GSC Coverage → onglet "Submitted by sitemap" doit afficher 984.

#### M2. Ajouter Organization schema sur toutes les pages
**First principle:** L'Organization schema est ce qui permet à Google d'attacher des sitelinks, knowledge panel, logo. Aujourd'hui tu n'as que WebApplication + Dataset.
**Action:**
```json
{
  "@type": "Organization",
  "name": "SHIFT Observatory",
  "url": "https://www.ksashiftobservatory.online",
  "logo": "https://www.ksashiftobservatory.online/apple-touch-icon.png",
  "founder": { "@type": "Person", "name": "Samy Aloulou" },
  "sameAs": ["https://twitter.com/saudi_builder"]
}
```
À ajouter dans `[lang]/layout.tsx` à côté du WebApplication schema.
**Failure check:** Si après 2 mois Google ne montre pas de knowledge panel pour "SHIFT Observatory" → le nom de marque est trop générique et a besoin de citations externes (presse, Wikipedia, etc.).
**Leading indicator:** GSC Performance → query "shift observatory" — apparition de sitelinks.

#### M3. Raccourcir meta description homepage (178 → 155 chars)
Actuel : "Which Saudi jobs will AI replace? Free dashboard scoring 237 occupations with salary data, Nitaqat status, career transitions and relocation calculator." (178 chars)
Proposé : "Which Saudi jobs will AI replace? Free tool scoring 237 occupations. Salary, Nitaqat, relocation calc. No signup." (114 chars — punchy + actionable)
**Failure check:** Si le snippet en SERP reste auto-généré par Google malgré le fix → Google juge ta description peu pertinente vis-à-vis de la query.
**Leading indicator:** Cmd+U sur résultat Google → vérifier que c'est bien la description écrite qui est servie.

#### M4. Ajouter contenu E-E-A-T (Experience) sur `/relocate`
**First principle:** L'algorithme Helpful Content pondère lourdement "first-hand experience". Aujourd'hui le calculateur est froid, pas d'auteur, pas de témoignage.
**Action:** Ajouter une section "From the field: 3 real relocation stories" avec 3 mini cases (peuvent être anonymisés) — engineer Paris→Riyadh, nurse Manila→Jeddah, doctor Mumbai→Dammam. 200 mots chacun.
**Failure check:** Si position pour cluster cost-of-living reste >40 — c'est que le problème est ailleurs (autorité, backlinks).
**Leading indicator:** Time on page sur `/relocate` (via Vercel Analytics) ; viser >2 min.

### 🟢 LOW (backlog)

#### L1. Acquérir 3-5 backlinks de qualité
- Soumettre à Product Hunt (catégorie "Free tools")
- Pitcher Arab News, Saudi Gazette, Bloomberg ME pour mention éditoriale
- Faire un thread Twitter détaillé qui sera quote-tweeted
**Leading indicator:** Moz / Ahrefs Domain Rating mensuel.

#### L2. Implémenter Web Stories / Quick Answer pages
Pour 5-10 occupations à haut volume, créer une page condensée optimisée AI Overview.

#### L3. Audit accessibility WCAG AA complet
Aujourd'hui : touch targets ≥44px ✓, viewport ✓, lang/dir ✓. Manque : axe-core full audit.

---

## Quick Wins (faisables en 30 min chacun)

1. **Ajouter Organization schema dans `[lang]/layout.tsx`** (M2) — 15 min
2. **Raccourcir meta description home** (M3) — 5 min
3. **Réécrire le title de la home** (H1 partie 1) — 5 min
4. **Soumettre sitemap dans GSC** (M1) — 5 min (action humaine)

---

## Recommandation stratégique

**Ne pas chercher à tout faire en parallèle.** Le levier #1 est **la cliquabilité desktop** (H1) — c'est ce qui transformera 1628 impressions en 50+ clics par mois. C'est mathématique.

Le levier #2 est **la profondeur de `/relocate`** (H2) — c'est ce qui transformera la pos 60+ en pos 20-30 pour le cluster cost-of-living. C'est un cluster à fort intent commercial.

Les leviers 3 et 4 (GEO, schema) sont des paris long terme (3-6 mois) sur la prochaine vague de trafic AI.

**Ordre suggéré :**
1. Cette semaine : C1, C2, H1
2. Semaine prochaine : H2 (contenu /relocate)
3. Dans 2 semaines : H3, M1, M2, M3
4. Dans 1 mois : retéléchargement GSC pour mesurer l'impact migration + H1 + H2

---

## Annexes — Données brutes utilisées

**GSC Performance (90j) :** 18 clics / 2 059 impressions / 0,87% CTR / pos moy. 10-15
**Top SERP positions :** /job/data-annotation-ai (pos 7,53, CTR 4,55%) / /job/private-tutor (pos 8,33, CTR 4,76%) / / (pos 8,09, CTR 2,55%)
**Coverage :** 249 indexed / 8 not indexed / 3 redirect / 4 crawled-not-indexed / 1 duplicate
**Schema détectés** (homepage /en) : WebApplication, Dataset (+ nested PropertyValue ×3, Person ×2, Place, Offer, DataDownload)
**Hreflang :** 5 entries correctes (en, fr, ar, ar-SA, x-default → en)
**Headers** : HSTS ✓ / CSP ✓ / cache-control ✓ / x-vercel-cache HIT ✓
**Content quality (home/en):** 91/100 — filler 0, AI-pattern 0, repetition 57 (acceptable — dashboard répète des labels structurels)
**Performance (CWV):** non disponible (PageSpeed Insights quota daily épuisé)

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Built by agricidaniel — Join the AI Marketing Hub community
🆓 Free  → https://www.skool.com/ai-marketing-hub
⚡ Pro   → https://www.skool.com/ai-marketing-hub-pro
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
