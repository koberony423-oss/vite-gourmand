// Hook d'accès au contexte d'authentification.
import { useContext } from 'react'
import { AuthContext } from './auth-context.js'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
