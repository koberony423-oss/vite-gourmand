// Détermine la page vers laquelle rediriger un utilisateur après connexion selon son rôle.
export function cheminApresConnexion(user, from) {
  if (user.role === 'administrateur') return '/espace-admin'
  if (user.role === 'employe') return '/espace-employe'
  return from || '/mon-espace'
}
