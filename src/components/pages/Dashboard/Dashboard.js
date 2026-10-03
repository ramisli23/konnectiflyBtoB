import { useState, useMemo, useEffect } from "react"

import {
  Wallet,
  Coins,
  Globe2,
  Box,
  Handshake,
  TrendingUp,
  Smartphone,
  Boxes,
  ClipboardCheck,
  BarChart3,
  LineChart as LineChartIcon,
  CreditCard,
  Package,
  FileText,
  Users,
  ShoppingCart,
  MapPin,
  Globe,
  ChevronDown,
  Search,
  LifeBuoy,
} from "lucide-react"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import "./Dashboard.css"
import {
  subscribeToAgencyBalance,
} from "../../../services/balanceService"

import PackageDetail from "../../../components/packages/packageDetail.js"
import Packages from "../Packages/CountryPage.js"
import BuyPackages from "../Packages/BuyPackage.js"
import Dealers from "../Dealers/Dealers.js"
import Credits from "../Credits/credits.js"
import Guide from "../../../Guide/guide.js"
import Policy from "../../../policy/CommunicationPolicy.js"


/* =========================================================
   MAIN DASHBOARD ROUTER
   ========================================================= */

export default function Dashboard({ page, user }) {
  switch (page) {
    case "Dashboard":
      return <DashboardHome user={user} />

    case "Packages":
      return <BuyPackages />

    case "Dealers":
      return <Dealers />

    case "Credits":
      return <Credits />

    case "Settings":
      return <SettingsPage />

      case "Guide":
      return <Guide />
      case "Policy":
      return <Policy/>

    case "Help":
      return <HelpPage />

    default:
      return <DashboardHome user={user} />
  }
}


/* =========================================================
   DASHBOARD STATS
   ========================================================= */

function useDashboardStats(user) {
  return useMemo(
    () => ({
    business: [
  {
    label: "All Bundles Amount",
    value: `${Number(user?.balance ?? 0).toFixed(2)} DZD`,
    icon: <Coins size={22} />,
    dark: true,
  },

  {
    label: "Wallet Refill",
    value: "0 ",
    icon: <Wallet size={22} />,
  },

  {
    label: "Dealer Sale Amount",
    value: "$0",
    icon: <Handshake size={22} />,
  },

  {
    label: "Dealer Profit",
    value: "0 DZD",
    icon: <TrendingUp size={22} />,
  },
],

      operations: [
        {
          label: "eSIM Sold",
          value: 0,
          icon: <Globe2 size={22} />,
          dark: true,
        },
        {
          label: "Bundle Count",
          value: 0,
          icon: <Box size={22} />,
        },
        {
          label: "Dealer eSIM Sold",
          value: 0,
          icon: <Smartphone size={22} />,
        },
        {
          label: "Dealer Bundle Count",
          value: 0,
          icon: <Boxes size={22} />,
        },
      ],

      bundleSold: {
        regional: 0,
        local: 0,
        global: 0,
      },

      allTime: [
        {
          label: "Total Wallet Refill",
          value: "$100",
          icon: <CreditCard size={17} />,
        },
        {
          label: "Total Bundles Sold",
          value: "$34",
          icon: <Package size={17} />,
        },
        {
          label: "Total eSIM Sold",
          value: "$21",
          icon: <FileText size={17} />,
        },
        {
          label: "Total Dealers",
          value: "$1",
          icon: <Users size={17} />,
        },
        {
          label: "Dealer Sales",
          value: "$0",
          icon: <ShoppingCart size={17} />,
        },
        {
          label: "Dealer Profit",
          value: "$0",
          icon: <LineChartIcon size={17} />,
        },
      ],

      monthly: [
        {
          month: "Apr",
          esim_sold: 3,
          bundle_count: 2,
          sale: 6,
          profit: 1,
        },
        {
          month: "May",
          esim_sold: 4,
          bundle_count: 3,
          sale: 9,
          profit: 2,
        },
        {
          month: "Jun",
          esim_sold: 6,
          bundle_count: 5,
          sale: 13,
          profit: 3,
        },
        {
          month: "Jul",
          esim_sold: 4,
          bundle_count: 3,
          sale: 9,
          profit: 2,
        },
        {
          month: "Aug",
          esim_sold: 2,
          bundle_count: 1,
          sale: 3,
          profit: 1,
        },
        {
          month: "Sep",
          esim_sold: 21,
          bundle_count: 8,
          sale: 62,
          profit: 12,
        },
      ],
    }),
    [user]
  )
}


