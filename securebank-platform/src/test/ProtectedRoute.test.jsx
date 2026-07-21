import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import useAuthStore from '../store/authStore'

// Stub out heavy layout children so tests stay fast
vi.mock('../components/layout/Sidebar', () => ({
  default: () => <nav data-testid="sidebar" />,
}))
vi.mock('../components/layout/Header', () => ({
  default: ({ title }) => <header data-testid="header">{title}</header>,
}))

function renderWithRouter(isAuthenticated) {
  useAuthStore.setState({ isAuthenticated })
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<main>Protected content</main>} />
        </Route>
        <Route path="/login" element={<main>Login page</main>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  useAuthStore.setState({ isAuthenticated: false })
})

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithRouter(false)
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders the outlet when authenticated', () => {
    renderWithRouter(true)
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('renders the sidebar when authenticated', () => {
    renderWithRouter(true)
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders the header when authenticated', () => {
    renderWithRouter(true)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })
})
