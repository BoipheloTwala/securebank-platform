import api from './axios'

export const transactionsApi = {
  // POST /transactions/deposit — body: { toAccountId, amount, currency?, description? }
  deposit: (data) =>
    api.post('/transactions/deposit', data),

  // POST /transactions/withdraw — body: { fromAccountId, amount, currency?, description? }
  withdraw: (data) =>
    api.post('/transactions/withdraw', data),

  // POST /transactions/transfer — body: { fromAccountId, toAccountId, amount, currency?, description? }
  transfer: (data) =>
    api.post('/transactions/transfer', data),

  // GET /transactions — list transactions
  // params: { page, limit, type, accountId }
  list: (params) =>
    api.get('/transactions', { params }),

  // GET /transactions/:id
  get: (id) =>
    api.get(`/transactions/${id}`),
}
