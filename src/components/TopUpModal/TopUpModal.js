// src/components/TopUpModal/TopUpModal.js
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Wallet, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { createBalanceInvoice, checkBalancePayment } from "../../services/balanceService"
import "./TopUpModal.css"

const MIN_AMOUNT = 100 // keep in sync with MIN_RECHARGE in the backend
const PRESETS = [500, 1000, 2000, 5000]
const POLL_MS = 4000
const POLL_MAX_MS = 10 * 60 * 1000 // stop auto-checking after 10 min

export const pendingKey = (agencyId) => `pendingTopUp:${agencyId}`

export default function TopUpModal({ open, onClose, agencyId, balance }) {
  const [amount, setAmount] = useState("1000")
  const [step, setStep] = useState("form") // form | loading | waiting | success | error
  const [error, setError] = useState("")
  const [invoice, setInvoice] = useState(null) // { invoiceId, paymentUrl }
  const [checking, setChecking] = useState(false)

  const timerRef = useRef(null)
  const startedAtRef = useRef(0)

  const stopPolling = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  const check = useCallback(
    async (invoiceId) => {
      try {
        setChecking(true)
        const r = await checkBalancePayment(invoiceId)
        if (r.status === "completed") {
          stopPolling()
          localStorage.removeItem(pendingKey(agencyId))
          setStep("success")
        }
      } catch (_) {
        // temporary network/server error: keep polling
      } finally {
        setChecking(false)
      }
    },
    [agencyId]
  )

  // reset when the modal opens
  useEffect(() => {
    if (open) {
      setStep("form")
      setError("")
      setInvoice(null)
    }
    return stopPolling
  }, [open])

  // close with Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const numAmount = Number(amount)
  const validAmount = Number.isFinite(numAmount) && numAmount >= MIN_AMOUNT

  const handleSubmit = async () => {
    if (!validAmount) {
      setError(`Le montant minimum est de ${MIN_AMOUNT} DZD.`)
      return
    }
    setError("")
    setStep("loading")

    // open the tab NOW (inside the click) so the browser doesn't block it
    const tab = window.open("", "_blank")

    try {
      const inv = await createBalanceInvoice(agencyId, numAmount)
      setInvoice(inv)
      localStorage.setItem(pendingKey(agencyId), String(inv.invoiceId))

      if (tab) tab.location.href = inv.paymentUrl
      else window.open(inv.paymentUrl, "_blank")

      setStep("waiting")
      startedAtRef.current = Date.now()
      stopPolling()
      timerRef.current = setInterval(() => {
        if (Date.now() - startedAtRef.current > POLL_MAX_MS) return stopPolling()
        check(inv.invoiceId)
      }, POLL_MS)
    } catch (e) {
      if (tab) tab.close()
      setError(e.message)
      setStep("error")
    }
  }

  return (
    <div className="topup-overlay" onMouseDown={onClose}>
      <div
        className="topup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="topup-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="topup-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>

        {/* ---------- FORM / ERROR ---------- */}
        {(step === "form" || step === "error" || step === "loading") && (
          <>
            <div className="topup-head">
              <span className="topup-head-icon"><Wallet size={20} /></span>
              <div>
                <h2 id="topup-title">Recharger le solde</h2>
                <p>Solde actuel : <strong>{Number(balance || 0).toFixed(2)} DZD</strong></p>
              </div>
            </div>

            <label className="topup-label" htmlFor="topup-amount">Montant (DZD)</label>
            <input
              id="topup-amount"
              className="topup-input"
              type="number"
              min={MIN_AMOUNT}
              step="50"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={step === "loading"}
            />

            <div className="topup-presets">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`topup-chip ${numAmount === p ? "topup-chip-active" : ""}`}
                  onClick={() => setAmount(String(p))}
                  disabled={step === "loading"}
                >
                  {p.toLocaleString("fr-DZ")}
                </button>
              ))}
            </div>

            {error && (
              <p className="topup-error" role="alert">
                <AlertCircle size={16} /> {error}
              </p>
            )}

            <button
              className="topup-primary"
              onClick={handleSubmit}
              disabled={step === "loading" || !validAmount}
            >
              {step === "loading" ? (
                <><Loader2 size={16} className="topup-spin" /> Création de la facture…</>
              ) : (
                `Payer ${validAmount ? numAmount.toLocaleString("fr-DZ") + " DZD" : ""}`
              )}
            </button>
            <p className="topup-hint">Paiement sécurisé par carte CIB / Edahabia.</p>
          </>
        )}

        {/* ---------- WAITING ---------- */}
        {step === "waiting" && (
          <div className="topup-center">
            <Loader2 size={34} className="topup-spin topup-blue" />
            <h2 id="topup-title">En attente du paiement</h2>
            <p>
              Terminez le paiement dans l'onglet qui vient de s'ouvrir.
              Votre solde sera mis à jour automatiquement.
            </p>
            <a className="topup-link" href={invoice?.paymentUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Rouvrir la page de paiement
            </a>
            <button
              className="topup-secondary"
              onClick={() => check(invoice.invoiceId)}
              disabled={checking}
            >
              {checking ? "Vérification…" : "J'ai payé, vérifier"}
            </button>
          </div>
        )}

        {/* ---------- SUCCESS ---------- */}
        {step === "success" && (
          <div className="topup-center">
            <CheckCircle2 size={38} className="topup-green" />
            <h2 id="topup-title">Solde rechargé</h2>
            <p>{numAmount.toLocaleString("fr-DZ")} DZD ont été ajoutés à votre compte.</p>
            <button className="topup-primary" onClick={onClose}>Terminer</button>
          </div>
        )}
      </div>
    </div>
  )
}