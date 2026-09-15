// Page « mot de passe oublié » : demande d'un lien de réinitialisation par e-mail.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motDePasseOublie } from '../api/auth.js'
import Alert from '../components/Alert.jsx'

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [tokenDev, setTokenDev] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setMessage('')
    setTokenDev('')
    setEnvoi(true)
    try {
      const reponse = await motDePasseOublie(email.trim())
      setMessage(
        reponse?.message ??
          'Si un compte existe pour cette adresse, un e-mail de réinitialisation a été envoyé.',
      )
      if (reponse?.tokenDev) setTokenDev(reponse.tokenDev)
    } catch (err) {
      if (err.status === 404) {
        setMessage(
          'Si un compte existe pour cette adresse, un e-mail de réinitialisation vous sera envoyé.',
        )
      } else {
        setErreur(err.message)
      }
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="home-section formulaire-page" aria-labelledby="mdp-title">
      <p className="eyebrow">Espace client</p>

      <h1 id="mdp-title" className="page-title">Mot de passe oublié</h1>

      <p>Indiquez votre adresse e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>

      <form onSubmit={soumettre} noValidate>
        <div className="champ">
          <label htmlFor="mdp-email">Adresse e-mail</label>
          <input
            id="mdp-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Alert type="success">{message}</Alert>
        <Alert type="error">{erreur}</Alert>

        {tokenDev && (
          <div className="tip" role="note">
            <strong>Mode démonstration :</strong> aucun e-mail n’est envoyé en environnement de
            développement.{' '}
            <Link to={`/reinitialiser?token=${encodeURIComponent(tokenDev)}`}>
              Ouvrir le lien de réinitialisation
            </Link>
          </div>
        )}

        <button type="submit" className="tip-button" disabled={envoi}>
          {envoi ? 'Envoi en cours…' : 'Envoyer le lien'}
        </button>
      </form>

      <p className="liens-secondaires">
        <Link to="/connexion">Retour à la connexion</Link>
      </p>
    </section>
  )
}
