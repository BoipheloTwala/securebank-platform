import api from './axios'

export const authApi = {
  register: (payload) =>
    api.post('/auth/register', payload),

  login: (credentials) =>
    api.post('/auth/login', credentials),

  logout: (refreshToken) =>
    api.post('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  getProfile: () =>
    api.get('/auth/me'),
}
