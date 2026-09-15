// Espace personnel : modification du profil, liste de mes commandes (historique repliable) et dépôt d'avis.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { mesCommandes, obtenirCommande } from '../api/commandes.js'
import { modifierMonProfil } from '../api/utilisateurs.js'
import { deposerAvis } from '../api/avis.js'
import Alert from '../components/Alert.jsx'
import StatutBadge from '../components/StatutBadge.jsx'
import { euros } from '../utils/prix.js'
import { LIBELLES_STATUT, formaterDate, formaterDateHeure, formaterHeure } from '../utils/format.js'

function FormulaireProfil() {
  const { user, majUser } = useAuth()
  const [form, setForm] = useState({
    prenom: user.prenom ?? '',
    nom: user.nom ?? '',
    numeroGsm: user.numeroGsm ?? user.numero_gsm ?? '',
  })
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))

  async function soumettre(e) {
    e.preventDefault()
    setMessage('')
    setErreur('')
    try {
      const u = await modifierMonProfil({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        numeroGsm: form.numeroGsm.trim(),
      })
      majUser({
        nom: u?.nom ?? form.nom,
        prenom: u?.prenom ?? form.prenom,
        numeroGsm: u?.numeroGsm ?? u?.numero_gsm ?? form.numeroGsm,
      })
      setMessage('Profil mis à jour.')
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <form onSubmit={soumettre} noValidate>
      <div className="grille-2">
        <div className="champ">
          <label htmlFor="pr-prenom">Prénom</label>
          <input id="pr-prenom" type="text" autoComplete="given-name" required value={form.prenom} onChange={maj('prenom')} />
        </div>
        <div className="champ">
          <label htmlFor="pr-nom">Nom</label>
          <input id="pr-nom" type="text" autoComplete="family-name" required value={form.nom} onChange={maj('nom')} />
        </div>
      </div>
      <div className="grille-2">
        <div className="champ">
          <label htmlFor="pr-email">Adresse e-mail (non modifiable)</label>
          <input id="pr-email" type="email" value={user.email} readOnly />
        </div>
        <div className="champ">
          <label htmlFor="pr-gsm">Téléphone portable</label>
          <input id="pr-gsm" type="tel" autoComplete="tel" value={form.numeroGsm} onChange={maj('numeroGsm')} />
        </div>
      </div>
      <Alert type="success">{message}</Alert>
      <Alert type="error">{erreur}</Alert>
      <button type="submit" className="tip-button">Enregistrer le profil</button>
    </form>
  )
}

function FormulaireAvis({ commande, onEnvoye }) {
  const [note, setNote] = useState('5')
  const [commentaire, setCommentaire] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      await deposerAvis(commande.id, Number(note), commentaire.trim())
      onEnvoye()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={soumettre} className="form-avis" noValidate>
      <fieldset>
        <legend>Votre note</legend>
        <div className="notes">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="note-option">
              <input
                type="radio"
                name={`note-${commande.id}`}
                value={n}
                checked={note === String(n)}
                onChange={() => setNote(String(n))}
              />
              {n} ★
            </label>
          ))}
        </div>
      </fieldset>
      <div className="champ">
        <label htmlFor={`avis-${commande.id}`}>Votre commentaire</label>
        <textarea id={`avis-${commande.id}`} rows={3} required value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
      </div>
      <Alert type="error">{erreur}</Alert>
      <button type="submit" className="tip-button" disabled={envoi}>
        {envoi ? 'Envoi…' : 'Envoyer mon avis'}
      </button>
    </form>
  )
}

