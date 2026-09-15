// Page d'accueil : présentation de l'entreprise, engagement et avis clients validés (GET /avis).
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { avisPublics } from '../api/avis.js'

export default function Accueil() {
  const [avis, setAvis] = useState([])
  const [etat, setEtat] = useState('chargement')

  useEffect(() => {
    avisPublics()
      .then((data) => {
        setAvis(Array.isArray(data) ? data : [])
        setEtat('ok')
      })
      .catch(() => setEtat('erreur'))
  }, [])

  return (
    <>
      <section className="home-section" aria-labelledby="about-title">
        <p className="eyebrow">Notre entreprise</p>

        <h2 id="about-title">Une cuisine généreuse, locale et sur mesure</h2>

        <p>
          Vite & Gourmand est une entreprise familiale fondée par Julie et José. Leur
          objectif est de proposer des menus accessibles, gourmands et adaptés à chaque
          événement.
        </p>
      </section>

      <section className="home-section" aria-labelledby="quality-title">
        <p className="eyebrow">Notre engagement</p>

        <h2 id="quality-title">Le professionnalisme au service de vos repas</h2>

        <p>
          Nous préparons chaque commande avec soin, dans le respect des régimes
          alimentaires, des allergènes et des conditions de conservation.
        </p>
      </section>

      <section className="reviews" aria-labelledby="reviews-title">
        <p className="eyebrow">Avis validés</p>

        <h2 id="reviews-title">Ce que nos clients disent de nous</h2>

        {etat === 'chargement' && <p aria-live="polite">Chargement des avis…</p>}
        {etat === 'erreur' && <p aria-live="polite">Les avis sont indisponibles pour le moment.</p>}
        {etat === 'ok' && avis.length === 0 && <p>Aucun avis pour le moment.</p>}

        {avis.length > 0 && (
          <div className="reviews-grid">
            {avis.map((a) => (
              <article className="review-card" key={a.id}>
                <p className="review-note" aria-label={`Note : ${a.note} sur 5`}>
                  {'★'.repeat(a.note)}
                  <span aria-hidden="true">{'☆'.repeat(5 - a.note)}</span>
                </p>
                <p>“{a.commentaire}”</p>
                <h3>
                  {a.prenom ?? 'Client'}
                  {a.nom ? ` ${a.nom.charAt(0)}.` : ''}
                </h3>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link to="/menus" className="tip-button">
        Découvrir nos menus
      </Link>
    </>
  )
}
