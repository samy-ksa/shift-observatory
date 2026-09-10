# Session SEO/perf — 05-06/08/2026

**Statut :** LIVRÉ EN PROD (11 commits, `8894dd5..2ddd35a`), en attente de mesure post-recrawl.
**Auteur :** Claude (session 2026-08-05/06)
**Décideur :** Samy
**Sujet :** connexion Google Search Console (OAuth), diagnostic complet des données réelles, corrections SEO/données/accessibilité/performance sur KSA Shift Observatory.

---

## 0. Contexte de départ

Connexion OAuth à Google Search Console pour `ksashiftobservatory.online` (compte perso Samy, scope `webmasters`). Refresh token stocké dans `.env.local` (`GSC_CLIENT_ID` / `GSC_CLIENT_SECRET` / `GSC_REFRESH_TOKEN`). Scripts d'investigation dans `scripts/gsc-*.mjs`.

But initial : comprendre ce que l'accès GSC permet de faire, puis agir dessus.

---

## 1. Diagnostic initial (données réelles, 90 jours)

- **Croissance réelle** : 28j vs 28j précédents → clics x5 (11→60), impressions x2,4, position moyenne 9,6→7,7.
- **CTR catastrophique** : 0,56% moyen (normal ~2-3% en position 8-9). 395 pages sur 443 trafiquées ont 0 clic malgré des impressions réelles.
- **Cause racine identifiée** : les titres des pages métier (palier de risque IA `<45`) révélaient le salaire complet dans le `<title>` — Google répond directement dans le SERP, plus besoin de cliquer ("zero-click search").
- **Cannibalisation structurelle** : 92→145 URLs `/job/X` sans préfixe de langue (résidus pré-migration i18n) toujours indexées séparément par Google malgré un redirect 308 fonctionnel vers `/en/job/X`, avec parfois **plus d'impressions que la version canonique**. Même bug sur `/relocate/[pair]` (60 URLs de plus).
- **Fausse alerte écartée** : le rapport sitemap "984 soumises / 0 indexées" est un artefact figé depuis juin — vérifié faux via inspection d'URL réelle (pages bien indexées, crawlées récemment).
- **Répartition pays** : USA génère le plus d'impressions (2342) mais CTR quasi nul (0,04%) — trafic hors-cible. Inde/Pakistan/Philippines/Arabie Saoudite = vraie audience.

## 2. Erreur de données découverte et corrigée : statut Nitaqat

