import api from './axios'

export const dashboardApi = {
  kpis: () =>
    api.get('/dashboard/kpis'),

  activity: (limit = 10) =>
    api.get('/dashboard/activity', { params: { limit } }),

  complianceScore: () =>
    api.get('/dashboard/compliance-score'),
}
