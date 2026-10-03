import { useState } from "react"
import {
  ArrowLeft,
  PanelLeft,
  CirclePlus,
  SlidersHorizontal,
  Download,
  Settings2,
  RefreshCw,
  ArrowUpDown,
  Eye,
  SquarePen,
  Link2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"
import "./Dealers.css"

export default function DealersPage({ onBack }) {
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Mock — à remplacer par les vraies données de l'API
  const dealers = [
    {
      id: "89492",
      name: "amir",
      email: "miroosoffi@gmail.com",
      status: "Active",
      balance: "0.00",
      createdAt: "Jul 28, 2025 at 05:54 PM",
    },
  ]

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "balance", label: "Balance($)" },
    { key: "createdAt", label: "Created At" },
  ]

  return (
    <div className="dealers-page">
      <div className="dealers-header">
        <button className="dealers-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>

        <span className="dealers-header-divider" />

        <PanelLeft size={18} className="dealers-header-icon" />

        <h2 className="dealers-header-title">Dashboard</h2>
      </div>

      {/* Bandeau titre + action */}
      <div className="dealers-intro-card">
        <div>
          <h1 className="dealers-intro-title">Dealers Overview</h1>
          <p className="dealers-intro-subtitle">You can manage dealers here</p>
        </div>

        <button className="dealers-add-btn">
          <CirclePlus size={18} />
          Add Dealer
        </button>
      </div>

      {/* Table */}
      <div className="dealers-table-card">
        <div className="dealers-table-toolbar">
          <button className="dealers-filters-btn">
            Apply Filters
            <SlidersHorizontal size={16} />
          </button>

          <div className="dealers-toolbar-right">
            <button className="dealers-export-btn">
              <Download size={16} />
              Export
            </button>
            <button className="dealers-view-btn">
              <Settings2 size={16} />
              View
            </button>
            <button className="dealers-refresh-btn" aria-label="Rafraîchir">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="dealers-table-wrapper">
          <table className="dealers-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>
                    <span className="dealers-th-content">
                      {col.label}
                      <ArrowUpDown size={12} className="dealers-sort-icon" />
                    </span>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dealers.map((dealer) => (
                <tr key={dealer.id}>
                  <td>{dealer.id}</td>
                  <td>{dealer.name}</td>
                  <td>{dealer.email}</td>
                  <td>
                    <span
                      className={`dealers-status-badge ${
                        dealer.status === "Active"
                          ? "dealers-status-active"
                          : "dealers-status-inactive"
                      }`}
                    >
                      {dealer.status}
                    </span>
                  </td>
                  <td>${dealer.balance}</td>
                  <td>{dealer.createdAt}</td>
                  <td>
                    <div className="dealers-actions">
                      <button className="dealers-action-btn" aria-label="Voir">
                        <Eye size={16} />
                      </button>
                      <button className="dealers-action-btn" aria-label="Modifier">
                        <SquarePen size={16} />
                      </button>
                      <button className="dealers-action-btn" aria-label="Lien">
                        <Link2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dealers-pagination">
          <div className="dealers-rows-per-page">
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

          <div className="dealers-pagination-right">
            <span className="dealers-page-label">Page 1 of 1</span>
            <div className="dealers-pagination-buttons">
              <button className="dealers-page-btn" disabled>
                <ChevronsLeft size={16} />
              </button>
              <button className="dealers-page-btn" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="dealers-page-btn" disabled>
                <ChevronRight size={16} />
              </button>
              <button className="dealers-page-btn" disabled>
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}