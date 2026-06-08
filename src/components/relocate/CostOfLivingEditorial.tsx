/**
 * Server-rendered editorial content for /[lang]/relocate.
 *
 * Purpose: rank for the "cost of living in saudi arabia" cluster, where GSC
 * reports 65+ impressions but a current position of 60-70 (page 7). The
 * calculator alone provides no crawlable textual signal — Google ranks text,
 * not interactive widgets. This component supplies ~800 words of substantive
 * editorial above and below the calculator, with H2/H3 structure and real
 * numbers from relocation-costs.ts.
 *
 * Trilingual: EN (cluster target — long form), FR (medium), AR (medium).
 *
 * Also exports an AI-search citable lede paragraph (134-167 words) for use in
 * server HTML so AI Overviews / Perplexity can quote it directly.
 */

import type { Lang } from "@/lib/i18n/context";

// ===========================================================================
// LEDE — the AI-citable opener. Placed ABOVE the calculator. Self-contained,
// answers "how much does it cost to live in Saudi Arabia in 2026?"
// ===========================================================================

const LEDE: Record<Lang, string> = {
  en: "The cost of living in Saudi Arabia in 2026 depends heavily on city, family size, and housing tier. A single expat lives comfortably in Riyadh on around SAR 9,000/month; a couple needs roughly SAR 14,000–18,000; a family of four with an international school spend closer to SAR 28,000–35,000/month. Riyadh runs about 15–20% pricier than Jeddah or Dammam, mostly due to compound housing and school inflation. The 0% income tax is the headline expat advantage — but it only pays off when paired with a fair package on housing (compound), schooling, transportation, and a yearly return flight allowance. The calculator below compares 65 line items between your current city and Riyadh, Jeddah, Dammam, Makkah, or Madinah, then projects the salary in SAR you'd need to maintain or improve your lifestyle.",
  fr: "Le coût de la vie en Arabie Saoudite en 2026 dépend fortement de la ville, de la taille du foyer et du niveau de logement. Un expatrié seul vit confortablement à Riyad avec environ 9 000 SAR/mois ; un couple a besoin de 14 000 à 18 000 SAR ; une famille de quatre avec école internationale tourne autour de 28 000 à 35 000 SAR/mois. Riyad coûte 15-20% de plus que Djeddah ou Dammam, principalement à cause des compounds et de la scolarité. L'impôt sur le revenu à 0% est l'avantage phare, mais il ne paye qu'avec un package juste sur logement, école, transport et billets retour annuels. Le calculateur compare 65 postes entre votre ville actuelle et Riyad, Djeddah, Dammam, La Mecque ou Médine, puis projette le salaire en SAR qu'il vous faudrait.",
  ar: "تختلف تكلفة المعيشة في المملكة العربية السعودية في 2026 بشكل كبير حسب المدينة وحجم العائلة ومستوى السكن. يعيش المغترب الأعزب بشكل مريح في الرياض بحوالي 9,000 ريال/شهر؛ يحتاج الزوجان إلى حوالي 14,000 إلى 18,000 ريال؛ بينما تحتاج عائلة من أربعة أفراد مع مدرسة دولية إلى حوالي 28,000 إلى 35,000 ريال/شهر. الرياض أغلى بنسبة 15-20% من جدة أو الدمام، ويعود ذلك أساساً إلى مساكن الكمباوند ورسوم المدارس. ضريبة الدخل 0% هي الميزة الأبرز للمغتربين، لكنها لا تؤتي ثمارها إلا مع حزمة عادلة للسكن والمدرسة والمواصلات وتذاكر العودة السنوية. تقارن الحاسبة 65 بنداً بين مدينتك الحالية والرياض وجدة والدمام ومكة والمدينة، وتحسب الراتب المطلوب بالريال السعودي.",
};

// ===========================================================================
// SECTIONS — placed BELOW the calculator. Each = H2 + paragraph(s).
// ===========================================================================

