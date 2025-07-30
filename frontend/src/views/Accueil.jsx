import { useAuth } from '../context/AuthContext'

function Accueil() {
  const { user, logout } = useAuth()

  return (
    <div className="accueil-container">
      <header className="user-header">
        <span>{user?.email}</span>
        <button onClick={logout} className="logout-btn">Se déconnecter</button>
      </header>
      
      <main>
        <h2>Bienvenue sur votre espace</h2>
        <p>Vous êtes connecté en tant que {user?.email}</p>
      </main>
    </div>
  )
}

export default Accueil