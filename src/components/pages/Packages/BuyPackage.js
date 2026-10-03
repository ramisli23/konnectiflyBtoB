import { useState } from "react"
import './BuyPackage.css'
import {
  Users,
  Package,
  TrendingUp,
  Wifi,
  Settings as SettingsIcon,
  LifeBuoy,
  Search,
  ChevronDown,
  ArrowLeft,
  PanelLeft
} from "lucide-react"

import PackageDetail from "../../../components/packages/packageDetail.js"
import Packages from "./CountryPage.js"

export default function BuyPackages({ onBack }) {
  const [selectedCountry, setSelectedCountry] = useState(null)

  const stats = [
    { label: "Clients connectés", value: "1 284", change: "+8.2%", icon: <Wifi size={20} /> },
    { label: "Utilisateurs actifs", value: "342", change: "+3.1%", icon: <Users size={20} /> },
    { label: "Forfaits vendus", value: "97", change: "-1.4%", icon: <Package size={20} /> },
    { label: "Revenu du mois", value: "12 430 €", change: "+12.6%", icon: <TrendingUp size={20} /> },
  ]

  if (selectedCountry) {
    return (
      <PackageDetail
        country={selectedCountry}
        onBack={() => setSelectedCountry(null)}
      />
    )
  }

  return (
    <div>
      <div className="package-detail-header-buy-package">
        <button
          className="package-detail-back-btn-buy-package"
          onClick={onBack}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="package-detail-header-divider-buy-package" />

        <PanelLeft size={18} className="package-detail-header-icon" />

        <h2 className="package-detail-header-title-buy-package">Dashboard</h2>
      </div>

      <div className="dash-page">
        <h1 className="dash-title">Acheter des Packages eSIM</h1>
        <p className="dash-subtitle">
          Vue d'ensemble de l'activité KonnectiFly aujourd'hui.
        </p>

        <Packages onSelect={setSelectedCountry} />
      </div>
    </div>
  )
}