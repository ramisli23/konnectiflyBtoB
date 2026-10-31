import { useEffect, useMemo, useRef, useState } from "react"

import {
  ArrowLeft,
  PanelLeft,
  Search,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"

import "./credits.css"

import {
  getAgencyProfile,
  getAuthToken,
  getCachedProfile,
  saveCachedProfile,
} from "../../../services/Api"

/* =========================================================
   MOCK — à remplacer par les vraies données de l'API
   Montants en DZD (le produit ne facture qu'en DZD).
   ========================================================= */

const TRANSACTIONS = [
  {
    id: "01a08766-be2f-4c31-9f4a-7b8e2d1c0a11",
    amount: -2745,
    description: "1 GB · 3 jours — Cameroun",
    createdAt: "2026-10-28T14:12:00",
  },
  {
    id: "01a08763-729a-4d18-8e55-c0b7a3f61d22",
    amount: -7385,
    description: "3 GB · 7 jours — Cameroun",
    createdAt: "2026-10-27T09:41:00",
  },
  {
    id: "01a08762-538c-4b27-9a03-d1e8f4c72b33",
    amount: 20000,
    description: "Recharge du compte",
    createdAt: "2026-10-26T18:03:00",
  },
  {
    id: "01a08761-e30d-4f46-b7d2-6a93c1e08c44",
    amount: -3975,
    description: "Illimité · 1 jour — Cameroun",
    createdAt: "2026-10-25T11:27:00",
  },
  {
    id: "01a0875e-82e1-4a05-8c9b-2f7d6b143e55",
    amount: -1450,
    description: "1 GB · 3 jours — Qatar",
    createdAt: "2026-10-24T16:55:00",
  },
  {
    id: "01a06e3c-316f-4c82-9d10-8b5a7e2c6f66",
    amount: -9560,
    description: "5 GB · 15 jours — Turquie",
    createdAt: "2026-10-21T08:30:00",
  },
  {
    id: "01a06e3c-31a7-4b93-8e21-cc4f9a0d7a77",
    amount: -12300,
    description: "20 GB · 30 jours — Vietnam",
    createdAt: "2026-10-18T21:14:00",
  },
  {
    id: "01a06e3b-72b8-4d04-9f32-1e6b8c5a3b88",
    amount: 15000,
    description: "Recharge du compte",
    createdAt: "2026-10-15T10:02:00",
  },
  {
    id: "019faffd-0b39-4e15-a043-2f7c9d6b4c99",
    amount: -5290,
    description: "3 GB · 7 jours — Malaisie",
    createdAt: "2026-10-12T13:48:00",
  },
  {
    id: "019ec6dc-400a-4f26-b154-3a8d0e7c5daa",
    amount: -2890,
    description: "1 GB · 7 jours — Tunisie",
    createdAt: "2026-10-08T17:36:00",
  },
  {
    id: "019ec6dc-401b-4a37-c265-4b9e1f8d6ebb",
    amount: -6720,
    description: "10 GB · 30 jours — Europe",
    createdAt: "2026-10-05T07:19:00",
  },
  {
    id: "019ec6dc-402c-4b48-d376-5caf2a9e7fcc",
    amount: -2215,
    description: "1 GB · 1 jour — Maroc",
    createdAt: "2026-10-01T15:44:00",
  },
  {
    id: "019ec6dc-403d-4c59-e487-6db03b0f80dd",
    amount: 25000,
    description: "Recharge du compte",
    createdAt: "2026-09-28T12:00:00",
  },
  {
    id: "019ec6dc-404e-4d6a-f598-7ec14c1a91ee",
    amount: -8640,
    description: "5 GB · 30 jours — Émirats arabes unis",
    createdAt: "2026-09-25T19:05:00",
  },
  {
    id: "019ec6dc-405f-4e7b-a609-8fd25d2ba2ff",
    amount: -3150,
    description: "1 GB · 3 jours — Sénégal",
    createdAt: "2026-09-22T10:33:00",
  },
  {
    id: "019ec6dc-406a-4f8c-b71a-90e36e3cb300",
    amount: -11480,
    description: "20 GB · 15 jours — États-Unis",
    createdAt: "2026-09-18T22:47:00",
  },
  {
    id: "019ec6dc-407b-4a9d-c82b-a1f47f4dc411",
    amount: -4630,
    description: "3 GB · 15 jours — Égypte",
    createdAt: "2026-09-15T09:12:00",
  },
  {
    id: "019ec6dc-408c-4bae-d93c-b2a58a5ed522",
    amount: -5480,
    description: "3 GB · 30 jours — Arabie saoudite",
    createdAt: "2026-09-10T14:26:00",
  },
  {
    id: "019ec6dc-409d-4cbf-ea4d-c3b69b6fe633",
    amount: 10000,
    description: "Recharge du compte",
    createdAt: "2026-09-06T16:58:00",
  },
  {
    id: "019ec6dc-410e-4dc0-fb5e-d4c76c700744",
    amount: -1890,
    description: "500 MB · 1 jour — Irak",
    createdAt: "2026-09-03T11:05:00",
  },
  {
    id: "019ec6dc-411f-4ed1-ac6f-e5d87d811855",
    amount: -7355,
    description: "3 GB · 3 jours — Cameroun",
    createdAt: "2026-08-29T20:31:00",
  },
  {
    id: "019ec6dc-412a-4fe2-bd70-f6e98e922966",
    amount: -10450,
    description: "10 GB · 15 jours — Royaume-Uni",
    createdAt: "2026-08-26T08:49:00",
  },
]

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "user", label: "Utilisateur" },
  { key: "email", label: "Email" },
  { key: "amount", label: "Montant", numeric: true },
  { key: "description", label: "Description" },
  { key: "createdAt", label: "Date" },
]

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const TIME_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
})

