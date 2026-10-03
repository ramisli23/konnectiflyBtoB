import { useState } from "react"
import {
  Plane,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe2,
  Wifi,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import {
  registerAgency,
  loginAgency,
  getAgencyProfile,
  saveAuthToken,
  saveCachedProfile,
} from "../../../services/Api"
import "./auth.css"

export default function AuthPage({ onBack, onAuthenticated, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode) // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    remember: false,
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [registered, setRegistered] = useState(false) // pending-validation screen

  const isSignup = mode === "signup"

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: null }))
    if (serverError) setServerError("")
  }

  const validate = () => {
    const next = {}
    if (isSignup && form.companyName.trim().length < 2) {
      next.companyName = "Entrez le nom de votre agence"
    }
    if (isSignup && form.contactName.trim().length < 2) {
      next.contactName = "Entrez le nom du contact"
    }
    if (isSignup && form.phone.trim().length < 8) {
      next.phone = "Numéro de téléphone invalide"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Adresse e-mail invalide"
    }
    if (form.password.length < 8) {
      next.password = "8 caractères minimum"
    }
    if (isSignup && form.confirmPassword !== form.password) {
      next.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    if (isSignup && !form.acceptTerms) {
      next.acceptTerms = "Acceptez les conditions pour continuer"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")
    if (!validate()) return

    setSubmitting(true)
    try {
      if (isSignup) {
        await registerAgency({
          email: form.email,
          password: form.password,
          company_name: form.companyName,
          contact_name: form.contactName,
          phone: form.phone,
        })
        // Backend keeps new agencies pending until an admin activates them —
        // so we show a confirmation screen instead of logging in right away.
        setRegistered(true)
      } else {
        const { token } = await loginAgency({
          email: form.email,
          password: form.password,
        })
        saveAuthToken(token)
        const profile = await getAgencyProfile(token)
        saveCachedProfile(profile)
        onAuthenticated?.({ ...profile, token })
      }
    } catch (err) {
      setServerError(err.message || "Une erreur est survenue, réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setServerError("")
    setRegistered(false)
  }

  return (
    <div className="kf-auth">
      <div className="kf-auth-shell">
        {/* BRAND PANEL */}
        <aside className="kf-auth-brand">
          <button className="kf-auth-back kf-auth-back-light" onClick={onBack}>
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
              L'espace agence
              <br />
              KonnectiFly
            </h1>
            <p>
              Gérez vos eSIM clients, suivez vos ventes et rachetez des
              forfaits en gros, directement depuis votre tableau de bord.
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
                Accès API sécurisé pour votre agence
              </li>
            </ul>
          </div>

          <div className="kf-auth-brand-quote">
            <p>
              « Nos clients activent leur eSIM avant même de récupérer leurs
              bagages. »
            </p>
            <span>— Rami, Berrahal Travel</span>
          </div>
        </aside>

        {/* FORM PANEL */}
        <section className="kf-auth-form-panel">
          <button className="kf-auth-back kf-auth-back-mobile" onClick={onBack}>
            <ArrowLeft size={16} />
            Retour
          </button>

          {registered ? (
            <div className="kf-auth-success">
              <div className="kf-auth-success-icon">
                <CheckCircle2 size={32} />
              </div>
              <h2>Demande envoyée</h2>
              <p>
                Votre compte agence a bien été créé et est <strong>en attente
                de validation</strong>. Nous vous préviendrons par e-mail dès
                qu'il sera activé — vous pourrez alors vous connecter.
              </p>
              <button
                type="button"
                className="kf-auth-submit"
                onClick={() => switchMode("login")}
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <div className="kf-auth-tabs">
                <button
                  className={`kf-auth-tab ${!isSignup ? "kf-auth-tab-active" : ""}`}
                  onClick={() => switchMode("login")}
                  type="button"
                >
                  Connexion
                </button>
                <button
                  className={`kf-auth-tab ${isSignup ? "kf-auth-tab-active" : ""}`}
                  onClick={() => switchMode("signup")}
                  type="button"
                >
                  Inscription
                </button>
              </div>

              <div className="kf-auth-heading">
                <h2>{isSignup ? "Créez votre compte agence" : "Content de vous revoir"}</h2>
                <p>
                  {isSignup
                    ? "Renseignez les infos de votre agence pour démarrer."
                    : "Connectez-vous pour accéder à votre tableau de bord."}
                </p>
              </div>

              {serverError && <div className="kf-auth-server-error">{serverError}</div>}

              <form className="kf-auth-form" onSubmit={handleSubmit} noValidate>
                {isSignup && (
                  <div className="kf-auth-field">
                    <label htmlFor="companyName">Nom de l'agence</label>
                    <div
                      className={`kf-auth-input ${errors.companyName ? "kf-auth-input-error" : ""}`}
                    >
                      <Building2 size={17} />
                      <input
                        id="companyName"
                        type="text"
                        placeholder="Berrahal Travel"
                        value={form.companyName}
                        onChange={update("companyName")}
                        autoComplete="organization"
                      />
                    </div>
                    {errors.companyName && (
                      <span className="kf-auth-error">{errors.companyName}</span>
                    )}
                  </div>
                )}

                {isSignup && (
                  <div className="kf-auth-field">
                    <label htmlFor="contactName">Nom du contact</label>
                    <div
                      className={`kf-auth-input ${errors.contactName ? "kf-auth-input-error" : ""}`}
                    >
                      <User size={17} />
                      <input
                        id="contactName"
                        type="text"
                        placeholder="Rami"
                        value={form.contactName}
                        onChange={update("contactName")}
                        autoComplete="name"
                      />
                    </div>
                    {errors.contactName && (
                      <span className="kf-auth-error">{errors.contactName}</span>
                    )}
                  </div>
                )}

                <div className="kf-auth-field">
                  <label htmlFor="email">Adresse e-mail</label>
                  <div className={`kf-auth-input ${errors.email ? "kf-auth-input-error" : ""}`}>
                    <Mail size={17} />
                    <input
                      id="email"
                      type="email"
                      placeholder="vous@agence.com"
                      value={form.email}
                      onChange={update("email")}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <span className="kf-auth-error">{errors.email}</span>}
                </div>

                {isSignup && (
                  <div className="kf-auth-field">
                    <label htmlFor="phone">Téléphone</label>
                    <div
                      className={`kf-auth-input ${errors.phone ? "kf-auth-input-error" : ""}`}
                    >
                      <Phone size={17} />
                      <input
                        id="phone"
                        type="tel"
                        placeholder="0550000000"
                        value={form.phone}
                        onChange={update("phone")}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && <span className="kf-auth-error">{errors.phone}</span>}
                  </div>
                )}

                <div className="kf-auth-field">
                  <label htmlFor="password">Mot de passe</label>
                  <div
                    className={`kf-auth-input ${errors.password ? "kf-auth-input-error" : ""}`}
                  >
                    <Lock size={17} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={update("password")}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      className="kf-auth-eye"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="kf-auth-error">{errors.password}</span>}
                </div>

                {isSignup && (
                  <div className="kf-auth-field">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <div
                      className={`kf-auth-input ${
                        errors.confirmPassword ? "kf-auth-input-error" : ""
                      }`}
                    >
                      <Lock size={17} />
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={update("confirmPassword")}
                        autoComplete="new-password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <span className="kf-auth-error">{errors.confirmPassword}</span>
                    )}
                  </div>
                )}

                {!isSignup ? (
                  <div className="kf-auth-row">
                    <label className="kf-auth-checkbox">
                      <input
                        type="checkbox"
                        checked={form.remember}
                        onChange={update("remember")}
                      />
                      Se souvenir de moi
                    </label>
                    <a href="#" className="kf-auth-link">
                      Mot de passe oublié ?
                    </a>
                  </div>
                ) : (
                  <div className="kf-auth-field">
                    <label className="kf-auth-checkbox">
                      <input
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={update("acceptTerms")}
                      />
                      J'accepte les conditions d'utilisation et la politique de
                      confidentialité
                    </label>
                    {errors.acceptTerms && (
                      <span className="kf-auth-error">{errors.acceptTerms}</span>
                    )}
                  </div>
                )}

                <button className="kf-auth-submit" type="submit" disabled={submitting}>
                  {submitting
                    ? "Un instant…"
                    : isSignup
                      ? "Créer mon compte agence"
                      : "Se connecter"}
                </button>
              </form>

              <p className="kf-auth-switch">
                {isSignup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
                <button type="button" onClick={() => switchMode(isSignup ? "login" : "signup")}>
                  {isSignup ? "Se connecter" : "Créer un compte"}
                </button>
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}