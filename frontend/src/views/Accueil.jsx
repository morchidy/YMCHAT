import { useAuth } from '../context/AuthContext';
import GroupList from '../components/GroupList';
import { Container, Navbar, Button } from 'react-bootstrap';

function Accueil() {
  const { user, logout } = useAuth();

  return (
    <div>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Réseau Social</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-3">
              Connecté en tant que: {user?.email}
            </Navbar.Text>
            <Button variant="outline-light" onClick={logout} size="sm">
              Se déconnecter
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container>
        <h2 className="mb-4">Mes groupes</h2>
        <GroupList />
      </Container>
    </div>
  );
}

export default Accueil;