const formatDZD = (value) => Number(value || 0).toLocaleString("fr-FR")

const formatDate = (iso) => DATE_FORMAT.format(new Date(iso))

export default function Credits({ onBack, user }) {
  /* =====================================================
     ÉTAT
     ===================================================== */

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")

  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" })

  const [copiedId, setCopiedId] = useState(null)

  const [balance, setBalance] = useState(() => {
    if (user?.balance !== undefined && user?.balance !== null) {
      return Number(user.balance)
    }

    const cached = getCachedProfile()
    return Number(cached?.balance ?? 0)
  })

  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState("")
  const [lastSync, setLastSync] = useState(() => new Date())

  const copyTimer = useRef(null)

  /* =====================================================
     DONNÉES
     ===================================================== */

  const rows = useMemo(
    () =>
      TRANSACTIONS.map((transaction) => ({
        ...transaction,
        user: user?.contact_name || user?.company_name || "Votre agence",
        email: user?.email || "—",
      })),
    [user]
  )

  const totals = useMemo(
    () => ({
      spent: rows.reduce(
        (sum, row) => sum + (row.amount < 0 ? -row.amount : 0),
        0
      ),
      topped: rows.reduce(
        (sum, row) => sum + (row.amount > 0 ? row.amount : 0),
        0
      ),
      count: rows.length,
    }),
    [rows]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return rows.filter((row) => {
      if (type === "out" && row.amount >= 0) return false

      if (type === "in" && row.amount <= 0) return false

      if (!needle) return true

      return [row.id, row.user, row.email, row.description]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    })
  }, [rows, query, type])

  const sorted = useMemo(() => {
    const valueOf = (row) =>
      sort.key === "amount" ? row.amount : String(row[sort.key] ?? "").toLowerCase()

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

  /* =====================================================
     EFFETS
     ===================================================== */

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage)
    }
  }, [page, currentPage])

  useEffect(() => {
    if (user && user.balance !== undefined && user.balance !== null) {
      setBalance(Number(user.balance))
    }
  }, [user])

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  /* =====================================================
     ACTIONS
     ===================================================== */

  const resetPage = () => setPage(1)

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "createdAt" ? "desc" : "asc" }
    )

    resetPage()
  }

  const handleCopy = async (id) => {
    let copied = false

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(id)
        copied = true
      }
    } catch {
      copied = false
    }

    // Repli pour les navigateurs sans API clipboard (ou sans permission)
    if (!copied) {
      try {
        const area = document.createElement("textarea")
        area.value = id
        area.setAttribute("readonly", "")
        area.style.position = "fixed"
        area.style.opacity = "0"

        document.body.appendChild(area)
        area.select()

        copied = document.execCommand("copy")
        area.remove()
      } catch {
        copied = false
      }
    }

    setCopiedId(copied ? id : null)

    if (copied) {
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedId(null), 1600)
    }
  }

  const handleExport = () => {
    if (!sorted.length) return

    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`

    const lines = [
      COLUMNS.map((column) => cell(column.label + " (DZD)")).join(";"),
      ...sorted.map((row) =>
        [
          row.id,
          row.user,
          row.email,
          row.amount,
          row.description,
          formatDate(row.createdAt),
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
    link.download = `credits-${new Date().toISOString().slice(0, 10)}.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  const handleRefresh = async () => {
    if (syncing) return

    setSyncing(true)
    setSyncError("")

    try {
      const token = getAuthToken()

      if (!token) {
        throw new Error("Session expirée, reconnectez-vous.")
      }

      const profile = await getAgencyProfile(token)

      saveCachedProfile(profile)

      if (profile?.balance !== undefined && profile?.balance !== null) {
        setBalance(Number(profile.balance))
      }

      setLastSync(new Date())
    } catch (error) {
      setSyncError(error?.message || "Synchronisation impossible.")
    } finally {
      setSyncing(false)
    }
  }

  /* =====================================================
     RENDU
     ===================================================== */

  return (
    <div className="credits-page">
      {/* ---------- EN-TÊTE ---------- */}

      <div className="credits-header">
        <button
          type="button"
          className="credits-back-btn"
          onClick={onBack}
          aria-label="Retour au dashboard"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="credits-header-divider" />

        <PanelLeft size={17} className="credits-header-icon" />

        <h2 className="credits-header-title">Dashboard</h2>
      </div>

      {/* ---------- TITRE ---------- */}

      <div className="credits-page-header">
        <div className="credits-page-heading">
          <h1 className="credits-title">Crédits</h1>

          <p className="credits-subtitle">
            Suivez votre solde et l&apos;historique des transactions.
          </p>
        </div>

        <div className="credits-sync">
          <button
            type="button"
            className="credits-sync-btn"
            onClick={handleRefresh}
            disabled={syncing}
            aria-busy={syncing}
          >
            <RefreshCw size={15} />
            {syncing ? "Synchronisation…" : "Synchroniser"}
          </button>

          <span className="credits-sync-meta">
            Dernière synchro à {TIME_FORMAT.format(lastSync)}
          </span>
        </div>
      </div>

      {syncError && (
        <p className="credits-alert" role="alert">
          {syncError}
        </p>
      )}

      {/* ---------- INDICATEURS ---------- */}

      <div className="credits-stats">
        <div className="credits-stat credits-stat-dark">
          <span className="credits-stat-label">
            <Wallet size={14} />
            Solde disponible
          </span>

          <strong className="credits-stat-value">
            {formatDZD(balance)} <small>DZD</small>
          </strong>
        </div>

        <div className="credits-stat">
          <span className="credits-stat-label">
            <ArrowDownLeft size={14} />
            Total dépensé
          </span>

          <strong className="credits-stat-value">
            {formatDZD(totals.spent)} <small>DZD</small>
          </strong>
        </div>

        <div className="credits-stat">
          <span className="credits-stat-label">
            <ArrowUpRight size={14} />
            Total rechargé
          </span>

          <strong className="credits-stat-value">
            {formatDZD(totals.topped)} <small>DZD</small>
          </strong>
        </div>

        <div className="credits-stat">
          <span className="credits-stat-label">
            <Receipt size={14} />
            Transactions
          </span>

          <strong className="credits-stat-value">{totals.count}</strong>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}

      <section className="credits-table-card" aria-labelledby="credits-list-title">
        <h2 id="credits-list-title" className="credits-sr-only">
          Historique des transactions
        </h2>

        <div className="credits-toolbar">
          <div className="credits-search">
            <Search size={15} />

            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                resetPage()
              }}
              placeholder="Rechercher un ID, un forfait…"
              aria-label="Rechercher une transaction"
            />

            {query && (
              <button
                type="button"
                className="credits-search-clear"
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

          <div className="credits-type-filter" role="group" aria-label="Filtrer par type">
            {[
              { value: "all", label: "Toutes" },
              { value: "out", label: "Achats" },
              { value: "in", label: "Recharges" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className="credits-type-btn"
                aria-pressed={type === option.value}
                onClick={() => {
                  setType(option.value)
                  resetPage()
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="credits-export-btn"
            onClick={handleExport}
            disabled={!sorted.length}
          >
            <Download size={15} />
            Exporter
          </button>
        </div>

        <div className="credits-table-wrapper">
          <table className="credits-table">
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
                      className={column.numeric ? "credits-th-numeric" : undefined}
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
                        className="credits-sort-btn"
                        data-active={active}
                        onClick={() => toggleSort(column.key)}
                      >
                        {column.label}
                        <Icon size={12} />
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="credits-id-cell">
                      <code className="credits-id" title={row.id}>
                        {row.id.slice(0, 8)}…
                      </code>

                      <button
                        type="button"
                        className="credits-copy-btn"
                        onClick={() => handleCopy(row.id)}
                        aria-label={
                          copiedId === row.id
                            ? "ID copié"
                            : `Copier l'ID ${row.id}`
                        }
                        title={
                          copiedId === row.id
                            ? "ID copié"
                            : "Copier l'ID complet"
                        }
                      >
                        {copiedId === row.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>

                  <td>{row.user}</td>

                  <td className="credits-email-cell" title={row.email}>
                    {row.email}
                  </td>

                  <td className="credits-amount-cell">
                    <span
                      className={`credits-amount ${
                        row.amount < 0 ? "credits-amount-out" : "credits-amount-in"
                      }`}
                    >
                      {row.amount < 0 ? "−" : "+"}
                      {formatDZD(Math.abs(row.amount))}
                    </span>
                  </td>

                  <td className="credits-description-cell" title={row.description}>
                    {row.description}
                  </td>

                  <td className="credits-date-cell">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!sorted.length && (
            <div className="credits-empty">
              <strong>Aucune transaction</strong>
              Aucun résultat ne correspond à votre recherche.
            </div>
          )}
        </div>

        {/* ---------- PAGINATION ---------- */}

        <div className="credits-pagination">
          <label className="credits-rows-per-page">
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

          <span className="credits-range">
            {sorted.length
              ? `${firstIndex + 1}–${firstIndex + pageRows.length} sur ${sorted.length}`
              : "0 résultat"}
          </span>

          <div className="credits-pagination-right">
            <span className="credits-page-label">
              Page {currentPage} / {totalPages}
            </span>

            <div className="credits-pagination-buttons">
              <button
                type="button"
                className="credits-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                aria-label="Première page"
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                type="button"
                className="credits-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="credits-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="credits-page-btn"
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
