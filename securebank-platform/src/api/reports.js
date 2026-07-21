import api from './axios'

export const reportsApi = {
  list: () =>
    api.get('/reports'),

  get: (id) =>
    api.get(`/reports/${id}`),

  generate: (data) =>
    api.post('/reports/generate', data),

  remove: (id) =>
    api.delete(`/reports/${id}`),
}
