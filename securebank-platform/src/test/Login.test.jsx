import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  )
}

describe('Login page', () => {
  it('renders the form fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/analyst@securebank.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('fills username and password', async () => {
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/analyst@securebank.com/i), {
      target: { value: 'test@securebank.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    expect(screen.getByPlaceholderText(/analyst@securebank.com/i).value).toBe('test@securebank.com')
  })
})
