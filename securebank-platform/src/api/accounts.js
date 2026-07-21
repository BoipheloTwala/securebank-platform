import api from './axios'

export const accountsApi = {
  // GET /accounts — list all accounts for the authenticated user
  // params: { page, limit }
  list: (params) =>
    api.get('/accounts', { params }),

  // GET /accounts/:id
  get: (id) =>
    api.get(`/accounts/${id}`),

  // POST /accounts — open a new account
  // body: { type: 'CHECKING' | 'SAVINGS' | 'FIXED_DEPOSIT', currency?: string }
  create: (data) =>
    api.post('/accounts', data),

  // GET /accounts/:id/balance
  balance: (id) =>
    api.get(`/accounts/${id}/balance`),
}