type Section = {
  h2: string;
  paragraphs: string[];
};

const SECTIONS: Record<Lang, Section[]> = {
  en: [
    {
      h2: "How much does it cost to live in Saudi Arabia in 2026?",
      paragraphs: [
        "Baseline monthly cost-of-living estimates for expats in 2026, including rent, groceries, transport, and basic services (excluding international school fees):",
        "Single adult in Riyadh: SAR 6,500–9,000. In Jeddah or Dammam: SAR 5,500–7,500. Couple without children in Riyadh: SAR 11,000–15,000. Family of four in Riyadh with compound housing: SAR 22,000–28,000 — before school fees. The same family in Jeddah typically saves SAR 3,000–4,000/month thanks to lower compound rents (12,500 SAR vs 18,500 SAR for a 3-bed compound).",
        "These figures assume Western-tier lifestyle (compound or premium apartment, supermarket groceries, occasional dining out, private healthcare top-up). A locally-integrated expat couple comfortable with standalone apartments and street-food dining can easily live on 30-40% less.",
      ],
    },
    {
      h2: "What salary do you need to live comfortably in Saudi Arabia?",
      paragraphs: [
        "Saudi Arabia has no personal income tax for expats — your gross salary equals your take-home, before housing and school deductions. The salary you need depends on family profile and the city.",
        "Single adult in Riyadh: SAR 10,000/month minimum, SAR 15,000 comfortable. The 5,000 SAR cushion goes to savings, occasional travel, and emergencies. Couple in Jeddah: SAR 15,000 minimum, SAR 22,000 comfortable. Family of four with an international school (American/British curriculum, mid-tier) in Riyadh: SAR 28,000 minimum, SAR 40,000 comfortable.",
        "Most employers structure expat packages with a separate housing allowance (typically 25% of base salary) and a transportation allowance (10%). When negotiating, push for an education allowance covering at least one international school per child — without it, your effective compensation drops by SAR 45,000–115,000/year per child.",
      ],
    },
    {
      h2: "Cost of Living: Saudi Arabia vs your home city",
      paragraphs: [
        "Saudi Arabia is cheaper than New York or San Francisco by roughly 30%, broadly comparable to Paris or London on housing but cheaper on dining and transport, and substantially more expensive than Mumbai, Manila, or Cairo in absolute terms — though tax-free income often makes the move still net-positive from emerging markets.",
        "From Paris to Riyadh: compound housing is similar (5,000–8,000 EUR vs 18,500 SAR ≈ 4,500 EUR), but groceries cost 20% less, restaurants 40% less. With 0% tax savings, a family of four typically nets +1,500 EUR/month equivalent.",
        "From Mumbai to Jeddah: absolute prices jump 4-5x on rent and 3x on groceries, but salaries are typically 3-5x higher in SAR equivalent, and 0% tax means the multiplier reaches 6-8x effective. The relocation pays for itself within 18 months for most professional roles.",
        "From New York to Riyadh: rent drops 50-60%, restaurants 30%, healthcare premiums 80% (employer-paid for most expat packages). A NY-based family of four saving USD 1,500/month typically saves USD 4,000–6,000/month equivalent post-relocation.",
      ],
    },
    {
      h2: "What expats often underestimate when costing Saudi Arabia",
      paragraphs: [
        "International school fees. American/British schools in Riyadh charge SAR 65,000–115,000/year per child (high school tier). Indian/Pakistani curricula run SAR 18,000–35,000/year. Without an employer-paid education allowance, two children in an American school = SAR 200,000+/year, more than many expat take-home packages.",
        "Compound vs apartment. A 3-bed standalone apartment in Riyadh runs SAR 7,950/month; the equivalent inside an expat compound with pool, gym, and security is SAR 18,500/month — a 130% premium. Most Western expat families consider compounds essential for school proximity, social life, and reduced friction with cultural norms.",
        "Yearly return flights. Most expat contracts include 1–2 economy tickets per year per family member. If not negotiated, budget SAR 3,000/person/year for Europe or SAR 5,000 for North America.",
        "EOSB (End of Service Benefit). The gratuity paid at contract end is tax-free and accrues at half-month per year for the first 5 years, then a full month per year. For a SAR 30,000/month role, 5 years = SAR 75,000 lump sum, 10 years = SAR 225,000.",
        "Cost of integration. Furnishing a compound villa: SAR 25,000–50,000 one-off. Car (lease or buy): SAR 1,500–3,000/month. Domestic help (cleaner/driver): SAR 2,000–4,000/month. None of these appear in baseline cost-of-living indexes.",
      ],
    },
  ],
  fr: [
    {
      h2: "Combien coûte la vie en Arabie Saoudite en 2026 ?",
      paragraphs: [
        "Estimations mensuelles de référence pour expatriés en 2026, hors frais de scolarité internationale :",
        "Adulte seul à Riyad : 6 500 à 9 000 SAR. À Djeddah ou Dammam : 5 500 à 7 500 SAR. Couple sans enfants à Riyad : 11 000 à 15 000 SAR. Famille de quatre à Riyad avec compound : 22 000 à 28 000 SAR — avant école. La même famille à Djeddah économise typiquement 3 000 à 4 000 SAR/mois grâce aux loyers de compound moins chers (12 500 SAR vs 18 500 SAR).",
        "Ces chiffres supposent un mode de vie occidental (compound ou appartement premium, courses en supermarché, restaurants occasionnels). Un couple expatrié intégré localement peut vivre avec 30-40% de moins.",
      ],
    },
    {
      h2: "Quel salaire pour vivre confortablement en Arabie Saoudite ?",
      paragraphs: [
        "L'Arabie Saoudite n'impose pas l'IR des expatriés — votre salaire brut équivaut à votre net, avant déductions logement et scolarité. Le salaire requis dépend du profil familial et de la ville.",
        "Adulte seul à Riyad : 10 000 SAR/mois minimum, 15 000 SAR confortable. Couple à Djeddah : 15 000 SAR minimum, 22 000 SAR confortable. Famille de quatre avec école internationale (programme américain ou britannique, milieu de gamme) à Riyad : 28 000 SAR minimum, 40 000 SAR confortable.",
        "La plupart des packages expatriés incluent une allocation logement (typiquement 25% du salaire) et transport (10%). À la négociation, exigez une allocation scolaire couvrant au moins une école internationale par enfant — sans cela, votre rémunération effective chute de 45 000 à 115 000 SAR/an par enfant.",
      ],
    },
    {
      h2: "Coût de la vie : Arabie Saoudite vs votre ville",
      paragraphs: [
        "L'Arabie Saoudite est 30% moins chère que New York ou San Francisco, comparable à Paris ou Londres sur le logement mais moins chère sur restaurants et transport, et substantiellement plus chère que Mumbai, Manille ou Le Caire en absolu — mais l'absence d'IR rend souvent l'expatriation nette-positive depuis les marchés émergents.",
        "De Paris à Riyad : compound similaire (5 000-8 000 EUR vs 18 500 SAR ≈ 4 500 EUR), courses 20% moins chères, restaurants 40% moins. Avec 0% d'impôt, une famille de quatre gagne typiquement +1 500 EUR/mois.",
        "De Mumbai à Djeddah : les prix absolus bondissent 4-5x sur le loyer et 3x sur les courses, mais les salaires SAR sont 3-5x plus élevés, et 0% d'impôt amène le multiplicateur effectif à 6-8x. L'expatriation s'amortit en 18 mois pour la plupart des rôles cadres.",
      ],
    },
    {
      h2: "Ce que les expatriés sous-estiment souvent",
      paragraphs: [
        "Frais de scolarité. Les écoles américaines/britanniques à Riyad facturent 65 000 à 115 000 SAR/an/enfant (lycée). Les programmes indiens/pakistanais : 18 000 à 35 000 SAR/an. Sans allocation scolaire, deux enfants en école américaine = 200 000+ SAR/an.",
        "Compound vs appartement. Un 3-pièces standalone à Riyad : 7 950 SAR/mois ; équivalent en compound avec piscine et sécurité : 18 500 SAR/mois — 130% de prime. La plupart des familles occidentales considèrent les compounds essentiels.",
        "Billets retour. La plupart des contrats incluent 1-2 billets éco/an/personne. À défaut, budgétez 3 000 SAR/personne pour l'Europe ou 5 000 SAR pour l'Amérique du Nord.",
        "EOSB (Indemnité de fin de service). Le gratuity en fin de contrat est défiscalisé : demi-mois/an les 5 premières années, puis mois plein. Pour un poste à 30 000 SAR/mois, 5 ans = 75 000 SAR ; 10 ans = 225 000 SAR.",
      ],
    },
  ],
  ar: [
    {
      h2: "كم تكلفة المعيشة في المملكة العربية السعودية في 2026؟",
      paragraphs: [
        "تقديرات شهرية مرجعية لتكلفة معيشة المغتربين في 2026، باستثناء رسوم المدارس الدولية:",
        "بالغ أعزب في الرياض: 6,500 إلى 9,000 ريال. في جدة أو الدمام: 5,500 إلى 7,500 ريال. زوجان بلا أطفال في الرياض: 11,000 إلى 15,000 ريال. عائلة من أربعة في الرياض مع كمباوند: 22,000 إلى 28,000 ريال — قبل رسوم المدرسة. نفس العائلة في جدة توفر عادة 3,000 إلى 4,000 ريال/شهر بفضل إيجارات الكمباوند الأقل (12,500 ريال مقابل 18,500 ريال).",
        "تفترض هذه الأرقام نمط حياة غربياً (كمباوند أو شقة فاخرة، تسوق في السوبر ماركت، تناول طعام في المطاعم أحياناً). يمكن للزوج المندمج محلياً العيش بـ 30-40% أقل.",
      ],
    },
    {
      h2: "ما الراتب اللازم للعيش بشكل مريح في المملكة العربية السعودية؟",
      paragraphs: [
        "لا تفرض المملكة العربية السعودية ضريبة دخل على المغتربين — راتبك الإجمالي يساوي صافي راتبك، قبل خصومات السكن والمدرسة. الراتب المطلوب يعتمد على ملف العائلة والمدينة.",
        "بالغ أعزب في الرياض: 10,000 ريال/شهر كحد أدنى، 15,000 ريال بشكل مريح. زوجان في جدة: 15,000 ريال كحد أدنى، 22,000 ريال بشكل مريح. عائلة من أربعة مع مدرسة دولية في الرياض: 28,000 ريال كحد أدنى، 40,000 ريال بشكل مريح.",
        "تحتوي معظم حزم المغتربين على بدل سكن (عادة 25% من الراتب) وبدل نقل (10%). عند التفاوض، اطلب بدل تعليم يغطي مدرسة دولية واحدة على الأقل لكل طفل — بدونه، تنخفض تعويضاتك الفعلية بـ 45,000 إلى 115,000 ريال/سنة لكل طفل.",
      ],
    },
    {
      h2: "تكلفة المعيشة: المملكة العربية السعودية مقارنة بمدينتك",
      paragraphs: [
        "المملكة العربية السعودية أرخص بنسبة 30% من نيويورك أو سان فرانسيسكو، مماثلة لباريس أو لندن في السكن لكن أرخص في المطاعم والنقل، وأغلى بكثير من بومباي أو مانيلا أو القاهرة بشكل مطلق — لكن غياب ضريبة الدخل يجعل الانتقال غالباً صافياً إيجابياً من الأسواق الناشئة.",
        "من بومباي إلى جدة: تقفز الأسعار المطلقة 4-5 مرات على الإيجار و3 مرات على البقالة، لكن الرواتب بالريال السعودي عادة 3-5 مرات أعلى، و 0% ضريبة يصل المضاعف الفعلي إلى 6-8 مرات. ينتج الانتقال أرباحه خلال 18 شهراً لمعظم الوظائف المهنية.",
      ],
    },
    {
      h2: "ما يقلل المغتربون من شأنه في تقدير التكلفة",
      paragraphs: [
        "رسوم المدارس الدولية. تتقاضى المدارس الأمريكية/البريطانية في الرياض 65,000 إلى 115,000 ريال/سنة/طفل (مرحلة ثانوية). المناهج الهندية/الباكستانية: 18,000 إلى 35,000 ريال/سنة. بدون بدل تعليم من صاحب العمل، طفلان في مدرسة أمريكية = 200,000+ ريال/سنة.",
        "كمباوند مقابل شقة. شقة 3 غرف مستقلة في الرياض: 7,950 ريال/شهر؛ المكافئ في كمباوند مع مسبح وأمن: 18,500 ريال/شهر — علاوة 130%. تعتبر معظم العائلات الغربية الكمباوندات ضرورية.",
        "تذاكر العودة السنوية. تشمل معظم العقود 1-2 تذاكر اقتصادية/سنة/فرد. إذا لم تُتفاوض، احسب 3,000 ريال/شخص لأوروبا أو 5,000 ريال لأمريكا الشمالية.",
        "مكافأة نهاية الخدمة. المكافأة في نهاية العقد معفاة من الضرائب: نصف شهر/سنة للسنوات الخمس الأولى، ثم شهر كامل/سنة. لمنصب براتب 30,000 ريال/شهر، 5 سنوات = 75,000 ريال؛ 10 سنوات = 225,000 ريال.",
      ],
    },
  ],
};

