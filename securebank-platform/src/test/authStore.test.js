import { describe, it, expect, beforeEach, vi } from 'vitest'
import useAuthStore from '../store/authStore'

// Mock the auth API module
vi.mock('../api/auth', () => ({
  authApi: {
    login:  vi.fn(),
    logout: vi.fn(),
  },
}))

import { authApi } from '../api/auth'

const mockUserPayload = {
  id: '1',
  email: 'admin@securebank.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
}

const mockTokens = {
  accessToken:  'access-abc',
  refreshToken: 'refresh-xyz',
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })
})

describe('authStore — login', () => {
  it('sets isLoading true while logging in', async () => {
    authApi.login.mockReturnValue(new Promise(() => {})) // never resolves
    const loginPromise = useAuthStore.getState().login({ email: 'a@b.com', password: 'x' })
    expect(useAuthStore.getState().isLoading).toBe(true)
    loginPromise.catch(() => {})
  })

  it('sets authenticated state on success', async () => {
    authApi.login.mockResolvedValue({
      data: { data: { user: mockUserPayload, tokens: mockTokens } },
    })
    await useAuthStore.getState().login({ email: 'admin@securebank.com', password: 'pass' })
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUserPayload)
    expect(state.accessToken).toBe('access-abc')
    expect(state.isLoading).toBe(false)
  })

  it('stores tokens in localStorage on success', async () => {
    authApi.login.mockResolvedValue({
      data: { data: { user: mockUserPayload, tokens: mockTokens } },
    })
    await useAuthStore.getState().login({ email: 'x', password: 'y' })
    expect(localStorage.getItem('sb_access_token')).toBe('access-abc')
    expect(localStorage.getItem('sb_refresh_token')).toBe('refresh-xyz')
  })

  it('sets error and clears loading on failure', async () => {
    authApi.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })
    await expect(
      useAuthStore.getState().login({ email: 'bad', password: 'bad' })
    ).rejects.toBeDefined()
    const state = useAuthStore.getState()
    expect(state.error).toBe('Invalid credentials')
    expect(state.isLoading).toBe(false)
    expect(state.isAuthenticated).toBe(false)
  })

  it('uses fallback error message when response has no message', async () => {
    authApi.login.mockRejectedValue(new Error('Network error'))
    await expect(
      useAuthStore.getState().login({ email: 'x', password: 'y' })
    ).rejects.toBeDefined()
    expect(useAuthStore.getState().error).toBe('Invalid credentials')
  })
})

describe('authStore — logout', () => {
  it('clears all auth state', async () => {
    useAuthStore.setState({
      user: mockUserPayload,
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
      isAuthenticated: true,
    })
    localStorage.setItem('sb_access_token', 'access-abc')
    localStorage.setItem('sb_refresh_token', 'refresh-xyz')
    authApi.logout.mockResolvedValue({})

    await useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(localStorage.getItem('sb_access_token')).toBeNull()
  })
})

describe('authStore — clearError', () => {
  it('clears the error field', () => {
    useAuthStore.setState({ error: 'Some error' })
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })
})
