// Page de réinitialisation du mot de passe à partir du jeton reçu (paramètre ?token=).
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { reinitialiser } from '../api/auth.js'
import Alert from '../components/Alert.jsx'

export default function ReinitialiserMotDePasse() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }
    setEnvoi(true)
    try {
      const reponse = await reinitialiser(token, motDePasse)
      setMessage(reponse?.message ?? 'Votre mot de passe a bien été modifié.')
    } catch (err) {
      setErreur(err.status === 404 ? 'Lien invalide ou expiré.' : err.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="home-section formulaire-page" aria-labelledby="reinit-title">
      <p className="eyebrow">Espace client</p>

      <h1 id="reinit-title" className="page-title">Nouveau mot de passe</h1>

      {!token && (
        <Alert type="error">
          Ce lien est incomplet. <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>.
        </Alert>
      )}

      {message ? (
        <>
          <Alert type="success">{message}</Alert>
          <Link to="/connexion" className="tip-button">Se connecter</Link>
        </>
      ) : (
        <form onSubmit={soumettre} noValidate>
          <div className="champ">
            <label htmlFor="reinit-mdp">Nouveau mot de passe</label>
            <input
              id="reinit-mdp"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby="reinit-aide"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
            <span id="reinit-aide" className="aide">8 caractères minimum.</span>
          </div>
          <div className="champ">
            <label htmlFor="reinit-conf">Confirmer le mot de passe</label>
            <input
              id="reinit-conf"
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>

          <Alert type="error">{erreur}</Alert>

          <button type="submit" className="tip-button" disabled={envoi || !token}>
            {envoi ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>
        </form>
      )}
    </section>
  )
}
