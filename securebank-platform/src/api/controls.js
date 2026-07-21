import api from './axios'

export const controlsApi = {
  list: (params) =>
    api.get('/controls', { params }),

  summary: () =>
    api.get('/controls/summary'),

  get: (id) =>
    api.get(`/controls/${id}`),

  create: (data) =>
    api.post('/controls', data),

  patch: (id, data) =>
    api.patch(`/controls/${id}`, data),

  remove: (id) =>
    api.delete(`/controls/${id}`),

  linkRisk: (controlId, riskId) =>
    api.post(`/controls/${controlId}/risks`, { riskId }),

  unlinkRisk: (controlId, riskId) =>
    api.delete(`/controls/${controlId}/risks/${riskId}`),
}
