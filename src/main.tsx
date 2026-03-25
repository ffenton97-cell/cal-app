import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { seedIfNeeded } from './seed.js'

seedIfNeeded()
  .catch(err => console.error('[FieldLog] Seed failed, continuing anyway:', err))
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
