import { useState, useMemo, useEffect, useRef } from "react"

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
  Activity,
  ArrowUpRight,
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

import { useReveal, useCountUp } from "../../../hooks/animations"

import "./Dashboard.css"

import {
  subscribeToAgencyBalance,
} from "../../../services/balanceService"


/* =========================================================
   PALETTE — 4 bleus uniquement
   ========================================================= */

const BLUE = {
  blue: "#0077b6",
  dark: "#023e73",
  deep: "#012a4d",
  light: "#eaf4fb",
}

/* =========================================================
   DASHBOARD — PAGE D'ACCUEIL
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
          live: true,
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
          numeric: true,
        },
        {
          label: "Bundle Count",
          value: 0,
          icon: <Box size={22} />,
          numeric: true,
        },
        {
          label: "Dealer eSIM Sold",
          value: 0,
          icon: <Smartphone size={22} />,
          numeric: true,
        },
        {
          label: "Dealer Bundle Count",
          value: 0,
          icon: <Boxes size={22} />,
          numeric: true,
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
        { month: "Avr", esim_sold: 3, bundle_count: 2, sale: 6, profit: 1 },
        { month: "Mai", esim_sold: 4, bundle_count: 3, sale: 9, profit: 2 },
        { month: "Juin", esim_sold: 6, bundle_count: 5, sale: 13, profit: 3 },
        { month: "Juil", esim_sold: 4, bundle_count: 3, sale: 9, profit: 2 },
        { month: "Août", esim_sold: 2, bundle_count: 1, sale: 3, profit: 1 },
        { month: "Sep", esim_sold: 21, bundle_count: 8, sale: 62, profit: 12 },
      ],
    }),
    [user]
  )
}


/* =========================================================
   TOOLTIP RECHARTS — stylé CSS
   ========================================================= */

