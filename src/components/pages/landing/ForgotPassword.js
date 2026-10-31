import { useState } from "react"
import { Link } from "react-router-dom"

import {
  Plane,
  ArrowLeft,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Wifi,
  Globe2,
} from "lucide-react"

import "./auth.css"
import "./forgotPassword.css"

const SUPPORT_EMAIL = "support@konnectifly.com"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ForgotPassword({ onBack, onLogin }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    const value = email.trim()

    if (!EMAIL_PATTERN.test(value)) {
      setError("Entrez une adresse email valide.")
      return
    }

    setError("")
    setSent(true)
  }

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Réinitialisation du mot de passe — espace agence"
  )}&body=${encodeURIComponent(
    [
      "Bonjour,",
      "",
      "Je souhaite réinitialiser le mot de passe de mon compte agence KonnectiFly.",
      "",
      `Email du compte : ${email.trim()}`,
      "",
      "Merci.",
    ].join("\n")
  )}`

  return (
    <div className="kf-auth">
      <div className="kf-auth-shell">
        {/* PANNEAU MARQUE */}
        <aside className="kf-auth-brand">
          <button
            type="button"
            className="kf-auth-back kf-auth-back-light"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Retour au site
          </button>

          <div className="kf-auth-brand-content">
            <div className="kf-auth-logo">
              <span className="kf-auth-logo-icon">
                <Plane size={20} />
              </span>
              <span>
                Konnecti<span className="kf-auth-logo-accent">Fly</span>
              </span>
            </div>

            <h1>
              Récupérez l&apos;accès
              <br />à votre espace
            </h1>

            <p>
              Un mot de passe oublié ne doit pas bloquer votre activité. Notre
              équipe vous accompagne pour retrouver l&apos;accès à votre compte
              agence en toute sécurité.
            </p>

            <ul className="kf-auth-perks">
              <li>
                <Globe2 size={18} />
                Plus de 130 destinations couvertes
              </li>
              <li>
                <Wifi size={18} />
                Activation instantanée pour vos clients
              </li>
              <li>
                <ShieldCheck size={18} />
                Réinitialisation vérifiée par notre équipe
              </li>
            </ul>
          </div>
        </aside>

        {/* PANNEAU FORMULAIRE */}
        <section className="kf-auth-form-panel">
          <button
            type="button"
            className="kf-auth-back kf-auth-back-mobile"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          {sent ? (
            <div className="kf-auth-success">
              <div className="kf-auth-success-icon">
                <CheckCircle2 size={32} />
              </div>

              <h2>Demande prête à envoyer</h2>

              <p>
                Pour des raisons de sécurité, la réinitialisation est validée
                par notre équipe. Envoyez votre demande depuis{" "}
                <strong>{email.trim()}</strong> : nous répondons sous 24 h
                ouvrées.
              </p>

              <a className="kf-auth-submit kf-auth-mailto" href={mailto}>
                <Mail size={17} />
                Ouvrir ma messagerie
              </a>

              <button type="button" className="kf-auth-link" onClick={onLogin}>
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <div className="kf-auth-heading">
                <h2>Mot de passe oublié</h2>

                <p>
                  Indiquez l&apos;email de votre compte agence. Nous vous
                  aiderons à le réinitialiser.
                </p>
              </div>

              <form className="kf-auth-form" onSubmit={handleSubmit} noValidate>
                <div className="kf-auth-field">
                  <label htmlFor="forgot-email">Email professionnel</label>

                  <div
                    className={`kf-auth-input ${
                      error ? "kf-auth-input-error" : ""
                    }`}
                  >
                    <Mail size={17} />

                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        if (error) setError("")
                      }}
                      placeholder="vous@agence.com"
                      autoComplete="email"
                      autoFocus
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "forgot-email-error" : undefined}
                    />
                  </div>

                  {error && (
                    <span className="kf-auth-error" id="forgot-email-error">
                      {error}
                    </span>
                  )}
                </div>

                <button className="kf-auth-submit" type="submit">
                  Envoyer la demande
                </button>
              </form>

              <p className="kf-auth-switch">
                Vous vous en souvenez ?{" "}
                <button type="button" onClick={onLogin}>
                  Se connecter
                </button>
              </p>

              <p className="kf-auth-legal-note">
                Vous pouvez aussi écrire à{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> ou lire
                nos{" "}
                <Link to="/legal#confidentialite" target="_blank" rel="noreferrer">
                  règles de confidentialité
                </Link>
                .
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
