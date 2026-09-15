// Appels API pour les avis clients (publics, dépôt, validation admin).
import { api } from './client.js'

export const avisPublics = () => api.get('/avis')
export const deposerAvis = (commandeId, note, commentaire) =>
  api.post('/avis', { commandeId, note, commentaire })
export const avisAdmin = () => api.get('/avis/admin')
export const validerAvis = (id, valide) =>
  api.patch(`/avis/${id}/valider`, { valide })
