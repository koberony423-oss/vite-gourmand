// Client HTTP central : base URL, jeton JWT (localStorage) et gestion uniforme des erreurs de l'API NestJS.
export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const TOKEN_KEY = 'vg_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/** Erreur enrichie avec le code HTTP et le message renvoyé par l'API. */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/** Transforme `{message: string | string[]}` de NestJS en texte lisible. */
function formatMessage(payload, status) {
  if (!payload) return `Erreur ${status}`
  const { message } = payload
  if (Array.isArray(message)) return message.join(' · ')
  if (typeof message === 'string') return message
  return `Erreur ${status}`
}

export async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const options = {
    method,
    headers: { Accept: 'application/json', ...headers },
  }
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  if (token) options.headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion.',
      0,
    )
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    throw new ApiError(formatMessage(data, response.status), response.status, data)
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
