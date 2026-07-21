import { create } from 'zustand'
import { evidenceApi } from '../api/evidence'

const useEvidenceStore = create((set) => ({
  evidence: [],
  selectedEvidence: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  filters: { search: '', status: '', controlId: '' },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),

  fetchEvidence: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await evidenceApi.list(params)
      set({
        evidence: data.data ?? [],
        pagination: data.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch evidence', isLoading: false })
    }
  },

  upload: async (formData, onProgress) => {
    set({ isUploading: true, uploadProgress: 0, error: null })
    try {
      const { data } = await evidenceApi.upload(formData, (pct) => {
        set({ uploadProgress: pct })
        onProgress?.(pct)
      })
      const item = data.data
      set((s) => ({ evidence: [item, ...s.evidence], isUploading: false, uploadProgress: 0 }))
      return item
    } catch (err) {
      set({ error: err.response?.data?.message || 'Upload failed', isUploading: false, uploadProgress: 0 })
      throw err
    }
  },

  updateEvidence: async (id, payload) => {
    const { data } = await evidenceApi.update(id, payload)
    set((s) => ({
      evidence: s.evidence.map((e) => (e.id === id ? data.data : e)),
      selectedEvidence: s.selectedEvidence?.id === id ? data.data : s.selectedEvidence,
    }))
    return data.data
  },

  deleteEvidence: async (id) => {
    await evidenceApi.remove(id)
    set((s) => ({ evidence: s.evidence.filter((e) => e.id !== id) }))
  },

  selectEvidence: (ev) => set({ selectedEvidence: ev }),

  downloadEvidence: async (id, fileName) => {
    const { data } = await evidenceApi.download(id)
    const url = URL.createObjectURL(new Blob([data]))
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'evidence'
    a.click()
    URL.revokeObjectURL(url)
  },
}))

export default useEvidenceStore
