import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './views/Login'
import Accueil from './views/Accueil'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Chargement...</div>
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