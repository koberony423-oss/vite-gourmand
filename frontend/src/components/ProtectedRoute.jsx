// Protège une route : exige une connexion et, si `roles` est fourni, un rôle autorisé.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function ProtectedRoute({ roles = [], children }) {
  const { user, chargement } = useAuth()
  const location = useLocation()

  if (chargement) {
    return (
      <section className="home-section">
        <p aria-live="polite">Chargement de votre session…</p>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <section className="home-section" aria-labelledby="acces-refuse-title">
        <p className="eyebrow">Accès refusé</p>
        <h1 id="acces-refuse-title" className="page-title">
          Vous n’avez pas accès à cette page
        </h1>
        <p>Cette section est réservée à un autre rôle. Retournez à votre espace.</p>
      </section>
    )
  }

  return children
}
