import api from './axios'

// NOTE: No /risks endpoint exists in the SecureBank backend (Node.js/Express).
// The backend exposes: /auth, /accounts, /transactions, /admin
// These stubs are placeholders for a future risk-management service.
export const risksApi = {
  list: (params) =>
    api.get('/risks', { params }),

  get: (id) =>
    api.get(`/risks/${id}`),

  create: (data) =>
    api.post('/risks', data),

  update: (id, data) =>
    api.put(`/risks/${id}`, data),

  patch: (id, data) =>
    api.patch(`/risks/${id}`, data),

  remove: (id) =>
    api.delete(`/risks/${id}`),

  heatmap: (params) =>
    api.get('/risks/heatmap', { params }),

  summary: () =>
    api.get('/risks/summary'),

  trend: (params) =>
    api.get('/risks/trend', { params }),
}
