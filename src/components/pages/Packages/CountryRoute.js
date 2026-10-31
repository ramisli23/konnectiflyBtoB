import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import "./CountryPage.css";

import { getCountriesoucontinents } from "../../../services/Api";
import PackageDetail from "../../../components/packages/packageDetail.js";

/* =====================================================
   ROUTE — /dashboard/packages/:scope/:id
   Résout la destination depuis l'API puis affiche
   la fiche des forfaits correspondants.
   ===================================================== */

export default function CountryRoute() {
  const { scope = "countries", id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filtres transmis par la liste des destinations
  const type = searchParams.get("type") || undefined;
  const mode = searchParams.get("mode") || undefined;
  const billing = searchParams.get("billing") || undefined;

  const [state, setState] = useState({
    loading: true,
    country: null,
    error: null,
  });

  // =====================================================
  // RÉSOUDRE LA DESTINATION
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    // L'endpoint "global" n'existe pas : on passe par "continents"
    const listType = scope === "global" ? "continents" : scope;

    async function resolveCountry() {
      try {
        const list = await getCountriesoucontinents(listType);

        const destinations = Array.isArray(list) ? list : [];

        const found = destinations.find(
          (destination) => String(destination?.id) === String(id),
        );

        if (!found) {
          throw new Error("Destination introuvable");
        }

        if (!cancelled) {
          setState({
            loading: false,
            country: {
              ...found,
              scope,
              type,
              mode,
              billing,
            },
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            country: null,
            error: error.message || "Failed to load destination.",
          });
        }
      }
    }

    resolveCountry();

    return () => {
      cancelled = true;
    };
  }, [scope, id]);

  // =====================================================
  // RENDU
  // =====================================================

  if (state.loading) {
    return (
      <div className="package-detail-page">
        <div className="packages-state">
          <p>Chargement de la destination…</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="package-detail-page">
        <div className="packages-state packages-state-error">
          <p>Erreur : {state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <PackageDetail
      country={state.country}
      onBack={() => navigate("/dashboard/packages")}
    />
  );
}