// ===========================================================================
// FAQ — emitted both as visible content AND JSON-LD FAQPage (in page.tsx).
// ===========================================================================

export const FAQ: Record<Lang, Array<{ q: string; a: string }>> = {
  en: [
    {
      q: "How much money do you need to live in Saudi Arabia?",
      a: "A single expat needs around SAR 10,000/month minimum to live in Riyadh (6,500 for basics + 3,500 cushion for savings, travel, emergencies). A family of four with an international school needs SAR 28,000–40,000/month. Jeddah and Dammam are 15-20% cheaper than Riyadh.",
    },
    {
      q: "Is Saudi Arabia expensive for expats?",
      a: "Compared to New York or San Francisco, Saudi Arabia is roughly 30% cheaper. Versus Paris or London, similar on housing but cheaper on dining and transport. Versus Mumbai, Manila, or Cairo, absolute prices are 3-5× higher — but tax-free income and typical 25%+ housing allowances usually make the move net-positive.",
    },
    {
      q: "What's the average rent in Riyadh in 2026?",
      a: "A 1-bedroom apartment in Riyadh city center: ~SAR 4,400/month (rent freeze active since 2025). A 3-bedroom apartment: ~SAR 7,950/month. A 3-bedroom compound villa with pool, gym, and security: ~SAR 18,500/month. The compound premium is mostly paid by employer in expat packages.",
    },
    {
      q: "How much do international schools cost in Saudi Arabia?",
      a: "American or British curriculum schools in Riyadh (high school tier): SAR 65,000–115,000/year per child. Indian or Pakistani curriculum schools: SAR 18,000–35,000/year. Most expat packages include an education allowance — without one, two children in an American school exceeds SAR 200,000/year.",
    },
    {
      q: "Is Saudi Arabia tax-free for expats?",
      a: "Yes. Saudi Arabia has 0% personal income tax for residents and expats. There is a 15% VAT on most purchases (introduced 2020), and end-of-service gratuity (EOSB) is tax-free at contract termination. The headline tax-free salary is the main financial draw of relocation.",
    },
    {
      q: "Which city in Saudi Arabia has the lowest cost of living?",
      a: "Among the 5 main cities (Riyadh, Jeddah, Dammam, Makkah, Madinah), Madinah is typically the cheapest, followed by Makkah, Dammam, Jeddah, then Riyadh. Riyadh is ~15-20% more expensive than Jeddah on housing alone. Smaller cities like Abha, Al-Khobar, or Yanbu can be 30-40% cheaper than Riyadh.",
    },
    {
      q: "What salary do I need to live comfortably in Saudi Arabia with a family?",
      a: "For a family of four in Riyadh with an international school, target SAR 35,000–40,000/month gross — including a housing allowance and education allowance. In Jeddah or Dammam, SAR 28,000–35,000 covers the same lifestyle. Without an education allowance, add SAR 5,000–10,000/month per child.",
    },
  ],
  fr: [
    {
      q: "Combien d'argent faut-il pour vivre en Arabie Saoudite ?",
      a: "Un expatrié seul a besoin d'environ 10 000 SAR/mois minimum à Riyad (6 500 pour les essentiels + 3 500 de marge). Une famille de quatre avec école internationale : 28 000 à 40 000 SAR/mois. Djeddah et Dammam sont 15-20% moins chères que Riyad.",
    },
    {
      q: "L'Arabie Saoudite est-elle chère pour les expatriés ?",
      a: "Comparé à New York ou San Francisco, environ 30% moins cher. Comparé à Paris ou Londres, similaire sur le logement mais moins cher sur restaurants et transport. Comparé à Mumbai, Manille ou Le Caire, prix absolus 3-5× plus élevés — mais l'absence d'impôt sur le revenu rend l'expatriation nette-positive.",
    },
    {
      q: "Quel est le loyer moyen à Riyad en 2026 ?",
      a: "Appartement 1 chambre centre-ville : ~4 400 SAR/mois (gel des loyers actif depuis 2025). Appartement 3 chambres : ~7 950 SAR/mois. Villa compound 3 chambres avec piscine et sécurité : ~18 500 SAR/mois.",
    },
    {
      q: "Combien coûtent les écoles internationales en Arabie Saoudite ?",
      a: "Écoles américaines/britanniques à Riyad (lycée) : 65 000 à 115 000 SAR/an/enfant. Programmes indiens/pakistanais : 18 000 à 35 000 SAR/an. La plupart des packages expatriés incluent une allocation scolaire.",
    },
    {
      q: "L'Arabie Saoudite est-elle vraiment sans impôt pour les expatriés ?",
      a: "Oui. 0% d'impôt sur le revenu pour les résidents et expatriés. TVA de 15% sur la plupart des achats. L'EOSB en fin de contrat est défiscalisée.",
    },
    {
      q: "Quelle ville d'Arabie Saoudite a le coût de la vie le plus bas ?",
      a: "Parmi les 5 grandes villes (Riyad, Djeddah, Dammam, La Mecque, Médine), Médine est généralement la moins chère, suivie de La Mecque, Dammam, Djeddah, puis Riyad.",
    },
    {
      q: "Quel salaire pour vivre confortablement en Arabie Saoudite en famille ?",
      a: "Famille de quatre à Riyad avec école internationale : viser 35 000 à 40 000 SAR/mois brut. À Djeddah ou Dammam : 28 000 à 35 000 SAR suffit.",
    },
  ],
  ar: [
    {
      q: "كم تحتاج من المال للعيش في المملكة العربية السعودية؟",
      a: "يحتاج المغترب الأعزب حوالي 10,000 ريال/شهر كحد أدنى للعيش في الرياض. تحتاج عائلة من أربعة مع مدرسة دولية إلى 28,000 إلى 40,000 ريال/شهر. جدة والدمام أرخص بنسبة 15-20% من الرياض.",
    },
    {
      q: "هل المملكة العربية السعودية مكلفة للمغتربين؟",
      a: "مقارنة بنيويورك أو سان فرانسيسكو، أرخص بنسبة 30%. مقارنة بباريس أو لندن، مماثلة في السكن وأرخص في المطاعم والنقل. مقارنة بمومباي أو مانيلا، الأسعار المطلقة أعلى 3-5 مرات — لكن غياب ضريبة الدخل وبدل السكن النموذجي بنسبة 25%+ يجعلان الانتقال صافياً إيجابياً.",
    },
    {
      q: "ما متوسط الإيجار في الرياض في 2026؟",
      a: "شقة بغرفة نوم واحدة في وسط الرياض: ~4,400 ريال/شهر (تجميد الإيجارات نشط منذ 2025). شقة 3 غرف نوم: ~7,950 ريال/شهر. فيلا كمباوند 3 غرف مع مسبح وأمن: ~18,500 ريال/شهر.",
    },
    {
      q: "كم تكلف المدارس الدولية في المملكة العربية السعودية؟",
      a: "المدارس الأمريكية/البريطانية في الرياض (المرحلة الثانوية): 65,000 إلى 115,000 ريال/سنة/طفل. مناهج هندية/باكستانية: 18,000 إلى 35,000 ريال/سنة.",
    },
    {
      q: "هل المملكة العربية السعودية معفاة من الضرائب للمغتربين؟",
      a: "نعم. 0% ضريبة دخل شخصية للمقيمين والمغتربين. ضريبة قيمة مضافة 15% على معظم المشتريات. مكافأة نهاية الخدمة معفاة من الضرائب.",
    },
    {
      q: "أي مدينة في المملكة العربية السعودية لديها أقل تكلفة معيشة؟",
      a: "من بين المدن الخمس الكبرى (الرياض وجدة والدمام ومكة والمدينة)، المدينة المنورة عادة الأرخص، تليها مكة والدمام وجدة ثم الرياض.",
    },
    {
      q: "ما الراتب المطلوب للعيش بشكل مريح في المملكة العربية السعودية مع العائلة؟",
      a: "لعائلة من أربعة في الرياض مع مدرسة دولية، استهدف 35,000 إلى 40,000 ريال/شهر إجمالي. في جدة أو الدمام، 28,000 إلى 35,000 ريال يكفي.",
    },
  ],
};

