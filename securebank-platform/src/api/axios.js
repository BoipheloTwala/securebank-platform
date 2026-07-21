import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sb_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token refresh + 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isAuthRoute = original.url?.includes('/auth/login') || original.url?.includes('/auth/register')
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('sb_refresh_token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        // API rotates the refresh token on every use — persist both
        const newAccessToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken
        localStorage.setItem('sb_access_token', newAccessToken)
        if (newRefreshToken) localStorage.setItem('sb_refresh_token', newRefreshToken)
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch (_err) {
        localStorage.removeItem('sb_access_token')
        localStorage.removeItem('sb_refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
