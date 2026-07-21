import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge, { RiskLevelBadge } from '../components/ui/Badge'

describe('Badge', () => {
  it('renders the label', () => {
    render(<Badge label="Critical" variant="critical" />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('applies correct variant class for critical', () => {
    const { container } = render(<Badge label="Critical" variant="critical" />)
    expect(container.firstChild).toHaveClass('bg-red-50')
  })
})

describe('RiskLevelBadge', () => {
  it('shows Critical for score >= 20', () => {
    render(<RiskLevelBadge likelihood={4} impact={5} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('shows Low for score between 3 and 5', () => {
    render(<RiskLevelBadge likelihood={1} impact={3} />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('shows Minimal for score < 3', () => {
    render(<RiskLevelBadge likelihood={1} impact={1} />)
    expect(screen.getByText('Minimal')).toBeInTheDocument()
  })
})
