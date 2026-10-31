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
  Receipt,
  FileText,
  Wallet,
  Calendar,
  Printer,
  CheckCircle2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"

import "../Orders/orders.css"

import {
  getAgencyOrders,
  getAgencyOrdersSummary,
  getAuthToken,
  decodeToken,
} from "../../../services/Api"

import { getLocalOrders, mergeOrders } from "../../../services/orders"

/* =====================================================
   FORMAT
   ===================================================== */

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
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

const COLUMNS = [
  { key: "reference", label: "Facture" },
  { key: "customerName", label: "Client" },
  { key: "amount", label: "Montant", numeric: true },
  { key: "date", label: "Date" },
  { key: "status", label: "Statut" },
]

const INVOICE_STATUS_LABELS = {
  paid: "Payée",
  pending: "En attente",
}

const normalizeSearch = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function resolveAgencyId(user) {
  return (
    user?.id ||
    user?.agency_id ||
    user?.agencyId ||
    decodeToken(getAuthToken())?.id ||
    null
  )
}

/* =====================================================
   CHARGEMENT
   ===================================================== */

function useInvoicesData(agencyId) {
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

    Promise.all([getAgencyOrders(agencyId, {}), getAgencyOrdersSummary(agencyId)])
      .then(([list, summary]) => {
        if (!active) return

        setState({
          loading: false,
          error: null,
          orders: mergeOrders(list.data, getLocalOrders()),
          summary,
        })
      })
      .catch((err) => {
        if (!active) return

        setState({
          loading: false,
          error:
            err?.message ||
            "Impossible de charger les factures. Vérifiez votre connexion.",
          orders: mergeOrders([], getLocalOrders()),
          summary: null,
        })
      })

    return () => {
      active = false
    }
  }, [agencyId, reloadKey])

  return { ...state, reload: () => setReloadKey((value) => value + 1) }
}

function toInvoice(order) {
  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()

  return {
    id: order.id,
    reference: order.invoiceId || order.reference,
    orderReference: order.reference,
    customerName: customerName || "—",
    email: order.customer?.email || "",
    phone: order.customer?.phone || "",
    address: order.customer?.address || "",
    destination: order.countryName || "—",
    packageLabel: order.packageLabel || "—",
    packageId: order.packageId || "",
    amount: Number(order.priceDZD || 0),
    currency: order.currency || "DZD",
    date: order.createdAt,
    status: order.status === "processing" ? "pending" : "paid",
  }
}

/* =====================================================
   PAGE — LISTE
   ===================================================== */

