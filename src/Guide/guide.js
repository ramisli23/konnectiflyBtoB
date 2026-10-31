import { useState } from "react"
import { Link } from "react-router-dom"
import "./guide.css"

import {
  ArrowLeft,
  PanelLeft,
  Sun,
  Moon,
  ShoppingCart,
  LayoutDashboard,
  Package,
  Users,
  CreditCard,
  Settings,
  Coins,
  ClipboardList,
  Cloud,
  KeyRound,
  Layers,
  FileText,
  User,
  Server,
  Lightbulb,
  AlertTriangle,
  Info,
  MessageCircleQuestion,
} from "lucide-react"


/* =========================================================
   GUIDE CONTENT DATA
   ========================================================= */

const GUIDE_SECTIONS = [
  {
    id: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    title: "Dashboard",
    intro:
      "Le Dashboard est votre centre de commande. Il vous donne une vue d'ensemble en temps réel de toute l'activité de votre compte revendeur, en un seul endroit.",
    features: [
      {
        name: "Stats Overview",
        desc: "Les KPI clés en un coup d'œil — ventes totales, revenu, profit et nombre de clients pour la période sélectionnée.",
      },
      {
        name: "Summary Cards",
        desc: "Cartes de synthèse agrégées pour comparer rapidement les performances.",
      },
      {
        name: "All-Time Statistics",
        desc: "Métriques cumulées sur toute la durée de vie de votre compte revendeur.",
      },
      {
        name: "Monthly Sales Chart",
        desc: "Graphique en barres/lignes montrant le volume de ventes eSIM et la marge sur les 6 derniers mois.",
      },
      {
        name: "Customer Activity",
        desc: "Graphique suivant l'activité de votre base de clients sur les 6 derniers mois.",
      },
      {
        name: "Top 10 Overview",
        desc: "Tableau à onglets montrant votre Top 10 des pays, forfaits et revendeurs par volume de ventes.",
      },
    ],
    extra: {
      type: "tip",
      content: (
        <>
          Utilisez le <strong>Date Range Picker</strong> à côté du titre
          « Statistics » pour filtrer tous les graphiques et KPI sur une
          période personnalisée — idéal pour les revues mensuelles ou
          trimestrielles.
        </>
      ),
    },
  },

  {
    id: "Buy Packages",
    icon: <Package size={20} />,
    title: "Buy Packages",
    intro:
      "Parcourez et achetez des forfaits eSIM à revendre à vos clients finaux ou à distribuer à vos revendeurs.",
    features: [
      {
        name: "Data Only — Local",
        desc: "Forfaits data mono-pays pour un usage local.",
      },
      {
        name: "Data Only — Regional",
        desc: "Forfaits data multi-pays couvrant une région géographique.",
      },
      {
        name: "Data Only — Global",
        desc: "Forfaits data mondiaux fonctionnant dans de nombreux pays.",
      },
      {
        name: "Data + Voice — Local",
        desc: "Forfaits mono-pays incluant data et appels.",
      },
      {
        name: "Data + Voice — Regional",
        desc: "Forfaits multi-pays incluant data et voix.",
      },
      {
        name: "Data + Voice — Global",
        desc: "Forfaits mondiaux incluant les appels vocaux.",
      },
    ],
    extra: {
      type: "steps",
      title: "How to Purchase",
      steps: [
        "Cliquez sur Buy Packages dans le menu latéral.",
        "Utilisez les onglets en haut pour choisir Local, Regional ou Global.",
        "Parcourez les forfaits disponibles par pays ou région.",
        "Utilisez la barre de recherche dans l'en-tête pour trouver un pays rapidement.",
        "Cliquez sur Add to Cart sur le forfait souhaité.",
        "Vérifiez votre panier (icône en haut à droite) puis cliquez sur Checkout.",
        "Votre solde est débité immédiatement en cas de succès.",
      ],
    },
    warning: (
      <>
        Votre solde doit être suffisant avant l'achat. Rendez-vous sur{" "}
        <strong>Topup Account</strong> si votre solde est bas.
      </>
    ),
  },

  {
    id: "Dealers",
    icon: <Users size={20} />,
    title: "Dealers",
    intro:
      "Gérez les sous-revendeurs opérant sous votre compte. Les revendeurs achètent des forfaits selon vos tarifs et opèrent de manière indépendante.",
    features: [
      {
        name: "View Dealers",
        desc: "Tableau paginé et consultable listant tous vos sous-revendeurs.",
      },
      {
        name: "Add Dealer",
        desc: "Cliquez sur Add Dealer pour inviter un nouveau revendeur et créer son compte.",
      },
      {
        name: "Dealer Details",
        desc: "Cliquez sur une ligne pour voir le profil, le solde et l'historique d'achats.",
      },
      {
        name: "Credit Allocation",
        desc: "Ajustez le solde d'un revendeur depuis sa page de profil.",
      },
    ],
    extra: {
      type: "code",
      title: "Dealer Hierarchy Flow",
      content:
        "Reseller → Adds Dealer → Dealer gets portal access\n→ Dealer buys packages → Credits deducted from Dealer balance\n(Dealer balance funded by you, the Reseller)",
    },
    tip: (
      <>
        Suivez les performances de chaque revendeur depuis Dashboard → Top
        10 → onglet Dealers pour identifier vos meilleurs partenaires.
      </>
    ),
  },

  {
    id: "Credits",
    icon: <CreditCard size={20} />,
    title: "Credits",
    intro:
      "Consultez l'historique complet de vos transactions de crédits. Les crédits sont la monnaie de la plateforme utilisée pour acheter des forfaits eSIM.",
    features: [
      {
        name: "Transaction Type",
        desc: "Chaque ligne est un Débit (achat de forfait) ou un Crédit (recharge reçue).",
      },
      {
        name: "Amount",
        desc: "La valeur en crédits ajoutée ou déduite lors de chaque transaction.",
      },
      {
        name: "Date & Time",
        desc: "L'horodatage exact de chaque transaction.",
      },
      {
        name: "Reference",
        desc: "Un identifiant de référence unique pour chaque événement de crédit.",
      },
      {
        name: "Search & Pagination",
        desc: "Utilisez la barre de recherche et la pagination pour filtrer un historique volumineux.",
      },
    ],
    extra: {
      type: "info",
      content:
        "Votre solde en temps réel est toujours affiché dans l'en-tête. La page Credits ne sert qu'à consulter l'historique.",
    },
  },

  {
    id: "Purchases",
    icon: <Settings size={20} />,
    title: "Purchases",
    intro:
      "Retrouvez l'historique complet de tous les forfaits eSIM que vous avez achetés, avec leur statut d'activation.",
    features: [
      {
        name: "Order List",
        desc: "Liste paginée de tous vos achats, du plus récent au plus ancien.",
      },
      {
        name: "Status",
        desc: "Indique si un forfait est en attente, actif, expiré ou annulé.",
      },
      {
        name: "eSIM Details",
        desc: "Accédez au QR code et aux informations d'activation d'un achat.",
      },
      {
        name: "Filters",
        desc: "Filtrez par pays, date ou statut pour retrouver un achat précis.",
      },
    ],
  },

  {
    id: "Pricing",
    icon: <Coins size={20} />,
    title: "Pricing",
    intro:
      "Consultez la grille tarifaire appliquée à votre compte pour chaque forfait, ainsi que la marge que vous pouvez appliquer à vos revendeurs.",
    features: [
      {
        name: "Base Price",
        desc: "Le tarif de base négocié pour votre compte revendeur.",
      },
      {
        name: "Dealer Markup",
        desc: "La marge que vous définissez au-dessus du tarif de base pour vos revendeurs.",
      },
      {
        name: "Currency",
        desc: "Les tarifs sont affichés dans la devise associée à votre compte.",
      },
    ],
    extra: {
      type: "tip",
      content:
        "Ajustez régulièrement votre marge revendeur en fonction de la concurrence et de vos objectifs de rentabilité.",
    },
  },

  {
    id: "Policies",
    icon: <ClipboardList size={20} />,
    title: "Policies",
    intro:
      "Retrouvez ici les politiques d'utilisation, de remboursement et de communication du portail revendeur.",
    features: [
      {
        name: "Refund Policy",
        desc: "Conditions dans lesquelles un forfait peut être remboursé ou annulé.",
      },
      {
        name: "Fair Use Policy",
        desc: "Règles d'utilisation raisonnable applicables aux forfaits data illimités.",
      },
      {
        name: "Communication Policy",
        desc: "Les canaux officiels de support et les délais de réponse attendus.",
      },
    ],
  },

  {
    id: "IP Whitelist",
    icon: <Cloud size={20} />,
    title: "IP Whitelist",
    intro:
      "Restreignez l'accès à votre API en n'autorisant que les adresses IP que vous approuvez.",
    features: [
      {
        name: "Add IP",
        desc: "Ajoutez une adresse IPv4 ou une plage CIDR à votre liste blanche.",
      },
      {
        name: "Remove IP",
        desc: "Retirez une adresse à tout moment pour révoquer son accès.",
      },
      {
        name: "Status",
        desc: "Chaque entrée indique si elle est active ou en attente de propagation.",
      },
    ],
    warning:
      "Si aucune IP n'est ajoutée, l'accès API reste ouvert à toute adresse. Activez cette liste pour renforcer la sécurité.",
  },

  {
    id: "API Keys",
    icon: <KeyRound size={20} />,
    title: "API Keys",
    intro:
      "Générez et gérez les clés utilisées pour authentifier vos appels à l'API eSIM.",
    features: [
      {
        name: "Generate Key",
        desc: "Créez une nouvelle clé secrète pour un environnement de production ou de test.",
      },
      {
        name: "Revoke Key",
        desc: "Désactivez immédiatement une clé compromise ou obsolète.",
      },
      {
        name: "Scopes",
        desc: "Limitez une clé à certaines actions (lecture seule, achats, gestion des revendeurs).",
      },
    ],
    warning:
      "Ne partagez jamais votre clé secrète en clair. Utilisez des variables d'environnement côté serveur.",
  },

  {
    id: "Topup",
    icon: <Layers size={20} />,
    title: "Topup",
    intro:
      "Rechargez le solde de votre compte revendeur pour pouvoir acheter des forfaits.",
    features: [
      {
        name: "Choose Amount",
        desc: "Sélectionnez ou saisissez le montant à recharger.",
      },
      {
        name: "Payment Method",
        desc: "Choisissez parmi les moyens de paiement disponibles pour votre compte.",
      },
      {
        name: "Confirmation",
        desc: "Le solde est mis à jour instantanément dans l'en-tête après validation.",
      },
    ],
  },

  {
    id: "API Docs",
    icon: <FileText size={20} />,
    title: "API Docs",
    intro:
      "Documentation technique complète pour intégrer l'API eSIM à vos propres systèmes.",
    features: [
      {
        name: "Endpoints",
        desc: "Liste de toutes les routes disponibles avec leurs paramètres.",
      },
      {
        name: "Authentication",
        desc: "Comment authentifier vos requêtes avec une clé API.",
      },
      {
        name: "Code Samples",
        desc: "Exemples de code prêts à l'emploi dans plusieurs langages.",
      },
    ],
  },

  {
    id: "Account",
    icon: <User size={20} />,
    title: "Account",
    intro:
      "Gérez les informations de votre compte revendeur et les paramètres de sécurité.",
    features: [
      {
        name: "Company Info",
        desc: "Nom de l'agence, coordonnées et informations de facturation.",
      },
      {
        name: "Security",
        desc: "Modifiez votre mot de passe et activez l'authentification à deux facteurs.",
      },
      {
        name: "Notifications",
        desc: "Choisissez les alertes que vous souhaitez recevoir par email.",
      },
    ],
  },

  {
    id: "Server Status",
    icon: <Server size={20} />,
    title: "Server Status",
    intro:
      "Vérifiez en temps réel la disponibilité des services de la plateforme (API, portail, provisioning eSIM).",
    features: [
      {
        name: "Uptime",
        desc: "Le pourcentage de disponibilité de chaque service sur les 30 derniers jours.",
      },
      {
        name: "Incidents",
        desc: "Historique des incidents passés avec leur résolution.",
      },
      {
        name: "Live Status",
        desc: "Indicateur de statut en direct : opérationnel, dégradé ou en panne.",
      },
    ],
  },
]


