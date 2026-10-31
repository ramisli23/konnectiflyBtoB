import { useEffect, useMemo, useRef, useState } from "react"

import {
  ArrowLeft,
  PanelLeft,
  CirclePlus,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  SquarePen,
  Link2,
  Check,
  Copy,
  X,
  Users,
  UserCheck,
  UserPlus,
  Wallet,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"

import "./Dealers.css"

/* =========================================================
   MOCK — à remplacer par les vraies données de l'API
   Soldes en DZD (le produit ne facture qu'en DZD).
   ========================================================= */

const INITIAL_DEALERS = [
  {
    id: "89492",
    name: "Amir Harez",
    email: "miroosoffi@gmail.com",
    status: "active",
    balance: 12500,
    createdAt: "2026-01-12T17:54:00",
  },
  {
    id: "89507",
    name: "Sara Belkacem",
    email: "sara.belkacem@flydz.com",
    status: "active",
    balance: 43200,
    createdAt: "2026-02-03T09:12:00",
  },
  {
    id: "89521",
    name: "Yacine Toumi",
    email: "yacine.toumi@gmail.com",
    status: "pending",
    balance: 0,
    createdAt: "2026-02-19T14:35:00",
  },
  {
    id: "89534",
    name: "Nadia Cherif",
    email: "nadia.cherif@outlook.com",
    status: "active",
    balance: 8750,
    createdAt: "2026-03-08T11:02:00",
  },
  {
    id: "89546",
    name: "Karim Benali",
    email: "k.benali@dztelecom.dz",
    status: "inactive",
    balance: 0,
    createdAt: "2026-04-01T16:47:00",
  },
  {
    id: "89558",
    name: "Lina Mansouri",
    email: "lina.mansouri@gmail.com",
    status: "active",
    balance: 23100,
    createdAt: "2026-04-22T08:21:00",
  },
  {
    id: "89563",
    name: "Omar Ziani",
    email: "omar.ziani@hotmail.com",
    status: "pending",
    balance: 0,
    createdAt: "2026-05-14T19:10:00",
  },
  {
    id: "89571",
    name: "Rania Saidi",
    email: "rania.saidi@flydz.com",
    status: "active",
    balance: 15800,
    createdAt: "2026-06-02T10:44:00",
  },
  {
    id: "89584",
    name: "Bilal Merabet",
    email: "bilal.merabet@gmail.com",
    status: "inactive",
    balance: 1200,
    createdAt: "2026-06-27T13:26:00",
  },
  {
    id: "89592",
    name: "Ines Kaci",
    email: "ines.kaci@yahoo.fr",
    status: "active",
    balance: 6400,
    createdAt: "2026-07-09T09:58:00",
  },
  {
    id: "89603",
    name: "Sofiane Rahal",
    email: "sofiane.rahal@gmail.com",
    status: "active",
    balance: 31750,
    createdAt: "2026-07-30T15:33:00",
  },
  {
    id: "89614",
    name: "Meriem Lounis",
    email: "meriem.lounis@outlook.com",
    status: "pending",
    balance: 0,
    createdAt: "2026-08-17T12:07:00",
  },
  {
    id: "89625",
    name: "Anis Ferhat",
    email: "anis.ferhat@gmail.com",
    status: "active",
    balance: 9800,
    createdAt: "2026-09-11T18:40:00",
  },
  {
    id: "89638",
    name: "Hakim Bouzid",
    email: "hakim.bouzid@dztelecom.dz",
    status: "inactive",
    balance: 0,
    createdAt: "2026-10-04T07:15:00",
  },
]

const STATUS_LABELS = {
  active: "Actif",
  pending: "En attente",
  inactive: "Inactif",
}

const COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Revendeur" },
  { key: "email", label: "Email" },
  { key: "status", label: "Statut" },
  { key: "balance", label: "Solde", numeric: true },
  { key: "createdAt", label: "Créé le" },
]

const EMPTY_DRAFT = { name: "", email: "", status: "active", balance: "0" }

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const formatDZD = (value) => Number(value || 0).toLocaleString("fr-FR")

const formatDate = (iso) => DATE_FORMAT.format(new Date(iso))

/* =========================================================
   COPIE PRESSE-PAPIERS
   ========================================================= */

