import { describe, it, expect, beforeEach } from 'vitest'
import useUIStore from '../store/uiStore'

// Reset store state between tests
beforeEach(() => {
  useUIStore.setState({
    sidebarCollapsed: false,
    darkMode: false,
    notifications: [],
    activeModal: null,
    modalData: null,
  })
})

describe('uiStore — sidebar', () => {
  it('starts with sidebar expanded', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })

  it('toggleSidebar collapses the sidebar', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })

  it('toggleSidebar expands when called again', () => {
    useUIStore.getState().toggleSidebar()
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
  })
})

describe('uiStore — modal', () => {
  it('starts with no active modal', () => {
    expect(useUIStore.getState().activeModal).toBeNull()
  })

  it('openModal sets the modal name', () => {
    useUIStore.getState().openModal('create-risk')
    expect(useUIStore.getState().activeModal).toBe('create-risk')
  })

  it('openModal sets modal data', () => {
    useUIStore.getState().openModal('edit-risk', { id: '42' })
    expect(useUIStore.getState().modalData).toEqual({ id: '42' })
  })

  it('closeModal clears name and data', () => {
    useUIStore.getState().openModal('edit-risk', { id: '42' })
    useUIStore.getState().closeModal()
    expect(useUIStore.getState().activeModal).toBeNull()
    expect(useUIStore.getState().modalData).toBeNull()
  })
})

describe('uiStore — notifications', () => {
  it('starts with empty notifications', () => {
    expect(useUIStore.getState().notifications).toHaveLength(0)
  })

  it('addNotification prepends a notification', () => {
    useUIStore.getState().addNotification({ message: 'Hello' })
    const { notifications } = useUIStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].message).toBe('Hello')
  })

  it('addNotification assigns an id', () => {
    useUIStore.getState().addNotification({ message: 'Test' })
    expect(useUIStore.getState().notifications[0].id).toBeDefined()
  })

  it('removeNotification removes by id', () => {
    useUIStore.getState().addNotification({ message: 'A' })
    const id = useUIStore.getState().notifications[0].id
    useUIStore.getState().removeNotification(id)
    expect(useUIStore.getState().notifications).toHaveLength(0)
  })

  it('clearNotifications empties the array', () => {
    useUIStore.getState().addNotification({ message: 'A' })
    useUIStore.getState().addNotification({ message: 'B' })
    useUIStore.getState().clearNotifications()
    expect(useUIStore.getState().notifications).toHaveLength(0)
  })

  it('caps notifications at 50', () => {
    for (let i = 0; i < 55; i++) {
      useUIStore.getState().addNotification({ message: `n${i}` })
    }
    expect(useUIStore.getState().notifications).toHaveLength(50)
  })
})
