# Analyse Google Search Console — 26/09/2026

Suite de `seo-session-2026-08-05.md`. Données GSC réelles (API), fenêtre 28 j = 27/08→23/09,
comparée aux 28 j précédents (30/07→26/08). Scripts jetables dans le scratchpad de session,
logique reproductible avec `scripts/gsc-investigate.mjs` + URL Inspection.

## 1. Chiffres

| | 28 j précédents | 28 derniers j |
|---|---|---|
| Clics | 64 | 48 (−25 %) |
| Impressions | 16 020 | 14 384 (−10 %) |
| CTR | 0,40 % | 0,33 % |
| Position moyenne | 7,6 | 7,2 |

Semaines du 14 et 21/09 : 5 puis ~3 clics (contre 12-21/semaine en juillet-août). Creux à surveiller,
pas encore expliqué.

## 2. Ce que disent les données

1. **74 % des impressions = une seule page, `/en/relocate`** (10 644 impr., 23 clics, CTR 0,22 %).
   93 % des impressions du site n'ont pas de requête visible, et les requêtes visibles contiennent
   « yes », « oui », « ja », « نعم », « brendan rodgers » : signature des surfaces IA de Google (AI Mode,
   AI Overviews), où la page est citée comme source et où l'on clique très peu. Le CTR bas de cette
   page n'est donc pas un problème de titre.
2. **La vraie demande cliquable = « [métier] salary in saudi arabia »** : cloud engineer (172 impr.),
   petroleum engineer (~90 cumulées), hotel manager (~50), MLT, hospital administrator. Positions
   6-9, 0 clic. Les têtes de SERP sont Glassdoor/Payscale/ERI.
3. **Les requêtes « cost of living in saudi arabia / riyadh / ksa / jeddah »** (gros volume) : positions
   17 à 60. Hors de portée sans autorité.
4. **Le français convertit 12× mieux** : `/fr/job/*` = CTR 4,1 %, position 5,3 (13 clics sur 319 impr.).
   Algérie, France, Tunisie cliquent à 0,8-1,3 % contre 0,1-0,2 % pour USA/Inde/UK.
5. **Indexation incomplète** (échantillon URL Inspection de 60 URL du sitemap) :
   FR job 10/10 indexées · EN job 7/20 · AR job 5/10 · paires relocate 7/20.
   **Inconnues de Google** : les 2 articles `/insights/*` (en ligne depuis juin/août), le hub `/en/job`,
   `/en/career`, `/en/pulse`.
6. **Google n'avait pas relu le sitemap depuis le 04/06** → re-soumis le 26/09 via l'API.
7. **Crawl très lent** : dernier crawl médian 24/08 ; `/en/job/cloud-engineer` pas recrawlée depuis le
   13/07. Conséquence directe : les verdicts « aucun effet » de la routine SEO Rank Watch (17 et 24/09)
   mesuraient l'ancienne version des pages. Corrigé (`check_crawl.mjs`, commit `df02c0b`).
8. **Pages orphelines** : aucun lien interne vers `/insights/*` ni `/pulse/*` (ni home, ni relocate, ni
   pages métier). Le hub `/en/job` n'est lié ni depuis la home ni depuis les pages métier.
9. **`lastmod` du sitemap = heure du build pour les 1 161 URL** : chaque déploiement déclare que tout a
   changé, Google apprend à ignorer ce signal.
10. **Pages métier en recul d'impressions à position stable** : petroleum-engineer 1 064→320,
    dentists 492→8, machine-learning-engineer 390→46. À revérifier dans 2-4 semaines avant d'agir.
11. Anciennes URL `/job/X` sans langue : 14 impr. sur 28 j (109 le mois d'avant). La cannibalisation du
    05/08 se résorbe.

## 3. Plan d'amélioration, par ordre de rendement

| # | Action | Effort | Validation Samy |
|---|---|---|---|
| 1 | Liens internes : bloc « Analyses » (insights + pulse) sur home, `/relocate`, et l'article lié sur chaque page métier concernée ; lien statique vers le hub `/job` dans header/footer | faible | non |
| 2 | `lastmod` réels dans `sitemap.ts` (date des données pour les métiers, date de l'article pour les insights, date de modification pour les pages touchées par la routine) | faible | non |
| 3 | Demander l'indexation dans GSC (UI, ~10/jour) : `/en/job`, les 2 insights, `/en/career`, les 3 pages métier modifiées par la routine | 10 min | geste de Samy |
| 4 | Paires `/relocate/X-to-Y` (393 pages, quasi 0 impression, 35 % indexées) : noindex ou regroupement par ville d'origine, pour concentrer le crawl sur ce qui rapporte | moyen | **oui** (restructuration) |
| 5 | Miser sur le français : c'est le seul segment qui clique. Articles FR (le keyword_map FR du moteur n'a jamais été atteint), vérifier la complétude des pages FR | moyen | oui (ligne éditoriale) |
| 6 | Requêtes salaire : traiter le gabarit des 237 pages métier en une fois (H1/intro « X Salary in Saudi Arabia 2026 » + fourchette visible en haut) sur une cohorte de ~10 pages, plutôt qu'un mot-clé par semaine | moyen | oui (arbitrage avec le choix du 05/08 de sortir le salaire du title) |
| 7 | Autorité : quelques liens de qualité (presse, LinkedIn, communautés expat Golfe). C'est ce qui débloquera le budget de crawl sur la durée | continu | oui |

Les 5 articles déjà générés par le moteur Hermès (nurses, lawyers, pharmacists, graphic designers,
translators, score ≥ 90, jamais publiés) n'ont d'intérêt qu'après le point 1 : publiés aujourd'hui, ils
seraient orphelins comme les 2 existants.
