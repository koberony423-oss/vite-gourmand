// Objet de contexte React partagé entre le fournisseur (AuthProvider) et le hook useAuth.
import { createContext } from 'react'

export const AuthContext = createContext(null)
