// Espace employé : suivi des commandes (statuts, annulation) et messages de contact à traiter.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { annulerCommande, changerStatut, toutesLesCommandes } from '../api/commandes.js'
import { listerContacts, marquerTraite } from '../api/contact.js'
import Alert from '../components/Alert.jsx'
import Onglets from '../components/Onglets.jsx'
import StatutBadge from '../components/StatutBadge.jsx'
import { euros } from '../utils/prix.js'
import { LIBELLES_STATUT, STATUTS, formaterDate, formaterDateHeure, formaterHeure } from '../utils/format.js'

const ONGLETS = [
  { id: 'commandes', label: 'Commandes' },
  { id: 'contacts', label: 'Messages de contact' },
]

function LigneCommande({ commande, onMaj, onMessage }) {
  const [statut, setStatut] = useState(commande.statut)
  const [annulation, setAnnulation] = useState(false)
  const [motif, setMotif] = useState('')
  const [moyen, setMoyen] = useState('email')
  const [erreur, setErreur] = useState('')

  async function appliquerStatut() {
    setErreur('')
    try {
      const maj = await changerStatut(commande.id, statut)
      onMaj({ ...commande, ...maj, statut })
      onMessage(`Commande ${String(commande.id).slice(0, 8)} passée à « ${LIBELLES_STATUT[statut]} ».`)
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function annuler(e) {
    e.preventDefault()
    setErreur('')
    try {
      const maj = await annulerCommande(commande.id, motif.trim(), moyen)
      onMaj({ ...commande, ...maj, statut: 'annulee' })
      setStatut('annulee')
      setAnnulation(false)
      onMessage(`Commande ${String(commande.id).slice(0, 8)} annulée. Pensez à prévenir le client par ${moyen}.`)
    } catch (err) {
      setErreur(err.message)
    }
  }

  const terminee = commande.statut === 'annulee' || commande.statut === 'terminee'

  return (
    <>
      <tr>
        <td>{String(commande.id).slice(0, 8)}</td>
        <td>
          {commande.prenom} {commande.nom}
          <br />
          <span className="aide">{commande.email}</span>
        </td>
        <td>{commande.menu_titre}</td>
        <td>
          {formaterDate(commande.date_prestation)}
          <br />
          {formaterHeure(commande.heure_souhaitee)}
        </td>
        <td>{commande.nb_personnes}</td>
        <td>{euros(commande.prix_total)}</td>
        <td>
          <StatutBadge statut={commande.statut} />
        </td>
        <td>
          {!terminee && (
            <div className="actions-cellule">
              <label htmlFor={`statut-${commande.id}`} className="visually-hidden">
                Nouveau statut de la commande {String(commande.id).slice(0, 8)}
              </label>
              <select id={`statut-${commande.id}`} value={statut} onChange={(e) => setStatut(e.target.value)}>
                {STATUTS.filter((s) => s !== 'annulee').map((s) => (
                  <option key={s} value={s}>
                    {LIBELLES_STATUT[s]}
                  </option>
                ))}
              </select>
              <button type="button" className="filter-button" onClick={appliquerStatut} disabled={statut === commande.statut}>
                Appliquer
              </button>
              <button type="button" className="filter-button danger" aria-expanded={annulation} onClick={() => setAnnulation((v) => !v)}>
                Annuler
              </button>
            </div>
          )}
          {terminee && <span className="aide">—</span>}
        </td>
      </tr>
      {(annulation || erreur) && (
        <tr>
          <td colSpan={8}>
            <Alert type="error">{erreur}</Alert>
            {annulation && (
              <form className="form-annulation" onSubmit={annuler} noValidate>
                <div className="champ">
                  <label htmlFor={`motif-${commande.id}`}>Motif de l’annulation</label>
                  <input id={`motif-${commande.id}`} type="text" required value={motif} onChange={(e) => setMotif(e.target.value)} />
                </div>
                <div className="champ">
                  <label htmlFor={`moyen-${commande.id}`}>Moyen de contact du client</label>
                  <select id={`moyen-${commande.id}`} value={moyen} onChange={(e) => setMoyen(e.target.value)}>
                    <option value="email">E-mail</option>
                    <option value="telephone">Téléphone</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <button type="submit" className="tip-button" disabled={!motif.trim()}>
                  Confirmer l’annulation
                </button>
              </form>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export function OngletCommandes() {
  const [commandes, setCommandes] = useState([])
  const [filtre, setFiltre] = useState('')
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    toutesLesCommandes()
      .then(setCommandes)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const visibles = filtre ? commandes.filter((c) => c.statut === filtre) : commandes

  return (
    <>
      <div className="champ champ-inline">
        <label htmlFor="filtre-statut">Filtrer par statut</label>
        <select id="filtre-statut" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {LIBELLES_STATUT[s]}
            </option>
          ))}
        </select>
      </div>

      <Alert type="success">{message}</Alert>
      <Alert type="error">{erreur}</Alert>
      {chargement && <p aria-live="polite">Chargement des commandes…</p>}

      <div className="tableau-scroll">
        <table>
          <caption className="visually-hidden">Liste des commandes</caption>
          <thead>
            <tr>
              <th scope="col">N°</th>
              <th scope="col">Client</th>
              <th scope="col">Menu</th>
              <th scope="col">Prestation</th>
              <th scope="col">Convives</th>
              <th scope="col">Total</th>
              <th scope="col">Statut</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c) => (
              <LigneCommande
                key={c.id}
                commande={c}
                onMessage={setMessage}
                onMaj={(maj) => setCommandes((liste) => liste.map((x) => (x.id === maj.id ? maj : x)))}
              />
            ))}
            {!chargement && visibles.length === 0 && (
              <tr>
                <td colSpan={8}>Aucune commande pour ce filtre.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function OngletContacts() {
  const [messages, setMessages] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    listerContacts()
      .then(setMessages)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const idDe = (m) => m._id ?? m.id

  async function basculer(m) {
    setErreur('')
    try {
      await marquerTraite(idDe(m), !m.traite)
      setMessages((liste) => liste.map((x) => (idDe(x) === idDe(m) ? { ...x, traite: !m.traite } : x)))
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <>
      <Alert type="error">{erreur}</Alert>
      {chargement && <p aria-live="polite">Chargement des messages…</p>}
      {!chargement && messages.length === 0 && <p>Aucun message de contact.</p>}

      <div className="commandes-liste">
        {messages.map((m) => (
          <article key={idDe(m)} className={`commande-card ${m.traite ? 'traite' : ''}`}>
            <div className="commande-entete">
              <h3>{m.sujet}</h3>
              <span className={`statut-badge ${m.traite ? 'statut-terminee' : 'statut-en_attente'}`}>
                {m.traite ? 'Traité' : 'À traiter'}
              </span>
            </div>
            <p>
              <strong>{m.nom}</strong> · <a href={`mailto:${m.email}`}>{m.email}</a>
              {m.telephone ? ` · ${m.telephone}` : ''}
            </p>
            <p className="message-contact">{m.message}</p>
            <p className="aide">Reçu le {formaterDateHeure(m.createdAt ?? m.created_at)}</p>
            <button type="button" className="filter-button" onClick={() => basculer(m)}>
              {m.traite ? 'Marquer comme non traité' : 'Marquer traité'}
            </button>
          </article>
        ))}
      </div>
    </>
  )
}

export default function EspaceEmploye() {
  const { user } = useAuth()
  const [onglet, setOnglet] = useState('commandes')

  return (
    <>
      <section className="home-section" aria-labelledby="employe-title">
        <p className="eyebrow">Espace employé</p>
        <h1 id="employe-title" className="page-title">Bonjour {user.prenom}</h1>
        <p>Suivez les commandes, mettez à jour leur statut et répondez aux messages des clients.</p>
        {user.role === 'administrateur' && (
          <p>
            <Link to="/espace-admin">Accéder à l’espace administrateur</Link>
          </p>
        )}
      </section>

      <section className="home-section" aria-labelledby="employe-onglets-title">
        <h2 id="employe-onglets-title" className="visually-hidden">Gestion</h2>
        <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />
        <div role="tabpanel" className="panneau">
          {onglet === 'commandes' && <OngletCommandes />}
          {onglet === 'contacts' && <OngletContacts />}
        </div>
      </section>
    </>
  )
}
