// src/components/Sidebar/Sidebar.js  (adjust import paths if your folders differ)
import { ChevronFirst, ChevronLast, MoreVertical, LogOut, Wallet, Plus } from "lucide-react"
import { createContext, useContext, useState, useRef, useEffect } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/images/logo3.png"
import {
  subscribeToAgencyBalance,
  checkBalancePayment,
} from "../../services/balanceService"
import TopUpModal, { pendingKey } from "../TopUpModal/TopUpModal"
import "./Sidebar.css"

const SidebarContext = createContext()

export default function Sidebar({ children, user, onLogout }) {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [balance, setBalance] = useState(Number(user?.balance ?? 0))
  const menuRef = useRef(null)

  const displayName = user?.company_name || user?.contact_name || "Invité"
  const displayEmail = user?.email || ""
  const avatarUrl = `https://ui-avatars.com/api/?background=0077b6&color=fff&bold=true&name=${encodeURIComponent(
    displayName
  )}`

  // Live balance from Firebase (updates by itself after a top up)
  useEffect(() => {
    if (!user?.id) return
    const unsubscribe = subscribeToAgencyBalance(
      user.id,
      (b) => setBalance(Number(b) || 0),
      (err) => console.error("Balance realtime error:", err)
    )
    return () => unsubscribe()
  }, [user?.id])

  // If the user paid but closed the modal / page, credit the pending top up on load
  useEffect(() => {
    if (!user?.id) return
    const pending = localStorage.getItem(pendingKey(user.id))
    if (!pending) return
    checkBalancePayment(pending)
      .then((r) => {
        if (r.status === "completed") localStorage.removeItem(pendingKey(user.id))
      })
      .catch(() => {})
  }, [user?.id])

  // Close the account menu when clicking outside it.
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  return (
    <aside className="sidebar-aside">
      <nav
        className={`sidebar-nav ${expanded ? "" : "sidebar-nav-collapsed"}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-wrap">
            <img src={logo} className="sidebar-logo" alt="Logo" />
          </div>

          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="sidebar-toggle-btn"
            aria-label={expanded ? "Réduire le menu" : "Développer le menu"}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        {/* Sidebar items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="sidebar-list">{children}</ul>
        </SidebarContext.Provider>

        {/* Balance + Top Up */}
        {user?.id && (
          expanded ? (
            <div className="sidebar-balance">
              <div className="sidebar-balance-top">
                <Wallet size={16} />
                <span>Solde</span>
              </div>
              <div className="sidebar-balance-amount">
                {balance.toLocaleString("fr-DZ", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <small>DZD</small>
              </div>
              <button
                type="button"
                className="sidebar-topup-btn"
                onClick={() => setTopUpOpen(true)}
                aria-label={`Recharger le solde (actuel : ${balance.toFixed(2)} DZD)`}
                title={`Solde : ${balance.toFixed(2)} DZD — Recharger`}
              >
                <Plus size={15} />
                <span className="sidebar-topup-label">Recharger</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-topup-mini"
              onClick={() => setTopUpOpen(true)}
              aria-label={`Solde ${balance.toFixed(2)} DZD, recharger`}
              title={`${balance.toFixed(2)} DZD — Recharger`}
            >
              <Wallet size={20} />
            </button>
          )
        )}

        {/* Footer */}
        <div className="sidebar-footer" ref={menuRef}>
          <img src={avatarUrl} alt="" className="sidebar-avatar" />

          <div
            className={`sidebar-user-info ${
              expanded ? "sidebar-user-info-visible" : ""
            }`}
          >
            <div className="sidebar-user-text">
              <h4 className="sidebar-user-name">{displayName}</h4>
              <span className="sidebar-user-email">{displayEmail}</span>
            </div>

            <button
              className="sidebar-more-btn"
              aria-label="Plus d'options du compte"
              aria-expanded={menuOpen}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical size={18} className="sidebar-more-icon" />
            </button>

            {menuOpen && (
              <div className="sidebar-account-menu">
                <button
                  type="button"
                  className="sidebar-account-menu-item"
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout?.()
                  }}
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        agencyId={user?.id}
        balance={balance}
      />
    </aside>
  )
}

export function SidebarItem({ icon, text, alert, to, end = false, onClick }) {
  const { expanded } = useContext(SidebarContext)

  const handleKeyDown = (e) => {
    if (!onClick) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick(e)
    }
  }

  return (
    <li>
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "sidebar-item-active" : ""}`
        }
      >
        {/* Icon */}
        <span className="sidebar-item-icon">{icon}</span>

        {/* Text */}
        <span
          className={`sidebar-item-text ${
            expanded ? "sidebar-item-text-visible" : ""
          }`}
        >
          {text}
        </span>

        {/* Alert */}
        {alert && (
          <span
            className={`sidebar-item-alert ${
              expanded ? "sidebar-item-alert-expanded" : ""
            }`}
            aria-hidden="true"
          />
        )}

        {/* Tooltip when collapsed */}
        {!expanded && <div className="sidebar-tooltip">{text}</div>}
      </NavLink>
    </li>
  )
}