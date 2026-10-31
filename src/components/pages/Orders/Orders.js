import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useOutletContext } from "react-router-dom"

import {
  ArrowLeft,
  PanelLeft,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Check,
  Copy,
  Receipt,
  Wifi,
  Clock,
  Wallet,
  Smartphone,
  ShoppingBag,
  BookOpen,
  Printer,
  Mail,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

import "./orders.css"

import {
  getLocalOrders,
  mergeOrders,
  normalizeOrder,
  ORDER_STATUS_LABELS,
} from "../../../services/orders"

import {
  getAgencyOrders,
  getAgencyOrdersSummary,
  getAgencyOrder,
  getAuthToken,
  decodeToken,
} from "../../../services/Api"

/* =====================================================
   FORMAT
   ===================================================== */

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const formatDZD = (value) => Number(value || 0).toLocaleString("fr-FR")

const formatDate = (iso) => DATE_FORMAT.format(new Date(iso))

const formatDateTime = (iso) => DATE_TIME_FORMAT.format(new Date(iso))

/** Recherche insensible aux accents et à la casse. */
const normalizeSearch = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const COLUMNS = [
  { key: "reference", label: "Référence" },
  { key: "countryName", label: "Destination" },
  { key: "packageLabel", label: "Forfait" },
  { key: "priceDZD", label: "Montant", numeric: true },
  { key: "createdAt", label: "Date" },
  { key: "status", label: "Statut" },
]

/* Statuts internes → valeurs attendues par le backend */
const API_STATUS = {
  active: "active",
  processing: "in_progress",
  expired: "expired",
}

async function copyText(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // repli ci-dessous
  }

  try {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"

    document.body.appendChild(area)
    area.select()

    const ok = document.execCommand("copy")
    area.remove()

    return ok
  } catch {
    return false
  }
}

/** Identifiant de l'agence connectée (profil, sinon jeton). */
function resolveAgencyId(user) {
  return (
    user?.id ||
    user?.agency_id ||
    user?.agencyId ||
    decodeToken(getAuthToken())?.id ||
    null
  )
}

/**
 * La synthèse vient du backend et ignore les commandes encore
 * locales (créées depuis le Checkout avant l'endpoint POST).
 * On les ajoute pour garder des indicateurs cohérents.
 */
function addPendingLocalOrders(summary, apiOrders, localOrders) {
  if (!summary) return null

  const apiReferences = new Set(apiOrders.map((order) => order.reference))

  const pending = localOrders.filter(
    (order) => order.reference && !apiReferences.has(order.reference)
  )

  if (!pending.length) return summary

  const processing = pending.filter(
    (order) => (order.status || "processing") === "processing"
  ).length

  return {
    ...summary,
    commandes: Number(summary.commandes ?? 0) + pending.length,
    enCours: Number(summary.enCours ?? 0) + processing,
    montantTotal:
      Number(summary.montantTotal ?? 0) +
      pending.reduce((sum, order) => sum + Number(order.priceDZD || 0), 0),
  }
}

/* =====================================================
   CHARGEMENT DES COMMANDES
   ===================================================== */

function useAgencyOrdersData(agencyId, status, withSummary = true) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    orders: [],
    summary: null,
  })

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    setState((current) => ({ ...current, loading: true, error: null }))

    if (!agencyId) {
      setState({
        loading: false,
        error: "Identifiant d'agence indisponible.",
        orders: mergeOrders([], getLocalOrders()),
        summary: null,
      })

      return () => {
        active = false
      }
    }

    const listRequest = getAgencyOrders(agencyId, {
      status: API_STATUS[status] || status,
    })

    const request = withSummary
      ? Promise.all([listRequest, getAgencyOrdersSummary(agencyId)])
      : listRequest.then((list) => [list, null])

    request
      .then(([list, summary]) => {
        if (!active) return

        const localOrders = getLocalOrders()

        setState({
          loading: false,
          error: null,
          orders: mergeOrders(list.data, localOrders),
          summary: withSummary
            ? addPendingLocalOrders(summary, list.data, localOrders)
            : null,
        })
      })
      .catch((err) => {
        if (!active) return

        setState({
          loading: false,
          error:
            err?.message ||
            "Impossible de charger les commandes. Vérifiez votre connexion.",
          orders: mergeOrders([], getLocalOrders()),
          summary: null,
        })
      })

    return () => {
      active = false
    }
  }, [agencyId, status, withSummary, reloadKey])

  return {
    ...state,
    reload: () => setReloadKey((value) => value + 1),
  }
}

