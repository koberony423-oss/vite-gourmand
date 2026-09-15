// Espace administrateur : statistiques, gestion des menus, plats, utilisateurs et validation des avis.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { commandesParMenu, commandesParTheme } from '../api/stats.js'
import { creerMenu, desactiverMenu, listerMenus, modifierMenu, obtenirMenu } from '../api/menus.js'
import { creerPlat, listerPlats, modifierPlat, supprimerPlat } from '../api/plats.js'
import { listerAllergenes, listerRegimes, listerThemes } from '../api/referentiels.js'
import { changerRole, changerStatutUtilisateur, listerUtilisateurs } from '../api/utilisateurs.js'
import { avisAdmin, validerAvis } from '../api/avis.js'
import Alert from '../components/Alert.jsx'
import Onglets from '../components/Onglets.jsx'
import GraphiqueBarres from '../components/GraphiqueBarres.jsx'
import { euros } from '../utils/prix.js'
import { LIBELLES_ROLE, LIBELLES_TYPE_PLAT, formaterDateHeure } from '../utils/format.js'

const ONGLETS = [
  { id: 'stats', label: 'Statistiques' },
  { id: 'menus', label: 'Menus' },
  { id: 'plats', label: 'Plats' },
  { id: 'utilisateurs', label: 'Utilisateurs' },
  { id: 'avis', label: 'Avis à valider' },
]

