/**
 * Règles de tarification "Vite & Gourmand".
 *
 * Justification métier (à défendre devant le jury) :
 * 1. Prix du menu proportionnel au nombre de convives : chaque menu a un
 *    prix de référence pour un nombre minimum de personnes
 *    (`prix_pour_min` pour `nb_personnes_min`). On calcule un prix
 *    unitaire par personne, puis on multiplie par le nombre réel de
 *    convives commandé.
 * 2. Frais de livraison par palier de distance (km) : reflète le coût
 *    réel du transport (carburant, temps) supporté par le traiteur.
 * 3. Remise fidélité/volume : au-delà du double de l'effectif minimum,
 *    une remise de 5% est appliquée (achat en gros volume).
 */

export interface PricingInput {
  prixPourMin: number;
  nbPersonnesMin: number;
  nbPersonnes: number;
  distanceKm: number;
}

export interface PricingResult {
  prixUnitaire: number;
  prixMenu: number;
  prixLivraison: number;
  tauxRemise: number;
  prixTotal: number;
}

export function calculerLivraison(distanceKm: number): number {
  if (distanceKm <= 10) return 0;
  if (distanceKm <= 30) return 15;
  return 30;
}

export function calculerRemise(nbPersonnes: number, nbPersonnesMin: number): number {
  return nbPersonnes >= nbPersonnesMin * 2 ? 0.05 : 0;
}

export function calculerPrix(input: PricingInput): PricingResult {
  const prixUnitaire = input.prixPourMin / input.nbPersonnesMin;
  const prixMenuBrut = prixUnitaire * input.nbPersonnes;
  const tauxRemise = calculerRemise(input.nbPersonnes, input.nbPersonnesMin);
  const prixMenu = Math.round(prixMenuBrut * (1 - tauxRemise) * 100) / 100;
  const prixLivraison = calculerLivraison(input.distanceKm);
  const prixTotal = Math.round((prixMenu + prixLivraison) * 100) / 100;

  return { prixUnitaire, prixMenu, prixLivraison, tauxRemise, prixTotal };
}
