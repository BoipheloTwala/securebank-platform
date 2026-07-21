import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: false,
      notifications: [],
      activeModal: null,
      modalData: null,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode
          document.documentElement.classList.toggle('dark', next)
          return { darkMode: next }
        }),

      openModal: (name, data = null) =>
        set({ activeModal: name, modalData: data }),

      closeModal: () =>
        set({ activeModal: null, modalData: null }),

      addNotification: (notification) =>
        set((s) => ({
          notifications: [
            { id: Date.now(), ...notification },
            ...s.notifications,
          ].slice(0, 50),
        })),

      removeNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'sb-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, darkMode: s.darkMode }),
    }
  )
)

export default useUIStore
