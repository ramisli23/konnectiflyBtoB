import { useNavigate } from "react-router-dom";

import "./BuyPackage.css";
import { ArrowLeft, PanelLeft } from "lucide-react";

import Packages from "./CountryPage.js";

// =====================================================
// PAGE — ACHAT DE PACKAGES eSIM
// Route : /dashboard/packages
// =====================================================

export default function BuyPackages() {
  const navigate = useNavigate();

  return (
    <div className="buy-package-page">
      <div className="buy-package-header">
        <button
          type="button"
          className="buy-package-back-btn"
          onClick={() => navigate("/dashboard")}
          aria-label="Retour au dashboard"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="buy-package-header-divider" />

        <PanelLeft size={17} className="buy-package-header-icon" />

        <h2 className="buy-package-header-title">Dashboard</h2>
      </div>

      <div className="buy-package-body">
        <h1 className="buy-package-title">Acheter des Packages eSIM</h1>

        <p className="buy-package-subtitle">
          Choisissez une destination pour voir les forfaits disponibles.
        </p>

        {/* La sélection ouvre la route /dashboard/packages/:scope/:id */}
        <Packages
          onSelect={(country) =>
            navigate(`/dashboard/packages/${country.scope}/${country.id}`)
          }
        />
      </div>
    </div>
  );
}