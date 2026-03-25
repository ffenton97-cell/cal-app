import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { seedIfNeeded } from './seed.js'

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#f87171', fontFamily: 'monospace', background: '#0f0f0f', minHeight: '100vh' }}>
          <strong>Render error</strong><br />
          {String(this.state.error)}
        </div>
      )
    }
    return this.props.children
  }
}

seedIfNeeded()
  .catch(err => console.error('[FieldLog] Seed failed, continuing anyway:', err))
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  })
