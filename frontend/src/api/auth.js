// Appels API liés à l'authentification (inscription, connexion, profil, mot de passe oublié).
import { api } from './client.js'

export const inscription = (donnees) => api.post('/auth/inscription', donnees)
export const connexion = (email, motDePasse) =>
  api.post('/auth/connexion', { email, motDePasse })
export const moi = () => api.get('/auth/moi')
export const motDePasseOublie = (email) =>
  api.post('/auth/mot-de-passe-oublie', { email })
export const reinitialiser = (token, motDePasse) =>
  api.post('/auth/reinitialiser', { token, motDePasse })
