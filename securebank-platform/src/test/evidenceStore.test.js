import { describe, it, expect, beforeEach, vi } from 'vitest'
import useEvidenceStore from '../store/evidenceStore'

vi.mock('../api/evidence', () => ({
  evidenceApi: {
    list:     vi.fn(),
    upload:   vi.fn(),
    update:   vi.fn(),
    remove:   vi.fn(),
    download: vi.fn(),
  },
}))

import { evidenceApi } from '../api/evidence'

const mockEvidence = {
  id: 'e1',
  title: 'MFA Screenshot',
  type: 'IMAGE',
  status: 'PENDING',
  fileName: 'mfa.png',
  fileSize: 12000,
}

const mockMeta = { page: 1, limit: 20, total: 1, totalPages: 1 }

beforeEach(() => {
  vi.clearAllMocks()
  useEvidenceStore.setState({
    evidence: [],
    selectedEvidence: null,
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    filters: { search: '', status: '', controlId: '' },
  })
})

describe('evidenceStore — fetchEvidence', () => {
  it('populates evidence list on success', async () => {
    evidenceApi.list.mockResolvedValue({ data: { data: [mockEvidence], meta: mockMeta } })
    await useEvidenceStore.getState().fetchEvidence()
    expect(useEvidenceStore.getState().evidence).toHaveLength(1)
    expect(useEvidenceStore.getState().evidence[0].title).toBe('MFA Screenshot')
  })

  it('sets error on failure', async () => {
    evidenceApi.list.mockRejectedValue({ response: { data: { message: 'Not found' } } })
    await useEvidenceStore.getState().fetchEvidence()
    expect(useEvidenceStore.getState().error).toBe('Not found')
  })
})

describe('evidenceStore — upload', () => {
  it('prepends uploaded item to evidence list', async () => {
    evidenceApi.upload.mockResolvedValue({ data: { data: mockEvidence } })
    const result = await useEvidenceStore.getState().upload(new FormData())
    expect(result).toEqual(mockEvidence)
    expect(useEvidenceStore.getState().evidence[0]).toEqual(mockEvidence)
    expect(useEvidenceStore.getState().isUploading).toBe(false)
    expect(useEvidenceStore.getState().uploadProgress).toBe(0)
  })

  it('sets error and clears uploading state on failure', async () => {
    evidenceApi.upload.mockRejectedValue({ response: { data: { message: 'Too large' } } })
    await expect(
      useEvidenceStore.getState().upload(new FormData())
    ).rejects.toBeDefined()
    expect(useEvidenceStore.getState().error).toBe('Too large')
    expect(useEvidenceStore.getState().isUploading).toBe(false)
  })
})

describe('evidenceStore — updateEvidence', () => {
  it('replaces the updated evidence in the list', async () => {
    useEvidenceStore.setState({ evidence: [mockEvidence] })
    const updated = { ...mockEvidence, status: 'APPROVED' }
    evidenceApi.update.mockResolvedValue({ data: { data: updated } })
    await useEvidenceStore.getState().updateEvidence('e1', { status: 'APPROVED' })
    expect(useEvidenceStore.getState().evidence[0].status).toBe('APPROVED')
  })

  it('also updates selectedEvidence if it matches', async () => {
    useEvidenceStore.setState({ evidence: [mockEvidence], selectedEvidence: mockEvidence })
    const updated = { ...mockEvidence, status: 'REJECTED' }
    evidenceApi.update.mockResolvedValue({ data: { data: updated } })
    await useEvidenceStore.getState().updateEvidence('e1', { status: 'REJECTED' })
    expect(useEvidenceStore.getState().selectedEvidence.status).toBe('REJECTED')
  })
})

describe('evidenceStore — deleteEvidence', () => {
  it('removes evidence from the list', async () => {
    useEvidenceStore.setState({ evidence: [mockEvidence, { id: 'e2', title: 'Other' }] })
    evidenceApi.remove.mockResolvedValue({})
    await useEvidenceStore.getState().deleteEvidence('e1')
    expect(useEvidenceStore.getState().evidence).toHaveLength(1)
    expect(useEvidenceStore.getState().evidence[0].id).toBe('e2')
  })
})

describe('evidenceStore — selectEvidence', () => {
  it('sets selectedEvidence', () => {
    useEvidenceStore.getState().selectEvidence(mockEvidence)
    expect(useEvidenceStore.getState().selectedEvidence).toEqual(mockEvidence)
  })
})

describe('evidenceStore — setFilters', () => {
  it('merges filter updates', () => {
    useEvidenceStore.getState().setFilters({ status: 'APPROVED' })
    expect(useEvidenceStore.getState().filters.status).toBe('APPROVED')
    expect(useEvidenceStore.getState().filters.search).toBe('')
  })
})
