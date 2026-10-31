const API_URL = "https://konnectifly-backend-b2b-gwzs.onrender.com"

export async function getCountriesoucontinents(type) {
  const response = await fetch(`${API_URL}/${type}`)

  if (!response.ok) {
    throw new Error("Failed to fetch countries")
  }

  return await response.json()
}

export async function getPackagesByCountry(scope, id, type, mode) {
  const url = `${API_URL}/packages/${scope}/${id}/${type}/${mode}`

  console.log("FINAL API URL:", url)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.status}`)
  }

  return await response.json()
}

// ---------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------

/**
 * Helper: parses the JSON body even on non-2xx responses, so we can
 * surface the backend's own error message ("Agence introuvable",
 * "Email déjà utilisé", etc.) instead of a generic failure.
 */
async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

/**
 * Registers a new agency (B2B account).
 * The backend returns { message, id, api_key, api_secret } and the
 * account stays "pending validation" until an admin activates it
 * via /auth/activate/:id — so this does NOT log the user in.
 */
export async function registerAgency({
  email,
  password,
  company_name,
  contact_name,
  phone,
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      company_name,
      contact_name,
      phone,
    }),
  })

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(data.message || "Échec de l'inscription")
  }

  return data // { message, id, api_key, api_secret }
}

/**
 * Logs an agency in. The backend returns { message, token } on
 * success, or { message } (e.g. "Agence introuvable") on failure.
 */
export async function loginAgency({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const data = await parseJsonSafe(response)

  if (!response.ok || !data.token) {
    throw new Error(data.message || "Échec de la connexion")
  }

  return data // { message, token }
}

/**
 * Fetches the full agency profile (balance, commission_rate, status,
 * company_name, contact_name, etc.) for the currently authenticated
 * agency, using the JWT returned by loginAgency.
 */
export async function getAgencyProfile(token) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(data.message || "Impossible de récupérer le profil")
  }

  return data
}

// ---------------------------------------------------------------
// COMMANDES
// ---------------------------------------------------------------

/** En-têtes optionnels : le backend accepte les commandes sans jeton,
 *  mais on l'envoie quand l'agence est connectée. */
function authHeaders() {
  const token = getAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

/**
 * Commandes d'une agence.
 * GET /orders/agency/:agencyId[?status=active]
 * → { total, data: [...] }
 */
export async function getAgencyOrders(agencyId, { status } = {}) {
  if (!agencyId) {
    throw new Error("Identifiant d'agence manquant")
  }

  const params = new URLSearchParams()

  if (status && status !== "all") {
    params.set("status", status)
  }

  const query = params.toString()

  const response = await fetch(
    `${API_URL}/orders/agency/${encodeURIComponent(agencyId)}${
      query ? `?${query}` : ""
    }`,
    { headers: authHeaders() }
  )

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(data.message || "Impossible de récupérer les commandes")
  }

  const orders = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : []

  return {
    total: Number(data?.total ?? orders.length),
    data: orders,
  }
}

/**
 * Synthèse des commandes d'une agence.
 * GET /orders/agency/:agencyId/summary
 * → { commandes, esimActives, enCours, montantTotal, currency }
 */
export async function getAgencyOrdersSummary(agencyId) {
  if (!agencyId) {
    throw new Error("Identifiant d'agence manquant")
  }

  const response = await fetch(
    `${API_URL}/orders/agency/${encodeURIComponent(agencyId)}/summary`,
    { headers: authHeaders() }
  )

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(
      data.message || "Impossible de récupérer la synthèse des commandes"
    )
  }

  return data
}

/**
 * Détail complet d'une commande (inclut les données eSIM : ICCID,
 * SM-DP+, code d'activation, QR code, lien universel).
 * GET /orders/agency/:agencyId/:orderId
 */
export async function getAgencyOrder(agencyId, orderId) {
  if (!agencyId || !orderId) {
    throw new Error("Identifiant de commande manquant")
  }

  const response = await fetch(
    `${API_URL}/orders/agency/${encodeURIComponent(agencyId)}/${encodeURIComponent(orderId)}`,
    { headers: authHeaders() }
  )

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(data.message || "Impossible de récupérer le détail de la commande")
  }

  return data
}

const TOKEN_KEY = "konnectifly_token"
const PROFILE_KEY = "konnectifly_profile"

export function saveAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Caches the agency profile (company_name, email, balance, etc.) so the
 * UI can render it instantly on load instead of flashing "Invité" while
 * the /auth/profile request is in flight.
 */
export function saveCachedProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // ignore storage errors
  }
}

export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCachedProfile() {
  localStorage.removeItem(PROFILE_KEY)
}

/**
 * Decodes the payload of the backend's JWT (id, email, type, iat, exp)
 * without any extra dependency — good enough for reading claims client-side.
 */
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
  } catch {
    return null
  }
}