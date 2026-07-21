import { describe, it, expect, beforeEach, vi } from 'vitest'
import useControlStore from '../store/controlStore'

vi.mock('../api/controls', () => ({
  controlsApi: {
    list:       vi.fn(),
    summary:    vi.fn(),
    create:     vi.fn(),
    patch:      vi.fn(),
    remove:     vi.fn(),
    linkRisk:   vi.fn(),
    unlinkRisk: vi.fn(),
  },
}))

import { controlsApi } from '../api/controls'

const mockControl = {
  id: 'c1',
  title: 'MFA Policy',
  framework: 'ISO27001',
  controlRef: 'A.9.4.2',
  status: 'IMPLEMENTED',
  effectiveness: 90,
  risks: [],
}

const mockMeta = { page: 1, limit: 20, total: 1, totalPages: 1 }

beforeEach(() => {
  vi.clearAllMocks()
  useControlStore.setState({
    controls: [],
    frameworkSummary: null,
    selectedControl: null,
    isLoading: false,
    error: null,
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    filters: { search: '', framework: '', status: '' },
  })
})

describe('controlStore — fetchControls', () => {
  it('populates controls on success', async () => {
    controlsApi.list.mockResolvedValue({ data: { data: [mockControl], meta: mockMeta } })
    await useControlStore.getState().fetchControls()
    expect(useControlStore.getState().controls).toHaveLength(1)
    expect(useControlStore.getState().controls[0].title).toBe('MFA Policy')
  })

  it('sets error on failure', async () => {
    controlsApi.list.mockRejectedValue({ response: { data: { message: 'Failed' } } })
    await useControlStore.getState().fetchControls()
    expect(useControlStore.getState().error).toBe('Failed')
    expect(useControlStore.getState().isLoading).toBe(false)
  })
})

describe('controlStore — fetchSummary', () => {
  it('sets frameworkSummary on success', async () => {
    const summary = { total: 6, byFramework: [] }
    controlsApi.summary.mockResolvedValue({ data: { data: summary } })
    await useControlStore.getState().fetchSummary()
    expect(useControlStore.getState().frameworkSummary).toEqual(summary)
  })

  it('sets frameworkSummary to null on failure', async () => {
    controlsApi.summary.mockRejectedValue(new Error('fail'))
    await useControlStore.getState().fetchSummary()
    expect(useControlStore.getState().frameworkSummary).toBeNull()
  })
})

describe('controlStore — createControl', () => {
  it('prepends new control to the list', async () => {
    useControlStore.setState({ controls: [{ id: 'c0', title: 'Old' }] })
    controlsApi.create.mockResolvedValue({ data: { data: mockControl } })
    const result = await useControlStore.getState().createControl({ title: 'MFA Policy' })
    expect(result).toEqual(mockControl)
    expect(useControlStore.getState().controls[0]).toEqual(mockControl)
    expect(useControlStore.getState().controls).toHaveLength(2)
  })
})

describe('controlStore — updateControl', () => {
  it('replaces the updated control', async () => {
    useControlStore.setState({ controls: [mockControl] })
    const updated = { ...mockControl, effectiveness: 95 }
    controlsApi.patch.mockResolvedValue({ data: { data: updated } })
    await useControlStore.getState().updateControl('c1', { effectiveness: 95 })
    expect(useControlStore.getState().controls[0].effectiveness).toBe(95)
  })
})

describe('controlStore — deleteControl', () => {
  it('removes the control from the list', async () => {
    useControlStore.setState({ controls: [mockControl, { id: 'c2', title: 'Other' }] })
    controlsApi.remove.mockResolvedValue({})
    await useControlStore.getState().deleteControl('c1')
    expect(useControlStore.getState().controls).toHaveLength(1)
    expect(useControlStore.getState().controls[0].id).toBe('c2')
  })
})

describe('controlStore — linkRisk / unlinkRisk', () => {
  it('linkRisk updates the control in the list', async () => {
    const withRisk = { ...mockControl, risks: [{ id: 'r1' }] }
    useControlStore.setState({ controls: [mockControl] })
    controlsApi.linkRisk.mockResolvedValue({ data: { data: withRisk } })
    await useControlStore.getState().linkRisk('c1', 'r1')
    expect(useControlStore.getState().controls[0].risks).toHaveLength(1)
  })

  it('unlinkRisk updates the control in the list', async () => {
    const withRisk = { ...mockControl, risks: [{ id: 'r1' }] }
    useControlStore.setState({ controls: [withRisk] })
    controlsApi.unlinkRisk.mockResolvedValue({ data: { data: mockControl } })
    await useControlStore.getState().unlinkRisk('c1', 'r1')
    expect(useControlStore.getState().controls[0].risks).toHaveLength(0)
  })
})

describe('controlStore — setFilters', () => {
  it('merges filter updates without clearing others', () => {
    useControlStore.getState().setFilters({ framework: 'PCIDSS' })
    expect(useControlStore.getState().filters.framework).toBe('PCIDSS')
    expect(useControlStore.getState().filters.status).toBe('')
  })
})
