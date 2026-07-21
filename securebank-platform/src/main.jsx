import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

// Restore dark mode preference on boot
const darkMode = JSON.parse(localStorage.getItem('sb-ui') || '{}')?.state?.darkMode
if (darkMode) document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
