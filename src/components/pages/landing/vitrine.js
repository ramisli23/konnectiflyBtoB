import { useState } from "react"
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
  ShieldCheck,
  Smartphone,
  Apple,
  SlidersHorizontal,
  Home as HomeIcon,
  Building2,
  LogOut,
} from "lucide-react"
import "./vitrine.css"
import europe from "../../../assets/images/europe.jpeg"
import turquie from "../../../assets/images/turquie.jpeg"
import egypte from "../../../assets/images/egypte.jpeg"


import usa from "../../../assets/images/usa.png";
import canada from "../../../assets/images/canada.png";
import japon from "../../../assets/images/japon.png";

import espagne from "../../../assets/images/espagne.jpeg";
import emirats from "../../../assets/images/emirats.png";
import uk from "../../../assets/images/uk.png";
import mexique from "../../../assets/images/mexique.jpeg";
import northafrica from "../../../assets/images/northafrica.jpeg"
import asie from "../../../assets/images/asie.jpeg"
import global from "../../../assets/images/global.jpeg"
export default function KonnectiFlyLanding({ onLogin, user, onLogout }) {
  const [destinationScope, setDestinationScope] = useState("local")
  const [showUserMenu, setShowUserMenu] = useState(false)

  const flags = ["🇺🇸", "🇬🇧", "🇯🇵", "🇦🇪", "🇹🇷", "🇪🇸", "🇫🇷"]

  const features = [
    {
      icon: <Wallet size={26} />,
      title: "Forfaits Abordables",
      text: "Restez connecté partout sans exploser votre budget.",
    },
    {
      icon: <Clock3 size={26} />,
      title: "Itinérance Gratuite",
      text: "Dites adieu aux frais de roaming à chaque frontière.",
    },
    {
      icon: <Wifi size={26} />,
      title: "Internet Fiable et Rapide",
      text: "Naviguez, diffusez et restez connecté sans interruption.",
    },
    {
      icon: <QrCode size={26} />,
      title: "Installation Facile",
      text: "Activez votre eSIM KonnectiFly en quelques clics.",
    },
  ]

  const localDestinations = [
  {
    name: "États-Unis",
    flag: "🇺🇸",
    price: "1.92",
    image: usa,
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    price: "4.50",
    image: canada,
  },
  {
    name: "Japon",
    flag: "🇯🇵",
    price: "1.54",
    image: japon,
  },
  {
    name: "Turquie",
    flag: "🇹🇷",
    price: "2.10",
    image: turquie,
  },
  {
    name: "Espagne",
    flag: "🇪🇸",
    price: "1.39",
    image: espagne,
  },
  {
    name: "Émirats arabes unis",
    flag: "🇦🇪",
    price: "3.75",
    image: emirats,
  },
  {
    name: "Royaume-Uni",
    flag: "🇬🇧",
    price: "1.62",
    image: uk,
  },
  {
    name: "Mexique",
    flag: "🇲🇽",
    price: "2.61",
    image: mexique,
  },
];

  const regionalDestinations = [
    { name: "Europe", flag: "🌍",image:europe, price: "8.50" },
    { name: "Afrique du Nord",image:northafrica, flag: "🌍", price: "6.90" },
    { name: "Asie du Sud-Est",image:asie, flag: "🌏", price: "9.20" },
    { name: "Amérique du Nord",image:usa, flag: "🌎", price: "7.40" },
  ]

  const globalDestinations = [
    { name: "Global 130+ pays",image:global, flag: "🌐", price: "19.90" },
  ]

  const destinationsByScope = {
    local: localDestinations,
    regional: regionalDestinations,
    global: globalDestinations,
  }

const phoneDestinations = [
  {
    name: "Europe",
    flag: "🇪🇺",
    image: europe,
  },
  {
    name: "Turquie",
    flag: "🇹🇷",
    image: turquie,
  },
  {
    name: "Égypte",
    flag: "🇪🇬",
    image: egypte,
  },
];

  const steps = [
    {
      number: "1",
      title: "Achetez un forfait KonnectiFly",
      text: "Choisissez votre destination et le forfait data qui vous correspond.",
    },
    {
      number: "2",
      title: "Installez l'eSIM",
      text: "Scannez le QR code ou installez en un tap depuis l'app.",
    },
    {
      number: "3",
      title: "Décollez connecté",
      text: "Votre forfait s'active automatiquement à l'arrivée.",
    },
  ]

  const compatiblePhones = [
    "iPhone XS et versions ultérieures",
    "Pixel 4 et versions ultérieures",
    "Samsung Galaxy série S20 - S25",
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

  return (
    <div className="kf-landing">
      {/* NAVBAR */}
      <header className="kf-navbar">
        <div className="kf-navbar-inner">
          <div className="kf-logo">
            <span className="kf-logo-icon">
              <Plane size={22} />
            </span>
            <span className="kf-logo-text">
              Konnecti<span className="kf-logo-accent">Fly</span>
            </span>
          </div>

          <nav className="kf-nav-links">
            <a href="#destinations">Acheter une eSIM</a>
            <a href="#partner">
              Devenir partenaire <ChevronDown size={14} />
            </a>
            <a href="#plus">
              Plus <ChevronDown size={14} />
            </a>
          </nav>
          <div className="kf-navbar-actions">
            <button className="kf-icon-btn">
              <ShoppingCart size={18} />
              <span className="kf-cart-badge">0</span>
            </button>

            {user ? (
              <div className="kf-user-menu">
                <button
                  className="kf-pill-btn kf-user-btn"
                  onClick={() => setShowUserMenu((s) => !s)}
                >
                  <span className="kf-user-avatar">{initials || <User size={14} />}</span>
                  {user.name}
                  <ChevronDown size={14} />
                </button>
                {showUserMenu && (
                  <div className="kf-user-dropdown">
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
                Connexion
              </button>
            )}

            <button className="kf-pill-btn kf-pill-btn-muted">
              <Search size={16} />
              Rechercher
            </button>

            <button className="kf-icon-btn">
              <Moon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="kf-hero">
        <div className="kf-hero-text">
          <h1 className="kf-hero-title">
            KonnectiFly
            <br />
            Volez <span className="kf-hero-highlight">Connecté</span>
            <br />
            Partout <span className="kf-hero-highlight">Ailleurs</span>
          </h1>

          <p className="kf-hero-subtitle">
            Voyagez léger avec des forfaits eSIM pensés pour les voyageurs.
            Une connexion internet rapide qui s'active à l'atterrissage, dans
            plus de 130 destinations.
          </p>

          <div className="kf-hero-search">
            <input
              type="text"
              placeholder="Entrez votre destination"
              className="kf-hero-search-input"
            />
            <button className="kf-hero-search-btn">
              <Search size={18} />
            </button>
          </div>

          <div className="kf-hero-flags">
            {flags.map((f, i) => (
              <span key={i} className="kf-hero-flag">
                {f}
              </span>
            ))}
          </div>

          <div className="kf-hero-trust">
            <div className="kf-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span className="kf-hero-trust-text">
              4.8/5 — plus de 500 000 voyageurs connectés
            </span>
          </div>
        </div>

        <div className="kf-hero-visual">
          <div className="kf-hero-glow" />

          <div className="kf-hero-card kf-hero-card-1">
            <Plane size={20} />
            <div>
              <strong>Vol AF 1284</strong>
              <span>Paris → Tokyo</span>
            </div>
          </div>

          <div className="kf-hero-phone">
            <div className="kf-hero-phone-notch" />
            <div className="kf-hero-phone-screen">
              <div className="kf-phone-header">
                <div className="kf-phone-statusbar">
                  <span>14:52</span>
                  <div className="kf-phone-statusbar-icons">
                    <span className="kf-status-dot" />
                    <span className="kf-status-dot" />
                    <span className="kf-status-dot" />
                  </div>
                </div>
                <div className="kf-phone-greeting">
                  <div className="kf-phone-avatar">
                    {user ? initials || "J" : "J"}
                  </div>
                  <div>
                    <p className="kf-phone-greeting-name">
                      Salut, {user ? user.name.split(" ")[0] : "John"}
                    </p>
                    <p className="kf-phone-greeting-sub">
                      Restez connecté partout <span></span>
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

                <p className="kf-phone-section-label">
  Destinations populaires
</p>

<div className="kf-phone-destinations-rail">
  {phoneDestinations.map((d, i) => (
    <div
      className="kf-phone-dest-card"
      key={i}
      style={{
        backgroundImage: `url(${d.image})`,
      }}
    >
      <span className="kf-phone-dest-flag">
        {d.flag}
      </span>

      <span className="kf-phone-dest-name">
        {d.name}
      </span>
    </div>
  ))}
</div>

                <div className="kf-hero-phone-promo">
                  <span>Partez à l'international</span>
                  <p>20 Go pour seulement $22.70 dans 150+ pays</p>
                </div>

                <div className="kf-phone-toggle-row">
                  <button className="kf-phone-toggle kf-phone-toggle-active">
                    Data Only
                  </button>
                  <button className="kf-phone-toggle">Data + Voice</button>
                </div>
              </div>

              <div className="kf-phone-tabbar">
                <div className="kf-phone-tab kf-phone-tab-active">
                  <HomeIcon size={16} />
                </div>
                <div className="kf-phone-tab">
                  <QrCode size={16} />
                </div>
                <div className="kf-phone-tab">
                  <Building2 size={16} />
                </div>
                <div className="kf-phone-tab">
                  <User size={16} />
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </section>

      {/* FEATURES */}
      <section className="kf-features">
        {features.map((f, i) => (
          <div className="kf-feature-card" key={i}>
            <div className="kf-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      {/* DESTINATIONS */}
      <section className="kf-destinations" id="destinations">
        <h2 className="kf-section-title">Quelle destination vous appelle ?</h2>
        <p className="kf-section-subtitle">
          Trouvez le forfait idéal avec KonnectiFly
        </p>

        <div className="kf-destinations-toolbar">
          <div className="kf-scope-toggle">
            <button
              className={`kf-scope-btn ${
                destinationScope === "local" ? "kf-scope-btn-active" : ""
              }`}
              onClick={() => setDestinationScope("local")}
            >
              <MapPin size={16} />
              Locales
            </button>
            <button
              className={`kf-scope-btn ${
                destinationScope === "regional" ? "kf-scope-btn-active" : ""
              }`}
              onClick={() => setDestinationScope("regional")}
            >
              <Map size={16} />
              Régionales
            </button>
            <button
              className={`kf-scope-btn ${
                destinationScope === "global" ? "kf-scope-btn-active" : ""
              }`}
              onClick={() => setDestinationScope("global")}
            >
              <Globe2 size={16} />
              Globales
            </button>
          </div>

          <button className="kf-cta-btn">
            <ArrowUpRight size={16} />
            Voir toutes les destinations
          </button>
        </div>

     <div className="kf-destinations-grid">
  {destinationsByScope[destinationScope].map((d, i) => (
    <div className="kf-destination-card" key={i}>

      <div
        className="kf-destination-photo"
        style={{
          backgroundImage: `url(${d.image})`,
        }}
      >
       
      </div>

      <div className="kf-destination-info">
        <strong>{d.name}</strong>
        <span>À partir de ${d.price}</span>
      </div>

      <ArrowUpRight
        size={16}
        className="kf-destination-arrow"
      />

    </div>
  ))}
</div>
      </section>

      {/* HOW IT WORKS */}
      <section className="kf-how">
        <h2 className="kf-section-title kf-center">
          Comment décoller avec KonnectiFly ?
        </h2>
        <p className="kf-section-subtitle kf-center">
          Pas de carte SIM physique, pas de configuration complexe. Achetez,
          scannez, volez connecté.
        </p>

        <div className="kf-steps">
          {steps.map((s, i) => (
            <div className="kf-step" key={i}>
              <div className="kf-step-number">{s.number}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPATIBILITY */}
      <section className="kf-compat">
        <div className="kf-compat-icons">
          <Smartphone size={64} strokeWidth={1.2} />
          <Apple size={40} strokeWidth={1.2} className="kf-compat-apple" />
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
                {p}
              </span>
            ))}
            <a href="#" className="kf-compat-chip kf-compat-chip-accent">
              Tous les téléphones compatibles →
            </a>
          </div>
        </div>
      </section>

      {/* WHY TRUST US */}
      <section className="kf-trust-section">
        <h2 className="kf-section-title kf-center">
          Pourquoi les voyageurs font confiance à KonnectiFly ?
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
              <div className="kf-trust-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="kf-footer-cta">
        <div>
          <h2>Prêt à décoller connecté ?</h2>
          <p>Rejoignez plus de 500 000 voyageurs KonnectiFly.</p>
        </div>
        <button className="kf-cta-btn kf-cta-btn-light">
          <ArrowUpRight size={16} />
          Explorer tous les forfaits
        </button>
      </section>
    </div>
  )
}