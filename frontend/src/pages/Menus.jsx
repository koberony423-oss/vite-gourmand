// Catalogue des menus avec filtres combinables (thème, régime, nombre de personnes, prix max).
import { useEffect, useMemo, useState } from 'react'
import { listerMenus } from '../api/menus.js'
import { listerRegimes, listerThemes } from '../api/referentiels.js'
import MenuCard from '../components/MenuCard.jsx'
import Alert from '../components/Alert.jsx'
import { prixParPersonne } from '../utils/prix.js'

const PERSONNES_RAPIDES = ['Tous', '6', '8', '10']

export default function Menus() {
  const [menus, setMenus] = useState([])
  const [themes, setThemes] = useState([])
  const [regimes, setRegimes] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [showTip, setShowTip] = useState(false)

  const [themeId, setThemeId] = useState('')
  const [regimeId, setRegimeId] = useState('')
  const [selectedPeople, setSelectedPeople] = useState('Tous')
  const [personnesLibre, setPersonnesLibre] = useState('')
  const [prixMax, setPrixMax] = useState('')

  useEffect(() => {
    Promise.all([listerMenus(), listerThemes(), listerRegimes()])
      .then(([m, t, r]) => {
        setMenus(m)
        setThemes(t)
        setRegimes(r)
      })
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false))
  }, [])

  const themesParId = useMemo(
    () => Object.fromEntries(themes.map((t) => [t.id, t.nom])),
    [themes],
  )
  const regimesParId = useMemo(
    () => Object.fromEntries(regimes.map((r) => [r.id, r.nom])),
    [regimes],
  )

  const nbPersonnes =
    personnesLibre !== ''
      ? Number(personnesLibre)
      : selectedPeople === 'Tous'
        ? null
        : Number(selectedPeople)

  const menusFiltres = menus.filter((menu) => {
    if (themeId && menu.theme_id !== themeId) return false
    if (regimeId && menu.regime_id !== regimeId) return false
    if (nbPersonnes && Number(menu.nb_personnes_min) > nbPersonnes) return false
    if (prixMax !== '' && prixParPersonne(menu) > Number(prixMax)) return false
    return true
  })

  function reinitialiser() {
    setThemeId('')
    setRegimeId('')
    setSelectedPeople('Tous')
    setPersonnesLibre('')
    setPrixMax('')
  }

  return (
    <>
      <section className="home-section" aria-labelledby="menus-intro-title">
        <p className="eyebrow">Nos menus</p>

        <h1 id="menus-intro-title" className="page-title">
          Un menu adapté à votre événement
        </h1>

        <p>
          Consultez nos propositions et choisissez celle qui correspond à votre repas, au
          nombre de convives et à vos préférences.
        </p>
      </section>

      <section className="recipes" aria-labelledby="menus-title">
        <div className="recipes-heading">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 id="menus-title">Nos menus disponibles</h2>
          </div>

          <div className="filters" role="group" aria-label="Filtrer les menus par nombre de personnes">
            {PERSONNES_RAPIDES.map((people) => (
              <button
                key={people}
                type="button"
                className={
                  selectedPeople === people && personnesLibre === ''
                    ? 'filter-button active'
                    : 'filter-button'
                }
                aria-pressed={selectedPeople === people && personnesLibre === ''}
                onClick={() => {
                  setSelectedPeople(people)
                  setPersonnesLibre('')
                }}
              >
                {people === 'Tous' ? 'Tous les menus' : `${people} personnes`}
              </button>
            ))}
          </div>

          <form className="filtres-avances" onSubmit={(e) => e.preventDefault()}>
            <div className="champ">
              <label htmlFor="filtre-theme">Thème</label>
              <select id="filtre-theme" value={themeId} onChange={(e) => setThemeId(e.target.value)}>
                <option value="">Tous les thèmes</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="champ">
              <label htmlFor="filtre-regime">Régime</label>
              <select id="filtre-regime" value={regimeId} onChange={(e) => setRegimeId(e.target.value)}>
                <option value="">Tous les régimes</option>
                {regimes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="champ">
              <label htmlFor="filtre-personnes">Nombre de convives</label>
              <input
                id="filtre-personnes"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="ex. 12"
                value={personnesLibre}
                onChange={(e) => setPersonnesLibre(e.target.value)}
                aria-describedby="filtre-personnes-aide"
              />
              <span id="filtre-personnes-aide" className="aide">
                Affiche les menus dont le minimum est atteint.
              </span>
            </div>

            <div className="champ">
              <label htmlFor="filtre-prix">Prix max. par personne (€)</label>
              <input
                id="filtre-prix"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                placeholder="ex. 30"
                value={prixMax}
                onChange={(e) => setPrixMax(e.target.value)}
              />
            </div>

            <button type="button" className="filter-button" onClick={reinitialiser}>
              Réinitialiser les filtres
            </button>
          </form>

          <p className="resultats" aria-live="polite">
            {chargement
              ? 'Chargement des menus…'
              : `${menusFiltres.length} menu${menusFiltres.length > 1 ? 's' : ''} trouvé${menusFiltres.length > 1 ? 's' : ''}`}
          </p>

          <Alert type="error">{erreur}</Alert>
        </div>

        {menusFiltres.map((menu) => (
          <MenuCard key={menu.id} menu={menu} themes={themesParId} regimes={regimesParId} />
        ))}

        {!chargement && !erreur && menusFiltres.length === 0 && (
          <p className="tip">Aucun menu ne correspond à ces critères. Essayez d’élargir vos filtres.</p>
        )}
      </section>

      <button
        type="button"
        className="tip-button"
        aria-expanded={showTip}
        aria-controls="astuce"
        onClick={() => setShowTip(!showTip)}
      >
        {showTip ? 'Masquer l’astuce' : 'Afficher l’astuce'}
      </button>

      {showTip && (
        <p className="tip" id="astuce">
          Astuce : commandez à l’avance afin de garantir la disponibilité du menu choisi.
        </p>
      )}
    </>
  )
}
