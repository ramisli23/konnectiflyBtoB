// src/services/balanceService.js
// Contains BOTH: the Firebase realtime listener AND the backend API calls.
import { ref, onValue } from "firebase/database"
import { database } from "../config/firebase"

/* =========================================================
   1) Realtime balance (Firebase)
   ========================================================= */

export function subscribeToAgencyBalance(agencyId, onBalanceChange, onError) {
  if (!agencyId) {
    console.warn("subscribeToAgencyBalance: no agency ID provided")
    return () => {}
  }

  const balanceRef = ref(database, `agences/${agencyId}/balance`)

  const unsubscribe = onValue(
    balanceRef,
    (snapshot) => {
      const value = snapshot.val()
      const balance =
        value === null || value === undefined || Number.isNaN(Number(value))
          ? 0
          : Number(value)

      onBalanceChange(balance)
    },
    (error) => {
      console.error("Firebase balance listener error:", error)
      if (onError) onError(error)
    }
  )

  return unsubscribe
}

/* =========================================================
   2) Top up (backend API)
   ========================================================= */

const API_URL = "https://konnectifly-backend-b2b-gwzs.onrender.com"

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, options)
  let data = null
  try {
    data = await res.json()
  } catch (_) {}

  if (!res.ok || !data || data.success === false) {
    throw new Error(data?.message || "Erreur serveur, réessayez.")
  }
  return data
}

// -> { success, invoiceId, paymentUrl }
export function createBalanceInvoice(agencyId, amount) {
  return request("/balance/create-balance-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agencyId, amount }),
  })
}

// -> { success, paid, status: "waiting" | "processing" | "completed", balance? }
export function checkBalancePayment(invoiceId) {
  return request(`/balance/check-balance-payment/${invoiceId}`)
}