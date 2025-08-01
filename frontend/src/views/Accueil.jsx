import { useAuth } from '../context/AuthContext';
import GroupList from '../components/GroupList';

function Accueil() {
  const { user, logout } = useAuth();

  return (
    <div className="accueil-container">
      <header className="user-header">
        <span>{user?.email}</span>
        <button onClick={logout} className="logout-btn">Se déconnecter</button>
      </header>
      
      <main>
        <h2>Mes groupes</h2>
        <GroupList />
      </main>
    </div>
  );
}

export default Accueil;