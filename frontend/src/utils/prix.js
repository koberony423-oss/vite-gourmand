// Règles de calcul du prix d'une commande, identiques à celles du backend (aperçu en direct).

/** Prix unitaire par personne à partir du prix « pour le minimum ». */
export function prixParPersonne(menu) {
  const prix = Number(menu.prix_pour_min)
  const min = Number(menu.nb_personnes_min) || 1
  return prix / min
}

/** Frais de livraison selon la distance : 0 € ≤ 10 km, 15 € ≤ 30 km, 30 € au-delà. */
export function prixLivraison(distanceKm) {
  const d = Number(distanceKm) || 0
  if (d <= 10) return 0
  if (d <= 30) return 15
  return 30
}

/**
 * Calcule le détail du prix : menu brut, remise (5 % si nb ≥ 2 × minimum), livraison, total.
 */
export function calculerPrix(menu, nbPersonnes, distanceKm = 0) {
  const nb = Math.max(0, Number(nbPersonnes) || 0)
  const min = Number(menu.nb_personnes_min) || 1
  const unitaire = prixParPersonne(menu)
  const menuBrut = unitaire * nb
  const tauxRemise = nb >= 2 * min && nb > 0 ? 5 : 0
  const remise = (menuBrut * tauxRemise) / 100
  const menuRemise = menuBrut - remise
  const livraison = prixLivraison(distanceKm)
  return {
    unitaire,
    menuBrut,
    tauxRemise,
    remise,
    menuRemise,
    livraison,
    total: menuRemise + livraison,
  }
}

/** Formate un nombre en euros (fr-FR). */
export function euros(valeur) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(valeur) || 0)
}