export default function Invoices() {
  const navigate = useNavigate()

  const { user } = useOutletContext() || {}

  const agencyId = resolveAgencyId(user)

  const { orders, summary, loading, error, reload } = useInvoicesData(agencyId)

  const invoices = useMemo(() => orders.map(toInvoice), [orders])

  const currency = summary?.currency || "DZD"

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const [sort, setSort] = useState({ key: "date", dir: "desc" })

  const stats = useMemo(() => {
    const total = invoices.length
    const paid = invoices.filter((invoice) => invoice.status === "paid").length
    const pending = invoices.filter((invoice) => invoice.status === "pending").length
    const amount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)

    return { total, paid, pending, amount }
  }, [invoices])

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query.trim())

    return invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false

      if (!needle) return true

      return normalizeSearch(
        [
          invoice.reference,
          invoice.orderReference,
          invoice.customerName,
          invoice.email,
          invoice.destination,
        ].join(" ")
      ).includes(needle)
    })
  }, [invoices, query, status])

  const sorted = useMemo(() => {
    const valueOf = (invoice) => {
      if (sort.key === "amount") return Number(invoice.amount || 0)

      if (sort.key === "status") return INVOICE_STATUS_LABELS[invoice.status] || ""

      if (sort.key === "date") return invoice.date

      return String(invoice[sort.key] ?? "").toLowerCase()
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

  const resetPage = () => setPage(1)

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "date" ? "desc" : "asc" }
    )

    resetPage()
  }

  const handleExport = () => {
    if (!sorted.length) return

    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`

    const lines = [
      ["Facture", "Commande", "Client", "Destination", `Montant (${currency})`, "Date", "Statut"]
        .map(cell)
        .join(";"),
      ...sorted.map((invoice) =>
        [
          invoice.reference,
          invoice.orderReference,
          invoice.customerName,
          invoice.destination,
          invoice.amount,
          formatDateTime(invoice.date),
          INVOICE_STATUS_LABELS[invoice.status],
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
    link.download = `factures-${new Date().toISOString().slice(0, 10)}.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="orders-page">
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

      <div className="orders-page-header">
        <div>
          <h1 className="orders-title">Factures</h1>

          <p className="orders-subtitle">
            Cliquez sur une facture pour consulter et imprimer le détail.
          </p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="orders-stat orders-stat-dark">
          <span className="orders-stat-label">
            <FileText size={14} />
            Factures
          </span>

          <strong className="orders-stat-value">{stats.total}</strong>
        </div>

        <div className="orders-stat">
          <span className="orders-stat-label">
            <CheckCircle2 size={14} />
            Payées
          </span>

          <strong className="orders-stat-value">{stats.paid}</strong>
        </div>

        <div className="orders-stat">
          <span className="orders-stat-label">
            <Calendar size={14} />
            En attente
          </span>

          <strong className="orders-stat-value">{stats.pending}</strong>
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

      {error && (
        <div className="orders-error" role="alert">
          <span>{error}</span>

          <button type="button" className="orders-error-retry" onClick={reload}>
            Réessayer
          </button>
        </div>
      )}

      <section className="orders-table-card" aria-labelledby="invoices-list-title">
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
              placeholder="Rechercher une facture, un client…"
              aria-label="Rechercher une facture"
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
              { value: "paid", label: "Payées" },
              { value: "pending", label: "En attente" },
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
                  Voir
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((invoice) => (
                <tr key={invoice.reference}>
                  <td>
                    <code className="orders-ref">{invoice.reference}</code>
                  </td>

                  <td>{invoice.customerName}</td>

                  <td className="orders-amount-cell">
                    {formatDZD(invoice.amount)} <small>{invoice.currency}</small>
                  </td>

                  <td className="orders-date-cell">{formatDate(invoice.date)}</td>

                  <td>
                    <span
                      className={`orders-status orders-status-${
                        invoice.status === "paid" ? "active" : "processing"
                      }`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>

                  <td>
                    <div className="orders-actions">
                      <button
                        type="button"
                        className="orders-action-btn"
                        onClick={() =>
                          navigate(`/dashboard/invoices/${invoice.reference}`)
                        }
                        aria-label={`Voir la facture ${invoice.reference}`}
                        title="Voir la facture"
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
              Chargement des factures…
            </div>
          )}

          {!loading && !sorted.length && (
            <div className="orders-empty">
              <strong>Aucune facture</strong>

              {invoices.length
                ? "Aucun résultat ne correspond à votre recherche."
                : "Vos factures apparaîtront ici après vos premières commandes."}
            </div>
          )}
        </div>

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
   PAGE — DÉTAIL / IMPRESSION D'UNE FACTURE
   Route : /dashboard/invoices/:reference
   ===================================================== */

export function InvoiceDetail() {
  const { reference } = useParams()

  const navigate = useNavigate()

  const { user } = useOutletContext() || {}

  const agencyId = resolveAgencyId(user)

  const { orders, loading, error, reload } = useInvoicesData(agencyId)

  const invoice = orders.map(toInvoice).find(
    (item) =>
      item.reference?.toLowerCase() === String(reference).toLowerCase() ||
      String(item.id) === String(reference)
  )

  const header = (
    <div className="orders-header">
      <button
        type="button"
        className="orders-back-btn"
        onClick={() => navigate("/dashboard/invoices")}
        aria-label="Retour aux factures"
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
          Chargement de la facture…
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="orders-page">
        {header}

        <div className="orders-notfound">
          <h1 className="orders-title">
            {error ? "Facture indisponible" : "Facture introuvable"}
          </h1>

          <p className="orders-subtitle">
            {error
              ? error
              : `La référence ${reference} ne correspond à aucune facture.`}
          </p>

          <div className="orders-notfound-actions">
            {error && (
              <button type="button" className="orders-btn-primary" onClick={reload}>
                Réessayer
              </button>
            )}

            <button
              type="button"
              className="orders-add-btn"
              onClick={() => navigate("/dashboard/invoices")}
            >
              <ArrowLeft size={16} />
              Retour aux factures
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=900")

    if (!printWindow) return

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${invoice.reference}</title>
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
    .total { font-size: 15px; font-weight: 700; color: #0077b6; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .status.paid { background: #eaf4fb; color: #023e73; }
    .status.pending { background: #fff3cd; color: #7a5a00; }
    .footer { margin-top: 32px; font-size: 11px; color: #023e73; border-top: 1px solid #e5eef7; padding-top: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="doc">
    <div class="top">
      <div class="brand">
        KonnectFly
        <small>Facture électronique</small>
      </div>
      <div class="meta">
        <strong>Facture ${invoice.reference}</strong>
        Émise le ${formatDate(invoice.date)}<br />
        Statut : <span class="status ${invoice.status}">${INVOICE_STATUS_LABELS[invoice.status]}</span>
      </div>
    </div>

    <div class="two section">
      <div>
        <h3>Facturé à</h3>
        <div class="box">
          ${invoice.customerName}<br />
          ${invoice.email ? invoice.email + "<br />" : ""}
          ${invoice.phone ? invoice.phone + "<br />" : ""}
          ${invoice.address ? invoice.address : ""}
        </div>
      </div>
      <div>
        <h3>Détails</h3>
        <div class="box">
          Commande : ${invoice.orderReference}<br />
          Forfait : ${invoice.packageLabel}<br />
          ${invoice.packageId ? "Réf. forfait : " + invoice.packageId + "<br />" : ""}
          Destination : ${invoice.destination}
        </div>
      </div>
    </div>

    <div class="section">
      <h3>Répartition</h3>
      <table>
        <tbody>
          <tr>
            <td>Prix de vente</td>
            <td class="right">${formatDZD(invoice.amount)} ${invoice.currency}</td>
          </tr>
          <tr>
            <td>Coût agence (80%)</td>
            <td class="right">${formatDZD(invoice.amount * 0.8)} ${invoice.currency}</td>
          </tr>
          <tr>
            <td class="total">Gain agence (20%)</td>
            <td class="right total">${formatDZD(invoice.amount * 0.2)} ${invoice.currency}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h3>Lignes</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="right">Quantité</th>
            <th class="right">Prix unitaire</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${invoice.packageLabel} — ${invoice.destination}</td>
            <td class="right">1</td>
            <td class="right">${formatDZD(invoice.amount)} ${invoice.currency}</td>
            <td class="right">${formatDZD(invoice.amount)} ${invoice.currency}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="right total">Total</td>
            <td class="right total">${formatDZD(invoice.amount)} ${invoice.currency}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      Merci de votre confiance. Cette facture est générée automatiquement par KonnectFly.
      Les instructions d'activation de l'eSIM sont disponibles dans la commande associée.
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

  return (
    <div className="orders-page">
      {header}

      <div className="orders-page-header">
        <div>
          <h1 className="orders-title">
            Facture <code>{invoice.reference}</code>
          </h1>

          <p className="orders-subtitle">
            Émise le {formatDateTime(invoice.date)}
          </p>
        </div>

        <span
          className={`orders-status orders-status-${
            invoice.status === "paid" ? "active" : "processing"
          }`}
        >
          {INVOICE_STATUS_LABELS[invoice.status]}
        </span>
      </div>

      <div className="invoice-document">
        <div className="invoice-doc-top">
          <div className="invoice-doc-brand">
            KonnectFly
            <small>Facture électronique</small>
          </div>

          <div className="invoice-doc-meta">
            <strong>{invoice.reference}</strong>
            <span>Émise le {formatDate(invoice.date)}</span>
            <span
              className={`invoice-doc-status invoice-doc-status-${invoice.status}`}
            >
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
          </div>
        </div>

        <div className="invoice-doc-grid">
          <div className="invoice-doc-box">
            <h3>Facturé à</h3>
            <p>{invoice.customerName}</p>
            {invoice.email && <p>{invoice.email}</p>}
            {invoice.phone && <p>{invoice.phone}</p>}
            {invoice.address && <p>{invoice.address}</p>}
          </div>

          <div className="invoice-doc-box">
            <h3>Détails</h3>
            <p>Commande : {invoice.orderReference}</p>
            <p>Forfait : {invoice.packageLabel}</p>
            {invoice.packageId && <p>Réf. forfait : {invoice.packageId}</p>}
            <p>Destination : {invoice.destination}</p>
          </div>
        </div>

        <div className="invoice-doc-breakdown">
          <h3>Répartition</h3>

          <div className="invoice-doc-breakdown-row">
            <span>Prix de vente</span>
            <strong>{formatDZD(invoice.amount)} {invoice.currency}</strong>
          </div>

          <div className="invoice-doc-breakdown-row">
            <span>Coût agence (80%)</span>
            <span>{formatDZD(invoice.amount * 0.8)} {invoice.currency}</span>
          </div>

          <div className="invoice-doc-breakdown-row invoice-doc-breakdown-gain">
            <span>Gain agence (20%)</span>
            <strong>{formatDZD(invoice.amount * 0.2)} {invoice.currency}</strong>
          </div>
        </div>

        <table className="invoice-doc-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="invoice-doc-right">Qté</th>
              <th className="invoice-doc-right">Prix unitaire</th>
              <th className="invoice-doc-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {invoice.packageLabel} — {invoice.destination}
              </td>
              <td className="invoice-doc-right">1</td>
              <td className="invoice-doc-right">
                {formatDZD(invoice.amount)} {invoice.currency}
              </td>
              <td className="invoice-doc-right">
                {formatDZD(invoice.amount)} {invoice.currency}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="invoice-doc-right invoice-doc-total">
                Total
              </td>
              <td className="invoice-doc-right invoice-doc-total">
                {formatDZD(invoice.amount)} {invoice.currency}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="invoice-doc-note">
          Merci de votre confiance. Cette facture est générée automatiquement
          par KonnectFly. Les instructions d'activation de l'eSIM sont
          disponibles dans la commande associée.
        </p>
      </div>

      <div className="orders-card-actions">
        <button type="button" className="orders-btn-primary" onClick={handlePrint}>
          <Printer size={14} />
          Imprimer / Télécharger PDF
        </button>

        <button
          type="button"
          className="orders-btn-ghost"
          onClick={() => navigate("/dashboard/orders")}
        >
          <Receipt size={14} />
          Voir la commande
        </button>

        <button
          type="button"
          className="orders-btn-ghost"
          onClick={() => navigate("/dashboard/invoices")}
        >
          <ArrowLeft size={14} />
          Retour aux factures
        </button>
      </div>
    </div>
  )
}
