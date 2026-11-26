# SHIFT Observatory — AI Labor Market Intelligence for Saudi Arabia

Free, open-source platform mapping AI automation risk of 237 occupations in Saudi Arabia.

**Live:** https://www.ksashiftobservatory.online
**Report:** [Q1 2026 AI Disruption Index (PDF)](https://www.ksashiftobservatory.online/reports/SHIFT-Q1-2026-AI-Risk-Report.pdf)

## What is SHIFT Observatory?

SHIFT scores every occupation on a composite AI automation risk index (0-100) combining:
- Automation probability (Frey & Osborne, Eloundou et al.)
- Salary impact
- Regulatory pressure (Nitaqat/Saudization)
- Demand signals (WEF Future of Jobs 2025)

## Key Data
- **237** occupations scored
- **4.45M+** expat workers tracked (GOSI Q4-2024)
- **13** Saudi regions, **20** ISIC sectors
- **100** professions reserved for Saudis
- **40** major employers ranked
- **29+** global AI layoffs tracked weekly

## Top 5 Highest Risk
| Occupation | Score | Workforce |
|---|---|---|
| Data Entry Keyers | 94.9 | 65,000 |
| Technical Writers | 93.2 | 3,800 |
| Tax Preparers | 93.1 | 9,200 |
| Telemarketers | 92.4 | 14,500 |
| Legal Secretaries | 91.5 | 5,800 |

## Top 5 Lowest Risk
| Occupation | Score | Workforce |
|---|---|---|
| Imam/Religious Leader | 5.0 | 42,000 |
| Social Workers | 11.8 | 26,500 |
| Personal Trainer | 12.0 | 22,000 |
| AI Ethics Specialist | 12.0 | 450 |
| Renewable Energy Tech | 12.0 | 6,500 |

## Features
- AI Risk Calculator (4 dimensions per occupation)
- Interactive Map (13 regions)
- Treemap Dashboard
- Saudization & Nitaqat Analysis
- Career Transition Recommender
- My Risk Profile (personalized wizard)
- Side-by-side Comparator
- SHIFT Pulse (weekly AI intelligence)
- Global AI Layoffs Tracker
- Quarterly PDF Report
- Public API

## API
```
GET /api/v1/occupations
GET /api/v1/sectors
GET /api/v1/regions
```
Free, no auth required. CC BY-SA 4.0.

## Tech Stack
Next.js 14 · React · TypeScript · Tailwind CSS · Recharts · Remotion · Perplexity API · Airtable · Vercel · jsPDF

## Data Sources
GOSI/GASTAT Q4-2024 · WEF Future of Jobs 2025 · HRSD Nitaqat · McKinsey · Frey & Osborne (2017) · Eloundou et al. (2023) · layoffs.fyi · Challenger Gray & Christmas

## Author
**Samy Aloulou** — French entrepreneur based in Riyadh Saudi Arabia. CEO of Monitoring Force Gulf.
samy@monitoringforcegulf.com

## License
CC BY-SA 4.0


## Analytics (Google Analytics 4)

- Posé le 26/11/2026 : balise GA4 `gtag.js`, identifiant de mesure `G-5BPW6GVRLZ` (flux « My website », ID 16420153237), dans le `<head>` de `src/app/[lang]/layout.tsx` (en, fr, ar).
- Le code `GTM-KKPJQMT8` (conteneur Tag Manager vide) a été essayé puis retiré : il ne mesurait rien. Ne pas le remettre : une seule balise Google par page.
- La CSP (`next.config.mjs`) autorise googletagmanager.com et google-analytics.com.
- La balise se charge sans attendre le bandeau de cookies (`CookieConsent`) : à brancher si Samy le demande.
- Statut au 26/11/2026 : « data collection pending » (jusqu'à 48 h).