/* =====================================================
   PAGE — LISTE DES COMMANDES
   Route : /dashboard/orders
   ===================================================== */

export default function Orders() {
  const navigate = useNavigate()

  const { user } = useOutletContext() || {}

  const agencyId = resolveAgencyId(user)

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" })

  const { orders, summary, loading, error, reload } = useAgencyOrdersData(
    agencyId,
    status
  )

  const currency = summary?.currency || "DZD"

  /* ---------- INDICATEURS ---------- */

  const stats = useMemo(() => {
    if (summary) {
      return {
        total: Number(summary.commandes ?? orders.length),
        active: Number(summary.esimActives ?? 0),
        processing: Number(summary.enCours ?? 0),
        amount: Number(summary.montantTotal ?? 0),
      }
    }

    return {
      total: orders.length,
      active: orders.filter((order) => order.status === "active").length,
      processing: orders.filter((order) => order.status === "processing").length,
      amount: orders.reduce((sum, order) => sum + Number(order.priceDZD || 0), 0),
    }
  }, [orders, summary])

  /* ---------- FILTRES ---------- */

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query.trim())

    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false

      if (!needle) return true

      return normalizeSearch(
        [
          order.reference,
          order.countryName,
          order.packageLabel,
          order.customer?.email,
        ].join(" ")
      ).includes(needle)
    })
  }, [orders, query, status])

  const sorted = useMemo(() => {
    const valueOf = (order) => {
      if (sort.key === "priceDZD") return Number(order.priceDZD || 0)

      if (sort.key === "status") return ORDER_STATUS_LABELS[order.status] || ""

      if (sort.key === "createdAt") return order.createdAt

      return String(order[sort.key] ?? "").toLowerCase()
    }

    return [...filtered].sort((a, b) => {
      const left = valueOf(a)
      const right = valueOf(b)

      if (left < right) return sort.dir === "asc" ? -1 : 1

      if (left > right) return sort.dir === "asc" ? 1 : -1

      return 0
    })
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage))

  const currentPage = Math.min(page, totalPages)

  const firstIndex = (currentPage - 1) * rowsPerPage

  const pageRows = sorted.slice(firstIndex, firstIndex + rowsPerPage)

  /* ---------- ACTIONS ---------- */

  const resetPage = () => setPage(1)

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "createdAt" ? "desc" : "asc" }
    )

    resetPage()
  }

  const handleExport = () => {
    if (!sorted.length) return

    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`

    const lines = [
      ["Référence", "Destination", "Forfait", `Montant (${currency})`, "Date", "Statut"]
        .map(cell)
        .join(";"),
      ...sorted.map((order) =>
        [
          order.reference,
          order.countryName,
          order.packageLabel,
          order.priceDZD,
          formatDateTime(order.createdAt),
          ORDER_STATUS_LABELS[order.status],
        ]
          .map(cell)
          .join(";")
      ),
    ]

    const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="orders-page">
      {/* ---------- EN-TÊTE ---------- */}

      <div className="orders-header">
        <button
          type="button"
          className="orders-back-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="Retour au dashboard"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="orders-header-divider" />

        <PanelLeft size={17} className="orders-header-icon" />

        <h2 className="orders-header-title">Dashboard</h2>
      </div>

      {/* ---------- TITRE ---------- */}

      <div className="orders-page-header">
        <div>
          <h1 className="orders-title">Commandes</h1>

          <p className="orders-subtitle">
            Retrouvez vos eSIM achetées et leurs informations d&apos;activation.
          </p>
        </div>

        <button
          type="button"
          className="orders-add-btn"
          onClick={() => navigate("/dashboard/packages")}
        >
          <ShoppingBag size={16} />
          Acheter un package
        </button>
      </div>

      {/* ---------- INDICATEURS ---------- */}

      <div className="orders-stats">
        <div className="orders-stat orders-stat-dark">
          <span className="orders-stat-label">
            <Receipt size={14} />
            Commandes
          </span>

          <strong className="orders-stat-value">{stats.total}</strong>
        </div>

        <div className="orders-stat">
          <span className="orders-stat-label">
            <Wifi size={14} />
            eSIM actives
          </span>

          <strong className="orders-stat-value">{stats.active}</strong>
        </div>

        <div className="orders-stat">
          <span className="orders-stat-label">
            <Clock size={14} />
            En cours
          </span>

          <strong className="orders-stat-value">{stats.processing}</strong>
        </div>

        <div className="orders-stat">
          <span className="orders-stat-label">
            <Wallet size={14} />
            Montant total
          </span>

          <strong className="orders-stat-value">
            {formatDZD(stats.amount)} <small>{currency}</small>
          </strong>
        </div>
      </div>

      {/* ---------- ERREUR ---------- */}

      {error && (
        <div className="orders-error" role="alert">
          <AlertCircle size={16} />

          <span>{error}</span>

          <button type="button" className="orders-error-retry" onClick={reload}>
            <RefreshCw size={14} />
            Réessayer
          </button>
        </div>
      )}

      {/* ---------- TABLE ---------- */}

      <section className="orders-table-card" aria-labelledby="orders-list-title">
        <h2 id="orders-list-title" className="orders-sr-only">
          Liste des commandes
        </h2>

        <div className="orders-toolbar">
          <div className="orders-search">
            <Search size={15} />

            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                resetPage()
              }}
              placeholder="Rechercher une référence, une destination…"
              aria-label="Rechercher une commande"
            />

            {query && (
              <button
                type="button"
                className="orders-search-clear"
                onClick={() => {
                  setQuery("")
                  resetPage()
                }}
                aria-label="Effacer la recherche"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="orders-status-filter" role="group" aria-label="Filtrer par statut">
            {[
              { value: "all", label: "Toutes" },
              { value: "active", label: "Actives" },
              { value: "processing", label: "En cours" },
              { value: "expired", label: "Expirées" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className="orders-status-btn"
                aria-pressed={status === option.value}
                onClick={() => {
                  setStatus(option.value)
                  resetPage()
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="orders-export-btn"
            onClick={handleExport}
            disabled={!sorted.length}
          >
            <Download size={15} />
            Exporter
          </button>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const active = sort.key === column.key
                  const Icon = active
                    ? sort.dir === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown

                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={column.numeric ? "orders-th-numeric" : undefined}
                      aria-sort={
                        active
                          ? sort.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className="orders-sort-btn"
                        data-active={active}
                        onClick={() => toggleSort(column.key)}
                      >
                        {column.label}
                        <Icon size={12} />
                      </button>
                    </th>
                  )
                })}

                <th scope="col" className="orders-th-actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((order) => (
                <tr key={order.reference}>
                  <td>
                    <code className="orders-ref">{order.reference}</code>
                  </td>

                  <td className="orders-country-cell">{order.countryName}</td>

                  <td>{order.packageLabel}</td>

                  <td className="orders-amount-cell">
                    {formatDZD(order.priceDZD)} <small>{order.currency}</small>
                  </td>

                  <td className="orders-date-cell">{formatDate(order.createdAt)}</td>

                  <td>
                    <span className={`orders-status orders-status-${order.status}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>

                  <td>
                    <div className="orders-actions">
                      <button
                        type="button"
                        className="orders-action-btn"
                        onClick={() =>
                          navigate(`/dashboard/orders/${order.reference}`)
                        }
                        aria-label={`Voir la commande ${order.reference}`}
                        title="Voir la commande"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="orders-loading" role="status">
              <span className="orders-loading-dot" />
              Chargement des commandes…
            </div>
          )}

          {!loading && !sorted.length && (
            <div className="orders-empty">
              <strong>Aucune commande</strong>

              {orders.length
                ? "Aucun résultat ne correspond à votre recherche."
                : "Vos eSIM achetées apparaîtront ici."}
            </div>
          )}
        </div>

        {/* ---------- PAGINATION ---------- */}

        <div className="orders-pagination">
          <label className="orders-rows-per-page">
            Lignes par page
            <select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value))
                resetPage()
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>

          <span className="orders-range">
            {sorted.length
              ? `${firstIndex + 1}–${firstIndex + pageRows.length} sur ${sorted.length}`
              : "0 résultat"}
          </span>

          <div className="orders-pagination-right">
            <span className="orders-page-label">
              Page {currentPage} / {totalPages}
            </span>

            <div className="orders-pagination-buttons">
              <button
                type="button"
                className="orders-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                aria-label="Première page"
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                type="button"
                className="orders-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="orders-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="orders-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                aria-label="Dernière page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* =====================================================
   PAGE — DÉTAIL D'UNE COMMANDE
   Route : /dashboard/orders/:reference
   ===================================================== */

