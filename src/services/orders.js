// =====================================================
// COMMANDES
// =====================================================
//
// Les commandes viennent du backend :
//   GET /orders/agency/:agencyId
//   GET /orders/agency/:agencyId/summary
//
// Tant que l'endpoint de création n'existe pas, les commandes
// passées depuis le Checkout sont conservées dans le localStorage
// et fusionnées avec celles du backend (dédoublonnées par référence).

import { formatDataAllowance, formatValidity } from "../utils/format"

const STORAGE_KEY = "konnectifly_orders"

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/* =====================================================
   STATUTS
   ===================================================== */

export const ORDER_STATUS_LABELS = {
  active: "Active",
  processing: "En cours",
  expired: "Expirée",
}

/** displayStatus / status du backend → statut interne. */
const STATUS_MAP = {
  active: "active",
  completed: "active",
  in_progress: "processing",
  payment_pending: "processing",
  pending: "processing",
  expired: "expired",
  failed: "expired",
}

function normalizeStatus(order) {
  return (
    STATUS_MAP[order?.displayStatus] || STATUS_MAP[order?.status] || "processing"
  )
}

/* =====================================================
   LECTURE / ÉCRITURE LOCALE
   ===================================================== */

export function getLocalOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    const parsed = raw ? JSON.parse(raw) : []

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStored(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // stockage indisponible : la commande reste affichée jusqu'au rechargement
  }
}

/* =====================================================
   NORMALISATION
   ===================================================== */

/** Transforme une commande du backend en modèle affichable. */
export function normalizeOrder(order) {
  const esim = order?.esimData?.sim || order?.esimData?.package?.sim || null

  const packageLabel =
    order?.packageLabel ||
    order?.package?.label ||
    [order?.dataLabel, order?.validityLabel].filter(Boolean).join(" · ") ||
    order?.planName ||
    "Forfait eSIM"

  const customer = order?.customer || {}

  return {
    id: order?.id ?? null,
    reference: order?.reference || String(order?.id ?? ""),
    countryName: order?.destination || order?.country || order?.countryName || "—",
    countryScope: order?.countryScope || null,
    countryId: order?.countryId ?? null,
    packageLabel,
    packageId: order?.packageId || order?.package?.packageId || null,
    invoiceId: order?.invoiceId || null,
    priceDZD: Number(order?.price ?? order?.amount ?? order?.priceDZD ?? 0),
    currency: order?.currency || "DZD",
    createdAt: order?.createdAt || new Date().toISOString(),
    status: normalizeStatus(order),
    rawStatus: order?.status || null,
    errorMessage: order?.errorMessage || null,
    iccid: esim?.iccid || order?.iccid || null,
    smdp: esim?.smdp_address || order?.smdp || null,
    activationCode: esim?.matching_id || order?.activationCode || null,
    qrCodeText: esim?.qr_code_text || null,
    universalLink: esim?.universal_link || null,
    remDataQuantity:
      esim?.rem_data_quantity ??
      order?.esimData?.package?.rem_data_quantity ??
      null,
    remDataUnit: esim?.rem_data_unit || null,
    customer: {
      firstName: customer?.firstname || customer?.firstName || "",
      lastName: customer?.lastname || customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      imei: customer?.imei || "",
    },
    source: order?.source || "local",
  }
}

/**
 * Fusionne les commandes du backend et celles créées localement
 * (dédoublonnage par référence, les données du backend gagnent).
 */
export function mergeOrders(apiOrders = [], localOrders = []) {
  const byReference = new Map()

  ;[
    ...localOrders.map((order) => normalizeOrder({ ...order, source: "local" })),
    ...apiOrders.map((order) => normalizeOrder({ ...order, source: "api" })),
  ].forEach((order) => {
    if (!order.reference) return

    byReference.set(order.reference, order)
  })

  return [...byReference.values()].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  )
}

/* =====================================================
   CRÉATION LOCALE (en attendant POST /orders)
   ===================================================== */

export function buildReference() {
  const existing = new Set(getLocalOrders().map((order) => order.reference))

  let reference = ""

  do {
    let suffix = ""

    for (let index = 0; index < 8; index += 1) {
      suffix +=
        REFERENCE_ALPHABET[
          Math.floor(Math.random() * REFERENCE_ALPHABET.length)
        ]
    }

    reference = `KF-${suffix}`
  } while (existing.has(reference))

  return reference
}

/**
 * Enregistre une commande passée depuis le Checkout.
 * Retourne la commande créée (référence incluse).
 */
export function createOrder({ plan, country, countryName, customer }) {
  const reference = buildReference()

  const order = {
    reference,
    planName: plan?.name || "Forfait eSIM",
    packageLabel: `${formatDataAllowance(plan)} · ${formatValidity(plan)}`,
    countryName: country?.name || countryName || "—",
    countryScope: country?.scope || null,
    countryId: country?.id ?? null,
    priceDZD: Number(plan?.priceDZD || 0),
    currency: "DZD",
    customer: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
    },
    createdAt: new Date().toISOString(),
    status: "processing",
    source: "local",
  }

  writeStored([order, ...getLocalOrders()])

  return order
}
