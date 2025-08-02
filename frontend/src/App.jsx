import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './views/Login'
import Accueil from './views/Accueil'
import { Container, Spinner } from 'react-bootstrap'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </div>
    )
  }

  return user ? <Accueil /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App