import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  Plane,
  Search,
  ShoppingCart,
  User,
  Moon,
  ChevronDown,
  Star,
  MapPin,
  Map,
  Globe2,
  Wallet,
  Clock3,
  Wifi,
  QrCode,
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
  Smartphone,
  Apple,
  SlidersHorizontal,
  Home as HomeIcon,
  Building2,
  LogOut,
  Menu,
  X,
  Signal,
  Zap,
  Headphones,
  Users,
  BadgeCheck,
  Rocket,
  Check,
} from "lucide-react"

import "./vitrine.css"

import {
  getCountriesoucontinents,
  getPackagesByCountry,
} from "../../../services/Api"

import europe from "../../../assets/images/europe.jpeg"
import turquie from "../../../assets/images/turquie.jpeg"
import egypte from "../../../assets/images/egypte.jpeg"

import usa from "../../../assets/images/usa.png"
import canada from "../../../assets/images/canada.png"
import japon from "../../../assets/images/japon.png"

import espagne from "../../../assets/images/espagne.jpeg"
import emirats from "../../../assets/images/emirats.png"
import uk from "../../../assets/images/uk.png"
import mexique from "../../../assets/images/mexique.jpeg"
import northafrica from "../../../assets/images/northafrica.jpeg"
import asie from "../../../assets/images/asie.jpeg"
import global from "../../../assets/images/global.jpeg"

const LOCAL_CODES = ["us", "ca", "jp", "tr", "es", "ae", "gb", "mx"]
const REGIONAL_CODES = ["eu", "af", "as", "na"]
const PHONE_CODES = ["eu", "tr", "eg"]

const DISPLAY_NAMES = {
  us: "États-Unis",
  ca: "Canada",
  jp: "Japon",
  tr: "Turquie",
  es: "Espagne",
  ae: "Émirats arabes unis",
  gb: "Royaume-Uni",
  mx: "Mexique",
  eg: "Égypte",
  eu: "Europe",
  af: "Afrique",
  as: "Asie",
  na: "Amérique du Nord",
}

const LOCAL_PHOTOS = {
  us: usa,
  ca: canada,
  jp: japon,
  tr: turquie,
  es: espagne,
  ae: emirats,
  gb: uk,
  mx: mexique,
  eg: egypte,
  eu: europe,
  af: northafrica,
  as: asie,
  na: usa,
}
const pick = (obj, keys) =>
  keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null && v !== "")

function normalizePlan(pkg) {
  const price = Number(pkg?.priceUSD)
  if (!Number.isFinite(price) || price <= 0) return null

  return {
    id: pkg.id ?? pkg.packageId,
    price: price.toFixed(2),
    data: pick(pkg, ["dataAmount", "data", "volume", "dataGB", "size"]),
    days: pick(pkg, ["validityDays", "validity", "duration", "days"]),
  }
}

function formatData(v) {
  if (v == null) return ""
  if (typeof v === "number") return `${v} Go`
  return String(v).replace(/gb/i, "Go").replace(/mb/i, "Mo")
}

function formatDays(v) {
  if (v == null) return ""
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? `${n} j` : String(v)
}

async function loadPlans(scope, id) {
  const response = await getPackagesByCountry(scope, id, "DATA-ONLY", "limited")
  const packages = Array.isArray(response?.data) ? response.data : []

  return packages
    .map(normalizePlan)
    .filter(Boolean)
    .sort((a, b) => a.price - b.price)
}

async function withMinPrices(destinations) {
  return Promise.all(
    destinations.map(async (destination) => {
      try {
        const plans = await loadPlans(destination.scope, destination.id)
        if (!plans.length) return destination

        return { ...destination, price: plans[0].price, plans: plans.slice(0, 3) }
      } catch {
        return destination
      }
    }),
  )
}
function flagEmoji(code) {
  const iso = String(code || "").toLowerCase()

  if (iso.length !== 2) return "🌍"

  if (iso === "eu") return "🇪🇺"
  if (["as", "af", "na", "sa", "oc", "me"].includes(iso)) return "🌍"

  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
  )
}

function validDestinations(list) {
  return Array.isArray(list)
    ? list.filter((item) => item && item.id && item.name && item.code)
    : []
}

function pickByCode(list, codes) {
  const byCode = new Map(
    list.map((item) => [String(item.code).toLowerCase(), item]),
  )

  return codes.map((code) => byCode.get(code)).filter(Boolean)
}

