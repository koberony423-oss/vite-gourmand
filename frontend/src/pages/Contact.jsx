// Page contact : formulaire (nom, e-mail, téléphone, sujet, message) envoyé à POST /contact.
import { useState } from 'react'
import { envoyerContact } from '../api/contact.js'
import Alert from '../components/Alert.jsx'

const INITIAL = { nom: '', email: '', telephone: '', sujet: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(INITIAL)
  const [succes, setSucces] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }))

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setSucces('')
    setEnvoi(true)
    try {
      await envoyerContact({
        nom: form.nom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim() || undefined,
        sujet: form.sujet.trim(),
        message: form.message.trim(),
      })
      setSucces('Merci ! Votre message a bien été envoyé. Julie et José vous répondront rapidement.')
      setForm(INITIAL)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="home-section formulaire-page" aria-labelledby="contact-title">
      <p className="eyebrow">Nous contacter</p>

      <h1 id="contact-title" className="page-title">
        Une question sur un menu ou un événement ?
      </h1>

      <p>Contactez Julie et José pour une demande personnalisée.</p>

      <form onSubmit={soumettre} noValidate>
        <div className="grille-2">
          <div className="champ">
            <label htmlFor="ct-nom">Nom</label>
            <input id="ct-nom" type="text" autoComplete="name" required value={form.nom} onChange={maj('nom')} />
          </div>
          <div className="champ">
            <label htmlFor="ct-email">Adresse e-mail</label>
            <input id="ct-email" type="email" autoComplete="email" required value={form.email} onChange={maj('email')} />
          </div>
        </div>

        <div className="grille-2">
          <div className="champ">
            <label htmlFor="ct-tel">Téléphone (facultatif)</label>
            <input id="ct-tel" type="tel" autoComplete="tel" value={form.telephone} onChange={maj('telephone')} />
          </div>
          <div className="champ">
            <label htmlFor="ct-sujet">Sujet</label>
            <input id="ct-sujet" type="text" required value={form.sujet} onChange={maj('sujet')} />
          </div>
        </div>

        <div className="champ">
          <label htmlFor="ct-message">Message</label>
          <textarea id="ct-message" rows={6} required value={form.message} onChange={maj('message')} />
        </div>

        <Alert type="success">{succes}</Alert>
        <Alert type="error">{erreur}</Alert>

        <button type="submit" className="tip-button" disabled={envoi}>
          {envoi ? 'Envoi en cours…' : 'Envoyer le message'}
        </button>
      </form>
    </section>
  )
}