function CarteCommande({ commande }) {
  const [historique, setHistorique] = useState(null)
  const [ouvert, setOuvert] = useState(false)
  const [avisOuvert, setAvisOuvert] = useState(false)
  const [avisMessage, setAvisMessage] = useState('')
  const [erreur, setErreur] = useState('')

  async function basculerHistorique() {
    const suivant = !ouvert
    setOuvert(suivant)
    if (suivant && historique === null) {
      try {
        const detail = await obtenirCommande(commande.id)
        setHistorique(detail.historique ?? [])
      } catch (err) {
        setErreur(err.message)
      }
    }
  }

  return (
    <article className="commande-card">
      <div className="commande-entete">
        <h3>{commande.menu_titre ?? 'Menu'}</h3>
        <StatutBadge statut={commande.statut} />
      </div>
      <p>
        Prestation le {formaterDate(commande.date_prestation)} à {formaterHeure(commande.heure_souhaitee)} ·{' '}
        {commande.nb_personnes} convives
      </p>
      <p>
        Menu {euros(commande.prix_menu)}
        {Number(commande.taux_remise) > 0 ? ` (remise ${Math.round(Number(commande.taux_remise) * 100)} %)` : ''} · livraison{' '}
        {euros(commande.prix_livraison)} · <strong>total {euros(commande.prix_total)}</strong>
      </p>
      <p className="aide">Commandée le {formaterDateHeure(commande.created_at)} · n° {String(commande.id).slice(0, 8)}</p>

      <div className="actions">
        <button
          type="button"
          className="filter-button"
          aria-expanded={ouvert}
          aria-controls={`hist-${commande.id}`}
          onClick={basculerHistorique}
        >
          {ouvert ? 'Masquer l’historique' : 'Voir l’historique'}
        </button>

        {commande.statut === 'terminee' && !avisMessage && (
          <button
            type="button"
            className="filter-button"
            aria-expanded={avisOuvert}
            onClick={() => setAvisOuvert((v) => !v)}
          >
            Laisser un avis
          </button>
        )}
      </div>

      {ouvert && (
        <div id={`hist-${commande.id}`} className="historique">
          {erreur && <Alert type="error">{erreur}</Alert>}
          {historique === null && !erreur && <p aria-live="polite">Chargement…</p>}
          {historique && historique.length === 0 && <p>Aucun historique.</p>}
          {historique && historique.length > 0 && (
            <ol>
              {historique.map((h) => (
                <li key={h.id}>
                  <strong>{LIBELLES_STATUT[h.statut] ?? h.statut}</strong> — {formaterDateHeure(h.date_changement)}
                  {h.commentaire ? ` · ${h.commentaire}` : ''}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {avisOuvert && !avisMessage && (
        <FormulaireAvis
          commande={commande}
          onEnvoye={() => {
            setAvisOuvert(false)
            setAvisMessage('Merci ! Votre avis sera publié après validation par notre équipe.')
          }}
        />
      )}
      <Alert type="success">{avisMessage}</Alert>
    </article>
  )
}

export default function MonEspace() {
  const { user } = useAuth()
  const [commandes, setCommandes] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    mesCommandes()
      .then(setCommandes)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  return (
    <>
      <section className="home-section" aria-labelledby="espace-title">
        <p className="eyebrow">Mon espace</p>
        <h1 id="espace-title" className="page-title">Bonjour {user.prenom}</h1>
        <p>Retrouvez ici vos informations personnelles et le suivi de vos commandes.</p>
      </section>

      <section className="home-section" aria-labelledby="profil-title">
        <p className="eyebrow">Profil</p>
        <h2 id="profil-title">Mes informations</h2>
        <FormulaireProfil />
      </section>

      <section className="home-section" aria-labelledby="commandes-title">
        <p className="eyebrow">Commandes</p>
        <h2 id="commandes-title">Mes commandes</h2>

        {chargement && <p aria-live="polite">Chargement de vos commandes…</p>}
        <Alert type="error">{erreur}</Alert>

        {!chargement && !erreur && commandes.length === 0 && (
          <p>
            Vous n’avez pas encore de commande. <Link to="/menus">Découvrir nos menus</Link>
          </p>
        )}

        <div className="commandes-liste">
          {commandes.map((c) => (
            <CarteCommande key={c.id} commande={c} />
          ))}
        </div>
      </section>
    </>
  )
}