function mapDestination(item, fallbackPrice, extra = {}) {
  const code = String(item.code).toLowerCase()

  return {
    id: item.id,
    code,
    name: DISPLAY_NAMES[code] || item.name,
    flag: flagEmoji(code),
    flagUrl: item.flag || null,
    image: LOCAL_PHOTOS[code] || item.image_url || item.banner || item.flag,
    price: fallbackPrice,
    ...extra,
  }
}

async function minPriceUSD(scope, id) {
  const response = await getPackagesByCountry(scope, id, "DATA-ONLY", "limited")
  const packages = Array.isArray(response?.data) ? response.data : []
  const values = packages
    .map((pkg) => Number(pkg?.priceUSD))
    .filter((value) => Number.isFinite(value) && value > 0)

  return values.length > 0 ? Math.min(...values).toFixed(2) : null
}




/* =========================================================
   SLIDING SCOPE TOGGLE
   ========================================================= */

function ScopeToggle({ scope, onChange, options }) {
  const rootRef = useRef(null)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const measure = () => {
      const active = root.querySelector(".kf-scope-btn-active")
      if (!active) return

      setPill({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      })
    }

    measure()

    window.addEventListener("resize", measure)
    const timer = setTimeout(measure, 350)

    return () => {
      window.removeEventListener("resize", measure)
      clearTimeout(timer)
    }
  }, [scope])

  return (
    <div className="kf-scope-toggle" ref={rootRef} role="tablist">
      <span
        className={`kf-scope-pill ${pill.ready ? "kf-scope-pill-ready" : ""}`}
        style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
      />
      {options.map((opt) => {
        const Icon = opt.icon
        const active = scope === opt.value

        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            className={`kf-scope-btn ${active ? "kf-scope-btn-active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <Icon size={16} />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}


/* =========================================================
   STAT (valeur statique)
   ========================================================= */

function StatItem({ value, suffix, decimals = 0, label, icon: Icon }) {
  const display = decimals
    ? value.toFixed(decimals).replace(".", ",")
    : Math.round(value).toLocaleString("fr-FR")

  return (
    <div className="kf-stat">
      <span className="kf-stat-icon">
        <Icon size={20} />
      </span>
      <strong className="kf-stat-value">
        {display}
        {suffix}
      </strong>
      <span className="kf-stat-label">{label}</span>
    </div>
  )
}


export default function KonnectiFlyLanding({ onLogin, user, onLogout }) {
  const [destinationScope, setDestinationScope] = useState("local")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [heroQuery, setHeroQuery] = useState("")
  const [liveDestinations, setLiveDestinations] = useState(null)

  /* Active nav link (scroll spy) */
  const [activeSection, setActiveSection] = useState("destinations")

  useEffect(() => {
    const ids = ["destinations", "comment-ca-marche", "compatibilite", "confiance"]

    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.32
      let current = ids[0]

      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= probe) current = id
      })

      setActiveSection(current)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* Fermeture des menus au clic extérieur */
  useEffect(() => {
    if (!showUserMenu && !showMobileNav) return

    const onClick = (e) => {
      if (!e.target.closest(".kf-user-menu")) setShowUserMenu(false)
    }

    document.addEventListener("click", onClick)

    return () => document.removeEventListener("click", onClick)
  }, [showUserMenu, showMobileNav])


  const flags = ["🇺🇸", "🇬🇧", "🇯🇵", "🇦🇪", "🇹🇷", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇲🇦"]

  const navLinks = [
    { id: "destinations", label: "Acheter une eSIM" },
    { id: "comment-ca-marche", label: "Comment ça marche" },
    { id: "compatibilite", label: "Compatibilité" },
    { id: "confiance", label: "Pourquoi nous" },
  ]

  const features = [
    {
      icon: <Wallet size={26} />,
      title: "Forfaits abordables",
      text: "Restez connecté partout sans exploser votre budget.",
    },
    {
      icon: <Clock3 size={26} />,
      title: "Itinérance gratuite",
      text: "Dites adieu aux frais de roaming à chaque frontière.",
    },
    {
      icon: <Wifi size={26} />,
      title: "Internet fiable et rapide",
      text: "Naviguez, diffusez et restez connecté sans interruption.",
    },
    {
      icon: <QrCode size={26} />,
      title: "Installation facile",
      text: "Activez votre eSIM KonnectiFly en quelques clics.",
    },
  ]

  const localDestinations = [
    { name: "États-Unis", flag: "🇺🇸", price: "600", image: usa },
    { name: "Canada", flag: "🇨🇦", price: "1500", image: canada },
    { name: "Japon", flag: "🇯🇵", price: "440", image: japon },
    { name: "Turquie", flag: "🇹🇷", price: "400", image: turquie },
    { name: "Espagne", flag: "🇪🇸", price: "400", image: espagne },
    { name: "Émirats arabes unis", flag: "🇦🇪", price: "1250", image: emirats },
    { name: "Royaume-Uni", flag: "🇬🇧", price: "400", image: uk },
    { name: "Mexique", flag: "🇲🇽", price: "1155", image: mexique },
  ]

  const regionalDestinations = [
    { name: "Europe", flag: "🌍", image: europe, price: "750" },
    { name: "Afrique du Nord", flag: "🌍", image: northafrica, price: "2955" },
    { name: "Asie du Sud-Est", flag: "🌏", image: asie, price: "1040" },
    { name: "Amérique du Nord", flag: "🌎", image: usa, price: "2000" },
  ]

  const globalDestinations = [
    { name: "Global 130+ pays", flag: "🌐", image: global, price: "1235" },
  ]

  useEffect(() => {
    let cancelled = false

    async function loadFromApi() {
      try {
        const [countriesRaw, continentsRaw] = await Promise.all([
          getCountriesoucontinents("countries"),
          getCountriesoucontinents("continents"),
        ])

        const countries = validDestinations(countriesRaw)
        const continents = validDestinations(continentsRaw)

        const local = pickByCode(countries, LOCAL_CODES).map((item) =>
          mapDestination(item, "—", { scope: "countries" }),
        )
        const regional = pickByCode(continents, REGIONAL_CODES).map((item) =>
          mapDestination(item, "—", { scope: "continents" }),
        )
        const phone = pickByCode(
          [...continents, ...countries],
          PHONE_CODES,
        ).map((item) =>
          mapDestination(item, "—", {
            scope: item.code === "eu" ? "continents" : "countries",
          }),
        )

        const globalCard = {
          id: 1,
          code: "global",
          name: "Global 130+ pays",
          flag: "🌐",
          flagUrl: null,
          image: global,
          price: "—",
          scope: "global",
        }

        const [localPriced, regionalPriced, phonePriced, globalPriced] =
          await Promise.all([
            withMinPrices(local),
            withMinPrices(regional),
            withMinPrices(phone),
            withMinPrices([globalCard]),
          ])

        if (cancelled) return

        setLiveDestinations({
          local: localPriced.length ? localPriced : null,
          regional: regionalPriced.length ? regionalPriced : null,
          global: globalPriced,
          phone: phonePriced.length ? phonePriced : null,
          search: countries.map((item) =>
            mapDestination(item, null, { scope: "countries" }),
          ),
        })
      } catch {
        if (!cancelled) setLiveDestinations(null)
      }
    }

    loadFromApi()

    return () => {
      cancelled = true
    }
  }, [])

  const destinationsByScope = {
    local: liveDestinations?.local || localDestinations,
    regional: liveDestinations?.regional || regionalDestinations,
    global: liveDestinations?.global || globalDestinations,
  }

  const phoneDestinations =
    liveDestinations?.phone || [
      { name: "Europe", flag: "🇪🇺", image: europe, price: "8.50" },
      { name: "Turquie", flag: "🇹🇷", image: turquie, price: "2.10" },
      { name: "Égypte", flag: "🇪🇬", image: egypte, price: "3.40" },
    ]

  const searchableDestinations =
    liveDestinations?.search || destinationsByScope.local

  const steps = [
    {
      icon: <ShoppingCart size={20} />,
      title: "Achetez un forfait KonnectiFly",
      text: "Choisissez votre destination et le forfait data qui vous correspond.",
    },
    {
      icon: <QrCode size={20} />,
      title: "Installez l'eSIM",
      text: "Scannez le QR code ou installez en un tap depuis l'app.",
    },
    {
      icon: <Plane size={20} />,
      title: "Décollez connecté",
      text: "Votre forfait s'active automatiquement à l'arrivée.",
    },
  ]

  const compatiblePhones = [
    "iPhone XS et versions ultérieures",
    "Pixel 4 et versions ultérieures",
    "Samsung Galaxy série S20 – S25",
    "Huawei P40 et versions ultérieures",
  ]

  const trustCards = [
    {
      icon: <Plane size={24} />,
      title: "KonnectiFly — Voyagez sans frontières",
      text: "Né pour les voyageurs, KonnectiFly connecte votre téléphone dès l'atterrissage, dans plus de 130 destinations.",
    },
    {
      icon: <Globe2 size={24} />,
      title: "Une couverture mondiale pensée pour vous",
      text: "Locale, régionale ou globale : choisissez la couverture exacte de votre prochain voyage, sans surprise sur la facture.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Fiable, transparent, sans engagement",
      text: "Pas de carte SIM à recevoir, pas de contrat. Achetez, scannez, volez.",
    },
  ]

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : ""

  const firstName = user?.name ? user.name.split(" ")[0] : "John"

  const filteredDestinations = heroQuery.trim()
    ? searchableDestinations.filter((d) =>
        d.name.toLowerCase().includes(heroQuery.trim().toLowerCase())
      ).slice(0, 8)
    : null

  function destinationHref(destination) {
    if (!destination?.id || !destination?.scope) {
      return user ? "/dashboard/packages" : "/login"
    }

    return user
      ? `/dashboard/packages/${destination.scope}/${destination.id}?type=DATA-ONLY&mode=limited&billing=fixed`
      : "/login"
  }


  return (
    <div className="kf-landing">
      {/* NAVBAR */}
      <header className="kf-navbar">
        <div className="kf-navbar-inner">
          <a className="kf-logo" href="#top">
            <span className="kf-logo-icon">
              <Plane size={22} />
            </span>
            <span className="kf-logo-text">
              Konnecti<span className="kf-logo-accent">Fly</span>
            </span>
          </a>

          <nav className="kf-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={activeSection === link.id ? "kf-nav-link-active" : ""}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="kf-navbar-actions">
           

            {user ? (
              <div className="kf-user-menu">
                <button
                  className="kf-pill-btn kf-user-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu((s) => !s)
                  }}
                >
                  <span className="kf-user-avatar">
                    {initials || <User size={14} />}
                  </span>
                  <span className="kf-user-btn-label">{user.name}</span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <div className="kf-user-dropdown kf-pop">
                    <div className="kf-user-dropdown-head">
                      <span className="kf-user-avatar kf-user-avatar-lg">
                        {initials || <User size={16} />}
                      </span>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onLogout?.()
                      }}
                    >
                      <LogOut size={15} />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="kf-pill-btn" onClick={onLogin}>
                <User size={16} />
                <span className="kf-pill-btn-label">Connexion</span>
              </button>
            )}

            <button className="kf-icon-btn" aria-label="Rechercher">
              <Search size={18} />
            </button>

          

            <button
              className="kf-icon-btn kf-burger"
              aria-label="Menu"
              onClick={() => setShowMobileNav((s) => !s)}
            >
              {showMobileNav ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {showMobileNav && (
          <nav className="kf-mobile-nav kf-pop">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setShowMobileNav(false)}
              >
                <ChevronDown size={14} className="kf-mobile-nav-arrow" />
                {link.label}
              </a>
            ))}
            {!user && (
              <button className="kf-pill-btn" onClick={onLogin}>
                <User size={16} />
                Connexion
              </button>
            )}
          </nav>
        )}
      </header>


      {/* HERO */}
      <section className="kf-hero" id="top">
        <div className="kf-hero-bg" aria-hidden="true">
          <span className="kf-blob kf-blob-1" />
          <span className="kf-blob kf-blob-2" />
          <span className="kf-blob kf-blob-3" />
          <span className="kf-grid-lines" />
        </div>

        <div className="kf-hero-text">
          <span className="kf-eyebrow">
            <span className="kf-eyebrow-pulse" />
            Plus de 130 destinations couvertes
          </span>

          <h1 className="kf-hero-title">
            <span className="kf-line">KonnectiFly</span>
            <span className="kf-line">
              Volez <span className="kf-hero-highlight">Connecté</span>
            </span>
            <span className="kf-line">
              Partout <span className="kf-hero-highlight">Ailleurs</span>
            </span>
          </h1>

          <p className="kf-hero-subtitle">
            Voyagez léger avec des forfaits eSIM pensés pour les voyageurs.
            Une connexion internet rapide qui s'active à l'atterrissage, dans
            plus de 130 destinations.
          </p>

          <div className="kf-hero-search">
            <Search size={18} className="kf-hero-search-icon" />
            <input
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Entrez votre destination"
              className="kf-hero-search-input"
              aria-label="Rechercher une destination"
            />
            <button className="kf-hero-search-btn" aria-label="Rechercher">
              <ArrowUpRight size={18} />
            </button>
          </div>

          {filteredDestinations && (
            <div className="kf-search-results kf-pop">
              {filteredDestinations.length === 0 ? (
                <p className="kf-search-empty">Aucune destination trouvée pour « {heroQuery} »</p>
              ) : (
                filteredDestinations.map((d) => (
                  <Link
                    key={d.id || d.name}
                    to={destinationHref(d)}
                    onClick={() => setHeroQuery("")}
                  >
                    <span className="kf-search-flag">
                      {d.flagUrl ? <img src={d.flagUrl} alt="" /> : d.flag}
                    </span>
                    <strong>{d.name}</strong>
                    {d.price && d.price !== "—" ? (
                      <span className="kf-search-price">dès ${d.price}</span>
                    ) : null}
                  </Link>
                ))
              )}
            </div>
          )}

          <div className="kf-hero-trust">
            <div className="kf-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="#f59e0b"
                  color="#f59e0b"
                  className="kf-star"
                  style={{ "--i": i }}
                />
              ))}
            </div>
            <span className="kf-hero-trust-text">
              4,8/5 — plus de 500 000 voyageurs connectés
            </span>
          </div>
        </div>


        {/* Hero visual */}
        <div className="kf-hero-visual">
          <div className="kf-hero-glow" aria-hidden="true" />
          <span className="kf-orbit kf-orbit-1" aria-hidden="true" />
          <span className="kf-orbit kf-orbit-2" aria-hidden="true" />

          <div className="kf-hero-card kf-hero-card-1 kf-float kf-float-a">
            <span className="kf-hero-card-icon">
              <Plane size={18} />
            </span>
            <div>
              <strong>Vol AF 1284</strong>
              <span>Paris → Tokyo</span>
            </div>
            <span className="kf-hero-card-live">
              <Signal size={12} />
              5G
            </span>
          </div>

          <div className="kf-hero-card kf-hero-card-2 kf-float kf-float-b">
            <span className="kf-hero-card-icon kf-hero-card-icon-green">
              <Zap size={18} />
            </span>
            <div>
              <strong>eSIM activée</strong>
              <span>20 Go · 12 jours</span>
            </div>
          </div>

          <div className="kf-hero-phone kf-float kf-float-phone">
            <span className="kf-hero-phone-shine" aria-hidden="true" />

            <div className="kf-hero-phone-screen">
              <div className="kf-phone-header">
                <div className="kf-phone-statusbar">
                  <span>14:52</span>
                  <div className="kf-phone-statusbar-icons">
                    <Signal size={12} />
                    <Wifi size={12} />
                    <span className="kf-phone-battery" />
                  </div>
                </div>

                <div className="kf-phone-greeting">
                  <div className="kf-phone-avatar">
                    {user ? initials || "J" : "J"}
                  </div>
                  <div>
                    <p className="kf-phone-greeting-name">Salut, {firstName}</p>
                    <p className="kf-phone-greeting-sub">
                      Restez connecté partout <span className="kf-live-dot" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="kf-phone-body">
                <div className="kf-hero-phone-search">
                  <Search size={14} />
                  <span>Où utiliser votre eSIM…</span>
                  <SlidersHorizontal size={14} className="kf-phone-search-filter" />
                </div>

                <p className="kf-phone-section-label">Destinations populaires</p>

                <div className="kf-phone-destinations-rail">
                  {phoneDestinations.map((d, i) => (
                    <div
                      className="kf-phone-dest-card"
                      key={d.id || i}
                      style={{
                        backgroundImage: `url(${d.image})`,
                        "--i": i,
                      }}
                    >
                      <span className="kf-phone-dest-flag">
                        {d.flagUrl ? <img src={d.flagUrl} alt="" /> : d.flag}
                      </span>
                      <span className="kf-phone-dest-name">{d.name}</span>
                      <span className="kf-phone-dest-price">
                        {d.price && d.price !== "—" ? `dès $${d.price}` : "eSIM"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="kf-hero-phone-promo">
                  <span>Partez à l'international</span>
                  <p>20 Go pour seulement $22.70 dans 150+ pays</p>
                  <span className="kf-phone-promo-bar">
                    <i />
                  </span>
                </div>

                <div className="kf-phone-toggle-row">
                  <button className="kf-phone-toggle kf-phone-toggle-active">Data Only</button>
                  <button className="kf-phone-toggle">Data + Voice</button>
                </div>
              </div>

              <div className="kf-phone-tabbar">
                <div className="kf-phone-tab kf-phone-tab-active">
                  <HomeIcon size={16} />
                  <span />
                </div>
                <div className="kf-phone-tab">
                  <QrCode size={16} />
                  <span />
                </div>
                <div className="kf-phone-tab">
                  <Building2 size={16} />
                  <span />
                </div>
                <div className="kf-phone-tab">
                  <User size={16} />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* MARQUEE PAYS */}
      <section className="kf-marquee" aria-label="Pays couverts">
        <div className="kf-marquee-track">
          {[0, 1].map((group) => (
            <span className="kf-marquee-group" key={group} aria-hidden={group === 1}>
              {flags.map((f, i) => (
                <span className="kf-marquee-item" key={i}>
                  {f}
                </span>
              ))}
              <span className="kf-marquee-sep" aria-hidden="true">
                <Plane size={14} />
              </span>
            </span>
          ))}
        </div>
      </section>


      {/* FEATURES */}
      <section className="kf-features">
        {features.map((f, i) => (
          <div className="kf-feature-card" key={i}>
            <span className="kf-feature-shine" aria-hidden="true" />
            <div className="kf-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>


      {/* STATS */}
      <section className="kf-stats">
        <StatItem value={500} suffix=" K+" label="voyageurs connectés" icon={Users} />
        <StatItem value={130} suffix="+" label="destinations" icon={Globe2} />
        <StatItem value={4.8} suffix="" decimals={1} label="note moyenne" icon={Star} />
        <StatItem value={24} suffix="/7" label="support disponible" icon={Headphones} />
      </section>


      {/* DESTINATIONS */}
      <section className="kf-destinations" id="destinations">
        <h2 className="kf-section-title">Quelle destination vous appelle&nbsp;?</h2>
        <p className="kf-section-subtitle">Trouvez le forfait idéal avec KonnectiFly</p>

        <div className="kf-destinations-toolbar">
          <ScopeToggle
            scope={destinationScope}
            onChange={setDestinationScope}
            options={[
              { value: "local", label: "Locales", icon: MapPin },
              { value: "regional", label: "Régionales", icon: Map },
              { value: "global", label: "Globales", icon: Globe2 },
            ]}
          />

          <Link className="kf-cta-btn" to={user ? "/dashboard/packages" : "/login"}>
            Voir toutes les destinations
            <ArrowUpRight size={16} className="kf-cta-arrow" />
          </Link>
        </div>

   <div className="kf-destinations-grid">
  {destinationsByScope[destinationScope].map((d) => (
    <div
      className="kf-destination-card"
      key={`${destinationScope}-${d.id || d.name}`}
    >
      <span className="kf-destination-shine" aria-hidden="true" />

      <div className="kf-destination-info">
        <span className="kf-destination-flag-badge">
          {d.flagUrl ? <img src={d.flagUrl} alt="" /> : d.flag}
        </span>
        <strong>{d.name}</strong>

        <span className="kf-destination-price">
          {d.price && d.price !== "—" ? `À partir de ${d.price}DZ` : "Forfaits bientôt disponibles"}
        </span>

        {d.plans?.length > 0 && (
          <ul className="kf-destination-plans">
            {d.plans.map((p, i) => (
              <li key={p.id ?? i}>
                {[formatData(p.data), formatDays(p.days)].filter(Boolean).join(" · ")}
                <b>${p.price}</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="kf-destination-photo"
        style={{ backgroundImage: `url(${d.image})` }}
        aria-hidden="true"
      />
    </div>
  ))}
</div>
      </section>


      {/* COMMENT ÇA MARCHE */}
      <section className="kf-how" id="comment-ca-marche">
        <span className="kf-how-glow" aria-hidden="true" />

        <h2 className="kf-section-title kf-center">
          Comment décoller avec KonnectiFly&nbsp;?
        </h2>
        <p className="kf-section-subtitle kf-center">
          Pas de carte SIM physique, pas de configuration complexe. Achetez,
          scannez, volez connecté.
        </p>

        <div className="kf-steps">
          <span className="kf-steps-track" aria-hidden="true">
            <i />
          </span>

          {steps.map((s, i) => (
            <div className="kf-step" key={i}>
              <div className="kf-step-head">
                <div className="kf-step-number">{i + 1}</div>
                <span className="kf-step-icon">{s.icon}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {i === 0 && (
                <span className="kf-step-badge">
                  <Check size={12} /> Sans carte physique
                </span>
              )}
            </div>
          ))}
        </div>
      </section>


      {/* COMPATIBILITÉ */}
      <section className="kf-compat" id="compatibilite">
        <div className="kf-compat-icons">
          <span className="kf-compat-ring" aria-hidden="true" />
          <span className="kf-compat-ring kf-compat-ring-2" aria-hidden="true" />
          <Smartphone size={64} strokeWidth={1.2} className="kf-compat-phone" />
          <Apple size={40} strokeWidth={1.2} className="kf-compat-apple" />
          <span className="kf-compat-pill kf-compat-pill-1">
            <BadgeCheck size={13} /> eSIM ready
          </span>
          <span className="kf-compat-pill kf-compat-pill-2">
            <Rocket size={13} /> Activation 30s
          </span>
        </div>

        <div className="kf-compat-text">
          <h2 className="kf-section-title">
            Vérifiez si votre téléphone est compatible eSIM
          </h2>
          <p className="kf-section-subtitle">
            Avant de décoller, vérifiez que votre téléphone accepte les eSIM
            KonnectiFly partout dans le monde.
          </p>

          <div className="kf-compat-chips">
            {compatiblePhones.map((p, i) => (
              <span className="kf-compat-chip" key={i}>
                <Check size={14} />
                {p}
              </span>
            ))}
            <a href="#compatibilite" className="kf-compat-chip kf-compat-chip-accent">
              Tous les téléphones compatibles
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>


      {/* CONFIANCE */}
      <section className="kf-trust-section" id="confiance">
        <h2 className="kf-section-title kf-center">
          Pourquoi les voyageurs font confiance à KonnectiFly&nbsp;?
        </h2>
        <p className="kf-section-subtitle kf-center">
          Un seul clic pour voyager à travers les nations
        </p>

        <div className="kf-trust-grid">
          {trustCards.map((c, i) => (
            <div
              className={`kf-trust-card ${i === 1 ? "kf-trust-card-accent" : ""}`}
              key={i}
            >
              <span className="kf-trust-shine" aria-hidden="true" />
              <div className="kf-trust-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA FINAL */}
      <section className="kf-footer-cta">
        <span className="kf-cta-glow" aria-hidden="true" />
        <span className="kf-cta-shine" aria-hidden="true" />
        <span className="kf-cta-dots" aria-hidden="true" />

        <div className="kf-footer-cta-text">
          <span className="kf-eyebrow kf-eyebrow-light">
            <span className="kf-eyebrow-pulse" />
            Prêt pour le décollage
          </span>
          <h2>Prêt à décoller connecté&nbsp;?</h2>
          <p>Rejoignez plus de 500 000 voyageurs KonnectiFly.</p>
        </div>

        <div className="kf-footer-cta-actions">
          <button
            className="kf-cta-btn kf-cta-btn-light"
            onClick={() =>
              document
                .getElementById("destinations")
                ?.scrollIntoView({ block: "start" })
            }
          >
            Explorer tous les forfaits
            <ArrowUpRight size={16} className="kf-cta-arrow" />
          </button>
          <span className="kf-cta-note">
            <ShieldCheck size={14} /> Paiement sécurisé · Sans engagement
          </span>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="kf-footer">
        <div className="kf-footer-inner">
          <div className="kf-footer-brand">
            <span className="kf-logo-icon kf-logo-icon-sm">
              <Plane size={16} />
            </span>
            <span className="kf-logo-text">
              Konnecti<span className="kf-logo-accent">Fly</span>
            </span>
          </div>

          <nav className="kf-footer-links">
            {navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <nav className="kf-footer-legal" aria-label="Informations légales">
            <Link to="/legal#mentions">Mentions légales</Link>
            <Link to="/legal#cgu">CGU</Link>
            <Link to="/legal#confidentialite">Confidentialité</Link>
          </nav>

          <span className="kf-footer-copy">
            © {new Date().getFullYear()} KonnectiFly. Tous droits réservés.
          </span>
        </div>
      </footer>


      {/* BACK TO TOP */}
      <button
        className="kf-to-top kf-to-top-visible"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
      >
        <ArrowUp size={18} />
      </button>
    </div>















  )
}