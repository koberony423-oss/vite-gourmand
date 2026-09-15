// Carte d'un menu dans le catalogue (reprend la classe .recipe-card existante).
import { Link } from 'react-router-dom'
import { prixParPersonne, euros } from '../utils/prix.js'

export default function MenuCard({ menu, themes = {}, regimes = {} }) {
  const rupture = Number(menu.stock_disponible) <= 0
  const theme = menu.theme_nom ?? themes[menu.theme_id] ?? 'Thème'
  const regime = menu.regime_nom ?? regimes[menu.regime_id] ?? 'Classique'

  return (
    <article className="recipe-card">
      <p className="recipe-time">{menu.nb_personnes_min} personnes minimum</p>

      <p className="recipe-category">{theme}</p>

      {rupture && <p className="badge-rupture">Rupture de stock</p>}

      <h3>{menu.titre}</h3>

      <p>{menu.description}</p>

      <p className="recipe-category">Régime : {regime}</p>

      <p className="recipe-time">Prix : {euros(prixParPersonne(menu))} par personne</p>

      <p className="recipe-time">
        Minimum de commande : {euros(menu.prix_pour_min)} pour {menu.nb_personnes_min}{' '}
        personnes
      </p>

      <p className="recipe-time">Stock disponible : {menu.stock_disponible}</p>

      <Link
        className="tip-button"
        to={`/menus/${menu.id}`}
        aria-label={`Voir le détail du menu ${menu.titre}`}
      >
        Voir le détail
      </Link>
    </article>
  )
}
