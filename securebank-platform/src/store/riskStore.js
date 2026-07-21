import { create } from 'zustand'
import { risksApi } from '../api/risks'

const useRiskStore = create((set) => ({
  risks: [],
  heatmap: [],
  summary: null,
  trend: [],
  selectedRisk: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  filters: { search: '', status: '', category: '', likelihood: '', impact: '' },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),

  fetchRisks: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await risksApi.list(params)
      set({
        risks: data.data ?? [],
        pagination: data.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch risks', isLoading: false })
    }
  },

  fetchHeatmap: async () => {
    try {
      const { data } = await risksApi.heatmap()
      set({ heatmap: data.data ?? [] })
    } catch {
      set({ heatmap: [] })
    }
  },

  fetchSummary: async () => {
    try {
      const { data } = await risksApi.summary()
      set({ summary: data.data })
    } catch {
      set({ summary: null })
    }
  },

  fetchTrend: async () => {
    try {
      const { data } = await risksApi.trend()
      set({ trend: data.data ?? [] })
    } catch {
      set({ trend: [] })
    }
  },

  selectRisk: (risk) => set({ selectedRisk: risk }),

  createRisk: async (payload) => {
    const { data } = await risksApi.create(payload)
    set((s) => ({ risks: [data.data, ...s.risks] }))
    return data.data
  },

  updateRisk: async (id, payload) => {
    const { data } = await risksApi.patch(id, payload)
    set((s) => ({
      risks: s.risks.map((r) => (r.id === id ? data.data : r)),
      selectedRisk: s.selectedRisk?.id === id ? data.data : s.selectedRisk,
    }))
    return data.data
  },

  deleteRisk: async (id) => {
    await risksApi.remove(id)
    set((s) => ({ risks: s.risks.filter((r) => r.id !== id) }))
  },
}))

export default useRiskStore