// ===========================================================================
// COMPONENT
// ===========================================================================

/** Editorial content to place ABOVE the calculator — the AI-citable lede. */
export function CostOfLivingLede({ lang }: { lang: Lang }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <section
      className="max-w-4xl mx-auto px-4 pt-8 pb-4 text-text-secondary"
      dir={dir}
    >
      <p className="text-sm md:text-base leading-relaxed">{LEDE[lang]}</p>
    </section>
  );
}

/** Editorial content to place BELOW the calculator — the long-form depth. */
export function CostOfLivingDepth({ lang }: { lang: Lang }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const sections = SECTIONS[lang];
  const faq = FAQ[lang];
  const faqHeading =
    lang === "fr"
      ? "FAQ : Coût de la vie en Arabie Saoudite"
      : lang === "ar"
        ? "أسئلة شائعة: تكلفة المعيشة في المملكة العربية السعودية"
        : "FAQ: Cost of Living in Saudi Arabia";

  return (
    <section
      className="max-w-4xl mx-auto px-4 py-12 text-text-secondary"
      dir={dir}
    >
      {sections.map((s) => (
        <div key={s.h2} className="mb-10">
          <h2 className="text-xl md:text-2xl font-semibold text-text-primary mb-4">
            {s.h2}
          </h2>
          {s.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-sm md:text-base leading-relaxed mb-3 last:mb-0"
            >
              {p}
            </p>
          ))}
        </div>
      ))}

      <div className="mt-12 pt-8 border-t border-white/10">
        <h2 className="text-xl md:text-2xl font-semibold text-text-primary mb-6">
          {faqHeading}
        </h2>
        <div className="space-y-6">
          {faq.map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-base md:text-lg font-medium text-text-primary mb-2">
                {q}
              </h3>
              <p className="text-sm md:text-base leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
