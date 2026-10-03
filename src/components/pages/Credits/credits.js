import { useState } from "react"
import {
  ArrowLeft,
  PanelLeft,
  SlidersHorizontal,
  Download,
  Settings2,
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  Copy,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"
import "./credits.css"

export default function Credits({ onBack }) {
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Mock — à remplacer par les vraies données de l'API
  const transactions = [
    {
      id: "01a08766-be2...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -12.30,
      description: "20GB eSIM Data for 30 Days in Vietnam - A-008-ES-AU-D-C4-30/60D-20GB",
      createdAt: "Sep 09, 2026 at 07:20 PM",
    },
    {
      id: "01a08763-729...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -15.67,
      description: "20GB eSIM Data for 15 Days in Malaysia - 21263271",
      createdAt: "Sep 09, 2026 at 07:17 PM",
    },
    {
      id: "01a08762-538...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -2.12,
      description: "1GB eSIM Data for 3 Days in Qatar - 21263636",
      createdAt: "Sep 09, 2026 at 07:16 PM",
    },
    {
      id: "01a08761-e30...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: 23.95,
      description: "reseller wallet refill",
      createdAt: "Sep 09, 2026 at 07:15 PM",
    },
    {
      id: "01a0875e-82e...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -5.44,
      description: "3GB eSIM Data for 3 Days in Qatar - 21263637",
      createdAt: "Sep 09, 2026 at 07:11 PM",
    },
    {
      id: "01a06e3c-316...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -9.30,
      description: "20GB eSIM Data for 15 Days in Turkey - 21263061",
      createdAt: "Sep 04, 2026 at 10:03 PM",
    },
    {
      id: "01a06e3c-31a...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -9.30,
      description: "20GB eSIM Data for 15 Days in Turkey - 21263061",
      createdAt: "Sep 04, 2026 at 10:03 PM",
    },
    {
      id: "01a06e3b-72b...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: 28.80,
      description: "reseller wallet refill",
      createdAt: "Sep 04, 2026 at 10:03 PM",
    },
    {
      id: "019faffd-0b3...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -6.29,
      description: "5GB eSIM Data for 30 Days in Tunisia - esimg_5GB_30D_TN_V2",
      createdAt: "Jul 29, 2026 at 11:27 PM",
    },
    {
      id: "019ec6dc-400...",
      user: "AMIR HAREZ",
      email: "ludify.dz@gmail.com",
      amount: -10.81,
      description: "20GB eSIM Data for 15 Days in Europe - 21272840",
      createdAt: "Jun 14, 2026 at 04:59 PM",
    },
  ]

  const totalPages = 5
  const [page, setPage] = useState(1)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "user", label: "User", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "amount", label: "Amount($)", sortable: true, chevronOnly: true },
    { key: "description", label: "Description", sortable: true },
    { key: "createdAt", label: "Created At", sortable: true },
  ]

  const formatAmount = (amount) =>
    `${amount < 0 ? "-" : ""}$${Math.abs(amount).toFixed(2)}`

  const copyToClipboard = (text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="credits-page">
      <div className="credits-header">
        <button className="credits-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>

        <span className="credits-header-divider" />

        <PanelLeft size={18} className="credits-header-icon" />

        <h2 className="credits-header-title">Dashboard</h2>
      </div>

      {/* Bandeau titre */}
      <div className="credits-intro-card">
        <div>
          <h1 className="credits-intro-title">Credits Overview</h1>
          <p className="credits-intro-subtitle">
            Manage credit transactions and balances here
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="credits-table-card">
        <div className="credits-table-toolbar">
          <button className="credits-filters-btn">
            Apply Filters
            <SlidersHorizontal size={16} />
          </button>

          <div className="credits-toolbar-right">
            <button className="credits-export-btn">
              <Download size={16} />
              Export
            </button>
            <button className="credits-view-btn">
              <Settings2 size={16} />
              View
            </button>
            <button className="credits-refresh-btn" aria-label="Rafraîchir">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="credits-table-wrapper">
          <table className="credits-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>
                    <span className="credits-th-content">
                      {col.label}
                      {col.chevronOnly ? (
                        <ChevronDown size={12} className="credits-sort-icon" />
                      ) : (
                        <ArrowUpDown size={12} className="credits-sort-icon" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div className="credits-id-cell">
                      {tx.id}
                      <button
                        className="credits-copy-btn"
                        aria-label="Copier l'ID"
                        onClick={() => copyToClipboard(tx.id)}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td>{tx.user}</td>
                  <td>{tx.email}</td>
                  <td>
                    <span
                      className={`credits-amount-badge ${
                        tx.amount < 0
                          ? "credits-amount-negative"
                          : "credits-amount-positive"
                      }`}
                    >
                      {formatAmount(tx.amount)}
                    </span>
                  </td>
                  <td className="credits-description-cell">{tx.description}</td>
                  <td>{tx.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="credits-pagination">
          <div className="credits-rows-per-page">
            Rows per page
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="credits-pagination-right">
            <span className="credits-page-label">
              Page {page} of {totalPages}
            </span>
            <div className="credits-pagination-buttons">
              <button
                className="credits-page-btn"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                className="credits-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="credits-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="credits-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}