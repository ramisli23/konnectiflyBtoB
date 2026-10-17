import { useEffect, useState } from "react";

import {
  Globe,
  Database,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { Lottie } from "lottie-react";

import "./CountryPage.css";
import loadingAnimation from "../../../assets/lottie/Success.json";

import { getCountriesoucontinents } from "../../../services/Api";

// =====================================================
// SCOPE → LABEL UTILISÉ SUR LES CARTES
// =====================================================

const SCOPE_LABELS = {
  countries: "Local eSIM",
  continents: "Regional eSIM",
  global: "Global eSIM",
};

// =====================================================
// COMPOSANT
// =====================================================

export default function Packages({ onSelect }) {
  // ======================================
  // STATE
  // ======================================

  const [packageScope, setPackageScope] = useState("countries");
  const [packageType, setPackageType] = useState("dataOnly");
  const [packageMode, setPackageMode] = useState("limited");
  const [billing, setBilling] = useState("fixed");
  const [query, setQuery] = useState("");

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================================
  // FILTER OPTIONS
  // ======================================

  const scopeTypes = [
    { id: "countries", label: "Local" },
    { id: "continents", label: "Regional" },
    { id: "global", label: "Global" },
  ];

  const packageTypes = [
    { id: "dataOnly", label: "Data Only", apiValue: "DATA-ONLY" },
    { id: "dataVoiceSms", label: "Data Voice", apiValue: "DATA-VOICE-SMS" },
  ];

  const modeTypes = [
    { id: "limited", label: "Limited", apiValue: "limited" },
    { id: "unlimited", label: "Unlimited", apiValue: "unlimited" },
  ];

  const billingTypes = [
    { id: "fixed", label: "Fixed" },
    { id: "usage", label: "Usage" },
  ];

  // ======================================
  // LOAD DESTINATIONS
  // ======================================

  useEffect(() => {
    loadDestinations();
  }, [packageScope]);

  async function loadDestinations() {
    try {
      setLoading(true);
      setError(null);
      setQuery("");

      // ==========================================
      // GLOBAL
      // ==========================================

      if (packageScope === "global") {
        setCountries([
          {
            id: 1,
            name: "Global",
            image_url:
              "https://portal.esimcard.com/images/reseller_destination_image/global.jpg",
          },
        ]);

        setLoading(false);
        return;
      }

      // ==========================================
      // LOCAL / REGIONAL
      // ==========================================

      const data = await getCountriesoucontinents(packageScope);

      const validDestinations = Array.isArray(data)
        ? data.filter(
            (destination) =>
              destination && destination.id && destination.name,
          )
        : [];

      setCountries(validDestinations);
    } catch (requestError) {
      setError(
        requestError.message || "Failed to load destinations.",
      );

      setCountries([]);
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // SEARCH
  // ======================================

  const filteredCountries = countries.filter((country) =>
    country.name
      ?.toLowerCase()
      .trim()
      .includes(query.toLowerCase().trim()),
  );

  // ======================================
  // SELECT PACKAGE
  // ======================================

  function handleSelectCountry(country) {
    const selectedType = packageTypes.find(
      (type) => type.id === packageType,
    );

    const selectedMode = modeTypes.find(
      (mode) => mode.id === packageMode,
    );

    onSelect({
      ...country,

      // countries / continents / global
      scope: packageScope,

      // DATA-ONLY / DATA-VOICE-SMS
      type: selectedType?.apiValue,

      // limited / unlimited
      mode: selectedMode?.apiValue,

      billing,
    });
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="packages-wrapper">
      {/* ======================================
          INTRO
      ====================================== */}

      <div className="package-intro-card">
        <div className="package-intro-head">
          <span className="package-intro-icon">
            <Globe size={20} />
          </span>

          <div>
            <h1 className="package-intro-title">
              Explore our eSIM Packages
            </h1>

            <p className="package-intro-subtitle">
              Travel smarter with hassle-free eSIM options.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="filters-bar">
        {/* ===============================
            COVERAGE
        =============================== */}

        <div className="filter-group">
          <span className="filter-group-label">
            <Globe size={15} />
            Coverage
          </span>

          <div className="filter-toggle">
            {scopeTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                aria-pressed={packageScope === type.id}
                className={[
                  "filter-toggle-btn",
                  packageScope === type.id
                    ? "filter-toggle-btn-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setPackageScope(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <span className="filters-bar-divider" />

        {/* ===============================
            PACKAGE TYPE
        =============================== */}

        <div className="filter-group">
          <span className="filter-group-label">
            <Database size={15} />
            Type
          </span>

          <div className="filter-toggle">
            {packageTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                aria-pressed={packageType === type.id}
                className={[
                  "filter-toggle-btn",
                  packageType === type.id
                    ? "filter-toggle-btn-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setPackageType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <span className="filters-bar-divider" />

        {/* ===============================
            MODE
        =============================== */}

        <div className="filter-group">
          <span className="filter-group-label">
            <Database size={15} />
            Mode
          </span>

          <div className="filter-toggle">
            {modeTypes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={packageMode === mode.id}
                className={[
                  "filter-toggle-btn",
                  packageMode === mode.id
                    ? "filter-toggle-btn-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setPackageMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <span className="filters-bar-divider" />

        {/* ===============================
            BILLING
        =============================== */}

        <div className="filter-group">
          <span className="filter-group-label">
            <FileText size={15} />
            Billing
          </span>

          <div className="filter-toggle">
            {billingTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                aria-pressed={billing === type.id}
                className={[
                  "filter-toggle-btn",
                  billing === type.id
                    ? "filter-toggle-btn-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setBilling(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="search-row">
        <div className="search-input-wrapper">
          <Search size={17} className="search-icon" />

          <input
            type="text"
            className="search-input"
            placeholder="Search your destination"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <button type="button" className="groups-dropdown">
          All groups
          <ChevronDown size={16} />
        </button>

        <span className="search-results-count">
          {loading
            ? "…"
            : `${filteredCountries.length} ${
                filteredCountries.length > 1
                  ? "destinations"
                  : "destination"
              }`}
        </span>
      </div>

      {/* ======================================
          DESTINATION CARDS
      ====================================== */}

      <div className="packages-container">
        {/* ====================================
            LOADING
        ==================================== */}

        {loading && (
          <div className="packages-state">
            <Lottie
              animationData={loadingAnimation}
              loop={true}
              className="loading-lottie"
            />

            <p>Loading destinations...</p>
          </div>
        )}

        {/* ====================================
            ERROR
        ==================================== */}

        {!loading && error && (
          <div className="packages-state packages-state-error">
            <p>Error: {error}</p>
          </div>
        )}

        {/* ====================================
            EMPTY
        ==================================== */}

        {!loading &&
          !error &&
          filteredCountries.length === 0 && (
            <div className="packages-state">
              <p>No destinations found.</p>
            </div>
          )}

        {/* ====================================
            CARDS
        ==================================== */}

        {!loading &&
          !error &&
          filteredCountries.map((country) => (
            <button
              type="button"
              className="package-card"
              key={country.id}
              onClick={() => handleSelectCountry(country)}
            >
              <div className="package-card-header">
                {country.flag || country.image_url ? (
                  <span className="package-country-icon">
                    <img
                      src={country.flag || country.image_url}
                      alt={country.name}
                    />
                  </span>
                ) : (
                  <span className="package-fallback-icon">
                    {country.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}

                <span className="package-card-chip">
                  {SCOPE_LABELS[packageScope]}
                </span>
              </div>

              <div className="package-card-info">
                <h2>{country.name}</h2>
              </div>

              <div className="package-card-divider" />

              <div className="package-card-price">
                <span className="price-label">Starting at</span>

                <strong>240 DZ</strong>
              </div>

              <span className="package-card-cta">
                View packages
                <ChevronRight size={14} />
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}