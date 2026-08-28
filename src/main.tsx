import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

// The static SEO fallback in index.html lives inside #root and is replaced
// here once React takes over (spec §9).
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
