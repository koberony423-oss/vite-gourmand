// Appels API pour les plats (CRUD administrateur).
import { api } from './client.js'

export const listerPlats = () => api.get('/plats')
export const creerPlat = (donnees) => api.post('/plats', donnees)
export const modifierPlat = (id, donnees) => api.patch(`/plats/${id}`, donnees)
export const supprimerPlat = (id) => api.delete(`/plats/${id}`)
