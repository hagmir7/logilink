import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx';

import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/400.css"; // Specify weight
import "@fontsource/inter/400-italic.css"; // Specify weight and style

createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <Router>
    <AuthProvider>
     
        <App />
      
    </AuthProvider>
    </Router>

  </StrictMode>,
)
