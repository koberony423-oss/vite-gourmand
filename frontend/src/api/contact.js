// Appels API pour les messages de contact.
import { api } from './client.js'

export const envoyerContact = (donnees) => api.post('/contact', donnees)
export const listerContacts = () => api.get('/contact')
export const marquerTraite = (id, traite) =>
  api.patch(`/contact/${id}/traite`, { traite })