/* ---------- Statistiques ---------- */
function OngletStats() {
  const [parMenu, setParMenu] = useState([])
  const [parTheme, setParTheme] = useState([])
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([commandesParMenu(), commandesParTheme()])
      .then(([m, t]) => {
        setParMenu(m)
        setParTheme(t)
      })
      .catch((e) => setErreur(e.message))
  }, [])

  const totalCA = parMenu.reduce((s, m) => s + Number(m.chiffreAffaires || 0), 0)
  const totalCmd = parMenu.reduce((s, m) => s + Number(m.nombreCommandes || 0), 0)

  return (
    <>
      <Alert type="error">{erreur}</Alert>
      <div className="chiffres-cles">
        <p className="recipe-time">{totalCmd} commande{totalCmd > 1 ? 's' : ''}</p>
        <p className="recipe-time">Chiffre d’affaires : {euros(totalCA)}</p>
      </div>

      <h3>Commandes par menu</h3>
      <div className="tableau-scroll">
        <table>
          <caption className="visually-hidden">Commandes par menu</caption>
          <thead>
            <tr>
              <th scope="col">Menu</th>
              <th scope="col">Commandes</th>
              <th scope="col">Convives</th>
              <th scope="col">Chiffre d’affaires</th>
            </tr>
          </thead>
          <tbody>
            {parMenu.map((m) => (
              <tr key={m._id}>
                <td>{m.menuTitre}</td>
                <td>{m.nombreCommandes}</td>
                <td>{m.totalConvives}</td>
                <td>{euros(m.chiffreAffaires)}</td>
              </tr>
            ))}
            {parMenu.length === 0 && (
              <tr>
                <td colSpan={4}>Aucune commande enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <GraphiqueBarres
        titre="Nombre de commandes par menu"
        donnees={parMenu.map((m) => ({ label: m.menuTitre, valeur: Number(m.nombreCommandes) }))}
      />

      <h3>Commandes par thème</h3>
      <div className="tableau-scroll">
        <table>
          <caption className="visually-hidden">Commandes par thème</caption>
          <thead>
            <tr>
              <th scope="col">Thème</th>
              <th scope="col">Commandes</th>
              <th scope="col">Chiffre d’affaires</th>
            </tr>
          </thead>
          <tbody>
            {parTheme.map((t) => (
              <tr key={t._id}>
                <td>{t._id}</td>
                <td>{t.nombreCommandes}</td>
                <td>{euros(t.chiffreAffaires)}</td>
              </tr>
            ))}
            {parTheme.length === 0 && (
              <tr>
                <td colSpan={3}>Aucune commande enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <GraphiqueBarres
        titre="Chiffre d’affaires par thème (€)"
        donnees={parTheme.map((t) => ({ label: t._id, valeur: Number(t.chiffreAffaires) }))}
        formatValeur={(v) => `${Math.round(v)} €`}
      />
    </>
  )
}

/* ---------- Menus ---------- */
const MENU_VIDE = {
  titre: '',
  description: '',
  themeId: '',
  regimeId: '',
  nbPersonnesMin: 6,
  prixPourMin: '',
  delaiCommandeJours: 3,
  precautionsStockage: '',
  stockDisponible: 5,
  galerieImages: '',
  platIds: [],
}

function OngletMenus() {
  const [menus, setMenus] = useState([])
  const [plats, setPlats] = useState([])
  const [themes, setThemes] = useState([])
  const [regimes, setRegimes] = useState([])
  const [form, setForm] = useState(MENU_VIDE)
  const [enEdition, setEnEdition] = useState(null)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  async function recharger() {
    setMenus(await listerMenus())
  }

  useEffect(() => {
    Promise.all([listerMenus(), listerPlats(), listerThemes(), listerRegimes()])
      .then(([m, p, t, r]) => {
        setMenus(m)
        setPlats(p)
        setThemes(t)
        setRegimes(r)
      })
      .catch((e) => setErreur(e.message))
  }, [])

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))

  function basculerPlat(id) {
    setForm((f) => ({
      ...f,
      platIds: f.platIds.includes(id) ? f.platIds.filter((x) => x !== id) : [...f.platIds, id],
    }))
  }

  async function editer(menu) {
    setErreur('')
    try {
      const detail = await obtenirMenu(menu.id)
      setEnEdition(menu.id)
      setForm({
        titre: detail.titre ?? '',
        description: detail.description ?? '',
        themeId: detail.theme_id ?? '',
        regimeId: detail.regime_id ?? '',
        nbPersonnesMin: detail.nb_personnes_min ?? 6,
        prixPourMin: detail.prix_pour_min ?? '',
        delaiCommandeJours: detail.delai_commande_jours ?? 3,
        precautionsStockage: detail.precautions_stockage ?? '',
        stockDisponible: detail.stock_disponible ?? 0,
        galerieImages: (detail.galerie_images ?? []).join('\n'),
        platIds: (detail.plats ?? []).map((p) => p.id),
      })
      document.getElementById('menu-form-title')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      setErreur(err.message)
    }
  }

  function annulerEdition() {
    setEnEdition(null)
    setForm(MENU_VIDE)
  }

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setMessage('')
    const corps = {
      titre: form.titre.trim(),
      description: form.description.trim(),
      themeId: form.themeId || undefined,
      regimeId: form.regimeId || undefined,
      nbPersonnesMin: Number(form.nbPersonnesMin),
      prixPourMin: Number(form.prixPourMin),
      delaiCommandeJours: Number(form.delaiCommandeJours),
      precautionsStockage: form.precautionsStockage.trim(),
      stockDisponible: Number(form.stockDisponible),
      galerieImages: form.galerieImages
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      platIds: form.platIds,
    }
    try {
      if (enEdition) {
        await modifierMenu(enEdition, corps)
        setMessage('Menu modifié.')
      } else {
        await creerMenu(corps)
        setMessage('Menu créé.')
      }
      annulerEdition()
      await recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function desactiver(menu) {
    if (!window.confirm(`Désactiver le menu « ${menu.titre} » ? Il ne sera plus visible des clients.`)) return
    setErreur('')
    try {
      await desactiverMenu(menu.id)
      setMessage('Menu désactivé.')
      await recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <>
      <Alert type="success">{message}</Alert>
      <Alert type="error">{erreur}</Alert>

      <h3>Menus actifs</h3>
      <div className="tableau-scroll">
        <table>
          <caption className="visually-hidden">Menus actifs</caption>
          <thead>
            <tr>
              <th scope="col">Titre</th>
              <th scope="col">Minimum</th>
              <th scope="col">Prix (min.)</th>
              <th scope="col">Délai</th>
              <th scope="col">Stock</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((m) => (
              <tr key={m.id}>
                <td>{m.titre}</td>
                <td>{m.nb_personnes_min} pers.</td>
                <td>{euros(m.prix_pour_min)}</td>
                <td>{m.delai_commande_jours} j</td>
                <td>{m.stock_disponible}</td>
                <td>
                  <div className="actions-cellule">
                    <button type="button" className="filter-button" onClick={() => editer(m)}>
                      Modifier
                    </button>
                    <button type="button" className="filter-button danger" onClick={() => desactiver(m)}>
                      Désactiver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {menus.length === 0 && (
              <tr>
                <td colSpan={6}>Aucun menu actif.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 id="menu-form-title">{enEdition ? 'Modifier le menu' : 'Créer un menu'}</h3>
      <form onSubmit={soumettre} noValidate>
        <div className="champ">
          <label htmlFor="m-titre">Titre</label>
          <input id="m-titre" type="text" required value={form.titre} onChange={maj('titre')} />
        </div>
        <div className="champ">
          <label htmlFor="m-desc">Description</label>
          <textarea id="m-desc" rows={3} value={form.description} onChange={maj('description')} />
        </div>
        <div className="grille-2">
          <div className="champ">
            <label htmlFor="m-theme">Thème</label>
            <select id="m-theme" value={form.themeId} onChange={maj('themeId')}>
              <option value="">— Choisir —</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label htmlFor="m-regime">Régime</label>
            <select id="m-regime" value={form.regimeId} onChange={maj('regimeId')}>
              <option value="">— Choisir —</option>
              {regimes.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grille-2">
          <div className="champ">
            <label htmlFor="m-min">Nombre de personnes minimum</label>
            <input id="m-min" type="number" min="1" required value={form.nbPersonnesMin} onChange={maj('nbPersonnesMin')} />
          </div>
          <div className="champ">
            <label htmlFor="m-prix">Prix pour le minimum (€)</label>
            <input id="m-prix" type="number" min="0" step="0.01" required value={form.prixPourMin} onChange={maj('prixPourMin')} />
          </div>
        </div>
        <div className="grille-2">
          <div className="champ">
            <label htmlFor="m-delai">Délai de commande (jours)</label>
            <input id="m-delai" type="number" min="0" value={form.delaiCommandeJours} onChange={maj('delaiCommandeJours')} />
          </div>
          <div className="champ">
            <label htmlFor="m-stock">Stock disponible</label>
            <input id="m-stock" type="number" min="0" value={form.stockDisponible} onChange={maj('stockDisponible')} />
          </div>
        </div>
        <div className="champ">
          <label htmlFor="m-precautions">Précautions de conservation</label>
          <textarea id="m-precautions" rows={2} value={form.precautionsStockage} onChange={maj('precautionsStockage')} />
        </div>
        <div className="champ">
          <label htmlFor="m-images">Images (une URL ou un chemin par ligne)</label>
          <textarea id="m-images" rows={2} value={form.galerieImages} onChange={maj('galerieImages')} />
        </div>

        <fieldset>
          <legend>Plats composant le menu</legend>
          {['entree', 'plat', 'dessert'].map((type) => (
            <div key={type} className="groupe-plats">
              <p className="eyebrow">{LIBELLES_TYPE_PLAT[type]}s</p>
              <div className="cases">
                {plats
                  .filter((p) => p.type === type)
                  .map((p) => (
                    <label key={p.id} className="case">
                      <input type="checkbox" checked={form.platIds.includes(p.id)} onChange={() => basculerPlat(p.id)} />
                      {p.nom}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </fieldset>

        <div className="actions">
          <button type="submit" className="tip-button">
            {enEdition ? 'Enregistrer les modifications' : 'Créer le menu'}
          </button>
          {enEdition && (
            <button type="button" className="tip-button tip-button-secondaire" onClick={annulerEdition}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </>
  )
}

/* ---------- Plats ---------- */
const PLAT_VIDE = { nom: '', description: '', type: 'entree', allergeneIds: [] }

function OngletPlats() {
  const [plats, setPlats] = useState([])
  const [allergenes, setAllergenes] = useState([])
  const [form, setForm] = useState(PLAT_VIDE)
  const [enEdition, setEnEdition] = useState(null)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  async function recharger() {
    setPlats(await listerPlats())
  }

  useEffect(() => {
    Promise.all([listerPlats(), listerAllergenes()])
      .then(([p, a]) => {
        setPlats(p)
        setAllergenes(a)
      })
      .catch((e) => setErreur(e.message))
  }, [])

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))

  function basculerAllergene(id) {
    setForm((f) => ({
      ...f,
      allergeneIds: f.allergeneIds.includes(id)
        ? f.allergeneIds.filter((x) => x !== id)
        : [...f.allergeneIds, id],
    }))
  }

  function editer(plat) {
    setEnEdition(plat.id)
    // L'API renvoie les noms d'allergènes : on retrouve les identifiants correspondants.
    const ids = allergenes.filter((a) => (plat.allergenes ?? []).includes(a.nom)).map((a) => a.id)
    setForm({ nom: plat.nom, description: plat.description ?? '', type: plat.type, allergeneIds: ids })
  }

  function annulerEdition() {
    setEnEdition(null)
    setForm(PLAT_VIDE)
  }

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setMessage('')
    const corps = {
      nom: form.nom.trim(),
      description: form.description.trim(),
      type: form.type,
      allergeneIds: form.allergeneIds,
    }
    try {
      if (enEdition) {
        await modifierPlat(enEdition, corps)
        setMessage('Plat modifié.')
      } else {
        await creerPlat(corps)
        setMessage('Plat créé.')
      }
      annulerEdition()
      await recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function supprimer(plat) {
    if (!window.confirm(`Supprimer le plat « ${plat.nom} » ?`)) return
    setErreur('')
    try {
      await supprimerPlat(plat.id)
      setMessage('Plat supprimé.')
      await recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <>
      <Alert type="success">{message}</Alert>
      <Alert type="error">{erreur}</Alert>

      <h3>Plats</h3>
      <div className="tableau-scroll">
        <table>
          <caption className="visually-hidden">Liste des plats</caption>
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Nom</th>
              <th scope="col">Allergènes</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plats.map((p) => (
              <tr key={p.id}>
                <td>{LIBELLES_TYPE_PLAT[p.type] ?? p.type}</td>
                <td>
                  {p.nom}
                  {p.description && (
                    <>
                      <br />
                      <span className="aide">{p.description}</span>
                    </>
                  )}
                </td>
                <td>{p.allergenes?.length ? p.allergenes.join(', ') : 'aucun'}</td>
                <td>
                  <div className="actions-cellule">
                    <button type="button" className="filter-button" onClick={() => editer(p)}>Modifier</button>
                    <button type="button" className="filter-button danger" onClick={() => supprimer(p)}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>{enEdition ? 'Modifier le plat' : 'Créer un plat'}</h3>
      <form onSubmit={soumettre} noValidate>
        <div className="grille-2">
          <div className="champ">
            <label htmlFor="p-nom">Nom</label>
            <input id="p-nom" type="text" required value={form.nom} onChange={maj('nom')} />
          </div>
          <div className="champ">
            <label htmlFor="p-type">Type</label>
            <select id="p-type" value={form.type} onChange={maj('type')}>
              <option value="entree">Entrée</option>
              <option value="plat">Plat</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
        </div>
        <div className="champ">
          <label htmlFor="p-desc">Description</label>
          <input id="p-desc" type="text" value={form.description} onChange={maj('description')} />
        </div>
        <fieldset>
          <legend>Allergènes</legend>
          <div className="cases">
            {allergenes.map((a) => (
              <label key={a.id} className="case">
                <input type="checkbox" checked={form.allergeneIds.includes(a.id)} onChange={() => basculerAllergene(a.id)} />
                {a.nom}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="actions">
          <button type="submit" className="tip-button">{enEdition ? 'Enregistrer' : 'Créer le plat'}</button>
          {enEdition && (
            <button type="button" className="tip-button tip-button-secondaire" onClick={annulerEdition}>Annuler</button>
          )}
        </div>
      </form>
    </>
  )
}

/* ---------- Utilisateurs ---------- */
function OngletUtilisateurs() {
  const { user: moi } = useAuth()
  const [utilisateurs, setUtilisateurs] = useState([])
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    listerUtilisateurs().then(setUtilisateurs).catch((e) => setErreur(e.message))
  }, [])

  async function majRole(u, role) {
    setErreur('')
    try {
      await changerRole(u.id, role)
      setUtilisateurs((l) => l.map((x) => (x.id === u.id ? { ...x, role } : x)))
      setMessage(`${u.prenom} ${u.nom} est maintenant ${LIBELLES_ROLE[role].toLowerCase()}.`)
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function majActif(u) {
    setErreur('')
    try {
      await changerStatutUtilisateur(u.id, !u.actif)
      setUtilisateurs((l) => l.map((x) => (x.id === u.id ? { ...x, actif: !u.actif } : x)))
      setMessage(`Compte de ${u.prenom} ${u.nom} ${u.actif ? 'désactivé' : 'activé'}.`)
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <>
      <Alert type="success">{message}</Alert>
      <Alert type="error">{erreur}</Alert>
      <div className="tableau-scroll">
        <table>
          <caption className="visually-hidden">Liste des utilisateurs</caption>
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">E-mail</th>
              <th scope="col">Téléphone</th>
              <th scope="col">Rôle</th>
              <th scope="col">Statut</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((u) => {
              const estMoi = u.id === moi.id
              return (
                <tr key={u.id}>
                  <td>
                    {u.prenom} {u.nom}
                    {estMoi ? ' (vous)' : ''}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.numero_gsm ?? u.numeroGsm ?? '—'}</td>
                  <td>
                    <label htmlFor={`role-${u.id}`} className="visually-hidden">
                      Rôle de {u.prenom} {u.nom}
                    </label>
                    <select id={`role-${u.id}`} value={u.role} disabled={estMoi} onChange={(e) => majRole(u, e.target.value)}>
                      {Object.entries(LIBELLES_ROLE).map(([valeur, libelle]) => (
                        <option key={valeur} value={valeur}>{libelle}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`statut-badge ${u.actif ? 'statut-terminee' : 'statut-annulee'}`}>
                      {u.actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className={`filter-button ${u.actif ? 'danger' : ''}`} disabled={estMoi} onClick={() => majActif(u)}>
                      {u.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ---------- Avis ---------- */
function OngletAvis() {
  const [avis, setAvis] = useState([])
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    avisAdmin()
      .then(setAvis)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  async function decider(a, valide) {
    setErreur('')
    try {
      await validerAvis(a.id, valide)
      setAvis((l) => l.map((x) => (x.id === a.id ? { ...x, valide } : x)))
      setMessage(valide ? 'Avis validé et publié.' : 'Avis refusé.')
    } catch (err) {
      setErreur(err.message)
    }
  }

  const enAttente = avis.filter((a) => !a.valide)
  const valides = avis.filter((a) => a.valide)

  function Carte({ a }) {
    return (
      <article className="commande-card">
        <div className="commande-entete">
          <h3>
            {a.prenom} {a.nom ? `${a.nom.charAt(0)}.` : ''} — {a.note}/5
          </h3>
          <span className={`statut-badge ${a.valide ? 'statut-terminee' : 'statut-en_attente'}`}>
            {a.valide ? 'Publié' : 'En attente'}
          </span>
        </div>
        <p>“{a.commentaire}”</p>
        <p className="aide">Déposé le {formaterDateHeure(a.created_at)}</p>
        <div className="actions">
          {!a.valide && (
            <button type="button" className="filter-button" onClick={() => decider(a, true)}>Valider</button>
          )}
          {a.valide && (
            <button type="button" className="filter-button danger" onClick={() => decider(a, false)}>Retirer</button>
          )}
        </div>
      </article>
    )
  }

  return (
    <>
      <Alert type="success">{message}</Alert>
      <Alert type="error">{erreur}</Alert>
      {chargement && <p aria-live="polite">Chargement des avis…</p>}

      <h3>En attente de validation ({enAttente.length})</h3>
      {!chargement && enAttente.length === 0 && <p>Aucun avis en attente.</p>}
      <div className="commandes-liste">
        {enAttente.map((a) => <Carte key={a.id} a={a} />)}
      </div>

      <h3>Avis publiés ({valides.length})</h3>
      {!chargement && valides.length === 0 && <p>Aucun avis publié.</p>}
      <div className="commandes-liste">
        {valides.map((a) => <Carte key={a.id} a={a} />)}
      </div>
    </>
  )
}

export default function EspaceAdmin() {
  const { user } = useAuth()
  const [onglet, setOnglet] = useState('stats')

  return (
    <>
      <section className="home-section" aria-labelledby="admin-title">
        <p className="eyebrow">Espace administrateur</p>
        <h1 id="admin-title" className="page-title">Bonjour {user.prenom}</h1>
        <p>
          Pilotez l’activité : statistiques, catalogue, plats, comptes et avis clients. Le suivi
          des commandes et les messages de contact se trouvent dans l’
          <Link to="/espace-employe">espace employé</Link>.
        </p>
      </section>

      <section className="home-section" aria-labelledby="admin-onglets-title">
        <h2 id="admin-onglets-title" className="visually-hidden">Administration</h2>
        <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />
        <div role="tabpanel" className="panneau">
          {onglet === 'stats' && <OngletStats />}
          {onglet === 'menus' && <OngletMenus />}
          {onglet === 'plats' && <OngletPlats />}
          {onglet === 'utilisateurs' && <OngletUtilisateurs />}
          {onglet === 'avis' && <OngletAvis />}
        </div>
      </section>
    </>
  )
}
