import api from './axios'

// NOTE: No /evidence endpoint exists in the SecureBank backend (Node.js/Express).
// The backend exposes: /auth, /accounts, /transactions, /admin
// These stubs are placeholders for a future evidence-management service.
export const evidenceApi = {
  list: (params) =>
    api.get('/evidence', { params }),

  get: (id) =>
    api.get(`/evidence/${id}`),

  upload: (formData, onProgress) =>
    api.post('/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    }),

  update: (id, data) =>
    api.patch(`/evidence/${id}`, data),

  remove: (id) =>
    api.delete(`/evidence/${id}`),

  download: (id) =>
    api.get(`/evidence/${id}/download`, { responseType: 'blob' }),

  linkControl: (evidenceId, controlId) =>
    api.post(`/evidence/${evidenceId}/controls`, { control_id: controlId }),

  unlinkControl: (evidenceId, controlId) =>
    api.delete(`/evidence/${evidenceId}/controls/${controlId}`),
}
