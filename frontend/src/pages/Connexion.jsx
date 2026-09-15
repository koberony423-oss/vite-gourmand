// Page de connexion : formulaire accessible, redirection selon le rôle après authentification.
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import Alert from '../components/Alert.jsx'
import { cheminApresConnexion } from '../utils/redirection.js'

export default function Connexion() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      const user = await login(email.trim(), motDePasse)
      navigate(cheminApresConnexion(user, location.state?.from), { replace: true })
    } catch (err) {
      setErreur(
        err.status === 401 ? 'Adresse e-mail ou mot de passe incorrect.' : err.message,
      )
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="home-section formulaire-page" aria-labelledby="login-title">
      <p className="eyebrow">Espace client</p>

      <h1 id="login-title" className="page-title">Connexion</h1>

      <p>
        Connectez-vous pour commander un menu, suivre vos commandes et laisser un avis.
      </p>

      {location.state?.from && (
        <Alert type="info">Veuillez vous connecter pour accéder à cette page.</Alert>
      )}

      <form onSubmit={soumettre} noValidate aria-describedby={erreur ? 'login-erreur' : undefined}>
        <div className="champ">
          <label htmlFor="login-email">Adresse e-mail</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="champ">
          <label htmlFor="login-mdp">Mot de passe</label>
          <input
            id="login-mdp"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
        </div>

        <Alert type="error" id="login-erreur">{erreur}</Alert>

        <button type="submit" className="tip-button" disabled={envoi}>
          {envoi ? 'Connexion en cours…' : 'Se connecter'}
        </button>
      </form>

      <p className="liens-secondaires">
        <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        {' · '}
        <Link to="/inscription">Créer un compte</Link>
      </p>
    </section>
  )
}
