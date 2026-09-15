// Page 404 : route inconnue.
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="home-section" aria-labelledby="nf-title">
      <p className="eyebrow">Erreur 404</p>
      <h1 id="nf-title" className="page-title">Cette page n’existe pas</h1>
      <p>La page demandée est introuvable. Elle a peut-être été déplacée ou supprimée.</p>
      <Link to="/" className="tip-button">Retour à l’accueil</Link>
    </section>
  )
}
