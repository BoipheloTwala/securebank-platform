import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Input, { Select } from '../components/ui/Input'

describe('Input', () => {
  it('renders without label by default', () => {
    render(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows required asterisk when required prop is set', () => {
    render(<Input label="Name" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('shows helper text when no error', () => {
    render(<Input helper="Enter your email" />)
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(<Input helper="Help" error="Error" />)
    expect(screen.queryByText('Help')).not.toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('applies error border class when error is set', () => {
    render(<Input error="Bad" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-400')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('fires onChange event', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders icon container when icon is provided', () => {
    const Icon = () => <svg data-testid="search-icon" />
    render(<Input icon={Icon} />)
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })
})

describe('Select', () => {
  it('renders select element', () => {
    render(
      <Select label="Status">
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </Select>
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders label', () => {
    render(<Select label="Category"><option>A</option></Select>)
    expect(screen.getByText('Category')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Select error="Required"><option>A</option></Select>)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(
      <Select>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>
    )
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})
