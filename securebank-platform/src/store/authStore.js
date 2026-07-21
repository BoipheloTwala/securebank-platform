import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/auth'
import { mockUser } from '../api/mock/data'

const MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          if (MOCK) {
            // Mock login — accept any credentials
            await new Promise((r) => setTimeout(r, 600))
            const fakeTokens = { access: 'mock-access-token', refresh: 'mock-refresh-token' }
            localStorage.setItem('sb_access_token', fakeTokens.access)
            localStorage.setItem('sb_refresh_token', fakeTokens.refresh)
            set({
              user: mockUser,
              accessToken: fakeTokens.access,
              refreshToken: fakeTokens.refresh,
              isAuthenticated: true,
              isLoading: false,
            })
            return
          }

          const { data } = await authApi.login(credentials)
          // API returns: { success, data: { user, tokens: { accessToken, refreshToken, expiresIn } }, message }
          const { user, tokens } = data.data
          localStorage.setItem('sb_access_token', tokens.accessToken)
          localStorage.setItem('sb_refresh_token', tokens.refreshToken)
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          const message =
            err.response?.data?.message ||
            (err.code === 'ERR_NETWORK' || !err.response
              ? 'Cannot reach the API — is it running on port 3000?'
              : 'Invalid credentials')
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get()
          if (!MOCK && refreshToken) await authApi.logout(refreshToken)
        } finally {
          localStorage.removeItem('sb_access_token')
          localStorage.removeItem('sb_refresh_token')
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'sb-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
