// Formulaire de commande d'un menu : convives, date, heure, distance, aperçu du prix en direct.
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenirMenu } from '../api/menus.js'
import { creerCommande } from '../api/commandes.js'
import Alert from '../components/Alert.jsx'
import { calculerPrix, euros } from '../utils/prix.js'
import { formaterDate } from '../utils/format.js'

/**
 * Première date de prestation acceptée, au format YYYY-MM-DD (fuseau local).
 * L'API compare la date (minuit) à l'instant présent : le jour « aujourd'hui + délai »
 * est donc refusé ; on propose « aujourd'hui + délai + 1 » pour éviter un rejet.
 */
function dateMin(delaiJours) {
  const d = new Date()
  d.setDate(d.getDate() + Number(delaiJours || 0) + 1)
  const mois = String(d.getMonth() + 1).padStart(2, '0')
  const jour = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

export default function Commander() {
  const { menuId } = useParams()
  const [menu, setMenu] = useState(null)
  const [erreurChargement, setErreurChargement] = useState('')
  const [nbPersonnes, setNbPersonnes] = useState('')
  const [datePrestation, setDatePrestation] = useState('')
  const [heure, setHeure] = useState('12:00')
  const [distance, setDistance] = useState('0')
  const [erreur, setErreur] = useState('')
  const [commande, setCommande] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    obtenirMenu(menuId)
      .then((m) => {
        setMenu(m)
        setNbPersonnes(String(m.nb_personnes_min))
        setDatePrestation(dateMin(m.delai_commande_jours))
      })
      .catch((e) => setErreurChargement(e.status === 500 ? 'Menu introuvable.' : e.message))
  }, [menuId])

  const detail = useMemo(
    () => (menu ? calculerPrix(menu, nbPersonnes, distance) : null),
    [menu, nbPersonnes, distance],
  )

  if (erreurChargement) {
    return (
      <section className="home-section" aria-labelledby="cmd-title">
        <h1 id="cmd-title" className="page-title">Commander</h1>
        <Alert type="error">{erreurChargement}</Alert>
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

  const minimum = Number(menu.nb_personnes_min)
  const dateMinimale = dateMin(menu.delai_commande_jours)
  const erreurs = []
  if (Number(nbPersonnes) < minimum) erreurs.push(`Le nombre de convives doit être au moins ${minimum}.`)
  if (!datePrestation || datePrestation < dateMinimale) {
    erreurs.push(`La date doit être au plus tôt le ${formaterDate(dateMinimale)} (délai de ${menu.delai_commande_jours} jours).`)
  }
  if (!heure) erreurs.push('Indiquez une heure souhaitée.')

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    if (erreurs.length) {
      setErreur(erreurs.join(' '))
      return
    }
    setEnvoi(true)
    try {
      const resultat = await creerCommande({
        menuId,
        nbPersonnes: Number(nbPersonnes),
        datePrestation,
        heureSouhaitee: heure,
        distanceKm: Number(distance) || 0,
      })
      setCommande(resultat)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  if (commande) {
    return (
      <section className="home-section" aria-labelledby="cmd-title">
        <p className="eyebrow">Commande</p>
        <h1 id="cmd-title" className="page-title">Merci pour votre commande !</h1>
        <Alert type="success">
          Votre commande n° {String(commande.id).slice(0, 8)} pour « {menu.titre} » a bien été
          enregistrée. Montant total : {euros(commande.prix_total)}. Elle est en attente de
          validation par notre équipe.
        </Alert>
        <div className="actions">
          <Link to="/mon-espace" className="tip-button">Voir mes commandes</Link>
          <Link to="/menus" className="tip-button tip-button-secondaire">Retour aux menus</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="home-section" aria-labelledby="cmd-title">
      <p className="eyebrow">Commande</p>

      <h1 id="cmd-title" className="page-title">Commander : {menu.titre}</h1>

      <p>
        Minimum {minimum} personnes · délai de commande {menu.delai_commande_jours} jours · stock
        disponible : {menu.stock_disponible}
      </p>

      <div className="commande-grille">
        <form onSubmit={soumettre} noValidate>
          <div className="champ">
            <label htmlFor="cmd-nb">Nombre de convives</label>
            <input
              id="cmd-nb"
              type="number"
              min={minimum}
              step="1"
              inputMode="numeric"
              required
              aria-describedby="cmd-nb-aide"
              value={nbPersonnes}
              onChange={(e) => setNbPersonnes(e.target.value)}
            />
            <span id="cmd-nb-aide" className="aide">
              Minimum {minimum}. Remise de 5 % à partir de {minimum * 2} convives.
            </span>
          </div>

          <div className="champ">
            <label htmlFor="cmd-date">Date de la prestation</label>
            <input
              id="cmd-date"
              type="date"
              min={dateMinimale}
              required
              aria-describedby="cmd-date-aide"
              value={datePrestation}
              onChange={(e) => setDatePrestation(e.target.value)}
            />
            <span id="cmd-date-aide" className="aide">
              Au plus tôt le {formaterDate(dateMinimale)} (délai de {menu.delai_commande_jours} jours).
            </span>
          </div>

          <div className="champ">
            <label htmlFor="cmd-heure">Heure souhaitée</label>
            <input id="cmd-heure" type="time" required value={heure} onChange={(e) => setHeure(e.target.value)} />
          </div>

          <div className="champ">
            <label htmlFor="cmd-distance">Distance de livraison (km depuis Bordeaux)</label>
            <input
              id="cmd-distance"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              aria-describedby="cmd-distance-aide"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
            <span id="cmd-distance-aide" className="aide">
              Livraison offerte jusqu’à 10 km, 15 € jusqu’à 30 km, 30 € au-delà.
            </span>
          </div>

          <Alert type="error">{erreur}</Alert>

          <button type="submit" className="tip-button" disabled={envoi}>
            {envoi ? 'Envoi de la commande…' : 'Valider la commande'}
          </button>
        </form>

        <aside className="apercu-prix" aria-labelledby="apercu-title" aria-live="polite">
          <h2 id="apercu-title">Aperçu du prix</h2>
          <dl>
            <dt>Prix par personne</dt>
            <dd>{euros(detail.unitaire)}</dd>
            <dt>Menu ({nbPersonnes || 0} convives)</dt>
            <dd>{euros(detail.menuBrut)}</dd>
            <dt>Remise ({detail.tauxRemise} %)</dt>
            <dd>− {euros(detail.remise)}</dd>
            <dt>Livraison</dt>
            <dd>{detail.livraison === 0 ? 'Offerte' : euros(detail.livraison)}</dd>
            <dt className="total">Total</dt>
            <dd className="total">{euros(detail.total)}</dd>
          </dl>
          {erreurs.length > 0 && (
            <ul className="liste-erreurs">
              {erreurs.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}