export function OrderDetail() {
  const { reference } = useParams()

  const navigate = useNavigate()

  const { user } = useOutletContext() || {}

  const agencyId = resolveAgencyId(user)

  const { orders, loading, error, reload } = useAgencyOrdersData(
    agencyId,
    "all",
    false
  )

  const [copied, setCopied] = useState(null)

  const [detail, setDetail] = useState(null)

  useEffect(() => {
    setDetail(null)
  }, [reference])

  const baseOrder = orders.find(
    (item) =>
      item.reference?.toLowerCase() === String(reference).toLowerCase() ||
      String(item.id) === String(reference)
  )

  useEffect(() => {
    if (!agencyId || !baseOrder?.id) return

    if (baseOrder.qrCodeText) {
      setDetail(baseOrder)
      return
    }

    let active = true

    getAgencyOrder(agencyId, baseOrder.id)
      .then((full) => {
        if (active) setDetail(normalizeOrder(full))
      })
      .catch(() => {
        if (active) setDetail(baseOrder)
      })

    return () => {
      active = false
    }
  }, [agencyId, baseOrder])

  const order = detail || baseOrder

  const header = (
    <div className="orders-header">
      <button
        type="button"
        className="orders-back-btn"
        onClick={() => navigate("/dashboard/orders")}
        aria-label="Retour aux commandes"
      >
        <ArrowLeft size={19} />
      </button>

      <span className="orders-header-divider" />

      <PanelLeft size={17} className="orders-header-icon" />

      <h2 className="orders-header-title">Dashboard</h2>
    </div>
  )

  if (loading) {
    return (
      <div className="orders-page">
        {header}

        <div className="orders-loading orders-loading-page" role="status">
          <span className="orders-loading-dot" />
          Chargement de la commande…
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="orders-page">
        {header}

        <div className="orders-notfound">
          <h1 className="orders-title">
            {error ? "Commande indisponible" : "Commande introuvable"}
          </h1>

          <p className="orders-subtitle">
            {error
              ? error
              : `La référence ${reference} ne correspond à aucune commande.`}
          </p>

          <div className="orders-notfound-actions">
            {error && (
              <button type="button" className="orders-btn-primary" onClick={reload}>
                <RefreshCw size={14} />
                Réessayer
              </button>
            )}

            <button
              type="button"
              className="orders-add-btn"
              onClick={() => navigate("/dashboard/orders")}
            >
              <ArrowLeft size={16} />
              Retour aux commandes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleCopy = async (field, value) => {
    const ok = await copyText(value)

    setCopied(ok ? field : null)

    if (ok) {
      window.setTimeout(() => setCopied(null), 1600)
    }
  }

  const handlePrintOrder = () => {
    const printWindow = window.open("", "_blank", "width=820,height=960")

    if (!printWindow) return

    const qrImg = order.qrCodeText
      ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          order.qrCodeText
        )}" alt="QR code eSIM" width="200" height="200" />`
      : ""

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Commande ${order.reference}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #012a4d; margin: 0; padding: 32px; }
    .doc { max-width: 760px; margin: 0 auto; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0077b6; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; color: #0077b6; }
    .brand small { display: block; font-size: 11px; font-weight: 500; color: #023e73; letter-spacing: 0.08em; text-transform: uppercase; }
    .meta { text-align: right; font-size: 13px; }
    .meta strong { display: block; font-size: 16px; }
    .section { margin-bottom: 20px; }
    .section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #023e73; margin: 0 0 8px; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { background: #eaf4fb; border-radius: 8px; padding: 12px 14px; font-size: 13px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #e5eef7; text-align: left; }
    th { background: #eaf4fb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #023e73; }
    .right { text-align: right; }
    .total { font-weight: 700; color: #0077b6; }
    .qr { text-align: center; }
    .qr img { border-radius: 8px; background: #fff; padding: 6px; }
    .footer { margin-top: 32px; font-size: 11px; color: #023e73; border-top: 1px solid #e5eef7; padding-top: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="doc">
    <div class="top">
      <div class="brand">
        KonnectFly
        <small>Commande eSIM</small>
      </div>
      <div class="meta">
        <strong>${order.reference}</strong>
        ${formatDateTime(order.createdAt)}<br />
        Statut : ${ORDER_STATUS_LABELS[order.status] || order.status}
      </div>
    </div>

    <div class="two section">
      <div>
        <h3>Forfait</h3>
        <div class="box">
          Destination : ${order.countryName}<br />
          Forfait : ${order.packageLabel}<br />
          ${order.packageId ? "Réf. forfait : " + order.packageId + "<br />" : ""}
          ${order.invoiceId ? "Facture : " + order.invoiceId + "<br />" : ""}
          Montant : ${formatDZD(order.priceDZD)} ${order.currency}
        </div>
      </div>
      <div>
        <h3>Client</h3>
        <div class="box">
          ${[order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ") || "—"}<br />
          ${order.customer?.email ? order.customer.email + "<br />" : ""}
          ${order.customer?.phone ? order.customer.phone + "<br />" : ""}
          ${order.customer?.address ? order.customer.address : ""}
        </div>
      </div>
    </div>

    ${
      order.qrCodeText
        ? `<div class="section qr">
            <h3>Activation de l'eSIM</h3>
            ${qrImg}
            <p style="font-size:12px;margin-top:8px;">Scannez ce QR code ou saisissez les informations ci-dessous.</p>
            <div class="box" style="margin-top:8px;">
              ${order.qrCodeText ? "Code LPA : " + order.qrCodeText + "<br />" : ""}
              ${order.smdp ? "Adresse SM-DP+ : " + order.smdp + "<br />" : ""}
              ${order.activationCode ? "Code d'activation : " + order.activationCode + "<br />" : ""}
              ${order.universalLink ? "Lien d'installation : " + order.universalLink + "<br />" : ""}
              ${order.iccid ? "ICCID : " + order.iccid + "<br />" : ""}
              ${order.remDataQuantity != null ? "Données restantes : " + order.remDataQuantity + " " + (order.remDataUnit || "") : ""}
            </div>
          </div>`
        : ""
    }

    <div class="footer">
      Instructions : Réglages → Cellulaire → Ajouter une eSIM → Scanner le QR code ou saisir les informations manuellement.
    </div>
  </div>
</body>
</html>`

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleEmailOrder = () => {
    const recipient = order.customer?.email || "support@konnectifly.com"

    const subject = encodeURIComponent(`Commande ${order.reference} — ${order.countryName}`)

    const body = encodeURIComponent(
      [
        `Bonjour,`,
        ``,
        `Voici le détail de votre commande ${order.reference}.`,
        ``,
        `Destination : ${order.countryName}`,
        `Forfait : ${order.packageLabel}`,
        `Montant : ${formatDZD(order.priceDZD)} ${order.currency}`,
        `Date : ${formatDateTime(order.createdAt)}`,
        `Statut : ${ORDER_STATUS_LABELS[order.status] || order.status}`,
        ``,
        `Activation de l'eSIM :`,
        ...activationLines,
        ``,
        `Merci,`,
        `KonnectFly`,
      ].join("\\n")
    )

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`
  }

  const activationLines = [
    order.qrCodeText ? `Code LPA : ${order.qrCodeText}` : null,
    order.smdp ? `Adresse SM-DP+ : ${order.smdp}` : null,
    order.activationCode ? `Code d'activation : ${order.activationCode}` : null,
    order.universalLink ? `Lien d'installation : ${order.universalLink}` : null,
    order.iccid ? `ICCID : ${order.iccid}` : null,
  ].filter(Boolean)

  const instructions = [
    `Commande ${order.reference} — ${order.countryName}`,
    `Forfait : ${order.packageLabel}`,
    "",
    "Installation de l'eSIM :",
    "1. Réglages → Cellulaire (ou Données mobiles)",
    "2. Ajouter une eSIM → Scanner le QR code ou saisir les informations manuellement",
    ...activationLines,
  ].join("\n")

  const hasActivation =
    Boolean(order.smdp) ||
    Boolean(order.activationCode) ||
    Boolean(order.iccid) ||
    Boolean(order.qrCodeText) ||
    Boolean(order.universalLink)

  const reorder = () =>
    order.countryScope && order.countryId
      ? navigate(`/dashboard/packages/${order.countryScope}/${order.countryId}`)
      : navigate("/dashboard/packages")

  return (
    <div className="orders-page">
      {/* ---------- EN-TÊTE ---------- */}

      {header}

      {/* ---------- TITRE ---------- */}

      <div className="orders-page-header">
        <div>
          <h1 className="orders-title">
            Commande <code>{order.reference}</code>
          </h1>

          <p className="orders-subtitle">
            Passée le {formatDateTime(order.createdAt)}
          </p>
        </div>

        <span className={`orders-status orders-status-${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {order.status === "expired" && (
        <p className="orders-alert" role="status">
          Cette eSIM est arrivée à échéance. Achetez un nouveau forfait pour
          continuer à vous connecter.
        </p>
      )}

      {order.errorMessage && (
        <p className="orders-alert orders-alert-error" role="alert">
          <AlertCircle size={15} />
          {order.errorMessage}
        </p>
      )}

      <div className="orders-detail-grid">
        {/* ---------- FORFAIT ---------- */}

        <section className="orders-card">
          <h2 className="orders-card-title">
            <Smartphone size={16} />
            Forfait
          </h2>

          <dl className="orders-detail-list">
            <div>
              <dt>Destination</dt>
              <dd>{order.countryName}</dd>
            </div>

            <div>
              <dt>Forfait</dt>
              <dd>{order.packageLabel}</dd>
            </div>

            {order.packageId && (
              <div>
                <dt>Référence forfait</dt>
                <dd>{order.packageId}</dd>
              </div>
            )}

            {order.invoiceId && (
              <div>
                <dt>Facture</dt>
                <dd>{order.invoiceId}</dd>
              </div>
            )}

            <div>
              <dt>Montant</dt>
              <dd>
                {formatDZD(order.priceDZD)} <small>{order.currency}</small>
              </dd>
            </div>
          </dl>

          <div className="orders-card-actions">
            <button type="button" className="orders-btn-primary" onClick={reorder}>
              <ShoppingBag size={14} />
              Acheter à nouveau
            </button>

            <button
              type="button"
              className="orders-btn-ghost"
              onClick={handlePrintOrder}
            >
              <Printer size={14} />
              Imprimer
            </button>

            <button
              type="button"
              className="orders-btn-ghost"
              onClick={handleEmailOrder}
            >
              <Mail size={14} />
              Envoyer par email
            </button>

            <button
              type="button"
              className="orders-btn-ghost"
              onClick={() => navigate("/dashboard/orders")}
            >
              Retour aux commandes
            </button>
          </div>
        </section>

        {/* ---------- CLIENT ---------- */}

        <section className="orders-card">
          <h2 className="orders-card-title">
            <Receipt size={16} />
            Client
          </h2>

          <dl className="orders-detail-list">
            <div>
              <dt>Nom</dt>
              <dd>
                {[order.customer?.firstName, order.customer?.lastName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </dd>
            </div>

            <div>
              <dt>Email</dt>
              <dd>{order.customer?.email || "—"}</dd>
            </div>

            <div>
              <dt>Téléphone</dt>
              <dd>{order.customer?.phone || "—"}</dd>
            </div>

            {order.customer?.address && (
              <div>
                <dt>Adresse</dt>
                <dd>{order.customer.address}</dd>
              </div>
            )}

            {order.customer?.imei && (
              <div>
                <dt>IMEI</dt>
                <dd>{order.customer.imei}</dd>
              </div>
            )}
          </dl>

          <p className="orders-hint">
            Les instructions d&apos;activation sont envoyées à cet email.
          </p>
        </section>

        {/* ---------- INSTALLATION ---------- */}

        <section className="orders-card orders-card-wide">
          <h2 className="orders-card-title">
            <Wifi size={16} />
            Installation de l&apos;eSIM
          </h2>

          <ol className="orders-steps">
            <li>
              Ouvrez <strong>Réglages → Cellulaire</strong> (ou Données mobiles).
            </li>
            <li>
              Touchez <strong>Ajouter une eSIM</strong> puis scannez le QR code
              reçu par email.
            </li>
            <li>
              Sans QR code, choisissez <strong>Saisir les informations
              manuellement</strong> et utilisez les données ci-dessous.
            </li>
            <li>
              Activez la ligne à l&apos;arrivée et vérifiez que les données
              mobiles sont bien sélectionnées.
            </li>
          </ol>

          {hasActivation ? (
            <>
              {order.qrCodeText && (
                <div className="orders-qr-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      order.qrCodeText
                    )}`}
                    alt="QR code d'activation eSIM"
                    width={220}
                    height={220}
                    className="orders-qr-image"
                  />

                  <p className="orders-qr-caption">
                    Scannez ce QR code avec l'appareil pour installer l'eSIM.
                  </p>

                  <button
                    type="button"
                    className="orders-copy-btn orders-copy-btn-inline"
                    onClick={() => handleCopy("qr", order.qrCodeText)}
                    title={copied === "qr" ? "Copié" : "Copier le code LPA"}
                  >
                    {copied === "qr" ? <Check size={14} /> : <Copy size={14} />}
                    {copied === "qr" ? "Code LPA copié" : "Copier le code LPA"}
                  </button>
                </div>
              )}

              <dl className="orders-detail-list orders-detail-list-mono">
                {order.universalLink && (
                  <div>
                    <dt>Lien d'installation</dt>
                    <dd>
                      <a
                        href={order.universalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="orders-link"
                      >
                        Configurer sur l'appareil
                      </a>
                    </dd>
                  </div>
                )}

                {order.smdp && (
                <div>
                  <dt>Adresse SM-DP+</dt>
                  <dd>
                    <span>{order.smdp}</span>

                    <button
                      type="button"
                      className="orders-copy-btn"
                      onClick={() => handleCopy("smdp", order.smdp)}
                      aria-label="Copier l'adresse SM-DP+"
                      title={copied === "smdp" ? "Copié" : "Copier"}
                    >
                      {copied === "smdp" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </dd>
                </div>
              )}

              {order.activationCode && (
                <div>
                  <dt>Code d&apos;activation</dt>
                  <dd>
                    <span>{order.activationCode}</span>

                    <button
                      type="button"
                      className="orders-copy-btn"
                      onClick={() => handleCopy("code", order.activationCode)}
                      aria-label="Copier le code d'activation"
                      title={copied === "code" ? "Copié" : "Copier"}
                    >
                      {copied === "code" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </dd>
                </div>
              )}

              {order.iccid && (
                <div>
                  <dt>ICCID</dt>
                  <dd>
                    <span>{order.iccid}</span>

                    <button
                      type="button"
                      className="orders-copy-btn"
                      onClick={() => handleCopy("iccid", order.iccid)}
                      aria-label="Copier l'ICCID"
                      title={copied === "iccid" ? "Copié" : "Copier"}
                    >
                      {copied === "iccid" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </dd>
                </div>
              )}

              {order.remDataQuantity != null && (
                <div>
                  <dt>Données restantes</dt>
                  <dd>
                    {order.remDataQuantity} {order.remDataUnit}
                  </dd>
                </div>
              )}
            </dl>
            </>

          ) : (
            <p className="orders-activation-empty">
              Les informations d&apos;activation (QR code, ICCID) seront
              disponibles dès que la commande aura été traitée par l&apos;opérateur.
            </p>
          )}

          <div className="orders-card-actions">
            <button
              type="button"
              className="orders-btn-primary"
              onClick={() => handleCopy("all", instructions)}
            >
              {copied === "all" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "all" ? "Instructions copiées" : "Copier les instructions"}
            </button>

            <button
              type="button"
              className="orders-btn-ghost"
              onClick={() => navigate("/dashboard/guide")}
            >
              <BookOpen size={14} />
              Guide d&apos;installation
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
