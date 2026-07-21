import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Table, { Pagination } from '../components/ui/Table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
]

const data = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
]

describe('Table', () => {
  it('renders column headers', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows empty message when data is empty', () => {
    render(<Table columns={columns} data={[]} />)
    expect(screen.getByText('No records found.')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('calls onRowClick with the row when a row is clicked', () => {
    const onRowClick = vi.fn()
    render(<Table columns={columns} data={data} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('Alice'))
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('uses custom render function for a column', () => {
    const cols = [
      { key: 'name', label: 'Name', render: (val) => <strong>{val.toUpperCase()}</strong> },
    ]
    render(<Table columns={cols} data={data} />)
    expect(screen.getByText('ALICE')).toBeInTheDocument()
  })
})

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders page info and buttons', () => {
    render(<Pagination page={2} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByText(/page/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('disables Previous on first page', () => {
    render(<Pagination page={1} totalPages={3} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables Next on last page', () => {
    render(<Pagination page={3} totalPages={3} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('calls onChange with page - 1 when Previous is clicked', () => {
    const onChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('calls onChange with page + 1 when Next is clicked', () => {
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
