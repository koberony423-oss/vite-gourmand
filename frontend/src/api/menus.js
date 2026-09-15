// Appels API pour les menus (catalogue public + gestion administrateur).
import { api } from './client.js'

export function listerMenus({ themeId, regimeId } = {}) {
  const params = new URLSearchParams()
  if (themeId) params.set('themeId', themeId)
  if (regimeId) params.set('regimeId', regimeId)
  const query = params.toString()
  return api.get(`/menus${query ? `?${query}` : ''}`)
}

export const obtenirMenu = (id) => api.get(`/menus/${id}`)
export const creerMenu = (donnees) => api.post('/menus', donnees)
export const modifierMenu = (id, donnees) => api.patch(`/menus/${id}`, donnees)
export const desactiverMenu = (id) => api.delete(`/menus/${id}`)
