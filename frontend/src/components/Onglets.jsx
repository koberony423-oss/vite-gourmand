// Composant d'onglets accessible (rôle tablist, navigation clavier flèches gauche/droite).
import { useId } from 'react'

export default function Onglets({ onglets, actif, onChange }) {
  const baseId = useId()

  function auClavier(e, index) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const delta = e.key === 'ArrowRight' ? 1 : -1
    const suivant = (index + delta + onglets.length) % onglets.length
    onChange(onglets[suivant].id)
    document.getElementById(`${baseId}-tab-${onglets[suivant].id}`)?.focus()
  }

  return (
    <div className="onglets" role="tablist" aria-label="Sections de l’espace">
      {onglets.map((o, i) => (
        <button
          key={o.id}
          id={`${baseId}-tab-${o.id}`}
          type="button"
          role="tab"
          aria-selected={actif === o.id}
          aria-controls={`${baseId}-panel-${o.id}`}
          tabIndex={actif === o.id ? 0 : -1}
          className={actif === o.id ? 'filter-button active' : 'filter-button'}
          onClick={() => onChange(o.id)}
          onKeyDown={(e) => auClavier(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
