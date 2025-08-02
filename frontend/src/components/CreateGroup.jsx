import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import { Card, Form, Button, Alert } from 'react-bootstrap';

function CreateGroup({ onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await groupService.createGroup(token, groupName);
      
      if (result.status) {
        setGroupName('');
        if (onGroupCreated) {
          onGroupCreated();
        }
      } else {
        setError(result.message || 'Erreur lors de la création du groupe');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header as="h5">Créer un nouveau groupe</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="d-flex">
            <Form.Control 
              type="text" 
              placeholder="Nom du nouveau groupe" 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)}
              disabled={loading}
              className="me-2"
            />
            <Button 
              type="submit" 
              disabled={loading}
              variant="success"
            >
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </Form.Group>
          {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
        </Form>
      </Card.Body>
    </Card>
  );
}

export default CreateGroup;