// Message d'information / succès / erreur annoncé aux lecteurs d'écran (aria-live).
export default function Alert({ type = 'info', children, id }) {
  if (!children) return null
  return (
    <div
      id={id}
      className={`alert alert-${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {children}
    </div>
  )
}
