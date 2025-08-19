import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { App } from './routes/App'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
