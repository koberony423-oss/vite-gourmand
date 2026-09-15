// En-tête du site : navigation principale (liens React Router) et bandeau d'accueil.
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function lienEspace(role) {
  if (role === 'administrateur') return { to: '/espace-admin', label: 'Espace admin' }
  if (role === 'employe') return { to: '/espace-employe', label: 'Espace employé' }
  return { to: '/mon-espace', label: 'Mon espace' }
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const surAccueil = pathname === '/'

  function seDeconnecter() {
    logout()
    navigate('/')
  }

  const espace = user ? lienEspace(user.role) : null

  return (
    <header className="header">
      <nav className="navigation" aria-label="Navigation principale">
        <NavLink to="/" end>
          Accueil
        </NavLink>
        <NavLink to="/menus">Nos menus</NavLink>
        <NavLink to="/contact">Contact</NavLink>

        {!user && <NavLink to="/connexion">Connexion</NavLink>}

        {user && (
          <>
            <NavLink to={espace.to}>{espace.label}</NavLink>
            {user.role === 'administrateur' && (
              <NavLink to="/espace-employe">Espace employé</NavLink>
            )}
            {user.role !== 'utilisateur' && <NavLink to="/mon-espace">Mon espace</NavLink>}
            <span className="nav-bonjour">Bonjour {user.prenom}</span>
            <button type="button" className="nav-deconnexion" onClick={seDeconnecter}>
              Déconnexion
            </button>
          </>
        )}
      </nav>

      <p className="eyebrow">Vite & Gourmand</p>

      {surAccueil ? (
        <>
          <h1>Des menus traiteur pour vos événements.</h1>

          <p className="intro">
            Julie et José vous accompagnent depuis 25 ans à Bordeaux pour vos repas de
            famille, événements et moments de fête.
          </p>
        </>
      ) : (
        <p className="intro header-compact">
          Traiteur familial à Bordeaux — repas de famille, événements et moments de fête.
        </p>
      )}
    </header>
  )
}
