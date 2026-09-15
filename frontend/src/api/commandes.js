// Appels API pour les commandes (client, employé, administrateur).
import { api } from './client.js'

export const creerCommande = (donnees) => api.post('/commandes', donnees)
export const mesCommandes = () => api.get('/commandes/moi')
export const toutesLesCommandes = () => api.get('/commandes')
export const obtenirCommande = (id) => api.get(`/commandes/${id}`)
export const changerStatut = (id, statut, commentaire) =>
  api.patch(`/commandes/${id}/statut`, { statut, commentaire })
export const annulerCommande = (id, motif, moyenContact) =>
  api.patch(`/commandes/${id}/annuler`, { motif, moyenContact })
