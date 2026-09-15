// Appels API pour les référentiels (thèmes, régimes, allergènes, horaires).
import { api } from './client.js'

export const listerThemes = () => api.get('/themes')
export const listerRegimes = () => api.get('/regimes')
export const listerAllergenes = () => api.get('/allergenes')
export const listerHoraires = () => api.get('/horaires')
