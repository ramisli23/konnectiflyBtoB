// =====================================================
// FORMATAGE DES DONNÉES API
// =====================================================

/**
 * Volume de données d'un forfait.
 *
 * L'API renvoie `data_quantity: -1` (et `is_unlimited: true`)
 * pour les forfaits illimités : on n'affiche jamais de valeur
 * négative, mais « Unlimited ».
 */
export function formatDataAllowance(plan) {
  const quantity = Number(plan?.data_quantity)

  const unlimited =
    plan?.is_unlimited === true ||
    plan?.is_unlimited === "true" ||
    quantity < 0

  if (unlimited) {
    return "Unlimited"
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "—"
  }

  return `${quantity} ${plan?.data_unit || ""}`.trim()
}

/**
 * Validité d'un forfait : « 3 Day » → « 3 jours ».
 * Retourne « — » si la valeur est absente.
 */
export function formatValidity(plan) {
  const value = Number(plan?.package_validity)

  if (!value || Number.isNaN(value)) {
    return "—"
  }

  const unit = String(plan?.package_validity_unit || "").toLowerCase()

  if (unit.startsWith("day")) {
    return `${value} jour${value > 1 ? "s" : ""}`
  }

  if (unit.startsWith("month")) {
    return `${value} mois`
  }

  if (unit.startsWith("year")) {
    return `${value} an${value > 1 ? "s" : ""}`
  }

  if (unit.startsWith("hour")) {
    return `${value} heure${value > 1 ? "s" : ""}`
  }

  return `${value} ${plan?.package_validity_unit || ""}`.trim()
}
