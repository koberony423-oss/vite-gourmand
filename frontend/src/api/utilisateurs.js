// Appels API pour les utilisateurs (profil et administration des comptes).
import { api } from './client.js'

export const listerUtilisateurs = () => api.get('/utilisateurs')
export const modifierMonProfil = (donnees) => api.patch('/utilisateurs/moi', donnees)
export const changerRole = (id, role) => api.patch(`/utilisateurs/${id}/role`, { role })
export const changerStatutUtilisateur = (id, actif) =>
  api.patch(`/utilisateurs/${id}/statut`, { actif })
