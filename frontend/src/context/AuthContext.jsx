// Fournisseur d'authentification : utilisateur courant, jeton JWT, connexion, inscription, déconnexion.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TOKEN_KEY, getToken } from '../api/client.js'
import * as authApi from '../api/auth.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(null)
  // Tant qu'un jeton existe sans profil chargé, la session est « en cours de vérification ».
  const [verifie, setVerifie] = useState(() => !getToken())

  // Au chargement, si un jeton existe on récupère le profil (GET /auth/moi).
  useEffect(() => {
    if (!token) return undefined
    let actif = true
    authApi
      .moi()
      .then((u) => {
        if (actif) setUser(u)
      })
      .catch(() => {
        if (actif) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (actif) setVerifie(true)
      })
    return () => {
      actif = false
    }
  }, [token])

  const appliquerSession = useCallback((reponse) => {
    localStorage.setItem(TOKEN_KEY, reponse.accessToken)
    setUser(reponse.user)
    setVerifie(true)
    setToken(reponse.accessToken)
    return reponse.user
  }, [])

  const login = useCallback(
    async (email, motDePasse) => appliquerSession(await authApi.connexion(email, motDePasse)),
    [appliquerSession],
  )

  const register = useCallback(
    async (donnees) => appliquerSession(await authApi.inscription(donnees)),
    [appliquerSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setVerifie(true)
  }, [])

  const majUser = useCallback((u) => setUser((prev) => ({ ...prev, ...u })), [])

  const value = useMemo(
    () => ({
      user,
      token,
      chargement: !verifie,
      estConnecte: Boolean(user),
      login,
      register,
      logout,
      majUser,
    }),
    [user, token, verifie, login, register, logout, majUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
