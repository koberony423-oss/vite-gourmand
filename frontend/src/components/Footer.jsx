// Pied de page : horaires d'ouverture (GET /horaires) et liens vers les pages légales.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listerHoraires } from '../api/referentiels.js'
import { JOURS, formaterHeure } from '../utils/format.js'

export default function Footer() {
  const [horaires, setHoraires] = useState([])
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    listerHoraires()
      .then((data) => setHoraires([...data].sort((a, b) => a.jour_semaine - b.jour_semaine)))
      .catch(() => setErreur('Horaires indisponibles pour le moment.'))
  }, [])

  return (
    <footer className="footer">
      <div>
        <p className="eyebrow">Horaires</p>

        <h2>Quand nous joindre</h2>

        {erreur && <p>{erreur}</p>}

        {horaires.map((h) => (
          <p key={h.id ?? h.jour_semaine}>
            {JOURS[h.jour_semaine] ?? `Jour ${h.jour_semaine}`} :{' '}
            {h.ferme
              ? 'fermé'
              : `${formaterHeure(h.heure_ouverture)} - ${formaterHeure(h.heure_fermeture)}`}
          </p>
        ))}
      </div>

      <div>
        <p className="eyebrow">Informations</p>

        <h2>Documents légaux</h2>

        <Link to="/mentions-legales">Mentions légales</Link>

        <Link to="/cgv">Conditions générales de vente</Link>

        <p className="footer-copyright">
          © {new Date().getFullYear()} Vite & Gourmand — Bordeaux
        </p>
      </div>
    </footer>
  )
}
