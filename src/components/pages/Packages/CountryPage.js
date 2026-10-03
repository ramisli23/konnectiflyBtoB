import { useEffect, useState } from "react";

import {
  Globe,
  Database,
  FileText,
  Search,
  ChevronDown
} from "lucide-react";
import { Lottie } from "lottie-react";
import "./CountryPage.css";
import loadingAnimation from  "../../../assets/lottie/Success.json";

import {
  getCountriesoucontinents,
} from "../../../services/Api";

export default function Packages({ onSelect }) {

  // ======================================
  // STATE
  // ======================================

  const [packageScope, setPackageScope] =
    useState("countries");

  const [packageType, setPackageType] =
    useState("dataOnly");

  const [packageMode, setPackageMode] =
    useState("limited");

  const [countries, setCountries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [billing, setBilling] =
    useState("fixed");

  const [query, setQuery] =
    useState("");


  // ======================================
  // FILTER OPTIONS
  // ======================================

  const scopeTypes = [

    {
      id: "countries",
      label: "Local",
    },

    {
      id: "continents",
      label: "Regional",
    },

    {
      id: "global",
      label: "Global",
    },

  ];


  const packageTypes = [

    {
      id: "dataOnly",
      label: "Data Only",
      apiValue: "DATA-ONLY",
    },

    {
      id: "dataVoiceSms",
      label: "Data Voice",
      apiValue: "DATA-VOICE-SMS",
    },

  ];


  const modeTypes = [

    {
      id: "limited",
      label: "Limited",
      apiValue: "limited",
    },

    {
      id: "unlimited",
      label: "Unlimited",
      apiValue: "unlimited",
    },

  ];


  const billingTypes = [

    {
      id: "fixed",
      label: "Fixed",
    },

    {
      id: "usage",
      label: "Usage",
    },

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

    console.log("Destinations API:", data);

    const validDestinations = Array.isArray(data)
      ? data.filter(
          (destination) =>
            destination &&
            destination.id &&
            destination.name
        )
      : [];

    setCountries(validDestinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);

    setError(
      error.message || "Failed to load destinations."
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
    .includes(query.toLowerCase().trim())
);

  // ======================================
  // SELECT PACKAGE
  // ======================================

 function handleSelectCountry(country) {
  const selectedType = packageTypes.find(
    (type) => type.id === packageType
  );

  const selectedMode = modeTypes.find(
    (mode) => mode.id === packageMode
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

        <h1 className="package-intro-title">

          Explore our eSIM Packages

        </h1>

        <p className="package-intro-subtitle">

          Travel smarter with hassle-free
          eSIM options.

        </p>

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

            <Globe size={16} />

            Coverage

          </span>


          <div className="filter-toggle">

            {scopeTypes.map((t) => (

              <button

                key={t.id}

                type="button"

                className={`
                  filter-toggle-btn
                  ${
                    packageScope === t.id
                      ? "filter-toggle-btn-active"
                      : ""
                  }
                `}

                onClick={() =>
                  setPackageScope(t.id)
                }

              >

                {t.label}

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

            <Database size={16} />

            Type

          </span>


          <div className="filter-toggle">

            {packageTypes.map((t) => (

              <button

                key={t.id}

                type="button"

                className={`
                  filter-toggle-btn
                  ${
                    packageType === t.id
                      ? "filter-toggle-btn-active"
                      : ""
                  }
                `}

                onClick={() =>
                  setPackageType(t.id)
                }

              >

                {t.label}

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

            <Database size={16} />

            Mode

          </span>


          <div className="filter-toggle">

            {modeTypes.map((m) => (

              <button

                key={m.id}

                type="button"

                className={`
                  filter-toggle-btn
                  ${
                    packageMode === m.id
                      ? "filter-toggle-btn-active"
                      : ""
                  }
                `}

                onClick={() =>
                  setPackageMode(m.id)
                }

              >

                {m.label}

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

            <FileText size={16} />

            Billing

          </span>


          <div className="filter-toggle">

            {billingTypes.map((t) => (

              <button

                key={t.id}

                type="button"

                className={`
                  filter-toggle-btn
                  ${
                    billing === t.id
                      ? "filter-toggle-btn-active"
                      : ""
                  }
                `}

                onClick={() =>
                  setBilling(t.id)
                }

              >

                {t.label}

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

          <Search
            size={18}
            className="search-icon"
          />

          <input

            type="text"

            className="search-input"

            placeholder="Search your destination"

            value={query}

            onChange={(e) =>
              setQuery(e.target.value)
            }

          />

        </div>


        <button
          type="button"
          className="groups-dropdown"
        >

          All groups

          <ChevronDown size={16} />

        </button>

      </div>


      {/* ======================================
          DESTINATION CARDS
      ====================================== */}

      <div className="packages-container">


        {/* ====================================
            LOADING
        ==================================== */}

        {loading && (

  <div className="packages-loading">

    <Lottie
      animationData={loadingAnimation}
      loop={true}
      className="loading-lottie"
    />

    <p>
      Loading destinations...
    </p>

  </div>

)}


        {/* ====================================
            ERROR
        ==================================== */}

        {!loading && error && (

          <div className="packages-error">

            <p>
              Error: {error}
            </p>

          </div>

        )}


        {/* ====================================
            EMPTY
        ==================================== */}

        {!loading &&
        !error &&
        filteredCountries.length === 0 && (

          <div className="packages-empty">

            <p>
              No destinations found.
            </p>

          </div>

        )}


        {/* ====================================
            CARDS
        ==================================== */}

        {!loading &&
        !error &&
        filteredCountries.length > 0 && (

          filteredCountries.map(
            (country) => (

              <div

                className="package-card"

                key={country.id}

                onClick={() =>
                  handleSelectCountry(
                    country
                  )
                }

              >


                {/* ==========================
                    IMAGE
                ========================== */}

                <div className="package-card-header">


                  {country.flag ||
                  country.image_url ? (

                    <div className="package-country-icon">

                      <img

                        src={
                          country.flag ||
                          country.image_url
                        }

                        alt={
                          country.name
                        }

                      />

                    </div>

                  ) : (

                    <div className="package-fallback-icon">

                      {country.name
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </div>

                  )}


                  <span className="package-card-arrow">

                    →

                  </span>

                </div>


                {/* ==========================
                    INFO
                ========================== */}

                <div className="package-card-info">

                  <h2>

                    {country.name}

                  </h2>


                  <span className="package-card-subtitle">

                    {packageScope ===
                    "countries"

                      ? "Local eSIM"

                      : packageScope ===
                        "continents"

                      ? "Regional eSIM"

                      : "Global eSIM"}

                  </span>

                </div>


                {/* ==========================
                    DIVIDER
                ========================== */}

                <div className="package-card-divider" />


                {/* ==========================
                    PRICE
                ========================== */}

                <div className="package-card-price">

                  <span className="price-label">

                    Starting at

                  </span>


                  <strong>

                    240 DZ

                  </strong>

                </div>


              </div>

            )
          )

        )}

      </div>

    </div>

  );

}