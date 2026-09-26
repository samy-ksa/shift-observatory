---
name: seo-rank-watch
description: >
  Améliore en continu le classement Google des pages de KSA Shift Observatory.
  Boucle : mesurer via GSC → choisir un mot-clé proche de la 1re position →
  analyser le besoin de recherche → faire UNE amélioration ciblée → observer
  7 jours → juger sur mesure réelle. Use when Samy dit "seo rank watch",
  "surveille le classement", "améliore le SEO", "où en sont nos mots-clés",
  ou veut lancer/poursuivre la boucle de progression SEO du site.
metadata:
  category: seo
  scope: project
---

# SEO Rank Watch

Améliore en continu le classement Google des pages du site cible (KSA Shift
Observatory).

**Objectif :** identifier les mots-clés susceptibles d'atteindre la 1re
position, effectuer une amélioration répondant à un besoin de recherche,
observer pendant 7 jours. Répéter jusqu'à atteindre la 1re place.

## Données

- `data/seo/watchwords.json` — mots-clés / pages cibles / priorité
- `data/seo/rank-history.json` — historique des classements. **Ajout
  exclusif**, jamais de réécriture des entrées passées.
- `data/seo/improvement-log.json` — historique des améliorations / status /
  date de prochaine revue

`status` possibles :
- `active` — candidat à amélioration
- `observing` — observation pendant 7 jours après amélioration
- `achieved` — 1re place atteinte, surveillance seule

## Workflow

### 1. Mesurer les classements

Utiliser principalement Google Search Console :

```
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo <REPO_PATH> --append
```

Récupérer la position moyenne GSC, impressions et clics, et vérifier les
variations de classement depuis la dernière mesure.

N'utiliser WebSearch que si GSC n'est pas disponible, ou pour vérifier le
classement du jour. Les classements WebSearch sont approximatifs ;
privilégier GSC. `position: null` + `impressions: 0` ne signifie pas
forcément "non indexé" — vérifier avec WebSearch si nécessaire avant de
conclure.

### 2. Réviser les améliorations expirées après 7 jours

Vérifier les mots-clés de `improvement-log.json` avec `nextReviewDate <=
aujourd'hui`.

**D'abord vérifier que Google a revu la page depuis l'amélioration.** Sur ce
site, Google ne recrawle une page que tous les 1 à 2 mois (mesuré le 26/09 :
aucune des 3 pages modifiées les 10, 17 et 24/09 n'avait été recrawlée). Juger
avant le recrawl revient à mesurer l'ANCIENNE version de la page :

```
node .claude/skills/seo-rank-watch/scripts/check_crawl.mjs --repo <REPO_PATH> --since <date de l'action> <targetPath>
```

- `recrawled: false` → **ne pas juger**. Laisser le status `observing`,
  repousser `nextReviewDate` de 7 jours et noter « pas encore recrawlée
  (dernier crawl : <date>) » dans le rapport. Ne pas compter la semaine comme
  « aucun effet ».
- `recrawled: true` → juger avec les jours GSC postérieurs au crawl.

Pour évaluer l'effet d'une amélioration, utiliser les 7 derniers jours GSC
(pas la moyenne 28 jours) :

```
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo <REPO_PATH> --days 7
```

- 1re place atteinte → `achieved`
- Amélioration faite mais 1re place non atteinte → `active`
- Aucun effet mesurable → `active`, et prévoir une méthode d'amélioration
  différente de la précédente pour la prochaine tentative

Enregistrer le jugement dans `improvement-log.json`.

### 3. Choisir un mot-clé à améliorer aujourd'hui

Exclure `observing` et `achieved`. Sélectionner **un seul** mot-clé, dans cet
ordre de priorité :

1. Positions 2 à 10 + impressions présentes — priorité aux plus proches de la
   1re place
2. Positions 11 à 20 + impressions élevées
3. Amélioration précédente sans effet / sans atteinte de la 1re place
4. `rank: null` à haute priorité
5. Requêtes prometteuses non encore enregistrées, trouvées via GSC

Si aucun candidat : s'arrêter après vérification des classements et rapport.
**Ne jamais forcer** la création d'une cible d'amélioration.

### 4. Analyser le besoin de recherche

Obligatoire avant toute amélioration :

1. Définir « qui recherche quoi et pourquoi » en 1 à 2 phrases
2. Vérifier les 1 à 3 premières pages actuelles via WebSearch
3. Comparer les pages en tête et la page cible
4. Identifier les écarts : informations manquantes par rapport au besoin de
   recherche

Ne pas augmenter le volume de texte pour le SEO — ajouter uniquement les
informations que les utilisateurs cherchent réellement.

### 5. Améliorer un mot-clé

Implémenter uniquement ce qui est nécessaire selon les écarts identifiés.
Exemples : title/description/intro/FAQ, contenu manquant, liens internes
(article ↔ page régionale ↔ page détaillée), données réelles manquantes. Les
liens internes doivent guider vers ce que l'utilisateur veut savoir ou faire
ensuite, pas seulement servir le maillage SEO.

- Améliorer **exactement un seul mot-clé par exécution**.
- **Ne jamais** appliquer de `noindex` ou de restructuration majeure de page
  sans proposer et obtenir l'approbation explicite de Samy.

### 6. Enregistrer l'amélioration et attendre 7 jours

Dans `improvement-log.json` :

```json
{
  "keyword": "...",
  "targetPath": "...",
  "status": "observing",
  "nextReviewDate": "aujourd'hui + 7 jours",
  "actions": [{
    "date": "...",
    "rankAtAction": 4.2,
    "needs": "besoin de recherche identifié",
    "done": "amélioration effectivement réalisée"
  }]
}
```

Commiter les changements de `data/seo/*.json` dans Git.

**Ne jamais** ré-améliorer un mot-clé en `observing` avant `nextReviewDate`.

## Rapport

À chaque exécution, fournir un rapport concis :

- Mots-clés en forte hausse / baisse depuis la dernière fois
- Jugements d'effet effectués cette fois (issus de l'étape 2)
- Mot-clé choisi aujourd'hui et raison du choix
- Besoin de recherche présumé
- Amélioration effectivement réalisée
- Mots-clés en `observing` et leur `nextReviewDate`

Ne jamais affirmer un effet d'amélioration par prédiction — rapporter ce qui
a été changé, et juger l'effet uniquement lors de la mesure réelle suivante.

## Guardrails

- Ne pas scraper les SERP Google avec des scripts propriétaires — utiliser
  GSC ou WebSearch uniquement.
- Une seule amélioration par mot-clé par exécution.
- Respecter strictement le cooldown de 7 jours pour `observing`.
- Ne jamais réécrire les données passées dans `rank-history.json` (ajout
  exclusif).
- Ne jamais afficher ni commiter de clés d'authentification ou d'informations
  secrètes.
- Ne pas appliquer de `noindex` ni de changement structurel majeur sans
  approbation.
- Ne pas affirmer un effet d'amélioration avant mesure réelle.
- Si aucune cible d'amélioration valable : ne rien faire.

**Boucle :** Mesurer → Choisir un mot proche de la 1re place → Analyser
l'intention de recherche → Améliorer → Observer 7 jours → Juger par mesure
réelle. Répéter jusqu'à la 1re place.
