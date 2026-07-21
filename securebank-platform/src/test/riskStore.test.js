import { describe, it, expect, beforeEach, vi } from 'vitest'
import useRiskStore from '../store/riskStore'

vi.mock('../api/risks', () => ({
  risksApi: {
    list:    vi.fn(),
    heatmap: vi.fn(),
    summary: vi.fn(),
    trend:   vi.fn(),
    create:  vi.fn(),
    patch:   vi.fn(),
    remove:  vi.fn(),
  },
}))

import { risksApi } from '../api/risks'

const mockRisk = {
  id: 'r1',
  title: 'SQL Injection',
  category: 'TECHNICAL',
  likelihood: 4,
  impact: 5,
  status: 'OPEN',
}

const mockMeta = { page: 1, limit: 20, total: 1, totalPages: 1 }

beforeEach(() => {
  vi.clearAllMocks()
  useRiskStore.setState({
    risks: [],
    heatmap: [],
    summary: null,
    trend: [],
    selectedRisk: null,
    isLoading: false,
    error: null,
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    filters: { search: '', status: '', category: '', likelihood: '', impact: '' },
  })
})

describe('riskStore — fetchRisks', () => {
  it('populates risks on success', async () => {
    risksApi.list.mockResolvedValue({ data: { data: [mockRisk], meta: mockMeta } })
    await useRiskStore.getState().fetchRisks()
    expect(useRiskStore.getState().risks).toHaveLength(1)
    expect(useRiskStore.getState().risks[0].title).toBe('SQL Injection')
  })

  it('sets isLoading true then false', async () => {
    let resolveIt
    risksApi.list.mockReturnValue(new Promise((r) => { resolveIt = r }))
    const p = useRiskStore.getState().fetchRisks()
    expect(useRiskStore.getState().isLoading).toBe(true)
    resolveIt({ data: { data: [], meta: mockMeta } })
    await p
    expect(useRiskStore.getState().isLoading).toBe(false)
  })

  it('sets error on failure', async () => {
    risksApi.list.mockRejectedValue({ response: { data: { message: 'Server error' } } })
    await useRiskStore.getState().fetchRisks()
    expect(useRiskStore.getState().error).toBe('Server error')
  })

  it('falls back to empty array when data.data is missing', async () => {
    risksApi.list.mockResolvedValue({ data: {} })
    await useRiskStore.getState().fetchRisks()
    expect(useRiskStore.getState().risks).toEqual([])
  })
})

describe('riskStore — fetchHeatmap', () => {
  it('populates heatmap on success', async () => {
    risksApi.heatmap.mockResolvedValue({ data: { data: [{ likelihood: 4, impact: 5, count: 2 }] } })
    await useRiskStore.getState().fetchHeatmap()
    expect(useRiskStore.getState().heatmap).toHaveLength(1)
  })

  it('sets empty array on failure', async () => {
    risksApi.heatmap.mockRejectedValue(new Error('fail'))
    await useRiskStore.getState().fetchHeatmap()
    expect(useRiskStore.getState().heatmap).toEqual([])
  })
})

describe('riskStore — createRisk', () => {
  it('prepends new risk to the list', async () => {
    useRiskStore.setState({ risks: [{ id: 'r0', title: 'Existing' }] })
    risksApi.create.mockResolvedValue({ data: { data: mockRisk } })
    const result = await useRiskStore.getState().createRisk({ title: 'SQL Injection' })
    expect(result).toEqual(mockRisk)
    expect(useRiskStore.getState().risks[0]).toEqual(mockRisk)
    expect(useRiskStore.getState().risks).toHaveLength(2)
  })
})

describe('riskStore — updateRisk', () => {
  it('replaces the updated risk in the list', async () => {
    useRiskStore.setState({ risks: [mockRisk] })
    const updated = { ...mockRisk, status: 'MITIGATED' }
    risksApi.patch.mockResolvedValue({ data: { data: updated } })
    await useRiskStore.getState().updateRisk('r1', { status: 'MITIGATED' })
    expect(useRiskStore.getState().risks[0].status).toBe('MITIGATED')
  })

  it('updates selectedRisk if it matches', async () => {
    useRiskStore.setState({ risks: [mockRisk], selectedRisk: mockRisk })
    const updated = { ...mockRisk, title: 'Updated Title' }
    risksApi.patch.mockResolvedValue({ data: { data: updated } })
    await useRiskStore.getState().updateRisk('r1', { title: 'Updated Title' })
    expect(useRiskStore.getState().selectedRisk.title).toBe('Updated Title')
  })
})

describe('riskStore — deleteRisk', () => {
  it('removes the risk from the list', async () => {
    useRiskStore.setState({ risks: [mockRisk, { id: 'r2', title: 'Other' }] })
    risksApi.remove.mockResolvedValue({})
    await useRiskStore.getState().deleteRisk('r1')
    expect(useRiskStore.getState().risks).toHaveLength(1)
    expect(useRiskStore.getState().risks[0].id).toBe('r2')
  })
})

describe('riskStore — setFilters', () => {
  it('merges filter updates', () => {
    useRiskStore.getState().setFilters({ status: 'OPEN' })
    expect(useRiskStore.getState().filters.status).toBe('OPEN')
    expect(useRiskStore.getState().filters.category).toBe('')
  })
})

describe('riskStore — selectRisk', () => {
  it('sets selectedRisk', () => {
    useRiskStore.getState().selectRisk(mockRisk)
    expect(useRiskStore.getState().selectedRisk).toEqual(mockRisk)
  })
})