const CHART_SERIES = [
  { key: "esim_sold", label: "eSIM sold", color: BLUE.blue, dashed: false, fill: "url(#gradSale)" },
  { key: "bundle_count", label: "bundle_count", color: BLUE.dark, dashed: false },
  { key: "sale", label: "sale", color: BLUE.deep, dashed: false },
  { key: "profit", label: "profit", color: BLUE.blue, dashed: true },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="dash-tooltip">
      <span className="dash-tooltip-label">{label}</span>

      {payload.map((entry) => (
        <div className="dash-tooltip-row" key={entry.dataKey}>
          <i style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  )
}


/* =========================================================
   NOMBRE ANIMÉ
   ========================================================= */

function AnimatedNumber({ value, decimals = 0, suffix = "" }) {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  const count = useCountUp(value, 1400, started)

  useEffect(() => {
    const el = ref.current
    if (!el || started) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        setStarted(true)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [started])

  const display = decimals
    ? count.toFixed(decimals).replace(".", ",")
    : Math.round(count).toLocaleString("fr-FR")

  return (
    <span ref={ref} className="dash-count">
      {display}
      {suffix}
    </span>
  )
}


/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({ icon, label, value, dark, live, numeric, delay = 0 }) {
  return (
    <div
      className={`metric-card ${dark ? "metric-card-dark" : ""}`}
      data-reveal
      style={{ "--dash-delay": `${delay}ms` }}
    >
      <span className="metric-card-sheen" aria-hidden="true" />

      <div className="metric-card-text">
        <span className="metric-card-label">
          {label}
          {live && (
            <span className="metric-card-live" title="Solde en temps réel">
              <i />
              live
            </span>
          )}
        </span>

        <strong className="metric-card-value">
          {numeric ? <AnimatedNumber value={Number(value)} /> : value}
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

function BundleSoldMini({ icon, label, value, tint, delay = 0 }) {
  return (
    <div className="bundle-mini" data-reveal style={{ "--dash-delay": `${delay}ms` }}>
      <div className={`bundle-mini-icon bundle-mini-icon-${tint}`}>{icon}</div>

      <p className="bundle-mini-label">{label}</p>

      <p className="bundle-mini-value">
        <AnimatedNumber value={Number(value)} />
      </p>

      <span className="bundle-mini-bar" aria-hidden="true">
        <i style={{ "--dash-bar": `${value}%` }} />
      </span>
    </div>
  )
}


/* =========================================================
   DASHBOARD HOME
   ========================================================= */

export function DashboardHome({ user }) {

  const [realtimeBalance, setRealtimeBalance] =
    useState(Number(user?.balance ?? 0))

  const revealRef = useReveal()


  useEffect(() => {

    const agencyId = user?.id

    if (!agencyId) {
      return
    }

    const unsubscribe =
      subscribeToAgencyBalance(
        agencyId,

        (balance) => {
          setRealtimeBalance(balance)
        },

        (error) => {
          console.error("Balance realtime error:", error)
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


  /* -----------------------------------------
     DASHBOARD
     ----------------------------------------- */

  return (
    <div className="dash-page" ref={revealRef}>

      {/* PAGE HEADER */}

      <div className="dash-page-header" data-reveal>
        <div>
          <h1 className="dash-title">Tableau de bord</h1>

          <p className="dash-subtitle">
            Vue d'ensemble de l'activité{" "}
            {user?.company_name || "de votre agence"}.
          </p>
        </div>

        <span className="dash-live-chip">
          <span className="dash-live-dot" aria-hidden="true" />
          Solde synchronisé en direct
        </span>
      </div>


      {/* =====================================================
          BUSINESS + OPERATIONS METRICS
          ===================================================== */}

      <div className="metrics-row">

        <section className="metrics-col" data-reveal style={{ "--dash-delay": "60ms" }}>

          <h2 className="metrics-heading">
            <TrendingUp size={16} />
            Business Metrics
          </h2>

          <div className="metrics-grid">
            {stats.business.map((m, i) => (
              <MetricCard key={m.label} {...m} delay={i * 80} />
            ))}
          </div>

        </section>


        <section className="metrics-col" data-reveal style={{ "--dash-delay": "140ms" }}>

          <h2 className="metrics-heading">
            <ClipboardCheck size={16} />
            Operations Metrics
          </h2>

          <div className="metrics-grid">
            {stats.operations.map((m, i) => (
              <MetricCard key={m.label} {...m} delay={i * 80} />
            ))}
          </div>

        </section>

      </div>


      {/* =====================================================
          BUNDLE SOLD + ALL TIME
          ===================================================== */}

      <div className="panels-row">

        <div className="dash-card bundle-sold-card" data-reveal style={{ "--dash-delay": "60ms" }}>
          <h3>
            <Box size={17} />
            Bundle Sold
          </h3>

          <div className="bundle-mini-grid">
            <BundleSoldMini
              tint="blue"
              icon={<Globe size={18} />}
              label="Regional"
              value={stats.bundleSold.regional}
              delay={0}
            />

            <BundleSoldMini
              tint="dark"
              icon={<MapPin size={18} />}
              label="Local"
              value={stats.bundleSold.local}
              delay={90}
            />

            <BundleSoldMini
              tint="deep"
              icon={<Globe2 size={18} />}
              label="Global"
              value={stats.bundleSold.global}
              delay={180}
            />
          </div>
        </div>


        <div className="dash-card all-time-card" data-reveal style={{ "--dash-delay": "140ms" }}>
          <h3>
            <BarChart3 size={17} />
            All Time Statistics
          </h3>

          <ul className="all-time-list">
            {stats.allTime.map((row, i) => (
              <li key={row.label} style={{ "--dash-delay": `${180 + i * 60}ms` }}>
                <span className="all-time-row-label">
                  {row.icon}
                  {row.label}
                </span>

                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
        </div>

      </div>


      {/* =====================================================
          CHARTS
          ===================================================== */}

      <div className="panels-row panels-row-charts">

        <div className="dash-card chart-panel" data-reveal>

          <div className="chart-panel-header">
            <h3 style={{ margin: 0 }}>
              <BarChart3 size={17} />
              Monthly eSIM sales and profit overview
            </h3>

            <span className="chart-panel-period">Last 6 months</span>
          </div>


          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={stats.monthly}
              margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradSale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE.blue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BLUE.blue} stopOpacity={0} />
                </linearGradient>

                <linearGradient id="gradDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE.dark} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={BLUE.dark} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="rgba(0, 119, 182, 0.12)" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "rgba(0, 119, 182, 0.18)" }}
                tick={{ fill: "rgba(0, 0, 0, 0.45)", fontSize: 12 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(0, 0, 0, 0.45)", fontSize: 12 }}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(0, 119, 182, 0.25)", strokeWidth: 1 }}
              />

              {CHART_SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  name={s.label}
                  dataKey={s.key}
                  stroke={s.color}
                  fill={s.fill || (s.key === "bundle_count" ? "url(#gradDark)" : "transparent")}
                  strokeWidth={2.25}
                  strokeDasharray={s.dashed ? "6 5" : undefined}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 0,
                    fill: s.color,
                  }}
                  animationDuration={1100}
                  animationEasing="ease-out"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>


          <div className="chart-legend">
            {CHART_SERIES.map((s) => (
              <span key={s.key}>
                <i
                  style={{
                    background: s.color,
                    opacity: s.dashed ? 0.6 : 1,
                  }}
                />
                {s.label}
              </span>
            ))}
          </div>

        </div>


        <div className="dash-card chart-panel chart-panel-narrow" data-reveal>

          <div className="chart-panel-header">
            <h3 style={{ margin: 0 }}>
              <LineChartIcon size={17} />
              Customer Activity
            </h3>
          </div>


          <div className="chart-empty-state">
            <span className="chart-empty-icon">
              <Activity size={22} />
            </span>
            <p>Pas encore de données</p>
            <span className="chart-empty-bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>


          <div className="chart-legend">
            {["New Users", "SIM Buy", "Visitors", "Renew Packages"].map((label) => (
              <span key={label}>
                <i style={{ background: BLUE.blue, opacity: 0.45 }} />
                {label}
              </span>
            ))}
          </div>

        </div>

      </div>

      <p className="dash-footnote">
        <Activity size={13} />
        Les données se rafraîchissent automatiquement depuis Firebase.
        <ArrowUpRight size={13} />
      </p>

    </div>
  )
}



/* =========================================================
   SETTINGS PAGE
   ========================================================= */

export function SettingsPage() {

  return (
    <div className="dash-page">

      <h1 className="dash-title">Paramètres</h1>

      <p className="dash-subtitle">Gérez les préférences de votre compte.</p>


      <div className="dash-card dash-settings-card">

        <div className="dash-settings-row">
          <div>
            <p className="dash-settings-label">Notifications par email</p>
            <p className="dash-settings-hint">Recevoir un résumé quotidien de l'activité.</p>
          </div>

          <label className="dash-switch">
            <input type="checkbox" defaultChecked />
            <span className="dash-switch-track" />
          </label>
        </div>


        <div className="dash-settings-row">
          <div>
            <p className="dash-settings-label">Authentification à deux facteurs</p>
            <p className="dash-settings-hint">Ajoute une couche de sécurité supplémentaire.</p>
          </div>

          <label className="dash-switch">
            <input type="checkbox" />
            <span className="dash-switch-track" />
          </label>
        </div>


        <div className="dash-settings-row">
          <div>
            <p className="dash-settings-label">Langue</p>
            <p className="dash-settings-hint">Langue utilisée dans l'interface.</p>
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

export function HelpPage() {

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

      <h1 className="dash-title">Aide</h1>

      <p className="dash-subtitle">Questions fréquentes et support.</p>


      <div className="dash-card dash-search-card">
        <Search size={18} />
        <input placeholder="Rechercher dans l'aide..." className="dash-search-input" />
      </div>


      <div className="dash-card">
        {faqs.map((f) => (
          <div className="dash-faq-item" key={f.q}>
            <p className="dash-faq-q">{f.q}</p>
            <p className="dash-faq-a">{f.a}</p>
          </div>
        ))}
      </div>


      <div className="dash-card dash-contact-card">
        <LifeBuoy size={22} />
        <div>
          <p className="dash-settings-label">Besoin d'aide supplémentaire ?</p>
          <p className="dash-settings-hint">
            Contactez le support à support@konnectifly.com
          </p>
        </div>
      </div>

    </div>
  )
}
