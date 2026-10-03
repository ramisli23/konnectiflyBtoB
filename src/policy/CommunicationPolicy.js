import { useState } from "react"
import "./CommunicationPolicy.css"

import {
  ArrowLeft,
  PanelLeft,
  Sun,
  Moon,
  ShoppingCart,
} from "lucide-react"


/* =========================================================
   CONTENT DATA
   ========================================================= */

const CHANNEL_CARDS = [
  {
    title: "Business & Sales",
    badge: "Email",
    contact: "konnectifly@gmail.com",
    bullets: [
      "Reseller onboarding",
      "Pricing and plans",
      "Billing / account discussions",
      "Partnership & volume inquiries",
    ],
  },
  {
    title: "Technical Support (Urgent)",
    badge: "Email",
    contact: "konnectiflyteam@gmail.com",
    bullets: [
      "eSIM activation issues",
      "Network / connectivity problems",
      "Platform or dashboard concerns",
    ],
    note: "Our specialists monitor this channel. Decisions are made per technical analysis.",
  },
]

const REALTIME_CARDS = [
  {
    title: "Slack (Recommended for Active Resellers)",
    lines: [
      "Create a dedicated Slack channel and invite the eSIMCard support team.",
      "Ideal for quick coordination, escalations, and ongoing collaboration.",
    ],
  },
  {
    title: "24/7 WhatsApp Support",
    contact: "+213559051040",
    lines: ["Available around the clock for urgent assistance and operational support."],
  },
]

const QUICK_CONTACTS = [
  { label: "Sales:", value: "konnectifly@gmail.com "},
  { label: "Technical:", value: "konnectiflyteam@gmail.com" },
  { label: "WhatsApp:", value: "+14072126950" },
]

const COMMITMENTS = [
  {
    title: "Clear Policies,",
    desc: "so you always know what to expect from every interaction.",
  },
  {
    title: "Honest Communication,",
    desc: "with transparent, timely updates on any issue that affects your business.",
  },
  {
    title: "Reliable Technical Support,",
    desc: "backed by specialists who resolve problems, not just acknowledge them.",
  },
]


/* =========================================================
   SMALL SUB-COMPONENTS
   ========================================================= */

function ChannelCard({ title, badge, contact, bullets, note }) {
  return (
    <div className="policy-box">
      <div className="policy-box-head">
        <h4>{title}</h4>
        {badge && <span className="policy-pill">{badge}</span>}
      </div>

      {contact && <p className="policy-contact">{contact}</p>}

      {bullets && (
        <ul className="policy-bullets">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}

      {note && <p className="policy-note">{note}</p>}
    </div>
  )
}

function RealtimeCard({ title, contact, lines }) {
  return (
    <div className="policy-box">
      <h4>{title}</h4>
      {contact && <p className="policy-contact">{contact}</p>}
      {lines.map((l, i) => (
        <p className="policy-note" key={i}>
          {l}
        </p>
      ))}
    </div>
  )
}


/* =========================================================
   COMMUNICATION POLICY PAGE
   ========================================================= */

export default function CommunicationPolicy({ onBack }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`policy-app ${darkMode ? "policy-dark" : ""}`}>

      {/* ================= TOP BAR ================= */}

      <header className="policy-topbar">
        <div className="policy-topbar-left">
          <button className="policy-icon-btn" onClick={onBack} aria-label="Retour">
            <ArrowLeft size={18} />
          </button>

          <button
            className="policy-icon-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Basculer le menu"
          >
            <PanelLeft size={18} />
          </button>

          <span className="policy-topbar-divider" />
          <span className="policy-topbar-title">Dashboard</span>
        </div>

       
      </header>


      <div className="policy-body">

        {/* ================= PAGE HEADER ================= */}

        <div className="policy-page-header">
          <div className="policy-badges">
            <span className="policy-badge">Policy</span>
            <span className="policy-badge">Support</span>
          </div>

          <h1 className="policy-title">Communication Policy</h1>

          <p className="policy-subtitle">
            Clear channels help us respond faster and keep reseller
            operations running smoothly. Use the right contact method below
            for the quickest resolution.
          </p>
        </div>

        <hr className="policy-header-rule" />


        {/* ================= TWO COLUMN LAYOUT ================= */}

        <div className="policy-columns">

          {/* ============ MAIN CONTENT ============ */}

          <div className="policy-card policy-main-card">

            <h2 className="policy-card-title">Communication & Support Policy</h2>
            <p className="policy-card-subtitle">
              Built for fast resolution and scalable reseller support.
            </p>

            <h3 className="policy-section-heading">
              Official Communication Channels
            </h3>

            <div className="policy-grid">
              {CHANNEL_CARDS.map((c) => (
                <ChannelCard key={c.title} {...c} />
              ))}
            </div>

            <hr className="policy-divider" />

            <h3 className="policy-section-heading">Real-Time Support</h3>

            <div className="policy-grid">
              {REALTIME_CARDS.map((c) => (
                <RealtimeCard key={c.title} {...c} />
              ))}
            </div>

            <hr className="policy-divider" />

            <div className="policy-box policy-box-full">
              <div className="policy-box-head">
                <h4>Tier-1 Priority Support</h4>
                <span className="policy-pill">Eligibility Based</span>
              </div>

              <p className="policy-note policy-note-strong">
                Resellers with consistent or high sales volume may qualify
                for Tier-1 Priority Support, which includes:
              </p>

              <ul className="policy-bullets">
                <li>Faster response times</li>
                <li>Priority issue handling</li>
                <li>Direct access to senior support resources</li>
              </ul>

              <p className="policy-note">
                Eligibility is reviewed periodically based on performance
                and volume.
              </p>
            </div>

            <hr className="policy-divider" />

            <h3 className="policy-section-heading">Our Commitment</h3>

            <p className="policy-card-subtitle">
              At eSIMCard, long-term success comes from:
            </p>

            <div className="policy-commitments">
              {COMMITMENTS.map((c) => (
                <p key={c.title}>
                  <strong>{c.title}</strong> {c.desc}
                </p>
              ))}
            </div>

          </div>


          {/* ============ QUICK CONTACTS ============ */}

          <aside className="policy-card policy-quick-card">
            <h3 className="policy-quick-title">Quick Contacts</h3>
            <p className="policy-quick-subtitle">Use the right channel.</p>

            <div className="policy-quick-list">
              {QUICK_CONTACTS.map((row) => (
                <div className="policy-quick-row" key={row.label}>
                  <span className="policy-quick-label">{row.label}</span>
                  <span className="policy-quick-value">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="policy-quick-callout">
              For fastest support, use Slack for ongoing coordination and
              WhatsApp for urgent 24/7 issues.
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}