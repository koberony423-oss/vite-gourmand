// Détail d'un menu : informations, composition par type de plat avec allergènes, galerie, bouton commander.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obtenirMenu } from '../api/menus.js'
import { useAuth } from '../context/useAuth.js'
import Alert from '../components/Alert.jsx'
import { API_URL } from '../api/client.js'
import { euros, prixParPersonne } from '../utils/prix.js'
import { LIBELLES_TYPE_PLAT } from '../utils/format.js'

const ORDRE_TYPES = ['entree', 'plat', 'dessert']

function urlImage(chemin) {
  if (!chemin) return ''
  if (/^https?:\/\//.test(chemin)) return chemin
  // Les images relatives sont servies par le backend (hors préfixe /api).
  return `${API_URL.replace(/\/api\/?$/, '')}${chemin}`
}

export default function MenuDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menu, setMenu] = useState(null)
  const [erreur, setErreur] = useState('')
  const [imagesKo, setImagesKo] = useState({})

  useEffect(() => {
    obtenirMenu(id)
      .then(setMenu)
      .catch((e) =>
        setErreur(e.status === 404 || e.status === 500 ? 'Menu introuvable.' : e.message),
      )
  }, [id])

  function commander() {
    if (!user) {
      navigate('/connexion', { state: { from: `/commander/${id}` } })
      return
    }
    navigate(`/commander/${id}`)
  }

  if (erreur) {
    return (
      <section className="home-section" aria-labelledby="menu-detail-title">
        <p className="eyebrow">Détail du menu</p>
        <h1 id="menu-detail-title" className="page-title">Menu indisponible</h1>
        <Alert type="error">{erreur}</Alert>
        <Link to="/menus" className="tip-button">Retour aux menus</Link>
      </section>
    )
  }

  if (!menu) {
    return (
      <section className="home-section">
        <p aria-live="polite">Chargement du menu…</p>
      </section>
    )
  }

  const rupture = Number(menu.stock_disponible) <= 0
  const plats = menu.plats ?? []
  const types = [
    ...ORDRE_TYPES.filter((t) => plats.some((p) => p.type === t)),
    ...[...new Set(plats.map((p) => p.type))].filter((t) => !ORDRE_TYPES.includes(t)),
  ]
  const images = (menu.galerie_images ?? []).filter((img) => !imagesKo[img])

  return (
    <section className="home-section" aria-labelledby="menu-detail-title">
      <p className="eyebrow">Détail du menu</p>

      <h1 id="menu-detail-title" className="page-title">{menu.titre}</h1>

      <p>{menu.description}</p>

      <div className="galerie" aria-label="Galerie du menu">
        {images.length > 0 ? (
          images.map((img) => (
            <img
              key={img}
              src={urlImage(img)}
              alt={`Photo du menu ${menu.titre}`}
              loading="lazy"
              onError={() => setImagesKo((prev) => ({ ...prev, [img]: true }))}
            />
          ))
        ) : (
          <div className="galerie-vide" role="img" aria-label="Illustration du menu indisponible">
            <span aria-hidden="true">Vite & Gourmand</span>
          </div>
        )}
      </div>

      <div className="infos-menu">
        <p className="recipe-category">Thème : {menu.theme_nom ?? '—'}</p>
        <p className="recipe-category">Régime : {menu.regime_nom ?? '—'}</p>
        {rupture && <p className="badge-rupture">Rupture de stock</p>}
      </div>

      <p className="recipe-time">Prix : {euros(prixParPersonne(menu))} par personne</p>

      <p className="recipe-time">
        Minimum de commande : {euros(menu.prix_pour_min)} pour {menu.nb_personnes_min} personnes
      </p>

      <p className="recipe-time">Délai de commande : {menu.delai_commande_jours} jours</p>

      <p className="recipe-time">Stock disponible : {menu.stock_disponible}</p>

      <h2>Précautions de conservation</h2>
      <p>{menu.precautions_stockage || 'Aucune précaution particulière.'}</p>

      <h2>Composition du menu</h2>

      {plats.length === 0 && <p>La composition de ce menu sera précisée prochainement.</p>}

      {types.map((type) => (
        <div key={type} className="composition">
          <h3>{LIBELLES_TYPE_PLAT[type] ?? type}</h3>
          <ul>
            {plats
              .filter((p) => p.type === type)
              .map((p) => (
                <li key={p.id}>
                  <strong>{p.nom}</strong>
                  {p.description ? ` — ${p.description}` : ''}
                  <br />
                  <span className="allergenes">
                    Allergènes :{' '}
                    {p.allergenes?.length ? p.allergenes.join(', ') : 'aucun allergène déclaré'}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}

      <div className="actions">
        <button
          type="button"
          className="tip-button"
          onClick={commander}
          disabled={rupture}
          aria-disabled={rupture}
        >
          {rupture ? 'Menu en rupture de stock' : 'Commander ce menu'}
        </button>

        <Link to="/menus" className="tip-button tip-button-secondaire">
          Retour aux menus
        </Link>
      </div>
    </section>
  )
}
