export const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function apiFetch(path, options){
  const url = `${API_BASE}${path}`
  return fetch(url, options)
}