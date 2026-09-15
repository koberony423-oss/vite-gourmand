// Graphique en barres SVG « maison » (sans dépendance), accessible via une table de données cachée.
export default function GraphiqueBarres({ donnees, titre, formatValeur = (v) => v }) {
  if (!donnees.length) return <p>Aucune donnée à afficher.</p>

  const largeur = 640
  const hauteur = 260
  const margeGauche = 60
  const margeBas = 70
  const margeHaut = 20
  const zoneH = hauteur - margeBas - margeHaut
  const zoneL = largeur - margeGauche - 20
  const max = Math.max(...donnees.map((d) => d.valeur), 1)
  const pas = zoneL / donnees.length
  const largeurBarre = Math.min(60, pas * 0.6)

  return (
    <figure className="graphique">
      <figcaption>{titre}</figcaption>
      <svg viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-label={titre} className="graphique-svg">
        <line x1={margeGauche} y1={margeHaut} x2={margeGauche} y2={hauteur - margeBas} stroke="#2c241f" />
        <line x1={margeGauche} y1={hauteur - margeBas} x2={largeur - 20} y2={hauteur - margeBas} stroke="#2c241f" />
        {[0, 0.5, 1].map((f) => {
          const y = hauteur - margeBas - f * zoneH
          return (
            <g key={f}>
              <line x1={margeGauche - 4} y1={y} x2={largeur - 20} y2={y} stroke="#eaded3" />
              <text x={margeGauche - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#2c241f">
                {formatValeur(Math.round(max * f))}
              </text>
            </g>
          )
        })}
        {donnees.map((d, i) => {
          const h = (d.valeur / max) * zoneH
          const x = margeGauche + i * pas + (pas - largeurBarre) / 2
          const y = hauteur - margeBas - h
          const label = d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={largeurBarre} height={h} rx="6" fill="#3f5d3a">
                <title>{`${d.label} : ${formatValeur(d.valeur)}`}</title>
              </rect>
              <text x={x + largeurBarre / 2} y={y - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2c241f">
                {formatValeur(d.valeur)}
              </text>
              <text
                x={x + largeurBarre / 2}
                y={hauteur - margeBas + 16}
                textAnchor="middle"
                fontSize="11"
                fill="#2c241f"
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>
      <table className="visually-hidden">
        <caption>{titre}</caption>
        <thead>
          <tr>
            <th scope="col">Catégorie</th>
            <th scope="col">Valeur</th>
          </tr>
        </thead>
        <tbody>
          {donnees.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{formatValeur(d.valeur)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
