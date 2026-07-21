import { create } from 'zustand'
import { controlsApi } from '../api/controls'

const useControlStore = create((set) => ({
  controls: [],
  frameworkSummary: null,
  selectedControl: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  filters: { search: '', framework: '', status: '' },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),

  fetchControls: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await controlsApi.list(params)
      set({
        controls: data.data ?? [],
        pagination: data.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch controls', isLoading: false })
    }
  },

  fetchSummary: async () => {
    try {
      const { data } = await controlsApi.summary()
      set({ frameworkSummary: data.data })
    } catch {
      set({ frameworkSummary: null })
    }
  },

  selectControl: (control) => set({ selectedControl: control }),

  createControl: async (payload) => {
    const { data } = await controlsApi.create(payload)
    set((s) => ({ controls: [data.data, ...s.controls] }))
    return data.data
  },

  updateControl: async (id, payload) => {
    const { data } = await controlsApi.patch(id, payload)
    set((s) => ({
      controls: s.controls.map((c) => (c.id === id ? data.data : c)),
      selectedControl: s.selectedControl?.id === id ? data.data : s.selectedControl,
    }))
    return data.data
  },

  deleteControl: async (id) => {
    await controlsApi.remove(id)
    set((s) => ({ controls: s.controls.filter((c) => c.id !== id) }))
  },

  linkRisk: async (controlId, riskId) => {
    const { data } = await controlsApi.linkRisk(controlId, riskId)
    set((s) => ({
      controls: s.controls.map((c) => (c.id === controlId ? data.data : c)),
    }))
    return data.data
  },

  unlinkRisk: async (controlId, riskId) => {
    const { data } = await controlsApi.unlinkRisk(controlId, riskId)
    set((s) => ({
      controls: s.controls.map((c) => (c.id === controlId ? data.data : c)),
    }))
    return data.data
  },
}))

export default useControlStore
