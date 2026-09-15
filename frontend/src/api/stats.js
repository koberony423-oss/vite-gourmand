// Appels API pour les statistiques (employé / administrateur).
import { api } from './client.js'

export const commandesParMenu = () => api.get('/stats/commandes-par-menu')
export const commandesParTheme = () => api.get('/stats/commandes-par-theme')
