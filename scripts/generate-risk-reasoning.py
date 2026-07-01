#!/usr/bin/env python3
"""
Génère un reasoning/action UNIQUE par métier (au lieu des 3 blocs fixes par tranche
de score actuellement dans JobAICitableLede.tsx — cause racine du duplicate-content
GSC : ~18 variantes de texte réutilisées sur 711 pages, seuls noms/chiffres changent).

Doctrine : le LLM ne s'appuie QUE sur les faits RÉELS du métier (spine ci-dessous),
jamais d'invention (pas de société/programme non cité dans les données). Sortie testée
sur un échantillon avant tout écrasement du master.json (0 écriture ici — dry-run only).

Usage : python3 scripts/generate-risk-reasoning.py --sample   (6 métiers-tests, affiche)
        python3 scripts/generate-risk-reasoning.py --sample --out sample_out.json
"""
import json
import os
import re
import socket
import sys
import time
import argparse
import urllib.request

# force IPv4: la résolution IPv6 (prioritaire par défaut) hang au handshake TLS
# dans cet environnement, alors que l'IPv4 répond normalement (curl le prouve)
_orig_getaddrinfo = socket.getaddrinfo
socket.getaddrinfo = lambda host, port, family=0, *a, **kw: _orig_getaddrinfo(
    host, port, socket.AF_INET, *a, **kw
)

HERE = os.path.dirname(os.path.abspath(__file__))
MASTER = os.path.join(HERE, "..", "src", "data", "master.json")
ENV_LOCAL = os.path.join(HERE, "..", ".env.local")

SAMPLE_SLUGS_EN = [
    "Data Entry Keyers", "Credit Analyst", "HR Specialists",
    "Imam/Religious Leader", "Payroll Clerks", "Software Developer",
]


def _load_api_key():
    # .env.local du projet prime sur l'environnement ambiant (qui peut porter
    # une clé sans rapport, ex. injectée pour un serveur MCP différent)
    if os.path.exists(ENV_LOCAL):
        for line in open(ENV_LOCAL):
            if line.strip().startswith("PERPLEXITY_API_KEY="):
                key = line.strip().split("=", 1)[1].strip().strip('"')
                if key:
                    return key
    if os.environ.get("PERPLEXITY_API_KEY"):
        return os.environ["PERPLEXITY_API_KEY"]
    raise RuntimeError("PERPLEXITY_API_KEY introuvable (.env.local ou env)")


def load_data():
    d = json.load(open(MASTER))
    occs = d["occupations"]["high_risk"] + d["occupations"]["low_risk"]
    sectors = {s["id"]: s for s in d["sectors"]}
    return occs, sectors


def build_spine(occ, sectors):
    """Faits RÉELS du métier + de son secteur — le SEUL matériau autorisé pour le LLM."""
    sec = sectors.get(occ.get("sector_id"), {})
    spine = {
        "name_en": occ["name_en"],
        "composite_score": occ["composite"],
        "category": occ["category"],  # substitution | augmentation
        "eloundou_llm_exposure": occ.get("eloundou"),
        "frey_osborne_automation_prob": occ.get("frey_osborne"),
        "felten_ai_exposure": occ.get("felten"),
        "sector_name": sec.get("name_en"),
        "sector_ai_risk_rationale": sec.get("ai_risk_rationale"),
        "wef_trend": occ.get("wef_trend"),
        "demand_rank_2024": occ.get("demand_rank_2024"),
        "nitaqat_status": occ.get("nitaqat_status"),
        "employment_est": occ.get("employment_est"),
        "employment_saudi_pct": occ.get("employment_saudi_pct"),
        "hrdf_programs": [h.get("name") for h in (occ.get("hrdf_programs") or [])],
    }
    return {k: v for k, v in spine.items() if v not in (None, "", [])}


