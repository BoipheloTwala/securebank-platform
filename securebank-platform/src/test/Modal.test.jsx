import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Modal from '../components/ui/Modal'

function renderModal(props = {}) {
  const defaults = { open: true, onClose: vi.fn(), title: 'Test Modal', children: <p>Body</p> }
  return render(<Modal {...defaults} {...props} />)
}

describe('Modal', () => {
  it('renders when open=true', () => {
    renderModal()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('does not render when open=false', () => {
    renderModal({ open: false })
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('also accepts isOpen prop', () => {
    renderModal({ open: false, isOpen: true })
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = renderModal({ onClose })
    const backdrop = container.querySelector('.absolute.inset-0')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders footer when provided', () => {
    renderModal({ footer: <button>Confirm</button> })
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('does not render footer slot when not provided', () => {
    renderModal({ footer: undefined })
    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument()
  })

  it('applies lg size class', () => {
    const { container } = renderModal({ size: 'lg' })
    expect(container.querySelector('.max-w-2xl')).toBeInTheDocument()
  })
})