async function copyText(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // on tente le repli ci-dessous
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

export default function DealersPage({ onBack }) {
  /* =====================================================
     ÉTAT
     ===================================================== */

  const [dealers, setDealers] = useState(INITIAL_DEALERS)

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" })

  const [modal, setModal] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [formErrors, setFormErrors] = useState({})

  const [copiedId, setCopiedId] = useState(null)
  const [notice, setNotice] = useState("")

  const copyTimer = useRef(null)
  const noticeTimer = useRef(null)

  /* =====================================================
     DONNÉES
     ===================================================== */

  const stats = useMemo(
    () => ({
      total: dealers.length,
      active: dealers.filter((dealer) => dealer.status === "active").length,
      pending: dealers.filter((dealer) => dealer.status === "pending").length,
      balance: dealers.reduce((sum, dealer) => sum + Number(dealer.balance || 0), 0),
    }),
    [dealers]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return dealers.filter((dealer) => {
      if (status !== "all" && dealer.status !== status) return false

      if (!needle) return true

      return [dealer.id, dealer.name, dealer.email]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    })
  }, [dealers, query, status])

  const sorted = useMemo(() => {
    const valueOf = (dealer) => {
      if (sort.key === "balance") return Number(dealer.balance || 0)

      if (sort.key === "status") return STATUS_LABELS[dealer.status] || ""

      return String(dealer[sort.key] ?? "").toLowerCase()
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

  /* =====================================================
     EFFETS
     ===================================================== */

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage)
    }
  }, [page, currentPage])

  useEffect(() => {
    if (!modal) return undefined

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setModal(null)
        setFormErrors({})
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [modal])

  useEffect(
    () => () => {
      clearTimeout(copyTimer.current)
      clearTimeout(noticeTimer.current)
    },
    []
  )

  /* =====================================================
     ACTIONS
     ===================================================== */

  const showNotice = (message) => {
    setNotice(message)

    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(""), 3200)
  }

  const resetPage = () => setPage(1)

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "createdAt" ? "desc" : "asc" }
    )

    resetPage()
  }

  const closeModal = () => {
    setModal(null)
    setFormErrors({})
  }

  const openCreate = () => {
    setDraft(EMPTY_DRAFT)
    setFormErrors({})
    setModal({ mode: "create", dealer: null })
  }

  const openEdit = (dealer) => {
    setDraft({
      name: dealer.name,
      email: dealer.email,
      status: dealer.status,
      balance: String(dealer.balance),
    })

    setFormErrors({})
    setModal({ mode: "edit", dealer })
  }

  const openView = (dealer) => {
    setFormErrors({})
    setModal({ mode: "view", dealer })
  }

  const handleCopyCode = async (dealer) => {
    const ok = await copyText(`REF-${dealer.id}`)

    setCopiedId(ok ? dealer.id : null)

    if (ok) {
      showNotice(`Code d'invitation copié · REF-${dealer.id}`)

      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedId(null), 1600)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const name = draft.name.trim()
    const email = draft.email.trim()
    const balance = Number(draft.balance)

    const errors = {}

    if (name.length < 2) {
      errors.name = "Indiquez au moins 2 caractères."
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = "Adresse email invalide."
    } else if (
      dealers.some(
        (dealer) =>
          dealer.email.toLowerCase() === email.toLowerCase() &&
          dealer.id !== modal?.dealer?.id
      )
    ) {
      errors.email = "Cet email est déjà utilisé par un revendeur."
    }

    if (!Number.isFinite(balance) || balance < 0) {
      errors.balance = "Montant invalide."
    }

    setFormErrors(errors)

    if (Object.keys(errors).length) return

    const values = {
      name,
      email,
      status: draft.status,
      balance: Math.round(balance),
    }

    if (modal.mode === "create") {
      const nextId = String(
        Math.max(0, ...dealers.map((dealer) => Number(dealer.id) || 0)) + 1
      )

      setDealers((current) => [
        {
          id: nextId,
          createdAt: new Date().toISOString(),
          ...values,
        },
        ...current,
      ])

      showNotice(`Revendeur ajouté · ${name}`)
    } else {
      setDealers((current) =>
        current.map((dealer) =>
          dealer.id === modal.dealer.id ? { ...dealer, ...values } : dealer
        )
      )

      showNotice(`Revendeur mis à jour · ${name}`)
    }

    resetPage()
    closeModal()
  }

  const handleExport = () => {
    if (!sorted.length) return

    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`

    const lines = [
      ["ID", "Revendeur", "Email", "Statut", "Solde (DZD)", "Créé le"]
        .map(cell)
        .join(";"),
      ...sorted.map((dealer) =>
        [
          dealer.id,
          dealer.name,
          dealer.email,
          STATUS_LABELS[dealer.status],
          dealer.balance,
          formatDate(dealer.createdAt),
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
    link.download = `revendeurs-${new Date().toISOString().slice(0, 10)}.csv`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  const setDraftField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }))

    if (formErrors[key]) {
      setFormErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  /* =====================================================
     RENDU
     ===================================================== */

  return (
    <div className="dealers-page">
      {/* ---------- EN-TÊTE ---------- */}

      <div className="dealers-header">
        <button
          type="button"
          className="dealers-back-btn"
          onClick={onBack}
          aria-label="Retour au dashboard"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="dealers-header-divider" />

        <PanelLeft size={17} className="dealers-header-icon" />

        <h2 className="dealers-header-title">Dashboard</h2>
      </div>

      {/* ---------- TITRE ---------- */}

      <div className="dealers-page-header">
        <div className="dealers-page-heading">
          <h1 className="dealers-title">Revendeurs</h1>

          <p className="dealers-subtitle">
            Gérez votre réseau de revendeurs et leurs soldes.
          </p>
        </div>

        <button type="button" className="dealers-add-btn" onClick={openCreate}>
          <CirclePlus size={16} />
          Ajouter un revendeur
        </button>
      </div>

      {notice && (
        <p className="dealers-notice" role="status">
          {notice}
        </p>
      )}

      {/* ---------- INDICATEURS ---------- */}

      <div className="dealers-stats">
        <div className="dealers-stat dealers-stat-dark">
          <span className="dealers-stat-label">
            <Users size={14} />
            Revendeurs
          </span>

          <strong className="dealers-stat-value">{stats.total}</strong>
        </div>

        <div className="dealers-stat">
          <span className="dealers-stat-label">
            <UserCheck size={14} />
            Actifs
          </span>

          <strong className="dealers-stat-value">{stats.active}</strong>
        </div>

        <div className="dealers-stat">
          <span className="dealers-stat-label">
            <UserPlus size={14} />
            En attente
          </span>

          <strong className="dealers-stat-value">{stats.pending}</strong>
        </div>

        <div className="dealers-stat">
          <span className="dealers-stat-label">
            <Wallet size={14} />
            Solde cumulé
          </span>

          <strong className="dealers-stat-value">
            {formatDZD(stats.balance)} <small>DZD</small>
          </strong>
        </div>
      </div>

      {/* ---------- TABLE ---------- */}

      <section className="dealers-table-card" aria-labelledby="dealers-list-title">
        <h2 id="dealers-list-title" className="dealers-sr-only">
          Liste des revendeurs
        </h2>

        <div className="dealers-toolbar">
          <div className="dealers-search">
            <Search size={15} />

            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                resetPage()
              }}
              placeholder="Rechercher un nom, un email…"
              aria-label="Rechercher un revendeur"
            />

            {query && (
              <button
                type="button"
                className="dealers-search-clear"
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

          <div className="dealers-status-filter" role="group" aria-label="Filtrer par statut">
            {[
              { value: "all", label: "Tous" },
              { value: "active", label: "Actifs" },
              { value: "pending", label: "En attente" },
              { value: "inactive", label: "Inactifs" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className="dealers-status-btn"
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
            className="dealers-export-btn"
            onClick={handleExport}
            disabled={!sorted.length}
          >
            <Download size={15} />
            Exporter
          </button>
        </div>

        <div className="dealers-table-wrapper">
          <table className="dealers-table">
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
                      className={column.numeric ? "dealers-th-numeric" : undefined}
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
                        className="dealers-sort-btn"
                        data-active={active}
                        onClick={() => toggleSort(column.key)}
                      >
                        {column.label}
                        <Icon size={12} />
                      </button>
                    </th>
                  )
                })}

                <th scope="col" className="dealers-th-actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((dealer) => (
                <tr key={dealer.id}>
                  <td>
                    <code className="dealers-id">{dealer.id}</code>
                  </td>

                  <td className="dealers-name-cell">{dealer.name}</td>

                  <td className="dealers-email-cell" title={dealer.email}>
                    {dealer.email}
                  </td>

                  <td>
                    <span className={`dealers-status dealers-status-${dealer.status}`}>
                      {STATUS_LABELS[dealer.status]}
                    </span>
                  </td>

                  <td className="dealers-balance-cell">
                    {formatDZD(dealer.balance)} <small>DZD</small>
                  </td>

                  <td className="dealers-date-cell">{formatDate(dealer.createdAt)}</td>

                  <td>
                    <div className="dealers-actions">
                      <button
                        type="button"
                        className="dealers-action-btn"
                        onClick={() => openView(dealer)}
                        aria-label={`Voir ${dealer.name}`}
                        title="Voir"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        className="dealers-action-btn"
                        onClick={() => openEdit(dealer)}
                        aria-label={`Modifier ${dealer.name}`}
                        title="Modifier"
                      >
                        <SquarePen size={15} />
                      </button>

                      <button
                        type="button"
                        className="dealers-action-btn"
                        onClick={() => handleCopyCode(dealer)}
                        aria-label={`Copier le code d'invitation de ${dealer.name}`}
                        title={
                          copiedId === dealer.id
                            ? "Code copié"
                            : "Copier le code d'invitation"
                        }
                      >
                        {copiedId === dealer.id ? <Check size={15} /> : <Link2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!sorted.length && (
            <div className="dealers-empty">
              <strong>Aucun revendeur</strong>
              Aucun résultat ne correspond à votre recherche.
            </div>
          )}
        </div>

        {/* ---------- PAGINATION ---------- */}

        <div className="dealers-pagination">
          <label className="dealers-rows-per-page">
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

          <span className="dealers-range">
            {sorted.length
              ? `${firstIndex + 1}–${firstIndex + pageRows.length} sur ${sorted.length}`
              : "0 résultat"}
          </span>

          <div className="dealers-pagination-right">
            <span className="dealers-page-label">
              Page {currentPage} / {totalPages}
            </span>

            <div className="dealers-pagination-buttons">
              <button
                type="button"
                className="dealers-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                aria-label="Première page"
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                type="button"
                className="dealers-page-btn"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="dealers-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="dealers-page-btn"
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

      {/* ---------- MODALE ---------- */}

      {modal && (
        <div
          className="dealers-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div
            className="dealers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dealers-modal-title"
          >
            <div className="dealers-modal-head">
              <h2 id="dealers-modal-title">
                {modal.mode === "create"
                  ? "Ajouter un revendeur"
                  : modal.mode === "edit"
                    ? "Modifier le revendeur"
                    : "Fiche revendeur"}
              </h2>

              <button
                type="button"
                className="dealers-modal-close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {modal.mode === "view" ? (
              <>
                <dl className="dealers-detail-list">
                  <div>
                    <dt>ID</dt>
                    <dd>
                      <code>{modal.dealer.id}</code>
                    </dd>
                  </div>

                  <div>
                    <dt>Revendeur</dt>
                    <dd>{modal.dealer.name}</dd>
                  </div>

                  <div>
                    <dt>Email</dt>
                    <dd>{modal.dealer.email}</dd>
                  </div>

                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <span
                        className={`dealers-status dealers-status-${modal.dealer.status}`}
                      >
                        {STATUS_LABELS[modal.dealer.status]}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt>Solde</dt>
                    <dd>
                      {formatDZD(modal.dealer.balance)} <small>DZD</small>
                    </dd>
                  </div>

                  <div>
                    <dt>Créé le</dt>
                    <dd>{formatDate(modal.dealer.createdAt)}</dd>
                  </div>

                  <div>
                    <dt>Code d&apos;invitation</dt>
                    <dd>
                      <code>REF-{modal.dealer.id}</code>
                    </dd>
                  </div>
                </dl>

                <div className="dealers-modal-footer">
                  <button
                    type="button"
                    className="dealers-btn-ghost"
                    onClick={() => handleCopyCode(modal.dealer)}
                  >
                    <Copy size={14} />
                    Copier le code
                  </button>

                  <button
                    type="button"
                    className="dealers-btn-primary"
                    onClick={() => {
                      const dealer = modal.dealer
                      closeModal()
                      openEdit(dealer)
                    }}
                  >
                    <SquarePen size={14} />
                    Modifier
                  </button>
                </div>
              </>
            ) : (
              <form className="dealers-form" onSubmit={handleSubmit} noValidate>
                <label className="dealers-field">
                  <span>Nom du revendeur</span>

                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) => setDraftField("name", event.target.value)}
                    placeholder="Ex. Amir Harez"
                    autoFocus
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={formErrors.name ? "dealers-error-name" : undefined}
                  />

                  {formErrors.name && (
                    <em id="dealers-error-name" className="dealers-field-error">
                      {formErrors.name}
                    </em>
                  )}
                </label>

                <label className="dealers-field">
                  <span>Email</span>

                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraftField("email", event.target.value)}
                    placeholder="nom@exemple.com"
                    aria-invalid={Boolean(formErrors.email)}
                    aria-describedby={formErrors.email ? "dealers-error-email" : undefined}
                  />

                  {formErrors.email && (
                    <em id="dealers-error-email" className="dealers-field-error">
                      {formErrors.email}
                    </em>
                  )}
                </label>

                <div className="dealers-form-row">
                  <label className="dealers-field">
                    <span>Statut</span>

                    <select
                      value={draft.status}
                      onChange={(event) => setDraftField("status", event.target.value)}
                    >
                      <option value="active">Actif</option>
                      <option value="pending">En attente</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </label>

                  <label className="dealers-field">
                    <span>Solde initial (DZD)</span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.balance}
                      onChange={(event) => setDraftField("balance", event.target.value)}
                      aria-invalid={Boolean(formErrors.balance)}
                      aria-describedby={
                        formErrors.balance ? "dealers-error-balance" : undefined
                      }
                    />

                    {formErrors.balance && (
                      <em id="dealers-error-balance" className="dealers-field-error">
                        {formErrors.balance}
                      </em>
                    )}
                  </label>
                </div>

                <div className="dealers-modal-footer">
                  <button type="button" className="dealers-btn-ghost" onClick={closeModal}>
                    Annuler
                  </button>

                  <button type="submit" className="dealers-btn-primary">
                    {modal.mode === "create" ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
