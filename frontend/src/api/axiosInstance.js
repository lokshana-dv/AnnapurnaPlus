import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // ← use proxy, NOT http://localhost:8080/api
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  try {
    const { auth } = await import('./firebase')
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {}
  return config
})

export default api