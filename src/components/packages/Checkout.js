import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Globe,
  Check,
  Info,
  ShieldCheck,
  Wallet,
  Zap,
  AlertCircle,
} from "lucide-react";

import "./Checkout.css";

import { getCachedProfile } from "../../services/Api";

/* =====================================================
   VALIDATION
   ===================================================== */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{8,16}$/;

/** Ordre d'affichage du résumé d'erreurs = ordre du formulaire */
const FIELD_ORDER = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "acceptTerms",
];

const FIELD_LABELS = {
  firstName: "Prénom",
  lastName: "Nom",
  email: "Adresse e-mail",
  phone: "Téléphone",
  acceptTerms: "les conditions générales de vente",
};

const validate = (form) => {
  const errors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "Entrez votre prénom.";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Entrez votre nom.";
  }

  if (!form.email.trim()) {
    errors.email = "Entrez votre adresse e-mail.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Cette adresse e-mail n'est pas valide.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Entrez votre numéro de téléphone.";
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Ce numéro n'est pas valide (8 à 15 chiffres).";
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions pour continuer.";
  }

  return errors;
};

/* =====================================================
   PRÉREMPLISSAGE DEPUIS LE PROFIL AGENCE
   ===================================================== */

const buildInitialForm = (profile) => {
  const contact = (profile?.contact_name || "").trim();

  // `split` sur une chaîne vide ne renvoie aucun élément : on force ""
  const [firstName = "", ...rest] = contact ? contact.split(/\s+/) : [];

  return {
    firstName,
    lastName: rest.join(" "),
    email: profile?.email || "",
    phone: profile?.phone || "",
    acceptTerms: false,
  };
};

/* =====================================================
   FORMAT
   ===================================================== */

const formatDZD = (value) =>
  Number(value || 0).toLocaleString("fr-FR");

const formatUSD = (value) =>
  Number(value || 0).toFixed(2);

/** Référence de commande lisible : KF-<8 caractères> */
const buildOrderRef = (plan) => {
  const seed = `${plan?.id ?? ""}${Date.now()}`
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  return `KF-${(seed + "00000000").slice(0, 8)}`;
};

/* =====================================================
   COMPOSANT
   ===================================================== */