/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({ icon, label, value, dark }) {
  return (
    <div className={`metric-card ${dark ? "metric-card-dark" : ""}`}>
      <div className="metric-card-text">
        <span className="metric-card-label">{label}</span>

        <strong className="metric-card-value">
          {value}
        </strong>
      </div>

      <div className="metric-card-icon">
        {icon}
      </div>
    </div>
  )
}


/* =========================================================
   BUNDLE SOLD MINI CARD
   ========================================================= */

function BundleSoldMini({ icon, label, value, tint }) {
  return (
    <div className="bundle-mini">

      <div
        className={`bundle-mini-icon bundle-mini-icon-${tint}`}
      >
        {icon}
      </div>

      <p className="bundle-mini-label">
        {label}
      </p>

      <p className="bundle-mini-value">
        {value}
      </p>

    </div>
  )
}


/* =========================================================
   DASHBOARD HOME
   ========================================================= */

function DashboardHome({ user }) {

  const [selectedCountry, setSelectedCountry] =
    useState(null)

  const [realtimeBalance, setRealtimeBalance] =
    useState(Number(user?.balance ?? 0))


  useEffect(() => {

    const agencyId = user?.id

    if (!agencyId) {
      console.warn("No agency ID available")
      return
    }

    console.log(
      "Subscribing to balance:",
      `agences/${agencyId}/balance`
    )

    const unsubscribe =
      subscribeToAgencyBalance(
        agencyId,

        (balance) => {
          console.log(
            "🔥 Realtime balance:",
            balance
          )

          setRealtimeBalance(balance)
        },

        (error) => {
          console.error(
            "Balance realtime error:",
            error
          )
        }
      )

    return () => {
      unsubscribe()
    }

  }, [user?.id])


  const stats = useDashboardStats({
    ...user,
    balance: realtimeBalance,
  })



  if (selectedCountry) {
    return (
      <PackageDetail
        country={selectedCountry}
        onBack={() => setSelectedCountry(null)}
      />
    )
  }

  /* -----------------------------------------
     DASHBOARD
     ----------------------------------------- */

  return (
    <div className="dash-page">

      {/* PAGE HEADER */}

      <h1 className="dash-title">
        Tableau de bord
      </h1>

      <p className="dash-subtitle">
        Vue d'ensemble de l'activité{" "}
        {user?.company_name || "de votre agence"}.
      </p>


      {/* =====================================================
          BUSINESS + OPERATIONS METRICS
          ===================================================== */}

      <div className="metrics-row">

        {/* BUSINESS */}

        <section className="metrics-col">

          <h2 className="metrics-heading">
            <TrendingUp size={16} />

            Business Metrics
          </h2>

          <div className="metrics-grid">

            {stats.business.map((m) => (
              <MetricCard
                key={m.label}
                {...m}
              />
            ))}

          </div>

        </section>


        {/* OPERATIONS */}

        <section className="metrics-col">

          <h2 className="metrics-heading">

            <ClipboardCheck size={16} />

            Operations Metrics

          </h2>

          <div className="metrics-grid">

            {stats.operations.map((m) => (
              <MetricCard
                key={m.label}
                {...m}
              />
            ))}

          </div>

        </section>

      </div>


      {/* =====================================================
          BUNDLE SOLD + ALL TIME
          ===================================================== */}

      <div className="panels-row">

        {/* BUNDLE SOLD */}

        <div className="dash-card bundle-sold-card">

          <h3>

            <Box size={17} />

            Bundle Sold

          </h3>


          <div className="bundle-mini-grid">

            <BundleSoldMini
              tint="teal"
              icon={<Globe size={18} />}
              label="Regional"
              value={stats.bundleSold.regional}
            />

            <BundleSoldMini
              tint="indigo"
              icon={<MapPin size={18} />}
              label="Local"
              value={stats.bundleSold.local}
            />

            <BundleSoldMini
              tint="rose"
              icon={<Globe2 size={18} />}
              label="Global"
              value={stats.bundleSold.global}
            />

          </div>

        </div>


        {/* ALL TIME STATISTICS */}

        <div className="dash-card all-time-card">

          <h3>

            <BarChart3 size={17} />

            All Time Statistics

          </h3>


          <ul className="all-time-list">

            {stats.allTime.map((row) => (

              <li key={row.label}>

                <span className="all-time-row-label">

                  {row.icon}

                  {row.label}

                </span>

                <strong>
                  {row.value}
                </strong>

              </li>

            ))}

          </ul>

        </div>

      </div>


      {/* =====================================================
          CHARTS
          ===================================================== */}

      <div className="panels-row panels-row-charts">

        {/* MONTHLY CHART */}

        <div className="dash-card chart-panel">

          <div className="chart-panel-header">

            <h3 style={{ margin: 0 }}>

              <BarChart3 size={17} />

              Monthly eSIM sales and profit overview

            </h3>

            <span className="chart-panel-period">
              Last 6 months
            </span>

          </div>


          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <AreaChart
              data={stats.monthly}
              margin={{
                top: 20,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >

              <defs>

                <linearGradient
                  id="saleGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#db2777"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="#db2777"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>


              <CartesianGrid
                vertical={false}
                stroke="var(--color-border-light)"
              />


              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />


              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />


              <Tooltip />


              <Area
                type="monotone"
                dataKey="esim_sold"
                stroke="#06b6d4"
                fill="transparent"
                strokeWidth={2}
              />


              <Area
                type="monotone"
                dataKey="bundle_count"
                stroke="#6366f1"
                fill="transparent"
                strokeWidth={2}
              />


              <Area
                type="monotone"
                dataKey="sale"
                stroke="#db2777"
                fill="url(#saleGradient)"
                strokeWidth={2}
              />


              <Area
                type="monotone"
                dataKey="profit"
                stroke="#a855f7"
                fill="transparent"
                strokeWidth={2}
              />

            </AreaChart>

          </ResponsiveContainer>


          {/* LEGEND */}

          <div className="chart-legend">

            <span>
              <i style={{ background: "#06b6d4" }} />
              esim_sold
            </span>

            <span>
              <i style={{ background: "#6366f1" }} />
              bundle_count
            </span>

            <span>
              <i style={{ background: "#db2777" }} />
              sale
            </span>

            <span>
              <i style={{ background: "#a855f7" }} />
              profit
            </span>

          </div>

        </div>


        {/* CUSTOMER ACTIVITY */}

        <div className="dash-card chart-panel chart-panel-narrow">

          <div className="chart-panel-header">

            <h3 style={{ margin: 0 }}>

              <LineChartIcon size={17} />

              Customer Activity

            </h3>

          </div>


          <div className="chart-empty-state">
            Pas encore de données
          </div>


          <div className="chart-legend">

            <span>
              <i style={{ background: "#06b6d4" }} />
              New Users
            </span>

            <span>
              <i style={{ background: "#6366f1" }} />
              SIM Buy
            </span>

            <span>
              <i style={{ background: "#db2777" }} />
              Visitors
            </span>

            <span>
              <i style={{ background: "#a855f7" }} />
              Renew Packages
            </span>

          </div>

        </div>

      </div>


    </div>
  )
}


/* =========================================================
   STATISTICS PAGE
   ========================================================= */

function StatisticsPage() {

  const bars = [
    { label: "Lun", value: 40 },
    { label: "Mar", value: 65 },
    { label: "Mer", value: 50 },
    { label: "Jeu", value: 80 },
    { label: "Ven", value: 95 },
    { label: "Sam", value: 60 },
    { label: "Dim", value: 30 },
  ]

  const max = Math.max(
    ...bars.map((b) => b.value)
  )


  return (
    <div className="dash-page">

      <h1 className="dash-title">
        Statistiques
      </h1>

      <p className="dash-subtitle">
        Connexions internet cette semaine.
      </p>


      <div className="dash-card">

        <h3>
          Connexions par jour
        </h3>


        <div className="dash-chart">

          {bars.map((b) => (

            <div
              className="dash-chart-col"
              key={b.label}
            >

              <div
                className="dash-chart-bar"
                style={{
                  height: `${(b.value / max) * 100}%`,
                }}
                title={`${b.value} connexions`}
              />

              <span className="dash-chart-label">
                {b.label}
              </span>

            </div>

          ))}

        </div>

      </div>


      <div className="dash-stat-grid dash-stat-grid-3">

        <div className="dash-card dash-mini-stat">

          <p className="dash-stat-label">
            Temps moyen de connexion
          </p>

          <p className="dash-stat-value">
            42 min
          </p>

        </div>


        <div className="dash-card dash-mini-stat">

          <p className="dash-stat-label">
            Taux de satisfaction
          </p>

          <p className="dash-stat-value">
            94%
          </p>

        </div>


        <div className="dash-card dash-mini-stat">

          <p className="dash-stat-label">
            Pays desservis
          </p>

          <p className="dash-stat-value">
            38
          </p>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   USERS PAGE
   ========================================================= */

function UsersPage() {

  const users = [
    {
      name: "Amine Belkacem",
      email: "amine.b@konnectifly.com",
      role: "Admin",
      status: "Actif",
    },
    {
      name: "Sarah Meziane",
      email: "sarah.m@konnectifly.com",
      role: "Support",
      status: "Actif",
    },
    {
      name: "Yacine Kaddour",
      email: "yacine.k@konnectifly.com",
      role: "Ventes",
      status: "Inactif",
    },
    {
      name: "Lina Cherif",
      email: "lina.c@konnectifly.com",
      role: "Support",
      status: "Actif",
    },
  ]


  return (
    <div className="dash-page">

      <div className="dash-page-header">

        <div>

          <h1 className="dash-title">
            Utilisateurs
          </h1>

          <p className="dash-subtitle">
            Gérez les membres de votre équipe.
          </p>

        </div>


        <button className="dash-btn-primary">
          + Ajouter un utilisateur
        </button>

      </div>


      <div className="dash-card dash-table-card">

        <table className="dash-table">

          <thead>

            <tr>

              <th>
                Nom
              </th>

              <th>
                Email
              </th>

              <th>
                Rôle
              </th>

              <th>
                Statut
              </th>

            </tr>

          </thead>


          <tbody>

            {users.map((u) => (

              <tr key={u.email}>

                <td>
                  {u.name}
                </td>

                <td className="dash-muted">
                  {u.email}
                </td>

                <td>
                  {u.role}
                </td>

                <td>

                  <span
                    className={`dash-badge ${
                      u.status === "Actif"
                        ? "dash-badge-green"
                        : "dash-badge-gray"
                    }`}
                  >
                    {u.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}


/* =========================================================
   INVENTORY PAGE
   ========================================================= */

function InventoryPage() {

  const items = [
    {
      name: "Carte SIM internationale",
      stock: 12,
      threshold: 20,
    },
    {
      name: "Routeur WiFi portable",
      stock: 48,
      threshold: 15,
    },
    {
      name: "Forfait 10 Go",
      stock: 3,
      threshold: 10,
    },
    {
      name: "Batterie externe",
      stock: 27,
      threshold: 15,
    },
  ]


  return (
    <div className="dash-page">

      <h1 className="dash-title">
        Inventaire
      </h1>

      <p className="dash-subtitle">
        Suivi des stocks disponibles.
      </p>


      <div className="dash-card dash-table-card">

        <table className="dash-table">

          <thead>

            <tr>

              <th>
                Article
              </th>

              <th>
                Stock
              </th>

              <th>
                Statut
              </th>

            </tr>

          </thead>


          <tbody>

            {items.map((it) => {

              const low =
                it.stock < it.threshold

              return (

                <tr key={it.name}>

                  <td>
                    {it.name}
                  </td>

                  <td>
                    {it.stock}
                  </td>

                  <td>

                    <span
                      className={`dash-badge ${
                        low
                          ? "dash-badge-amber"
                          : "dash-badge-green"
                      }`}
                    >
                      {low
                        ? "Stock faible"
                        : "En stock"}
                    </span>

                  </td>

                </tr>

              )
            })}

          </tbody>

        </table>

      </div>

    </div>
  )
}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function SettingsPage() {

  return (
    <div className="dash-page">

      <h1 className="dash-title">
        Paramètres
      </h1>

      <p className="dash-subtitle">
        Gérez les préférences de votre compte.
      </p>


      <div className="dash-card dash-settings-card">

        {/* EMAIL NOTIFICATIONS */}

        <div className="dash-settings-row">

          <div>

            <p className="dash-settings-label">
              Notifications par email
            </p>

            <p className="dash-settings-hint">
              Recevoir un résumé quotidien de l'activité.
            </p>

          </div>


          <label className="dash-switch">

            <input
              type="checkbox"
              defaultChecked
            />

            <span className="dash-switch-track" />

          </label>

        </div>


        {/* TWO FACTOR */}

        <div className="dash-settings-row">

          <div>

            <p className="dash-settings-label">
              Authentification à deux facteurs
            </p>

            <p className="dash-settings-hint">
              Ajoute une couche de sécurité supplémentaire.
            </p>

          </div>


          <label className="dash-switch">

            <input type="checkbox" />

            <span className="dash-switch-track" />

          </label>

        </div>


        {/* LANGUAGE */}

        <div className="dash-settings-row">

          <div>

            <p className="dash-settings-label">
              Langue
            </p>

            <p className="dash-settings-hint">
              Langue utilisée dans l'interface.
            </p>

          </div>


          <button className="dash-select">

            Français

            <ChevronDown size={16} />

          </button>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   HELP PAGE
   ========================================================= */

function HelpPage() {

  const faqs = [
    {
      q: "Comment ajouter un nouvel utilisateur ?",
      a: 'Rendez-vous dans Utilisateurs puis cliquez sur "Ajouter un utilisateur".',
    },
    {
      q: "Comment activer un forfait pour un client ?",
      a: "Depuis Inventaire, sélectionnez le forfait et assignez-le au client concerné.",
    },
    {
      q: "Que faire en cas de stock faible ?",
      a: "Une alerte automatique apparaît sur le tableau de bord ; contactez votre fournisseur pour réapprovisionner.",
    },
  ]


  return (
    <div className="dash-page">

      <h1 className="dash-title">
        Aide
      </h1>

      <p className="dash-subtitle">
        Questions fréquentes et support.
      </p>


      {/* SEARCH */}

      <div className="dash-card dash-search-card">

        <Search size={18} />

        <input
          placeholder="Rechercher dans l'aide..."
          className="dash-search-input"
        />

      </div>


      {/* FAQ */}

      <div className="dash-card">

        {faqs.map((f) => (

          <div
            className="dash-faq-item"
            key={f.q}
          >

            <p className="dash-faq-q">
              {f.q}
            </p>

            <p className="dash-faq-a">
              {f.a}
            </p>

          </div>

        ))}

      </div>


      {/* SUPPORT */}

      <div className="dash-card dash-contact-card">

        <LifeBuoy size={22} />

        <div>

          <p className="dash-settings-label">
            Besoin d'aide supplémentaire ?
          </p>

          <p className="dash-settings-hint">
            Contactez le support à support@konnectifly.com
          </p>

        </div>

      </div>

    </div>
  )
}