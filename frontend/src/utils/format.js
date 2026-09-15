// Petites fonctions de formatage partagées (dates, heures, libellés).
/** Convertit une valeur en Date ; une date sans heure est lue en heure locale (et non UTC) pour éviter un décalage d'un jour. */
function versDate(valeur) {
  // « 2026-10-02 » ou « 2026-10-02T00:00:00.000Z » (colonne DATE renvoyée par l'API) : jour civil, sans heure.
  if (typeof valeur === 'string' && /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(valeur)) {
    const [a, m, j] = valeur.slice(0, 10).split('-').map(Number)
    return new Date(a, m - 1, j)
  }
  return new Date(valeur)
}

export function formaterDate(valeur) {
  if (!valeur) return '—'
  const d = versDate(valeur)
  if (Number.isNaN(d.getTime())) return String(valeur)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formaterDateHeure(valeur) {
  if (!valeur) return '—'
  const d = new Date(valeur)
  if (Number.isNaN(d.getTime())) return String(valeur)
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** « 09:00:00 » → « 09h00 » */
export function formaterHeure(valeur) {
  if (!valeur) return ''
  const [h, m] = String(valeur).split(':')
  return `${h}h${m ?? '00'}`
}

export const LIBELLES_STATUT = {
  en_attente: 'En attente',
  accepte: 'Acceptée',
  en_preparation: 'En préparation',
  en_cours_de_livraison: 'En cours de livraison',
  livre: 'Livrée',
  en_attente_du_retour_de_materiel: 'En attente du retour de matériel',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

export const STATUTS = Object.keys(LIBELLES_STATUT)

export const LIBELLES_TYPE_PLAT = {
  entree: 'Entrée',
  plat: 'Plat',
  dessert: 'Dessert',
}

export const LIBELLES_ROLE = {
  utilisateur: 'Utilisateur',
  employe: 'Employé',
  administrateur: 'Administrateur',
}

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
