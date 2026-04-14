// Controller: Application entry point and root rendering logic
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './views/index.css'
import App from './views/App.jsx'
import { AuthProvider } from './models/context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)