import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";

import loadingAnimation from "../../../src/assets/lottie/Trail loading.json";

import {
  ArrowLeft,
  PanelLeft,
  SlidersHorizontal,
  Calendar,
  Globe,
  ChevronRight,
  X,
  Wifi,
  Smartphone,
  Signal,
  MessageSquare,
  Phone,
  Check,
} from "lucide-react";

import "./packageDetail.css";
import Checkout from "./Checkout";

import { getPackagesByCountry } from "../../services/Api";

// =====================================================
// SCOPE → API VALUE
// =====================================================

const getPackageEndpointType = (scope) => {
  if (scope === "countries") {
    return "country";
  }

  if (scope === "continents") {
    return "continent";
  }

  if (scope === "global") {
    return "global";
  }

  return "country";
};

// =====================================================
// COMPONENT
// =====================================================

export default function PackageDetail({
  country,
  onBack,
}) {
  // =====================================================
  // FILTERS
  // =====================================================

  const [packageScope, setPackageScope] = useState(
    country?.scope || "countries"
  );

  const [packageType, setPackageType] = useState(
    country?.type || "DATA-ONLY"
  );

  const [packageMode, setPackageMode] = useState(
    country?.mode || "limited"
  );

  const [billing, setBilling] = useState(
    country?.billing || "fixed"
  );

  // =====================================================
  // DATA
  // =====================================================

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [search, setSearch] = useState("");

  // =====================================================
  // PACKAGE DETAIL MODAL
  // =====================================================

  const [detailPlan, setDetailPlan] = useState(null);

  const [showDetails, setShowDetails] = useState(false);

  // =====================================================
  // CHECKOUT (package en cours d'achat, null = liste)
  // =====================================================

  const [checkoutPlan, setCheckoutPlan] = useState(null);

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

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
      id: "DATA-ONLY",
      label: "Data Only",
    },
    {
      id: "DATA-VOICE-SMS",
      label: "Data Voice",
    },
  ];

  const modeTypes = [
    {
      id: "limited",
      label: "Limited",
    },
    {
      id: "unlimited",
      label: "Unlimited",
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

  // =====================================================
  // LOAD PACKAGES
  // =====================================================

  useEffect(() => {
    if (!country?.id) {
      setPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const endpointType =
      getPackageEndpointType(packageScope);

    console.log("=================================");
    console.log("PACKAGE REQUEST");
    console.log("Scope:", endpointType);
    console.log("ID:", country.id);
    console.log("Type:", packageType);
    console.log("Mode:", packageMode);
    console.log("=================================");

    getPackagesByCountry(
      endpointType,
      country.id,
      packageType,
      packageMode
    )
      .then((response) => {
        console.log("Packages API:", response);

        if (!response?.status) {
          throw new Error(
            response?.message ||
              "API returned an error"
          );
        }

        const packages = Array.isArray(response.data)
          ? response.data
          : [];

        setPlans(packages);

        // Select first package
        if (packages.length > 0) {
          setSelectedPlanId(packages[0].id);
        } else {
          setSelectedPlanId(null);
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching packages:",
          error
        );

        setError(
          error.message ||
            "Failed to load packages."
        );

        setPlans([]);
        setSelectedPlanId(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    country?.id,
    packageScope,
    packageType,
    packageMode,
  ]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredPlans = plans.filter((plan) => {
    const text = `
      ${plan.data_quantity || ""}
      ${plan.data_unit || ""}
      ${plan.package_validity || ""}
      ${plan.package_validity_unit || ""}
      ${plan.name || ""}
      ${plan.priceUSD || ""}
      ${plan.priceDZD || ""}
    `.toLowerCase();

    return text.includes(
      search.toLowerCase()
    );
  });

  // =====================================================
  // SELECTED PLAN
  // =====================================================

  const selectedPlan =
    plans.find(
      (plan) =>
        plan.id === selectedPlanId
    ) || plans[0];

  // =====================================================
  // OPEN PACKAGE DETAILS
  // =====================================================

  const handleViewDetails = (event, plan) => {
    event.preventDefault();
    event.stopPropagation();

    setDetailPlan(plan);
    setShowDetails(true);
  };

  // =====================================================
  // CLOSE PACKAGE DETAILS
  // =====================================================

  const closeDetails = () => {
    setShowDetails(false);
    setDetailPlan(null);
  };

  // =====================================================
  // BUY PACKAGE → OPEN CHECKOUT PAGE
  // =====================================================

  const handleBuyPackage = (plan) => {
    setShowDetails(false);
    setDetailPlan(null);
    setCheckoutPlan(plan);

    window.scrollTo({ top: 0 });
  };

  // =====================================================
  // CLOSE CHECKOUT
  // =====================================================

  const closeCheckout = () => {
    setCheckoutPlan(null);
  };

  // =====================================================
  // SUBMIT ORDER
  // =====================================================

  const handleSubmitOrder = async (order) => {
    console.log("ORDER:", order);

    // TODO:
    // Appeler ici ton API de commande, par exemple :
    // await createOrder({ ...order.customer, packageId: order.plan.id });
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (checkoutPlan) {
    return (
      <Checkout
        plan={checkoutPlan}
        countryName={country?.name}
        onBack={closeCheckout}
        onSubmit={handleSubmitOrder}
      />
    );
  }

  return (
    <div className="package-detail-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="package-detail-header">

        <button
          type="button"
          className="package-detail-back-btn"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>

        <span className="package-detail-header-divider" />

        <PanelLeft
          size={18}
          className="package-detail-header-icon"
        />

        <h2 className="package-detail-header-title">
          Dashboard
        </h2>

      </div>

      {/* =========================================
          TITLE
      ========================================= */}

      <h1 className="package-detail-title">
        Explore our eSIM packages
      </h1>

      <p className="package-detail-subtitle">
        Pick the Best eSIM Plans for{" "}
        {country?.name} Travel
      </p>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="filters-bar">

        {/* TYPE */}

        <div className="filter-group">

          <div className="filter-group-label">
            <SlidersHorizontal size={16} />
            Type
          </div>

          <div className="filter-toggle">

            {packageTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`
                  filter-toggle-btn
                  ${
                    packageType === type.id
                      ? "filter-toggle-btn-active"
                      : ""
                  }
                `}
                onClick={() =>
                  setPackageType(type.id)
                }
              >
                {type.label}
              </button>
            ))}

          </div>

        </div>

        <div className="filters-bar-divider" />

        {/* MODE */}

        <div className="filter-group">

          <div className="filter-group-label">
            Mode
          </div>

          <div className="filter-toggle">

            {modeTypes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`
                  filter-toggle-btn
                  ${
                    packageMode === mode.id
                      ? "filter-toggle-btn-active"
                      : ""
                  }
                `}
                onClick={() =>
                  setPackageMode(mode.id)
                }
              >
                {mode.label}
              </button>
            ))}

          </div>

        </div>

      </div>

      {/* =========================================
          SEARCH
      ========================================= */}

      <div className="package-detail-toolbar">

        <input
          type="text"
          className="package-detail-search"
          placeholder="Search packages"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          type="button"
          className="package-detail-filter-btn"
        >
          <SlidersHorizontal size={16} />
          Filter Packages
        </button>

      </div>

      {/* =========================================
          PACKAGES
      ========================================= */}

      <div className="package-plans-grid">

        {/* LOADING */}

        {loading ? (

          <div className="packages-loading">

            <Lottie
              animationData={loadingAnimation}
              loop={true}
              className="loading-lottie"
            />

            <p>
              Loading packages...
            </p>

          </div>

        ) : error ? (

          /* ERROR */

          <div className="no-packages">

            <p>
              Erreur : {error}
            </p>

          </div>

        ) : filteredPlans.length === 0 ? (

          /* EMPTY */

          <div className="no-packages">

            <p>
              No packages found.
            </p>

          </div>

        ) : (

          /* PACKAGES */

          filteredPlans.map((plan) => {

            const isSelected =
              plan.id === selectedPlanId;

            return (

              <div
                key={plan.id}
                className={`
                  package-plan-card
                  ${
                    isSelected
                      ? "package-plan-card-selected"
                      : ""
                  }
                `}
                onClick={() =>
                  setSelectedPlanId(
                    plan.id
                  )
                }
              >

                {/* DATA */}

                <div className="package-plan-data">
                  {plan.data_quantity}{" "}
                  {plan.data_unit}
                </div>

                {/* DAYS */}

                <div className="package-plan-days">

                  <Calendar size={14} />

                  {plan.package_validity}{" "}
                  {plan.package_validity_unit}

                </div>

                <div className="package-plan-divider" />

                {/* PRICE */}

                <div className="package-plan-price">

                  {Number(
                    plan.priceDZD || 0
                  ).toLocaleString()}

                  <span className="package-plan-currency">
                    {" "}DZD
                  </span>

                </div>

                {/* COUNTRY */}

                <div className="package-plan-meta">

                  <Globe size={14} />

                  {country?.name}

                </div>

                {/* DETAILS */}

                <button
                  type="button"
                  className="package-plan-view-details"
                  onClick={(event) =>
                    handleViewDetails(
                      event,
                      plan
                    )
                  }
                >
                  View Details

                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>
            );
          })
        )}

      </div>

      {/* =========================================
          BUY BAR
      ========================================= */}

      {!loading &&
        !error &&
        selectedPlan && (

          <div className="package-detail-buy-bar">

            <div className="package-detail-buy-bar-info">

              <span className="package-detail-buy-bar-data">
                {selectedPlan.data_quantity}{" "}
                {selectedPlan.data_unit}
              </span>

              <span className="package-detail-buy-bar-days">
                {selectedPlan.package_validity}{" "}
                {selectedPlan.package_validity_unit}
              </span>

            </div>

            <button
              type="button"
              className="package-detail-buy-btn"
              onClick={() =>
                handleBuyPackage(
                  selectedPlan
                )
              }
            >
              Acheter — $

              {Number(
                selectedPlan.priceUSD || 0
              ).toFixed(2)}
            </button>

          </div>

        )}

      {/* =========================================
          PACKAGE DETAIL MODAL
      ========================================= */}

      {showDetails && detailPlan && (

        <div
          className="package-detail-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="package-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="package-detail-modal-header">

              <div>

                <span className="package-detail-modal-label">
                  eSIM PACKAGE
                </span>

                <h2>
                  {detailPlan.name}
                </h2>

              </div>

              <button
                type="button"
                className="package-detail-modal-close"
                onClick={closeDetails}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {/* =================================
                BASIC INFORMATION
            ================================= */}

            <div className="package-detail-modal-grid">

              {/* DATA */}

              <div className="detail-info-card">

                <Wifi size={18} />

                <span>
                  Data
                </span>

                <strong>
                  {detailPlan.data_quantity}{" "}
                  {detailPlan.data_unit}
                </strong>

              </div>

              {/* VALIDITY */}

              <div className="detail-info-card">

                <Calendar size={18} />

                <span>
                  Validity
                </span>

                <strong>
                  {detailPlan.package_validity}{" "}
                  {detailPlan.package_validity_unit}
                </strong>

              </div>

              {/* USD */}

              <div className="detail-info-card">

                <span>
                  USD Price
                </span>

                <strong>
                  $
                  {Number(
                    detailPlan.priceUSD || 0
                  ).toFixed(2)}
                </strong>

              </div>

              {/* DZD */}

              <div className="detail-info-card">

                <span>
                  DZD Price
                </span>

                <strong>
                  {Number(
                    detailPlan.priceDZD || 0
                  ).toLocaleString()}{" "}
                  DZD
                </strong>

              </div>

            </div>

            {/* =================================
                PACKAGE TYPE
            ================================= */}

            <div className="package-detail-section">

              <h3>
                Package Information
              </h3>

              <div className="package-detail-info-list">

                <div className="package-detail-row">

                  <span>
                    Package type
                  </span>

                  <strong>
                    {detailPlan.package_type}
                  </strong>

                </div>

                <div className="package-detail-row">

                  <span>
                    Mode
                  </span>

                  <strong>
                    {detailPlan.mode ||
                      packageMode}
                  </strong>

                </div>

                <div className="package-detail-row">

                  <span>
                    Voice
                  </span>

                  <strong>
                    {detailPlan.voice_quantity || 0}{" "}
                    {detailPlan.voice_unit ||
                      "Minutes"}
                  </strong>

                </div>

                <div className="package-detail-row">

                  <span>
                    SMS
                  </span>

                  <strong>
                    {detailPlan.sms_quantity || 0}
                  </strong>

                </div>

              </div>

            </div>

            {/* =================================
                ACTIVATION
            ================================= */}

            {detailPlan.detail && (

              <div className="package-detail-section">

                <h3>
                  Activation
                </h3>

                <div className="package-detail-row">

                  <span>
                    Activation type
                  </span>

                  <strong>
                    {detailPlan.detail
                      .activation_type ||
                      "N/A"}
                  </strong>

                </div>

                {detailPlan.detail
                  .activation_type_description && (

                  <p>
                    {
                      detailPlan.detail
                        .activation_type_description
                    }
                  </p>

                )}

              </div>

            )}

            {/* =================================
                COVERAGE
            ================================= */}

            {detailPlan.detail?.countries?.length >
              0 && (

              <div className="package-detail-section">

                <h3>
                  Coverage
                </h3>

                {detailPlan.detail.countries.map(
                  (destination) => (

                    <div
                      className="coverage-country"
                      key={destination.id}
                    >

                      {destination.image_url && (

                        <img
                          src={
                            destination.image_url
                          }
                          alt={
                            destination.name
                          }
                        />

                      )}

                      <div>

                        <strong>
                          {destination.name}
                        </strong>

                        <span>
                          {destination.code
                            ?.toUpperCase()}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

            {/* =================================
                NETWORK COVERAGE
            ================================= */}

            {detailPlan.detail?.countries?.[0]
              ?.network_coverage?.length > 0 && (

              <div className="package-detail-section">

                <h3>
                  Available Networks
                </h3>

                <div className="network-list">

                  {detailPlan.detail.countries[0]
                    .network_coverage.map(
                      (network, index) => (

                        <div
                          className="network-item"
                          key={`${network.network_code}-${index}`}
                        >

                          <div className="network-info">

                            <strong>
                              {network.network_name}
                            </strong>

                            <span>
                              {network.network_code}
                            </span>

                          </div>

                          <div className="network-technologies">

                            {network.five_G && (
                              <span>
                                5G
                              </span>
                            )}

                            {network.four_G && (
                              <span>
                                4G
                              </span>
                            )}

                            {network.three_g && (
                              <span>
                                3G
                              </span>
                            )}

                            {network.two_g && (
                              <span>
                                2G
                              </span>
                            )}

                          </div>

                        </div>

                      )
                    )}

                </div>

              </div>

            )}

            {/* =================================
                ROAMING COUNTRIES
            ================================= */}

            {detailPlan.romaing_countries?.length >
              0 && (

              <div className="package-detail-section">

                <h3>
                  Roaming Countries
                </h3>

                <div className="roaming-list">

                  {detailPlan.romaing_countries.map(
                    (destination, index) => (

                      <div
                        className="roaming-item"
                        key={`${destination.id}-${index}`}
                      >

                        {destination.image_url && (

                          <img
                            src={
                              destination.image_url
                            }
                            alt={
                              destination.name
                            }
                          />

                        )}

                        <span>
                          {destination.name}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

            {/* =================================
                FEATURES
            ================================= */}

            <div className="package-detail-section">

              <h3>
                Features
              </h3>

              <div className="features-list">

                <div className="feature-item">

                  <Check size={16} />

                  <span>
                    eSIM supported
                  </span>

                </div>

                {detailPlan.data_quantity > 0 && (

                  <div className="feature-item">

                    <Wifi size={16} />

                    <span>
                      Mobile Data
                    </span>

                  </div>

                )}

                {detailPlan.voice_quantity > 0 && (

                  <div className="feature-item">

                    <Phone size={16} />

                    <span>
                      Voice Calls
                    </span>

                  </div>

                )}

                {detailPlan.sms_quantity > 0 && (

                  <div className="feature-item">

                    <MessageSquare size={16} />

                    <span>
                      SMS
                    </span>

                  </div>

                )}

                {detailPlan.detail?.countries?.[0]
                  ?.network_coverage?.length > 0 && (

                  <div className="feature-item">

                    <Signal size={16} />

                    <span>
                      Multiple Networks
                    </span>

                  </div>

                )}

              </div>

            </div>

            {/* =================================
                MODAL FOOTER
            ================================= */}

            <div className="package-detail-modal-footer">

              <div className="modal-price">

                <span>
                  Total price
                </span>

                <strong>
                  {Number(
                    detailPlan.priceDZD || 0
                  ).toLocaleString()}{" "}
                  DZD
                </strong>

                <small>
                  $
                  {Number(
                    detailPlan.priceUSD || 0
                  ).toFixed(2)}
                </small>

              </div>

              <button
                type="button"
                className="package-detail-modal-buy-btn"
                onClick={() =>
                  handleBuyPackage(
                    detailPlan
                  )
                }
              >
                Acheter
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}