SYSTEM_PROMPT = """Tu écris pour SHIFT Observatory, un site qui évalue le risque d'automatisation IA de métiers en Arabie Saoudite.

RÈGLES ABSOLUES (zéro invention) :
- Tu ne t'appuies QUE sur les faits fournis dans le JSON du métier. Aucune connaissance externe, aucun fait inventé.
- N'invente JAMAIS de nom d'entreprise, de programme, de statistique non présents dans les données fournies.
- Chaque métier doit avoir un texte GENUINEMENT DIFFÉRENT dans sa structure de phrase (pas juste les chiffres qui changent) — varie l'angle d'attaque, l'ordre des faits, le vocabulaire.
- Utilise les scores spécifiques (eloundou/frey_osborne/felten) et le rationale du secteur pour justifier le POURQUOI de ce score précis, pas une explication générique.
- Texte brut UNIQUEMENT : le résultat est inséré tel quel dans une phrase de prose. AUCUN markdown (pas de **gras**, pas de listes) et AUCUNE citation/référence (pas de [1], [2], (source)...).

ÉCHELLES DE RÉFÉRENCE (ne JAMAIS qualifier un chiffre à contresens de ces bandes) :
- frey_osborne_automation_prob (0-100) : <15 = très faible, 15-40 = modérée, 40-70 = élevée, >70 = très élevée.
- eloundou_llm_exposure (0-1) : <0.2 = très faible, 0.2-0.5 = modérée, 0.5-0.75 = élevée, >0.75 = très élevée.
- composite_score (0-100) : mêmes bandes que frey_osborne.
Si tu écris "élevé"/"faible" (ou équivalent EN/AR) à côté d'un chiffre, vérifie qu'il correspond à sa bande ci-dessus.

Réponds UNIQUEMENT en JSON strict : {"reasoning_en":"...","action_en":"...","reasoning_fr":"...","action_fr":"...","reasoning_ar":"...","action_ar":"..."}
- reasoning (EN/FR/AR) : 40-60 mots STRICT (jamais plus de 60), explique POURQUOI ce score précis (ancré sur les sous-scores/secteur fournis) sans détail secondaire superflu.
- action (EN/FR/AR) : 15-25 mots, recommandation concrète cohérente avec category (substitution→transition, augmentation→montée en compétences).
"""


def _band(value, thresholds=(15, 40, 70)):
    lo, mid, hi = thresholds
    if value < lo:
        return "low"
    if value < mid:
        return "moderate"
    if value < hi:
        return "high"
    return "very_high"


def validate(occ, spine, out):
    """Contrôles post-génération : longueur, markdown/citations résiduels,
    et cohérence qualitatif/chiffre (ex. dire 'high' à côté d'un score bas).
    Retourne la liste des problèmes trouvés (vide = OK)."""
    issues = []

    for lang in ("en", "fr", "ar"):
        r, a = out.get(f"reasoning_{lang}", ""), out.get(f"action_{lang}", "")
        if not r or not a:
            issues.append(f"{lang}: champ manquant")
            continue
        if "**" in r + a or re.search(r"\[\d+\]", r + a):
            issues.append(f"{lang}: markdown/citation résiduel")
        wr = len(r.split())
        if not (35 <= wr <= 65):
            issues.append(f"{lang}: reasoning_{lang} fait {wr} mots, la cible stricte est 40-60 mots — {'raccourcis' if wr > 60 else 'développe'}-le")

    # cohérence qualitatif/chiffre — vérifiée sur l'anglais (texte source des 3 langues)
    r_en = out.get("reasoning_en", "")
    checks = [
        ("frey_osborne_automation_prob", (15, 40, 70)),
        ("eloundou_llm_exposure", (0.2, 0.5, 0.75)),
        ("composite_score", (15, 40, 70)),
    ]
    # découpage en clauses pour ne comparer un chiffre qu'au qualificatif de SA
    # propre clause (sinon un "high" décrivant une autre métrique juste après
    # dans la phrase déclenche un faux positif — vu sur Software Developer)
    clauses = re.split(r"[,.;]| and | but | while ", r_en)
    for field, thresholds in checks:
        val = spine.get(field)
        if val is None:
            continue
        band = _band(val, thresholds)
        for num_str in (str(val), str(round(val)), str(round(val, 1))):
            clause = next((c for c in clauses if num_str in c), None)
            if clause is None:
                continue
            clause_lower = clause.lower()
            if band == "low" and re.search(r"\bhigh\b", clause_lower):
                issues.append(f"en: '{field}'={val} (bande {band}) qualifié 'high' — contresens")
            if band == "very_high" and re.search(r"\blow\b", clause_lower):
                issues.append(f"en: '{field}'={val} (bande {band}) qualifié 'low' — contresens")
            break

    return issues


