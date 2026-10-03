import { useState } from "react";
import { ArrowLeft, Calendar, Globe, Check } from "lucide-react";

import "./Checkout.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{8,16}$/;

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  acceptTerms: false,
};

const validate = (form) => {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = "Entrez votre prénom.";
  if (!form.lastName.trim()) errors.lastName = "Entrez votre nom.";

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

export default function Checkout({ plan, countryName, onBack, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Efface l'erreur du champ dès que la personne le corrige
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

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
      setDone(true);
    } catch (err) {
      setSubmitError(
        err?.message || "La commande n'a pas pu être envoyée. Réessayez."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Confirmation ----------

  if (done) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <span className="checkout-success-icon">
            <Check size={28} />
          </span>
          <h1>Commande enregistrée</h1>
          <p>
            Nous enverrons les détails de votre eSIM à{" "}
            <strong>{form.email}</strong>.
          </p>
          <button
            type="button"
            className="checkout-submit-btn"
            onClick={onBack}
          >
            Retour aux packages
          </button>
        </div>
      </div>
    );
  }

  // ---------- Formulaire ----------

  const field = (name, label, props = {}) => (
    <div className="checkout-field">
      <label htmlFor={`checkout-${name}`}>{label}</label>
      <input
        id={`checkout-${name}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `checkout-${name}-error` : undefined}
        {...props}
      />
      {errors[name] && (
        <span className="checkout-error" id={`checkout-${name}-error`}>
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div className="checkout-page">
      <button type="button" className="checkout-back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        Retour aux packages
      </button>

      <h1 className="checkout-title">Finaliser la commande</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Vos informations</h2>

          <div className="checkout-row">
            {field("firstName", "Prénom", {
              autoComplete: "given-name",
              autoFocus: true,
            })}
            {field("lastName", "Nom", { autoComplete: "family-name" })}
          </div>

          {field("email", "Adresse e-mail", {
            type: "email",
            autoComplete: "email",
            inputMode: "email",
          })}

          {field("phone", "Téléphone", {
            type: "tel",
            autoComplete: "tel",
            inputMode: "tel",
            placeholder: "+213 5XX XX XX XX",
          })}

          <label className="checkout-terms">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
            />
            <span>J'accepte les conditions générales de vente.</span>
          </label>
          {errors.acceptTerms && (
            <span className="checkout-error">{errors.acceptTerms}</span>
          )}

          {submitError && (
            <div className="checkout-submit-error" role="alert">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? "Envoi en cours..."
              : `Confirmer la commande — ${Number(
                  plan.priceDZD || 0
                ).toLocaleString()} DZD`}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Récapitulatif</h2>

          <div className="checkout-summary-data">
            {plan.data_quantity} {plan.data_unit}
          </div>

          <div className="checkout-summary-line">
            <Calendar size={14} />
            {plan.package_validity} {plan.package_validity_unit}
          </div>

          <div className="checkout-summary-line">
            <Globe size={14} />
            {countryName}
          </div>

          <div className="checkout-summary-total">
            <span>Total</span>
            <strong>{Number(plan.priceDZD || 0).toLocaleString()} DZD</strong>
            <small>${Number(plan.priceUSD || 0).toFixed(2)}</small>
          </div>
        </aside>
      </div>
    </div>
  );
}