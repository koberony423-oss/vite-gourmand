// Page d'inscription : création d'un compte utilisateur puis connexion automatique.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import Alert from '../components/Alert.jsx'

export default function Inscription() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    numeroGsm: '',
    motDePasse: '',
    confirmation: '',
  })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    if (form.motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (form.motDePasse !== form.confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }
    setEnvoi(true)
    try {
      await register({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        motDePasse: form.motDePasse,
        numeroGsm: form.numeroGsm.trim() || undefined,
      })
      navigate('/mon-espace', { replace: true })
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="home-section formulaire-page" aria-labelledby="inscription-title">
      <p className="eyebrow">Espace client</p>

      <h1 id="inscription-title" className="page-title">Créer un compte</h1>

      <p>Un compte vous permet de commander nos menus et de suivre vos commandes.</p>

      <form onSubmit={soumettre} noValidate>
        <div className="grille-2">
          <div className="champ">
            <label htmlFor="ins-prenom">Prénom</label>
            <input id="ins-prenom" type="text" autoComplete="given-name" required value={form.prenom} onChange={maj('prenom')} />
          </div>
          <div className="champ">
            <label htmlFor="ins-nom">Nom</label>
            <input id="ins-nom" type="text" autoComplete="family-name" required value={form.nom} onChange={maj('nom')} />
          </div>
        </div>

        <div className="champ">
          <label htmlFor="ins-email">Adresse e-mail</label>
          <input id="ins-email" type="email" autoComplete="email" required value={form.email} onChange={maj('email')} />
        </div>

        <div className="champ">
          <label htmlFor="ins-gsm">Téléphone portable (facultatif)</label>
          <input id="ins-gsm" type="tel" autoComplete="tel" value={form.numeroGsm} onChange={maj('numeroGsm')} />
        </div>

        <div className="grille-2">
          <div className="champ">
            <label htmlFor="ins-mdp">Mot de passe</label>
            <input
              id="ins-mdp"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby="ins-mdp-aide"
              value={form.motDePasse}
              onChange={maj('motDePasse')}
            />
            <span id="ins-mdp-aide" className="aide">8 caractères minimum.</span>
          </div>
          <div className="champ">
            <label htmlFor="ins-confirmation">Confirmer le mot de passe</label>
            <input id="ins-confirmation" type="password" autoComplete="new-password" required value={form.confirmation} onChange={maj('confirmation')} />
          </div>
        </div>

        <Alert type="error" id="ins-erreur">{erreur}</Alert>

        <button type="submit" className="tip-button" disabled={envoi}>
          {envoi ? 'Création en cours…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="liens-secondaires">
        Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
      </p>
    </section>
  )
}
