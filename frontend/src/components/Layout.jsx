// Gabarit commun à toutes les pages : lien d'évitement, en-tête, contenu principal, pied de page.
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const { pathname } = useLocation()

  // Remonter en haut de page à chaque changement de route.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="app">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