Samy a remis en question à raison la fiabilité des données "réservé aux Saoudiens" (l'exemple donné en premier jet — femme de ménage — était une invention, pas dans les vraies données). Investigation complète :

- Liste officielle des 100 professions réservées (Décision HRSD, Article 36) récupérée et croisée avec les 37 pages marquées `reserved_saudi_only`.
- Extension avril 2026 (69 métiers administratifs supplémentaires) découverte et intégrée à la vérification.
- **16 métiers corrigés** (`sector_quota` au lieu de `reserved_saudi_only`) car absents des deux listes officielles, avec preuve contraire documentée pour plusieurs (ex: STEM Teacher — pénurie connue de profs saoudiens en sciences) :
  - 7 métiers de santé : Audiologist, Podiatrist, Clinical Psychologist, Respiratory Therapist, Physiotherapist, Infection Control Specialist, Medical Imaging Specialist
  - 9 autres : Revenue Manager (Hotels), Corporate Trainer, Islamic Banking Officer, Aviation Safety Inspector, Luxury Sales Associate, Concierge (Luxury), Fitness Center Manager, STEM Teacher, In-house Counsel
- **16 confirmées correctes** (cashiers, security-guard, receptionists, translators, government-relations-officer, general-manager, data-entry-keyers, payroll-clerks, call-center-agent, executive-secretary, recruitment-specialist, customer-service-reps, digital-marketing-manager, event-manager, document-controller, procurement-officer).
- **3 avocats spécialisés confirmés réservés en substance** (immigration/IP/real-estate lawyer) : restriction réelle mais via une autre loi (Code of Law Practice — pratique du droit réservée aux nationaux), pas le Nitaqat. `in-house-counsel` était dans ce lot au départ mais a été déplacé vers "corrigées" (rôle juriste d'entreprise, couramment tenu par des expatriés dans le Golfe, différent d'un avocat plaidant).
- **⚠️ 2 métiers laissés en zone grise, NON TRANCHÉS** : `hotel-general-manager` et `real-estate-appraiser`. Aucune preuve claire trouvée ni dans un sens ni dans l'autre pendant la session — toujours marqués `reserved_saudi_only` dans `master.json` par défaut (prudence), mais pas vérifiés avec le même niveau de rigueur que le reste. **À vérifier en priorité si on retouche ce sujet.**
- Vérifié : la logique de détection secondaire (`isReservedProfession`, matching flou contre `nitaqat.reserved_professions_100` dans `master.json`) ne produit aucun faux positif sur les 237 métiers, cohérente à 100% avec `nitaqat_status`.

**Reste 21 pages marquées "réservées"** sur les 37 initiales (16 corrigées vers "ouvert") : 16 confirmées correctes + 3 avocats + 2 non tranchées avec certitude (voir ci-dessus).

## 3. Fixes déployés (par commit)

| Commit | Quoi |
|---|---|
| `a4ed356` | Titres pages métier (114 pages, palier risque `<45`) : salaire complet → score IA + "Salary Guide" |
| `3298b42` | Titres `/relocate/[pair]` (105 pages) : générique + suffixe marque → hook chiffré (déjà écrit pour l'OG, jamais utilisé pour le SEO) |
| `ddb6507`, `f59c32c` | 16 corrections `nitaqat_status` (voir §2) |
| `ac7f380` | Parité FR sur le statut Nitaqat (FAQ schema + meta description) — la version arabe avait déjà l'info, la française jamais |
| `b3de157` | Bandeau CTA "Voir les métiers ouverts aux expatriés →" sur les pages réellement réservées (impasse → `/career`) |
| `56d941b` | Page hub `/job` (existait depuis juillet, sous-exploitée) : titre accrocheur + FAQ factuelle calculée depuis les vraies données (mieux payés, risque IA le plus bas, ratio ouvert/réservé) |
| `53288fa` | Widget de recherche/filtre interactif (`OccupationDirectory.tsx`, orphelin depuis sa création) branché sur `/job`, en complément de la liste statique (conservée pour le crawl) |
| `dca3777` | LCP homepage (5,3s → attendu <2s) : le compteur principal était cachė 1,2s par un fondu d'entrée Framer Motion — retiré |
| `372e5b0` | CSP bloquait les logos d'employeurs (Google Favicons, ~40 requêtes/visite) depuis toujours — domaine ajouté à `img-src`. Contraste insuffisant sur "OBS" (nav mobile) — corrigé |
| `2ddd35a` | Contraste systémique : token `text-muted` (#6B7280, 3,99:1) recoloré `#75808D` (4,81:1) — confirmé cassé sur 3 pages différentes, 30+ éléments. `text-gray-500` (même couleur, 99 usages/18 fichiers) unifié vers le token corrigé. `/relocate` (+ 105 pages `/relocate/[pair]`) : 3 `<select>` sans label associé corrigés, landmark `<main>` manquant ajouté |

Tous vérifiés `tsc --noEmit` + `npm run build` avant push. Aucun échec de build sur la session.

## 4. Audit Core Web Vitals (PageSpeed Insights, lab data — CrUX indisponible, trafic trop faible)

Clé API PSI dans `AIzaSyAKYmxVDpB3FC0mPBUH262TQCWy5Z7hsTI` (projet GCP lié au client OAuth GSC). ⚠️ Ne pas confondre client OAuth et clé API — PSI/CrUX refusent catégoriquement les tokens OAuth, testé et confirmé.

| Page | LCP mobile avant | Diagnostic | Statut |
|---|---|---|---|
| Homepage | 5,3s | Animation d'entrée sur l'élément LCP | ✅ Corrigé (`dca3777`) |
| Page métier | 3,5s | ~550ms diffus (CSS/police), pas de cause unique | Pas de fix simple trouvé |
| Relocate | 2,9s | Non creusé, proche du seuil | — |
| Hub /job | 0,8s | — | Déjà excellent |

Accessibilité/bonnes pratiques : 2 bugs réels trouvés et corrigés (CSP favicons, contraste — voir §3). SEO Lighthouse : 1.0 partout.

## 5. Ce qui reste EN COURS côté Samy

- **206 URLs à soumettre en suppression** dans Search Console > Suppressions (145 `/job/X` + 61 `/relocate/X` sans préfixe de langue). Listes complètes données dans le chat de session, pas sauvegardées en fichier séparé — **si besoin de les régénérer**, relancer `scripts/gsc-stale-urls-list.mjs` et `scripts/gsc-relocate-dupes-list.mjs` (nécessite `.env.local` avec les creds GSC).

## 6. Ce qui reste À DÉCIDER / PAS FAIT

- **`hotel-general-manager` et `real-estate-appraiser`** (voir §2) — statut Nitaqat non vérifié avec certitude, à trancher si le sujet est rouvert.
- **Pages hub supplémentaires** (au-delà de `/job`) — pas construites, pas demandées.
- **LCP pages métier (3,5s)** — pas de fix identifié avec certitude, nécessiterait un audit plus profond (font loading, CSS critique) si ça reste prioritaire.
- **CrUX (données de terrain réelles)** — indisponible tant que le trafic réel ne dépasse pas le seuil minimum de Google. À re-tester dans quelques mois.

## 7. Comment mesurer l'impact (à faire dans 1-3 semaines, pas avant)

Google doit recrawler les pages modifiées pour que les nouveaux titres apparaissent dans les résultats de recherche — improbable de voir un effet avant 1-2 semaines minimum.

```bash
cd /Users/samyaloulou/Projects/shift-observatory
node --env-file=.env.local scripts/gsc-investigate.mjs
```

Comparer : CTR moyen (était 0,56%), position moyenne (était 8,7), et spécifiquement re-vérifier les pages listées dans `scripts/gsc-deep-1-inventory.mjs` (top pages à 0 clic) pour voir si le CTR a bougé sur ces mêmes URLs.

## 8. Fichiers utiles créés cette session

Tous dans `scripts/`, non committés (utilitaires d'investigation, pas du code applicatif) :
- `gsc-auth.mjs` — (re)génère le refresh token OAuth si besoin
- `gsc-investigate.mjs`, `gsc-deep-1-inventory.mjs`, `gsc-deep-2-cannib-clicks.mjs` — analyses GSC
- `gsc-stale-urls-list.mjs`, `gsc-relocate-dupes-list.mjs` — génèrent les listes d'URLs à supprimer
- `gsc-reserved-impact.mjs`, `scan-saudi-reserved.mjs` — analyse des pages "réservées"
- `gsc-inspect-urls.mjs`, `gsc-test.mjs`, `gsc-relocate-pair-check.mjs` — vérifications ponctuelles

## 9. Check intermédiaire du 11/08/2026 (J+5/6, trop tôt pour conclure)

Résultat : **rien de mesurable pour l'instant, conforme à l'attente ("pas avant 1-3 semaines")**. Détail :

- **90 jours glissant** : CTR 0,57% (quasi inchangé vs 0,56% au diagnostic initial), position 8,3. Normal : la fenêtre 90j est dominée par les 3 mois d'avant le fix, un fix de 6 jours ne peut pas encore bouger cette moyenne.
- **Recrawl partiel confirmé** : `petroleum-engineer` a été re-crawlé le 05/08 à 17h56 UTC, ~5h après le push du commit `a4ed356` (12h25 UTC) — le mécanisme fonctionne. Mais `dentists` n'a toujours pas été re-crawlé depuis le **29/07** (avant le fix) — Google n'a donc pas encore vu son nouveau titre. Le recrawl se fait page par page, pas en bloc.
- **Jour par jour sur `petroleum-engineer`** (titre corrigé) : 0 clic tous les jours sauf le 06/08 (1 clic/28 impr). Rien de concluant : à ~30-45 impressions/jour sur une seule page, le bruit statistique est plus grand que l'effet attendu.
- **Jour par jour site entier** : CTR quotidien oscille entre 0% et 1,3% aussi bien avant qu'après le 05/08 — aucune rupture visible à la date du fix. Le volume (300-600 impressions/jour) est trop faible pour trancher sur 5-6 jours.
- La tendance de fond (clics/position qui s'améliorent) était déjà en cours **avant** la session SEO (croissance du site) — ne pas l'attribuer au fix tant qu'on n'a pas plus de recul.

**Action** : ne rien conclure avant le prochain check, prévu semaine du 18-25/08 (J+13 à J+20). Si `dentists` (ou d'autres pages du lot des 114) n'est toujours pas re-crawlé à ce moment-là, ça vaudra le coup de vérifier s'il y a un souci de budget de crawl plutôt que d'attendre indéfiniment.

**Point ouvert non vérifié** : les 206 suppressions d'URLs dans Search Console (§5) — statut pas revérifié pendant ce check, à confirmer avec Samy.