export default function Checkout({ plan, countryName, onBack, onSubmit }) {
  const [form, setForm] = useState(() =>
    buildInitialForm(getCachedProfile())
  );

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [orderRef, setOrderRef] = useState(null);

  const formRef = useRef(null);

  const priceDZD = formatDZD(plan.priceDZD);
  const priceUSD = formatUSD(plan.priceUSD);

  const errorList = useMemo(
    () => FIELD_ORDER.filter((name) => errors[name]),
    [errors]
  );

  /* =====================================================
     ÉCHAP → RETOUR
     ===================================================== */

  useEffect(() => {
    window.scrollTo({ top: 0 });

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onBack();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitting, onBack]);

  /* =====================================================
     SAISIE
     ===================================================== */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // L'erreur du champ disparaît dès que la personne le corrige
    setErrors((prev) => {
      if (!prev[name]) return prev;

      const next = { ...prev };
      delete next[name];

      return next;
    });
  };

  /* =====================================================
     ENVOI
     ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate(form);

    setErrors(found);
    setSubmitError(null);

    if (Object.keys(found).length > 0) {
      // Amène la personne directement sur le premier problème
      const first = FIELD_ORDER.find((name) => found[name]);

      formRef.current
        ?.querySelector(`[name="${first}"]`)
        ?.focus();

      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        plan,
        customer: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
      });

      setOrderRef(buildOrderRef(plan));
    } catch (err) {
      setSubmitError(
        err?.message || "La commande n'a pas pu être envoyée. Réessayez."
      );

      formRef.current?.querySelector(".checkout-submit-btn")?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     CONFIRMATION
     ===================================================== */

  if (orderRef) {
    return (
      <div className="checkout-page">
        <div className="checkout-success" role="status">
          <span className="checkout-success-icon">
            <Check size={30} />
          </span>

          <span className="checkout-success-label">
            Commande enregistrée
          </span>

          <h1 className="checkout-success-title">
            C'est parti pour {countryName}
          </h1>

          <p className="checkout-success-text">
            Les instructions d'activation de l'eSIM sont envoyées à{" "}
            <strong>{form.email.trim()}</strong>.
          </p>

          <dl className="checkout-success-list">
            <div className="checkout-success-row">
              <dt>Référence</dt>
              <dd>{orderRef}</dd>
            </div>

            <div className="checkout-success-row">
              <dt>Forfait</dt>
              <dd>
                {plan.data_quantity} {plan.data_unit} ·{" "}
                {plan.package_validity} {plan.package_validity_unit}
              </dd>
            </div>

            <div className="checkout-success-row">
              <dt>Montant</dt>
              <dd>
                {priceDZD} DZD · ${priceUSD}
              </dd>
            </div>
          </dl>

          <div className="checkout-success-actions">
            <button
              type="button"
              className="checkout-submit-btn"
              onClick={onBack}
            >
              Retour aux packages
            </button>

            <button
              type="button"
              className="checkout-ghost-btn"
              onClick={onBack}
            >
              Voir toutes les destinations
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     FORMULAIRE
     ===================================================== */

  const field = (name, label, props = {}) => (
    <div className="checkout-field">
      <label htmlFor={`checkout-${name}`}>{label}</label>

      <input
        id={`checkout-${name}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={
          errors[name] ? `checkout-${name}-error` : undefined
        }
        required
        {...props}
      />

      {errors[name] && (
        <span
          className="checkout-error"
          id={`checkout-${name}-error`}
        >
          <AlertCircle size={13} aria-hidden="true" />
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div className="checkout-page">
      {/* =========================================
          EN-TÊTE
      ========================================= */}

      <div className="checkout-header">
        <button
          type="button"
          className="checkout-back-btn"
          onClick={onBack}
          aria-label="Retour aux packages"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="checkout-header-divider" />

        <Wallet size={17} className="checkout-header-icon" />

        <h2 className="checkout-header-title">Paiement</h2>
      </div>

      <div className="checkout-body">
        <h1 className="checkout-title">Finaliser la commande</h1>

        <p className="checkout-subtitle">
          Vérifiez le forfait choisi puis renseignez les coordonnées de
          votre client.
        </p>

        <div className="checkout-layout">
          {/* =======================================
              FORMULAIRE
          ======================================= */}

          <form
            className="checkout-form"
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
          >
            <h2 className="checkout-card-title">Vos informations</h2>

            {errorList.length > 0 && (
              <div
                className="checkout-error-summary"
                role="alert"
              >
                <strong>
                  {errorList.length === 1
                    ? "1 champ à corriger"
                    : `${errorList.length} champs à corriger`}
                </strong>

                <ul>
                  {errorList.map((name) => (
                    <li key={name}>{FIELD_LABELS[name]}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="checkout-row">
              {field("firstName", "Prénom", {
                autoComplete: "given-name",
                placeholder: "Amina",
              })}

              {field("lastName", "Nom", {
                autoComplete: "family-name",
                placeholder: "Boudiaf",
              })}
            </div>

            {field("email", "Adresse e-mail", {
              type: "email",
              autoComplete: "email",
              inputMode: "email",
              placeholder: "amina@exemple.com",
            })}

            {field("phone", "Téléphone", {
              type: "tel",
              autoComplete: "tel",
              inputMode: "tel",
              placeholder: "+213 5XX XX XX XX",
            })}

            <label
              className="checkout-terms"
              htmlFor="checkout-acceptTerms"
            >
              <input
                id="checkout-acceptTerms"
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                aria-invalid={Boolean(errors.acceptTerms)}
                aria-describedby={
                  errors.acceptTerms
                    ? "checkout-acceptTerms-error"
                    : undefined
                }
              />

              <span>
                J'accepte les conditions générales de vente.
              </span>
            </label>

            {errors.acceptTerms && (
              <span
                className="checkout-error"
                id="checkout-acceptTerms-error"
              >
                <AlertCircle size={13} aria-hidden="true" />
                {errors.acceptTerms}
              </span>
            )}

            {submitError && (
              <div
                className="checkout-submit-error"
                role="alert"
              >
                <AlertCircle size={15} aria-hidden="true" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting
                ? "Envoi en cours…"
                : `Confirmer la commande — ${priceDZD} DZD`}
            </button>

            <p className="checkout-fineprint">
              En confirmant, le montant est débité de votre solde
              agence.
            </p>
          </form>

          {/* =======================================
              RÉCAPITULATIF
          ======================================= */}

          <aside className="checkout-summary">
            <h2 className="checkout-card-title">Récapitulatif</h2>

            <div className="checkout-summary-plan">
              {plan.name && (
                <span className="checkout-summary-name">
                  {plan.name}
                </span>
              )}

              <span className="checkout-summary-data">
                {plan.data_quantity}{" "}
                <span>{plan.data_unit}</span>
              </span>
            </div>

            <ul className="checkout-summary-list">
              <li>
                <Calendar size={15} aria-hidden="true" />
                <span>Validité</span>
                <strong>
                  {plan.package_validity}{" "}
                  {plan.package_validity_unit}
                </strong>
              </li>

              <li>
                <Globe size={15} aria-hidden="true" />
                <span>Destination</span>
                <strong>{countryName}</strong>
              </li>
            </ul>

            <div className="checkout-summary-total">
              <span className="checkout-summary-total-label">
                Total
              </span>

              <strong className="checkout-summary-total-price">
                {priceDZD}{" "}
                <span className="checkout-summary-total-currency">
                  DZD
                </span>
              </strong>

              <small className="checkout-summary-total-usd">
                ${priceUSD}
              </small>
            </div>

            <ul className="checkout-summary-perks">
              <li>
                <Zap size={14} aria-hidden="true" />
                Activation immédiate
              </li>

              <li>
                <ShieldCheck size={14} aria-hidden="true" />
                Paiement sécurisé depuis votre compte
              </li>

              <li>
                <Info size={14} aria-hidden="true" />
                Un eSIM par commande
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