def call_perplexity(api_key, spine, extra_note=None):
    user_content = f"Métier (JSON, faits réels) :\n{json.dumps(spine, ensure_ascii=False)}"
    if extra_note:
        user_content += f"\n\nCORRECTION REQUISE (relis bien la consigne) : {extra_note}"
    body = json.dumps({
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.4,
        "max_tokens": 900,
    }).encode()
    req = urllib.request.Request(
        "https://api.perplexity.ai/chat/completions",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.loads(r.read())
                content = data["choices"][0]["message"]["content"]
                content = content.strip()
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                return json.loads(content.strip())
        except Exception as e:
            if attempt == 0:
                time.sleep(2)
                continue
            raise RuntimeError(f"Perplexity KO: {e}")


def generate_validated(api_key, occ, spine, max_attempts=4):
    """Génère puis valide ; retente avec un correctif ciblé si des problèmes sont trouvés.
    Une panne réseau transitoire consomme une tentative mais n'abandonne pas l'item.
    Retourne (output, issues_du_output_retourné) — issues vide = propre, sinon needs_review.
    `out`/`issues` restent toujours synchronisés : les issues rapportées décrivent
    TOUJOURS le contenu réellement retourné, jamais une panne réseau d'une tentative
    ultérieure dont le contenu a été jeté."""
    note = None
    out, issues = None, None
    for attempt in range(1, max_attempts + 1):
        try:
            candidate = call_perplexity(api_key, spine, extra_note=note)
        except Exception as e:
            if out is None:  # aucune tentative valide encore obtenue
                issues = [f"panne réseau tentative {attempt}: {e}"]
            time.sleep(2)
            continue
        candidate_issues = validate(occ, spine, candidate)
        out, issues = candidate, candidate_issues
        if not issues:
            return out, []
        note = "problèmes détectés au tour précédent : " + "; ".join(issues) + \
               ". Corrige ces points précis, garde le reste."
        time.sleep(0.5)
    if out is None:
        raise RuntimeError(issues[0])
    return out, issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", action="store_true", help="6 métiers-tests seulement")
    ap.add_argument("--out", help="fichier JSON de sortie (sinon stdout)")
    args = ap.parse_args()

    api_key = _load_api_key()
    occs, sectors = load_data()

    # index dans `occs` = clé stable pour la fusion master.json — le nom seul ne
    # suffit pas (2 métiers y partagent le même name_en avec des scores différents :
    # Renewable Energy Technician, Cybersecurity Analyst)
    indexed = list(enumerate(occs))
    targets = [(i, o) for i, o in indexed if o["name_en"] in SAMPLE_SLUGS_EN] if args.sample else indexed
    print(f"=== génération sur {len(targets)} métier(s) ===\n", file=sys.stderr)

    results = {}
    n_review = 0
    for n, (occ_idx, occ) in enumerate(targets, 1):
        spine = build_spine(occ, sectors)
        key = f"{occ['name_en']}#{occ_idx}"
        print(f"[{n}/{len(targets)}] {occ['name_en']} (score={occ['composite']}, spine={list(spine.keys())})",
              file=sys.stderr)
        try:
            out, issues = generate_validated(api_key, occ, spine)
            entry = {"occ_index": occ_idx, "spine": spine, "generated": out}
            if issues:
                entry["needs_review"] = True
                entry["validation_issues"] = issues
                n_review += 1
                print(f"  ⚠️ needs_review après retries: {issues}", file=sys.stderr)
            results[key] = entry
        except Exception as e:
            print(f"  ⚠️ échec: {e}", file=sys.stderr)
            results[key] = {"occ_index": occ_idx, "spine": spine, "error": str(e)}
        time.sleep(0.5)  # léger throttle

    print(f"\n=== {n_review}/{len(targets)} en needs_review ===", file=sys.stderr)
    out_json = json.dumps(results, ensure_ascii=False, indent=2)
    if args.out:
        open(args.out, "w").write(out_json)
        print(f"✓ écrit dans {args.out}", file=sys.stderr)
    else:
        print(out_json)


if __name__ == "__main__":
    main()
