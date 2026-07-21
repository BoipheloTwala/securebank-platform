import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card, { CardHeader } from '../components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Content</p></Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies padding by default', () => {
    const { container } = render(<Card>Padded</Card>)
    expect(container.firstChild).toHaveClass('p-5')
  })

  it('omits padding when padding=false', () => {
    const { container } = render(<Card padding={false}>No pad</Card>)
    expect(container.firstChild).not.toHaveClass('p-5')
  })

  it('applies hover class when hover=true', () => {
    const { container } = render(<Card hover>Hoverable</Card>)
    expect(container.firstChild).toHaveClass('cursor-pointer')
  })

  it('accepts extra className', () => {
    const { container } = render(<Card className="extra-class">x</Card>)
    expect(container.firstChild).toHaveClass('extra-class')
  })
})

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="My Title" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<CardHeader title="T" subtitle="Sub text" />)
    expect(screen.getByText('Sub text')).toBeInTheDocument()
  })

  it('does not render subtitle element when omitted', () => {
    render(<CardHeader title="T" />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('renders action slot', () => {
    render(<CardHeader title="T" action={<button>Action</button>} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})
