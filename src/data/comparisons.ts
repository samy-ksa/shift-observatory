export interface ComparisonFeature {
  feature_en: string;
  feature_fr: string;
  shift: "yes" | "partial" | "no";
  competitor: "yes" | "partial" | "no";
  shift_detail_en: string;
  shift_detail_fr: string;
  competitor_detail_en: string;
  competitor_detail_fr: string;
}

export interface ComparisonData {
  slug: string;
  competitor: string;
  competitor_description_en: string;
  competitor_description_fr: string;
  competitor_url: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  features: ComparisonFeature[];
  verdict_en: string;
  verdict_fr: string;
  faq_en: { question: string; answer: string }[];
  faq_fr: { question: string; answer: string }[];
}

export const COMPARISONS: ComparisonData[] = [
  // 1. NUMBEO
  {
    slug: "numbeo",
    competitor: "Numbeo",
    competitor_description_en: "Numbeo is the world's largest cost of living database, powered by user-contributed data covering 9,000+ cities worldwide.",
    competitor_description_fr: "Numbeo est la plus grande base de données de coût de la vie au monde, alimentée par des contributions d'utilisateurs couvrant plus de 9 000 villes.",
    competitor_url: "https://www.numbeo.com",
    title_en: "SHIFT vs Numbeo: Best Cost of Living Tool for Saudi Arabia (2026)",
    title_fr: "SHIFT vs Numbeo : meilleur outil cout de la vie en Arabie Saoudite (2026)",
    description_en: "Compare SHIFT Observatory and Numbeo for Saudi Arabia cost of living, salary data, AI risk scoring, and relocation planning. Free, trilingual, 237 occupations.",
    description_fr: "Comparez SHIFT Observatory et Numbeo pour le cout de la vie, les salaires, le risque IA et la planification de relocation en Arabie Saoudite.",
    features: [
      {
        feature_en: "Saudi Arabia cost of living data",
        feature_fr: "Donnees cout de la vie en Arabie Saoudite",
        shift: "yes", competitor: "yes",
        shift_detail_en: "65+ items across 5 KSA cities with compound housing and school fees",
        shift_detail_fr: "65+ postes dans 5 villes KSA avec logement compound et frais de scolarite",
        competitor_detail_en: "General cost data, less granular for KSA specifics",
        competitor_detail_fr: "Donnees generales, moins detaillees pour les specificites KSA",
      },
      {
        feature_en: "AI automation risk scoring",
        feature_fr: "Score de risque d'automatisation IA",
        shift: "yes", competitor: "no",
        shift_detail_en: "237 occupations scored using Frey & Osborne + Eloundou methodology",
        shift_detail_fr: "237 metiers scores selon la methodologie Frey & Osborne + Eloundou",
        competitor_detail_en: "Not available",
        competitor_detail_fr: "Non disponible",
      },
      {
        feature_en: "Salary benchmarks by occupation",
        feature_fr: "Salaires par metier",
        shift: "yes", competitor: "partial",
        shift_detail_en: "Entry, median, and senior salary tiers in SAR for 237 occupations",
        shift_detail_fr: "Salaires debutant, median et senior en SAR pour 237 metiers",
        competitor_detail_en: "Average salaries only, limited occupational breakdown",
        competitor_detail_fr: "Salaires moyens uniquement, ventilation limitee par metier",
      },
      {
        feature_en: "Nitaqat / Saudization analysis",
        feature_fr: "Analyse Nitaqat / Saoudisation",
        shift: "yes", competitor: "no",
        shift_detail_en: "Band classification, reserved occupations, sector quotas",
        shift_detail_fr: "Classification par bande, metiers reserves, quotas sectoriels",
        competitor_detail_en: "Not available",
        competitor_detail_fr: "Non disponible",
      },
      {
        feature_en: "Relocation cost comparison",
        feature_fr: "Comparaison des couts de relocation",
        shift: "yes", competitor: "yes",
        shift_detail_en: "17 origin cities, personalized by family size, housing type, school tier",
        shift_detail_fr: "17 villes d'origine, personnalise par taille de famille, type de logement, ecole",
        competitor_detail_en: "City vs city comparison, generic (not personalized)",
        competitor_detail_fr: "Comparaison ville vs ville, generique (non personnalise)",
      },
      {
        feature_en: "Pre-departure checklist",
        feature_fr: "Checklist pre-depart",
        shift: "yes", competitor: "no",
        shift_detail_en: "Personalized by country of origin and profession sector",
        shift_detail_fr: "Personnalisee par pays d'origine et secteur professionnel",
        competitor_detail_en: "Not available",
        competitor_detail_fr: "Non disponible",
      },
      {
        feature_en: "Career transition recommender",
        feature_fr: "Recommandation de reconversion",
        shift: "yes", competitor: "no",
        shift_detail_en: "AI-aware career transitions with skill overlap analysis",
        shift_detail_fr: "Transitions de carriere basees sur l'IA avec analyse des competences",
        competitor_detail_en: "Not available",
        competitor_detail_fr: "Non disponible",
      },
      {
        feature_en: "Trilingual (EN/FR/AR)",
        feature_fr: "Trilingue (EN/FR/AR)",
        shift: "yes", competitor: "partial",
        shift_detail_en: "Full English, French, and Arabic support",
        shift_detail_fr: "Support complet anglais, francais et arabe",
        competitor_detail_en: "Primarily English, some partial translations",
        competitor_detail_fr: "Principalement anglais, quelques traductions partielles",
      },
      {
        feature_en: "Personalized PDF report",
        feature_fr: "Rapport PDF personnalise",
        shift: "yes", competitor: "no",
        shift_detail_en: "10-page McKinsey-style relocation analysis",
        shift_detail_fr: "Analyse de relocation de 10 pages style McKinsey",
        competitor_detail_en: "Not available",
        competitor_detail_fr: "Non disponible",
      },
      {
        feature_en: "Free and open source",
        feature_fr: "Gratuit et open source",
        shift: "yes", competitor: "partial",
        shift_detail_en: "Completely free, open data",
        shift_detail_fr: "Entierement gratuit, donnees ouvertes",
        competitor_detail_en: "Free to use, but not open source",
        competitor_detail_fr: "Gratuit a utiliser, mais pas open source",
      },
    ],
    verdict_en: "Numbeo is a great general cost-of-living tool, but SHIFT is purpose-built for Saudi Arabia with AI risk scoring, Nitaqat analysis, and personalized relocation reports that Numbeo doesn't offer.",
    verdict_fr: "Numbeo est un excellent outil general de cout de la vie, mais SHIFT est concu specifiquement pour l'Arabie Saoudite avec le scoring de risque IA, l'analyse Nitaqat et des rapports personnalises que Numbeo ne propose pas.",
    faq_en: [
      { question: "Is SHIFT better than Numbeo for Saudi Arabia?", answer: "For Saudi Arabia specifically, yes. SHIFT provides KSA-specific data including compound housing costs, international school fees, Nitaqat regulations, and AI automation risk scoring for 237 occupations. Numbeo is better for comparing cities globally." },
      { question: "Does Numbeo have AI risk data?", answer: "No. Numbeo focuses exclusively on cost of living data. SHIFT Observatory is the only free platform combining cost of living, AI automation risk, salary benchmarks, and Nitaqat analysis for Saudi Arabia." },
      { question: "Can I use both SHIFT and Numbeo?", answer: "Absolutely. They complement each other well. Use Numbeo for general global cost comparisons and SHIFT for Saudi Arabia-specific analysis including AI risk, relocation planning, and career guidance." },
    ],
    faq_fr: [
      { question: "SHIFT est-il meilleur que Numbeo pour l'Arabie Saoudite ?", answer: "Pour l'Arabie Saoudite specifiquement, oui. SHIFT fournit des donnees specifiques au KSA incluant les couts de compound, les frais scolaires internationaux, les reglementations Nitaqat et le scoring de risque IA pour 237 metiers." },
      { question: "Numbeo a-t-il des donnees sur le risque IA ?", answer: "Non. Numbeo se concentre exclusivement sur le cout de la vie. SHIFT Observatory est la seule plateforme gratuite combinant cout de la vie, risque IA, salaires et analyse Nitaqat pour l'Arabie Saoudite." },
      { question: "Peut-on utiliser SHIFT et Numbeo ensemble ?", answer: "Absolument. Ils se completent bien. Utilisez Numbeo pour les comparaisons globales et SHIFT pour l'analyse specifique a l'Arabie Saoudite." },
    ],
  },

  // 2. GLASSDOOR
  {
    slug: "glassdoor",
    competitor: "Glassdoor",
    competitor_description_en: "Glassdoor is a platform for company reviews, salary reports, and job listings, primarily focused on the US and European markets.",
    competitor_description_fr: "Glassdoor est une plateforme d'avis sur les entreprises, de rapports salariaux et d'offres d'emploi, principalement axee sur les marches americain et europeen.",
    competitor_url: "https://www.glassdoor.com",
    title_en: "SHIFT vs Glassdoor: Saudi Arabia Salary & Job Data Compared (2026)",
    title_fr: "SHIFT vs Glassdoor : salaires et emploi en Arabie Saoudite compares (2026)",
    description_en: "Compare SHIFT Observatory and Glassdoor for Saudi Arabia salary data, company reviews, AI risk scoring, and career planning. Free access vs paywall.",
    description_fr: "Comparez SHIFT Observatory et Glassdoor pour les salaires en Arabie Saoudite, avis entreprises, risque IA et planification de carriere.",
    features: [
      { feature_en: "Saudi Arabia salary data", feature_fr: "Donnees salariales Arabie Saoudite", shift: "yes", competitor: "partial", shift_detail_en: "237 occupations with entry/median/senior tiers in SAR", shift_detail_fr: "237 metiers avec 3 niveaux en SAR", competitor_detail_en: "Limited KSA data, mostly self-reported", competitor_detail_fr: "Donnees KSA limitees, principalement auto-declarees" },
      { feature_en: "AI automation risk", feature_fr: "Risque d'automatisation IA", shift: "yes", competitor: "no", shift_detail_en: "Composite score for 237 occupations", shift_detail_fr: "Score composite pour 237 metiers", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Company reviews", feature_fr: "Avis sur les entreprises", shift: "no", competitor: "yes", shift_detail_en: "Not available", shift_detail_fr: "Non disponible", competitor_detail_en: "Millions of reviews worldwide", competitor_detail_fr: "Des millions d'avis dans le monde" },
      { feature_en: "Interview questions", feature_fr: "Questions d'entretien", shift: "no", competitor: "yes", shift_detail_en: "Not available", shift_detail_fr: "Non disponible", competitor_detail_en: "Interview prep and salary negotiation tools", competitor_detail_fr: "Preparation d'entretien et outils de negociation" },
      { feature_en: "Relocation calculator", feature_fr: "Calculateur de relocation", shift: "yes", competitor: "no", shift_detail_en: "17 origin cities, personalized comparison", shift_detail_fr: "17 villes d'origine, comparaison personnalisee", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Career transitions", feature_fr: "Transitions de carriere", shift: "yes", competitor: "no", shift_detail_en: "AI-aware career path recommendations", shift_detail_fr: "Recommandations de parcours basees sur l'IA", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Free without account", feature_fr: "Gratuit sans compte", shift: "yes", competitor: "no", shift_detail_en: "No login required, completely free", shift_detail_fr: "Pas de connexion requise, entierement gratuit", competitor_detail_en: "Requires login, paywall for full data", competitor_detail_fr: "Connexion requise, paywall pour les donnees completes" },
      { feature_en: "Nitaqat analysis", feature_fr: "Analyse Nitaqat", shift: "yes", competitor: "no", shift_detail_en: "Band classification and reserved occupations", shift_detail_fr: "Classification par bande et metiers reserves", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
    ],
    verdict_en: "Glassdoor excels at company reviews and interview prep, but has limited Saudi data. SHIFT provides comprehensive KSA-specific salary, AI risk, and relocation data without requiring an account.",
    verdict_fr: "Glassdoor excelle dans les avis entreprises et la preparation d'entretien, mais a des donnees saoudiennes limitees. SHIFT fournit des donnees salariales, de risque IA et de relocation specifiques au KSA sans compte.",
    faq_en: [
      { question: "Does Glassdoor have good Saudi Arabia data?", answer: "Glassdoor has limited Saudi Arabia coverage compared to Western markets. Most KSA salary data is self-reported and sparse. SHIFT uses official GOSI data and structured salary surveys for 237 occupations." },
      { question: "Is SHIFT free unlike Glassdoor?", answer: "Yes. SHIFT Observatory is completely free with no login required. Glassdoor requires account creation and paywalls detailed salary insights behind a premium subscription." },
      { question: "Should I use Glassdoor or SHIFT for Saudi job search?", answer: "Use both. Glassdoor for company reviews and interview prep. SHIFT for salary benchmarks, AI risk assessment, Nitaqat status, and relocation cost analysis specific to Saudi Arabia." },
    ],
    faq_fr: [
      { question: "Glassdoor a-t-il de bonnes donnees sur l'Arabie Saoudite ?", answer: "Glassdoor a une couverture limitee de l'Arabie Saoudite. SHIFT utilise des donnees GOSI officielles pour 237 metiers." },
      { question: "SHIFT est-il gratuit contrairement a Glassdoor ?", answer: "Oui. SHIFT Observatory est entierement gratuit sans connexion. Glassdoor requiert un compte et reserve les donnees detaillees aux abonnes premium." },
      { question: "Dois-je utiliser Glassdoor ou SHIFT pour l'Arabie Saoudite ?", answer: "Les deux. Glassdoor pour les avis entreprises. SHIFT pour les salaires, le risque IA, le Nitaqat et les couts de relocation." },
    ],
  },

  // 3. LINKEDIN SALARY
  {
    slug: "linkedin-salary",
    competitor: "LinkedIn Salary Insights",
    competitor_description_en: "LinkedIn Salary Insights provides salary data based on self-reported member information, available primarily to LinkedIn Premium subscribers.",
    competitor_description_fr: "LinkedIn Salary Insights fournit des donnees salariales basees sur les declarations de ses membres, accessible principalement aux abonnes Premium.",
    competitor_url: "https://www.linkedin.com/salary",
    title_en: "SHIFT vs LinkedIn Salary: Saudi Arabia Salary Benchmarks (2026)",
    title_fr: "SHIFT vs LinkedIn Salary : salaires en Arabie Saoudite compares (2026)",
    description_en: "Compare SHIFT Observatory and LinkedIn Salary for KSA salary data. Free 237-occupation benchmarks vs Premium-only LinkedIn insights.",
    description_fr: "Comparez SHIFT Observatory et LinkedIn Salary pour les salaires en Arabie Saoudite. 237 metiers gratuits vs donnees Premium LinkedIn.",
    features: [
      { feature_en: "KSA salary benchmarks", feature_fr: "Salaires de reference KSA", shift: "yes", competitor: "partial", shift_detail_en: "237 occupations with 3 salary tiers", shift_detail_fr: "237 metiers avec 3 niveaux", competitor_detail_en: "Limited to Premium users, fewer KSA data points", competitor_detail_fr: "Reserve aux utilisateurs Premium, peu de donnees KSA" },
      { feature_en: "AI risk scoring", feature_fr: "Score de risque IA", shift: "yes", competitor: "no", shift_detail_en: "Composite AI automation risk for every occupation", shift_detail_fr: "Risque d'automatisation IA composite pour chaque metier", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Nitaqat status", feature_fr: "Statut Nitaqat", shift: "yes", competitor: "no", shift_detail_en: "Reserved occupations and sector quotas", shift_detail_fr: "Metiers reserves et quotas sectoriels", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Job demand signals", feature_fr: "Signaux de demande d'emploi", shift: "partial", competitor: "yes", shift_detail_en: "WEF trend indicators (growing/stable/declining)", shift_detail_fr: "Indicateurs WEF (croissance/stable/declin)", competitor_detail_en: "Real-time job posting data and hiring trends", competitor_detail_fr: "Donnees d'offres en temps reel et tendances de recrutement" },
      { feature_en: "Relocation cost calculator", feature_fr: "Calculateur de relocation", shift: "yes", competitor: "no", shift_detail_en: "Full personalized comparison with PDF report", shift_detail_fr: "Comparaison personnalisee complete avec rapport PDF", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Free access", feature_fr: "Acces gratuit", shift: "yes", competitor: "no", shift_detail_en: "Completely free, no account needed", shift_detail_fr: "Entierement gratuit, sans compte", competitor_detail_en: "Premium subscription required for full salary data", competitor_detail_fr: "Abonnement Premium requis pour les donnees completes" },
    ],
    verdict_en: "LinkedIn provides real-time hiring signals but locks salary data behind Premium. SHIFT offers free, comprehensive KSA salary benchmarks for 237 occupations plus AI risk and relocation tools.",
    verdict_fr: "LinkedIn fournit des signaux de recrutement en temps reel mais reserve les salaires au Premium. SHIFT offre gratuitement des salaires pour 237 metiers plus le risque IA et la relocation.",
    faq_en: [
      { question: "Is LinkedIn salary data accurate for Saudi Arabia?", answer: "LinkedIn has limited self-reported salary data for KSA. SHIFT uses structured salary survey data and GOSI employment figures for 237 occupations, providing more reliable Saudi-specific benchmarks." },
      { question: "Do I need LinkedIn Premium to see salary data?", answer: "Yes, LinkedIn requires Premium subscription for detailed salary insights. SHIFT Observatory provides comprehensive salary data for 237 Saudi occupations completely free." },
      { question: "Which is better for Saudi Arabia job research?", answer: "Use LinkedIn for networking and job applications. Use SHIFT for salary benchmarking, AI risk assessment, and relocation planning specific to Saudi Arabia." },
    ],
    faq_fr: [
      { question: "Les salaires LinkedIn sont-ils fiables pour l'Arabie Saoudite ?", answer: "LinkedIn a des donnees salariales KSA limitees et auto-declarees. SHIFT utilise des donnees structurees et GOSI pour 237 metiers." },
      { question: "Faut-il LinkedIn Premium pour voir les salaires ?", answer: "Oui. SHIFT offre gratuitement les salaires de 237 metiers saoudiens." },
      { question: "Lequel est meilleur pour l'Arabie Saoudite ?", answer: "LinkedIn pour le networking. SHIFT pour les salaires, le risque IA et la relocation." },
    ],
  },

  // 4. PAYSCALE
  {
    slug: "payscale",
    competitor: "PayScale",
    competitor_description_en: "PayScale provides compensation data and salary benchmarking tools, primarily for the US market with some international coverage.",
    competitor_description_fr: "PayScale fournit des donnees de remuneration et des outils de benchmarking salarial, principalement pour le marche americain.",
    competitor_url: "https://www.payscale.com",
    title_en: "SHIFT vs PayScale: Saudi Arabia Salary & Career Data (2026)",
    title_fr: "SHIFT vs PayScale : salaires et carrieres en Arabie Saoudite (2026)",
    description_en: "Compare SHIFT Observatory and PayScale for Saudi Arabia salary benchmarks, AI risk scoring, and career planning tools.",
    description_fr: "Comparez SHIFT et PayScale pour les salaires, le risque IA et la planification de carriere en Arabie Saoudite.",
    features: [
      { feature_en: "KSA salary data", feature_fr: "Donnees salariales KSA", shift: "yes", competitor: "partial", shift_detail_en: "237 occupations, 3 salary tiers in SAR", shift_detail_fr: "237 metiers, 3 niveaux en SAR", competitor_detail_en: "Limited KSA coverage, US-centric", competitor_detail_fr: "Couverture KSA limitee, centre sur les USA" },
      { feature_en: "AI automation risk", feature_fr: "Risque d'automatisation IA", shift: "yes", competitor: "no", shift_detail_en: "Composite score for 237 occupations", shift_detail_fr: "Score composite pour 237 metiers", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Nitaqat / Saudization", feature_fr: "Nitaqat / Saoudisation", shift: "yes", competitor: "no", shift_detail_en: "Full regulatory analysis", shift_detail_fr: "Analyse reglementaire complete", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Relocation calculator", feature_fr: "Calculateur de relocation", shift: "yes", competitor: "partial", shift_detail_en: "65+ cost items, personalized PDF", shift_detail_fr: "65+ postes, rapport PDF personnalise", competitor_detail_en: "Basic cost of living comparison", competitor_detail_fr: "Comparaison basique du cout de la vie" },
      { feature_en: "Career path mapping", feature_fr: "Cartographie de carriere", shift: "yes", competitor: "yes", shift_detail_en: "AI-aware transitions with skill overlap", shift_detail_fr: "Transitions basees sur l'IA avec chevauchement de competences", competitor_detail_en: "Traditional career paths, not AI-aware", competitor_detail_fr: "Parcours traditionnels, sans prise en compte de l'IA" },
      { feature_en: "Free access", feature_fr: "Acces gratuit", shift: "yes", competitor: "partial", shift_detail_en: "Completely free", shift_detail_fr: "Entierement gratuit", competitor_detail_en: "Basic free, detailed data requires payment", competitor_detail_fr: "Basique gratuit, donnees detaillees payantes" },
    ],
    verdict_en: "PayScale is strong for US compensation data but has limited Saudi coverage. SHIFT is purpose-built for KSA with AI risk scoring, Nitaqat analysis, and personalized relocation tools.",
    verdict_fr: "PayScale est fort pour les remunerations americaines mais a une couverture saoudienne limitee. SHIFT est concu pour le KSA avec risque IA, Nitaqat et outils de relocation.",
    faq_en: [
      { question: "Does PayScale cover Saudi Arabia?", answer: "PayScale has limited Saudi Arabia data compared to Western markets. SHIFT provides comprehensive KSA-specific salary benchmarks for 237 occupations based on structured survey data." },
      { question: "Is SHIFT or PayScale better for expat salary negotiation?", answer: "For Saudi Arabia, SHIFT is better. It provides KSA-specific salary tiers, tax savings calculations, and a full relocation cost comparison that PayScale doesn't offer for the Gulf region." },
      { question: "Does PayScale have AI risk data?", answer: "No. PayScale focuses on compensation data. SHIFT is the only free platform combining salary benchmarks with AI automation risk scoring for the Saudi market." },
    ],
    faq_fr: [
      { question: "PayScale couvre-t-il l'Arabie Saoudite ?", answer: "PayScale a des donnees KSA limitees. SHIFT fournit des salaires specifiques pour 237 metiers saoudiens." },
      { question: "SHIFT ou PayScale pour negocier en Arabie Saoudite ?", answer: "SHIFT est meilleur pour le KSA avec ses salaires, calculs fiscaux et comparaisons de relocation." },
      { question: "PayScale a-t-il des donnees sur le risque IA ?", answer: "Non. SHIFT est la seule plateforme gratuite combinant salaires et risque IA pour le marche saoudien." },
    ],
  },

  // 5. MERCER
  {
    slug: "mercer",
    competitor: "Mercer Cost of Living",
    competitor_description_en: "Mercer publishes the annual Cost of Living Survey ranking 227 cities worldwide, used by multinational corporations for expat compensation benchmarking.",
    competitor_description_fr: "Mercer publie l'enquete annuelle sur le cout de la vie classant 227 villes, utilisee par les multinationales pour le benchmarking des remunerations d'expatries.",
    competitor_url: "https://www.mercer.com/insights/total-rewards/cost-of-living/",
    title_en: "SHIFT vs Mercer: Saudi Arabia Cost of Living Comparison (2026)",
    title_fr: "SHIFT vs Mercer : cout de la vie en Arabie Saoudite compare (2026)",
    description_en: "Compare SHIFT Observatory (free) and Mercer ($500+ reports) for Saudi Arabia cost of living data, salary benchmarks, and relocation planning.",
    description_fr: "Comparez SHIFT (gratuit) et Mercer (500$+ par rapport) pour le cout de la vie et la relocation en Arabie Saoudite.",
    features: [
      { feature_en: "Cost of living rankings", feature_fr: "Classement cout de la vie", shift: "yes", competitor: "yes", shift_detail_en: "5 KSA cities with 65+ detailed items", shift_detail_fr: "5 villes KSA avec 65+ postes detailles", competitor_detail_en: "City ranking, aggregate indices", competitor_detail_fr: "Classement par ville, indices agreges" },
      { feature_en: "Granular cost items", feature_fr: "Postes de cout detailles", shift: "yes", competitor: "no", shift_detail_en: "Individual prices for 65+ items (groceries, rent, transport)", shift_detail_fr: "Prix individuels pour 65+ postes (alimentation, loyer, transport)", competitor_detail_en: "Aggregate indices only, no individual items", competitor_detail_fr: "Indices agreges uniquement, pas de postes individuels" },
      { feature_en: "AI risk scoring", feature_fr: "Score de risque IA", shift: "yes", competitor: "no", shift_detail_en: "237 occupations scored", shift_detail_fr: "237 metiers scores", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Free access", feature_fr: "Acces gratuit", shift: "yes", competitor: "no", shift_detail_en: "Completely free, open data", shift_detail_fr: "Entierement gratuit, donnees ouvertes", competitor_detail_en: "$500+ per city report", competitor_detail_fr: "500$+ par rapport de ville" },
      { feature_en: "Personalized to family size", feature_fr: "Personnalise par taille de famille", shift: "yes", competitor: "no", shift_detail_en: "Adjusts for adults, children, housing type, school tier", shift_detail_fr: "Ajuste par adultes, enfants, type de logement, ecole", competitor_detail_en: "Standard profiles only", competitor_detail_fr: "Profils standards uniquement" },
      { feature_en: "Salary benchmarks", feature_fr: "Salaires de reference", shift: "yes", competitor: "partial", shift_detail_en: "237 occupations, 3 tiers in SAR", shift_detail_fr: "237 metiers, 3 niveaux en SAR", competitor_detail_en: "Available in separate compensation reports", competitor_detail_fr: "Disponible dans des rapports de remuneration separes" },
    ],
    verdict_en: "Mercer is the gold standard for multinational HR departments, but costs $500+ per report. SHIFT provides free, granular cost-of-living data for Saudi Arabia with personalized relocation analysis that Mercer doesn't offer to individuals.",
    verdict_fr: "Mercer est la reference pour les DRH de multinationales, mais coute 500$+ par rapport. SHIFT offre gratuitement des donnees detaillees avec une analyse de relocation personnalisee.",
    faq_en: [
      { question: "Is SHIFT as accurate as Mercer?", answer: "SHIFT uses Numbeo crowd-sourced data and structured salary surveys while Mercer uses proprietary corporate data. For individual expat planning, SHIFT provides more granular and actionable data. For corporate HR benchmarking, Mercer remains the standard." },
      { question: "How much does Mercer cost vs SHIFT?", answer: "Mercer reports start at $500+ per city. SHIFT Observatory is completely free for all features including the relocation calculator, salary benchmarks, and AI risk scoring." },
      { question: "Can SHIFT replace Mercer for expat planning?", answer: "For individual expats, yes. SHIFT provides personalized relocation analysis with 65+ cost items, salary benchmarks, and AI risk data for free. Mercer is better suited for corporate HR departments managing large expat populations." },
    ],
    faq_fr: [
      { question: "SHIFT est-il aussi precis que Mercer ?", answer: "SHIFT utilise des donnees Numbeo et des enquetes salariales structurees. Pour la planification individuelle, SHIFT fournit des donnees plus granulaires. Pour le benchmarking RH, Mercer reste la reference." },
      { question: "Combien coute Mercer vs SHIFT ?", answer: "Les rapports Mercer coutent 500$+ par ville. SHIFT est entierement gratuit." },
      { question: "SHIFT peut-il remplacer Mercer ?", answer: "Pour les expatries individuels, oui. SHIFT offre une analyse personnalisee gratuite. Mercer est plus adapte aux DRH gerant de grandes populations d'expatries." },
    ],
  },

  // 6. BAYT
  {
    slug: "bayt",
    competitor: "Bayt.com",
    competitor_description_en: "Bayt.com is the leading job board in the Middle East and North Africa, connecting job seekers with employers across the Gulf region.",
    competitor_description_fr: "Bayt.com est le principal site d'emploi au Moyen-Orient et en Afrique du Nord, connectant les candidats aux employeurs du Golfe.",
    competitor_url: "https://www.bayt.com",
    title_en: "SHIFT vs Bayt.com: Saudi Arabia Job Market Intelligence (2026)",
    title_fr: "SHIFT vs Bayt.com : intelligence du marche de l'emploi en Arabie Saoudite (2026)",
    description_en: "Compare SHIFT Observatory and Bayt.com for Saudi Arabia job market data, salary benchmarks, AI risk scoring, and career planning.",
    description_fr: "Comparez SHIFT et Bayt.com pour les donnees du marche de l'emploi saoudien, salaires, risque IA et planification de carriere.",
    features: [
      { feature_en: "Job listings", feature_fr: "Offres d'emploi", shift: "no", competitor: "yes", shift_detail_en: "Not available (links to job boards)", shift_detail_fr: "Non disponible (liens vers les sites d'emploi)", competitor_detail_en: "Thousands of active job listings in KSA", competitor_detail_fr: "Des milliers d'offres actives en KSA" },
      { feature_en: "AI risk scoring", feature_fr: "Score de risque IA", shift: "yes", competitor: "no", shift_detail_en: "237 occupations scored", shift_detail_fr: "237 metiers scores", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Salary benchmarks", feature_fr: "Salaires de reference", shift: "yes", competitor: "partial", shift_detail_en: "Data-driven, 3 tiers for 237 occupations", shift_detail_fr: "Base sur les donnees, 3 niveaux pour 237 metiers", competitor_detail_en: "Self-reported salary data", competitor_detail_fr: "Donnees salariales auto-declarees" },
      { feature_en: "Nitaqat analysis", feature_fr: "Analyse Nitaqat", shift: "yes", competitor: "no", shift_detail_en: "Band classification and reserved occupations", shift_detail_fr: "Classification et metiers reserves", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Relocation cost", feature_fr: "Cout de relocation", shift: "yes", competitor: "no", shift_detail_en: "17 origin cities, personalized comparison", shift_detail_fr: "17 villes d'origine, comparaison personnalisee", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "CV building", feature_fr: "Creation de CV", shift: "no", competitor: "yes", shift_detail_en: "Not available", shift_detail_fr: "Non disponible", competitor_detail_en: "CV builder and career tools", competitor_detail_fr: "Creation de CV et outils carriere" },
      { feature_en: "Career transitions", feature_fr: "Transitions de carriere", shift: "yes", competitor: "no", shift_detail_en: "AI-aware career recommendations", shift_detail_fr: "Recommandations de carriere basees sur l'IA", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
    ],
    verdict_en: "Bayt.com is essential for finding job listings in the Gulf, but SHIFT complements it with salary intelligence, AI risk analysis, and relocation planning that Bayt doesn't provide.",
    verdict_fr: "Bayt.com est essentiel pour trouver des offres d'emploi dans le Golfe, mais SHIFT le complete avec des salaires, le risque IA et la relocation.",
    faq_en: [
      { question: "Should I use Bayt or SHIFT for Saudi job search?", answer: "Use both. Bayt.com for job listings and applications. SHIFT for salary negotiation data, AI risk assessment, and understanding Nitaqat regulations before applying." },
      { question: "Does Bayt have AI risk data?", answer: "No. Bayt.com focuses on job listings and CV services. SHIFT provides AI automation risk scoring for 237 occupations in Saudi Arabia." },
      { question: "Is Bayt.com salary data reliable?", answer: "Bayt salary data is self-reported by users. SHIFT uses structured salary survey data and GOSI employment figures for more reliable benchmarks." },
    ],
    faq_fr: [
      { question: "Faut-il utiliser Bayt ou SHIFT ?", answer: "Les deux. Bayt pour les offres d'emploi. SHIFT pour les salaires, le risque IA et le Nitaqat." },
      { question: "Bayt a-t-il des donnees sur le risque IA ?", answer: "Non. Bayt se concentre sur les offres d'emploi. SHIFT fournit le scoring de risque IA pour 237 metiers." },
      { question: "Les salaires Bayt sont-ils fiables ?", answer: "Les donnees Bayt sont auto-declarees. SHIFT utilise des enquetes structurees et des donnees GOSI." },
    ],
  },

  // 7. JADARAT
  {
    slug: "jadarat",
    competitor: "Jadarat",
    competitor_description_en: "Jadarat is Saudi Arabia's official national employment portal operated by HRDF, primarily serving Saudi nationals seeking private sector employment.",
    competitor_description_fr: "Jadarat est le portail national saoudien de l'emploi opere par le HRDF, servant principalement les citoyens saoudiens a la recherche d'emploi dans le secteur prive.",
    competitor_url: "https://www.jadarat.sa",
    title_en: "SHIFT vs Jadarat: Saudi Arabia Employment Data for Expats (2026)",
    title_fr: "SHIFT vs Jadarat : donnees emploi en Arabie Saoudite pour expatries (2026)",
    description_en: "Compare SHIFT Observatory and Jadarat for Saudi employment data. SHIFT serves expats with AI risk and relocation tools; Jadarat serves Saudi nationals.",
    description_fr: "Comparez SHIFT et Jadarat pour les donnees emploi saoudiennes. SHIFT pour les expatries, Jadarat pour les Saoudiens.",
    features: [
      { feature_en: "Official government platform", feature_fr: "Plateforme gouvernementale officielle", shift: "no", competitor: "yes", shift_detail_en: "Independent open-source platform", shift_detail_fr: "Plateforme open-source independante", competitor_detail_en: "Operated by Saudi HRDF", competitor_detail_fr: "Operee par le HRDF saoudien" },
      { feature_en: "Job listings (KSA)", feature_fr: "Offres d'emploi (KSA)", shift: "no", competitor: "yes", shift_detail_en: "Links to external job boards", shift_detail_fr: "Liens vers des sites d'emploi externes", competitor_detail_en: "Direct job listings for Saudi nationals", competitor_detail_fr: "Offres directes pour les Saoudiens" },
      { feature_en: "AI risk scoring", feature_fr: "Score de risque IA", shift: "yes", competitor: "no", shift_detail_en: "237 occupations scored", shift_detail_fr: "237 metiers scores", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Salary benchmarks", feature_fr: "Salaires de reference", shift: "yes", competitor: "partial", shift_detail_en: "3 tiers for 237 occupations", shift_detail_fr: "3 niveaux pour 237 metiers", competitor_detail_en: "Some salary ranges for listed positions", competitor_detail_fr: "Quelques fourchettes salariales pour les postes listes" },
      { feature_en: "Expat focus", feature_fr: "Oriente expatries", shift: "yes", competitor: "no", shift_detail_en: "Built for international workers relocating to KSA", shift_detail_fr: "Concu pour les travailleurs internationaux s'expatriant en KSA", competitor_detail_en: "Focused on Saudi nationals", competitor_detail_fr: "Axe sur les citoyens saoudiens" },
      { feature_en: "Relocation tools", feature_fr: "Outils de relocation", shift: "yes", competitor: "no", shift_detail_en: "Cost calculator, checklist, PDF report", shift_detail_fr: "Calculateur, checklist, rapport PDF", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Trilingual", feature_fr: "Trilingue", shift: "yes", competitor: "partial", shift_detail_en: "English, French, Arabic", shift_detail_fr: "Anglais, francais, arabe", competitor_detail_en: "English and Arabic", competitor_detail_fr: "Anglais et arabe" },
    ],
    verdict_en: "Jadarat is Saudi Arabia's official job portal for Saudi nationals. SHIFT serves a completely different audience: international workers evaluating relocation to KSA with AI risk, salary, and cost-of-living analysis.",
    verdict_fr: "Jadarat est le portail officiel d'emploi saoudien pour les citoyens saoudiens. SHIFT sert un public different : les travailleurs internationaux evaluant une expatriation avec risque IA, salaires et cout de la vie.",
    faq_en: [
      { question: "Can expats use Jadarat?", answer: "Jadarat primarily serves Saudi nationals seeking private sector employment. Expats should use SHIFT Observatory for salary benchmarks, AI risk data, and relocation planning, then apply through employer-sponsored channels." },
      { question: "Is Jadarat or SHIFT better for job research?", answer: "They serve different audiences. Jadarat is for Saudi nationals looking for jobs. SHIFT is for international workers evaluating Saudi Arabia as a career destination with AI risk and cost-of-living analysis." },
      { question: "Does Jadarat have AI risk data?", answer: "No. Jadarat is a job matching portal. SHIFT provides AI automation risk scoring, career transition recommendations, and labour market intelligence for 237 occupations." },
    ],
    faq_fr: [
      { question: "Les expatries peuvent-ils utiliser Jadarat ?", answer: "Jadarat est principalement pour les Saoudiens. Les expatries doivent utiliser SHIFT pour les salaires, le risque IA et la relocation." },
      { question: "Jadarat ou SHIFT pour la recherche d'emploi ?", answer: "Ils servent des publics differents. Jadarat pour les Saoudiens. SHIFT pour les internationaux evaluant l'Arabie Saoudite." },
      { question: "Jadarat a-t-il des donnees sur le risque IA ?", answer: "Non. Jadarat est un portail de matching d'emploi. SHIFT fournit le scoring de risque IA pour 237 metiers." },
    ],
  },

  // 8. LIGHTCAST
  {
    slug: "lightcast",
    competitor: "Lightcast (Emsi Burning Glass)",
    competitor_description_en: "Lightcast (formerly Emsi Burning Glass) is the leading enterprise labor market analytics platform, used by governments and corporations worldwide.",
    competitor_description_fr: "Lightcast (ex Emsi Burning Glass) est la principale plateforme d'analyse du marche du travail pour les entreprises, utilisee par les gouvernements et les multinationales.",
    competitor_url: "https://lightcast.io",
    title_en: "SHIFT vs Lightcast: AI Labour Market Data for Saudi Arabia (2026)",
    title_fr: "SHIFT vs Lightcast : donnees IA du marche du travail en Arabie Saoudite (2026)",
    description_en: "Compare SHIFT Observatory (free) and Lightcast ($50K+/year) for Saudi Arabia AI labour market intelligence, salary data, and skills taxonomy.",
    description_fr: "Comparez SHIFT (gratuit) et Lightcast (50K$+/an) pour l'intelligence du marche du travail IA en Arabie Saoudite.",
    features: [
      { feature_en: "AI labour market data", feature_fr: "Donnees IA du marche du travail", shift: "yes", competitor: "yes", shift_detail_en: "KSA focus, 237 occupations, GOSI data", shift_detail_fr: "Focus KSA, 237 metiers, donnees GOSI", competitor_detail_en: "Global coverage, billions of data points", competitor_detail_fr: "Couverture mondiale, milliards de donnees" },
      { feature_en: "Free access", feature_fr: "Acces gratuit", shift: "yes", competitor: "no", shift_detail_en: "Completely free for individuals", shift_detail_fr: "Entierement gratuit pour les individus", competitor_detail_en: "Enterprise pricing $50K+/year", competitor_detail_fr: "Tarification entreprise 50K$+/an" },
      { feature_en: "Saudi Arabia coverage", feature_fr: "Couverture Arabie Saoudite", shift: "yes", competitor: "partial", shift_detail_en: "Deep KSA focus with GOSI, Nitaqat, Vision 2030", shift_detail_fr: "Focus KSA approfondi avec GOSI, Nitaqat, Vision 2030", competitor_detail_en: "Limited MENA coverage compared to US/EU", competitor_detail_fr: "Couverture MENA limitee par rapport aux USA/UE" },
      { feature_en: "Skills taxonomy", feature_fr: "Taxonomie de competences", shift: "partial", competitor: "yes", shift_detail_en: "Skill families and transition mapping", shift_detail_fr: "Familles de competences et cartographie des transitions", competitor_detail_en: "35,000+ skills in detailed taxonomy", competitor_detail_fr: "35 000+ competences dans une taxonomie detaillee" },
      { feature_en: "Nitaqat analysis", feature_fr: "Analyse Nitaqat", shift: "yes", competitor: "no", shift_detail_en: "Band classification and sector quotas", shift_detail_fr: "Classification par bande et quotas sectoriels", competitor_detail_en: "Not available", competitor_detail_fr: "Non disponible" },
      { feature_en: "Individual user tools", feature_fr: "Outils pour les individus", shift: "yes", competitor: "no", shift_detail_en: "Career recommender, relocation calculator, checklist", shift_detail_fr: "Recommandation carriere, calculateur, checklist", competitor_detail_en: "B2B only, no individual tools", competitor_detail_fr: "B2B uniquement, pas d'outils individuels" },
    ],
    verdict_en: "Lightcast is the enterprise standard for global labour analytics but costs $50K+/year and has limited MENA coverage. SHIFT is free, focused on Saudi Arabia, and built for individual workers and small businesses.",
    verdict_fr: "Lightcast est la reference entreprise pour l'analyse mondiale du travail mais coute 50K$+/an avec une couverture MENA limitee. SHIFT est gratuit, concentre sur le KSA et concu pour les individus.",
    faq_en: [
      { question: "Is SHIFT a free alternative to Lightcast?", answer: "For Saudi Arabia specifically, yes. SHIFT provides free AI automation risk scoring, salary benchmarks, and Nitaqat analysis for 237 KSA occupations. Lightcast offers broader global data but at enterprise pricing ($50K+/year)." },
      { question: "Does Lightcast cover Saudi Arabia well?", answer: "Lightcast has limited MENA coverage compared to US and European markets. SHIFT uses official GOSI data and is purpose-built for the Saudi labour market." },
      { question: "Who should use Lightcast vs SHIFT?", answer: "Lightcast for governments, large corporations, and workforce planners needing global data. SHIFT for individual workers, expats, recruiters, and SMEs focused on Saudi Arabia." },
    ],
    faq_fr: [
      { question: "SHIFT est-il une alternative gratuite a Lightcast ?", answer: "Pour l'Arabie Saoudite, oui. SHIFT fournit gratuitement le risque IA, les salaires et l'analyse Nitaqat pour 237 metiers. Lightcast coute 50K$+/an." },
      { question: "Lightcast couvre-t-il bien l'Arabie Saoudite ?", answer: "Lightcast a une couverture MENA limitee. SHIFT utilise des donnees GOSI et est concu pour le marche du travail saoudien." },
      { question: "Qui devrait utiliser Lightcast vs SHIFT ?", answer: "Lightcast pour les gouvernements et grandes entreprises. SHIFT pour les individus et PME concentres sur l'Arabie Saoudite." },
    ],
  },
];

export function getComparison(slug: string): ComparisonData | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