/* =========================================================
   SMALL SUB-COMPONENTS
   ========================================================= */

function FeatureTable({ features }) {
  return (
    <div className="guide-table">
      <div className="guide-table-row guide-table-head">
        <span>Feature</span>
        <span>Description</span>
      </div>

      {features.map((f) => (
        <div className="guide-table-row" key={f.name}>
          <span className="guide-table-feature">{f.name}</span>
          <span className="guide-table-desc">{f.desc}</span>
        </div>
      ))}
    </div>
  )
}

function StepsList({ title, steps }) {
  return (
    <>
      <h4 className="guide-subheading">{title}</h4>

      <ol className="guide-steps">
        {steps.map((s, i) => (
          <li key={i}>
            <span className="guide-step-badge">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

function CodeBlock({ title, content }) {
  return (
    <>
      <h4 className="guide-subheading">{title}</h4>
      <pre className="guide-code">{content}</pre>
    </>
  )
}

function CalloutBox({ type, children }) {
  const icon =
    type === "warning" ? (
      <AlertTriangle size={17} />
    ) : type === "info" ? (
      <Info size={17} />
    ) : (
      <Lightbulb size={17} />
    )

  return (
    <div className={`guide-callout guide-callout-${type}`}>
      {icon}
      <span>{children}</span>
    </div>
  )
}


/* =========================================================
   GUIDE PAGE
   ========================================================= */

export default function Guide({ onBack }) {
  const [activeId, setActiveId] = useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const section =
    GUIDE_SECTIONS.find((s) => s.id === activeId) || GUIDE_SECTIONS[0]

  return (
    <div className={`guide-app ${darkMode ? "guide-dark" : ""}`}>

      {/* ================= TOP BAR ================= */}

      <header className="guide-topbar">
        <div className="guide-topbar-left">
          <button
            className="guide-icon-btn"
            onClick={onBack}
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            className="guide-icon-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Basculer le menu"
          >
            <PanelLeft size={18} />
          </button>

          <span className="guide-topbar-divider" />

          <span className="guide-topbar-title">Dashboard</span>
        </div>

      </header>


      <div className="guide-body">

        {/* ================= HERO CARD ================= */}

        <div className="guide-hero-card">
          <div className="guide-badges">
            <span className="guide-badge guide-badge-teal">
              Reseller Portal
            </span>
            <span className="guide-badge guide-badge-purple">
              User Guide
            </span>
          </div>

          <h2 className="guide-hero-title">Reseller Portal — User Guide</h2>

          <p className="guide-hero-subtitle">
            Tout ce qu'il vous faut pour gérer votre activité de revendeur
            eSIM&nbsp;: de l'achat de forfaits et la gestion des revendeurs
            à la configuration de l'accès API et au suivi de vos
            performances.
          </p>
        </div>


        <div className="guide-main">

          {/* ================= SIDEBAR ================= */}

          {sidebarOpen && (
            <nav className="guide-sidebar">
              {GUIDE_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  className={`guide-nav-item ${
                    activeId === s.id ? "is-active" : ""
                  }`}
                  onClick={() => setActiveId(s.id)}
                >
                  {s.icon}
                  <span>{s.id}</span>
                </button>
              ))}
            </nav>
          )}


          {/* ================= CONTENT ================= */}

          <section className="guide-content">
            <h3 className="guide-content-title">
              {section.icon}
              {section.title}
            </h3>

            <p className="guide-content-intro">{section.intro}</p>

            <FeatureTable features={section.features} />

            {section.extra?.type === "tip" && (
              <div className="guide-extra-block">
                <CalloutBox type="tip">{section.extra.content}</CalloutBox>
              </div>
            )}

            {section.extra?.type === "info" && (
              <div className="guide-extra-block">
                <CalloutBox type="info">{section.extra.content}</CalloutBox>
              </div>
            )}

            {section.extra?.type === "steps" && (
              <div className="guide-extra-block">
                <StepsList
                  title={section.extra.title}
                  steps={section.extra.steps}
                />
              </div>
            )}

            {section.extra?.type === "code" && (
              <div className="guide-extra-block">
                <CodeBlock
                  title={section.extra.title}
                  content={section.extra.content}
                />
              </div>
            )}

            {section.tip && (
              <div className="guide-extra-block">
                <CalloutBox type="tip">{section.tip}</CalloutBox>
              </div>
            )}

            {section.warning && (
              <div className="guide-extra-block">
                <CalloutBox type="warning">{section.warning}</CalloutBox>
              </div>
            )}
          </section>

        </div>


        {/* ================= FOOTER ================= */}

        <footer className="guide-footer">
          <MessageCircleQuestion size={16} />
          <span>
            Need help? Contact support via <strong>WhatsApp</strong> or{" "}
            <strong>resellertechnical@esimcard.com</strong>. Check the{" "}
            <Link to="/dashboard/policy" className="guide-link">
              Communication Policy
            </Link>{" "}
            page for all support channels.
          </span>
        </footer>

      </div>
    </div>
  )
}