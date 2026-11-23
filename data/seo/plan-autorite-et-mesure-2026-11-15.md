# Plan SEO du 15/11/2026 : indexation, pages têtes de liste, autorité, mesure

## Baseline (avant les changements du 15/11)
- GSC 28 j (13/10-09/11) : 21 clics, 20 703 impressions dont ~15 977 = rafale de robots US (à exclure) → ~4 700 impressions réelles. Période précédente : 33 clics.
- Indexation, 30 pages métier tirées au hasard par langue (URL Inspection, 15/11) : FR 11/30 (37 %), EN 13/30 (43 %), AR 19/30 (63 %). Non indexées : ~20 % inconnues de Google, ~23 % « découvertes, non indexées », ~18 % « lues, non indexées ». Canonical correct partout.
- Liens entrants : aucune mention externe visible (recherche du nom de domaine = uniquement ses propres pages).
- Citations IA (Perplexity, 10 questions) : 2/10 (12/11), 6/10 (05/11).

## Livré le 15/11
- 4 classements (`/rankings/*`) + 17 pages secteur (`/sector/*`, noindex si < 5 métiers), 3 langues.
- `/saudization-tracker` : 17 décisions 2026 vérifiées, données ouvertes `/data/saudization-decisions.{json,csv}` (CC BY 4.0).
- Maillage : hub /job, footer, accueil. Sitemap re-soumis, IndexNow envoyé (15 URL).

## Critères de réussite (bilan à 4 semaines, 13/12/2026)
1. Pages indexées sur l'échantillon de 30 par langue : FR ≥ 55 %, EN ≥ 55 %.
2. Nouvelles pages (rankings, tracker) : au moins 8 sur 15 indexées à J+14.
3. Clics 28 j hors rafale ≥ 40 (contre 21).
4. Domaines référents : au moins 5 (mesure : Bing Webmaster / Moz gratuit, ou recherche du domaine).

## Autorité : cibles (brouillons préparés, RIEN envoyé, accord de Samy requis avant tout envoi)
A. Ressources qui listent déjà des guides Saudization (demander l'ajout d'un lien « tracker daté + données ouvertes ») : saudilifeguide.org, blogs RH (solvait.com, truesira.com, taqdeem.net, zenhr), Wego.
B. Médias qui couvrent les décisions Nitaqat : Zawya, Arab News, Gulf News, AGBI, Enterprise (newsletter AI + Innovation MENA) : angle « tableau des 17 décisions et échéances à venir, données CSV libres ».
C. Dépôts de données citables : Zenodo (DOI), Kaggle, GitHub (README + licence), data.world : publier le JSON/CSV avec lien retour.
D. Publications sur plateformes à forte autorité (LinkedIn article, Medium) reprenant un classement + lien vers la page.

### Brouillon type (A, anglais)
Objet : A dated tracker of 2026 Saudization decisions (free CSV)
Bonjour [prénom], je maintiens un suivi daté des décisions Saudization/Nitaqat de 2026 (17 décisions, avec source officielle et date d'entrée en vigueur) : https://www.ksashiftobservatory.online/en/saudization-tracker . Les données sont libres (CC BY 4.0, JSON/CSV). Si cela peut compléter votre page [titre de leur page], je serais ravi que vous l'ajoutiez. Cordialement, [signature]

### Brouillon type (B, journaliste)
Objet : Nitaqat 2026: 3 effective dates coming in the next 6 months
Bonjour [prénom], suite à votre article sur [sujet], voici un calendrier sourcé des entrées en vigueur à venir (gymnases 18/11, gestion de projet 14/02/2027, seuil Nitaqat 5 000 SAR 25/04/2027, ingénierie 35 % 09/05/2027) : [lien tracker]. Données CSV libres pour vos graphiques.

## Mesure du 23/11/2026 (J+8)
- Nouvelles pages indexées : 4/15 (EN tracker, EN classement « most at risk », EN « highest-paid », FR « most at risk ») ; 3 « découverte, non indexée » (EN/FR « safest », AR « reserved »), 8 « inconnue de Google » (dont FR et AR tracker, 3 classements AR sur 4). Critère 8/15 à J+14 (29/11) : PAS atteint à ce jour.
- Technique OK : HTTP 200, `index, follow`, canonical correct, présentes au sitemap (864 URL, 0 erreur, relu par Google le 23/11 05:18). Pages indexées explorées les 17-21/11 : Google avance, lentement. Liens internes : 5 depuis chaque hub /job, 2 depuis l'accueil, 0 lien externe.
- Impressions des nouvelles pages depuis le 15/11 : 4 (tracker EN 3, classement FR 1), 1 clic. Total site 28 j : 17 clics, 22 445 impressions (rafale robots toujours là : Inde, Royaume-Uni, Brésil).
- Diagnostic : cause = autorité et budget d'exploration (aucun lien externe), pas un défaut technique. Priorité AR (0/4 classements, tracker inconnu) car c'est la langue cible du site.
