// Pastille colorée affichant le statut d'une commande en français.
import { LIBELLES_STATUT } from '../utils/format.js'

export default function StatutBadge({ statut }) {
  return (
    <span className={`statut-badge statut-${statut}`}>
      {LIBELLES_STATUT[statut] ?? statut}
    </span>
  )
}
