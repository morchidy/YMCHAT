import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import groupService from '../services/groupService';
import { Button, Alert, Form, ListGroup, Card, Tabs, Tab, Spinner } from 'react-bootstrap';
import GroupChat from './GroupChat';

function GroupManager({ group, onBack }) {
  const { token, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('members'); 

  // Charger les membres du groupe
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await groupService.getGroupMembers(token, group.id);
      if (response.status) {
        setMembers(response.data || []);
      } else {
        setError('Erreur lors de la récupération des membres du groupe');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Charger tous les utilisateurs pour le menu déroulant
  const fetchAllUsers = async () => {
    try {
      const response = await userService.getAllUsers(token);
      if (response.status) {
        setAllUsers(response.data || []);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs', err);
    }
  };

  useEffect(() => {
    if (token && group) {
      fetchMembers();
      fetchAllUsers();
    }
  }, [token, group]);

  // Ajouter un membre
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      const response = await groupService.addUserToGroup(token, group.id, selectedUserId);
      if (response.status) {
        // Recharger la liste des membres
        fetchMembers();
        setSelectedUserId('');
      } else {
        setError(response.message || 'Erreur lors de l\'ajout du membre');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Supprimer un membre
  const handleRemoveMember = async (userId) => {
    try {
      const response = await groupService.removeUserFromGroup(token, group.id, userId);
      if (response.status) {
        // Mettre à jour la liste des membres
        setMembers(members.filter(member => member.id !== userId));
      } else {
        setError(response.message || 'Erreur lors de la suppression du membre');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Filtrer les utilisateurs qui ne sont pas déjà membres
  const availableUsers = allUsers.filter(
    u => !members.some(m => m.id === u.id)
  );

  if (loading && activeTab === 'members') {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 d-flex align-items-center">
        <Button variant="secondary" onClick={onBack} className="me-3">
          <i className="bi bi-arrow-left"></i> Retour
        </Button>
        <h2>Groupe "{group.name}"</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="members" title="Membres">
          <Card className="mb-4">
            <Card.Header as="h5">Ajouter un membre</Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddMember}>
                <Form.Group className="d-flex">
                  <Form.Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="me-2"
                  >
                    <option value="">Sélectionnez un utilisateur</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </Form.Select>
                  <Button type="submit" variant="primary">
                    Ajouter
                  </Button>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header as="h5">Liste des membres</Card.Header>
            <Card.Body>
              {members.length > 0 ? (
                <ListGroup>
                  {members.map(member => (
                    <ListGroup.Item 
                      key={member.id} 
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>{member.email}</span>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.id === user.id}
                      >
                        Supprimer
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">Aucun membre dans ce groupe.</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="chat" title="Messages">
          {/* Utiliser une div avec hauteur pour contenir le GroupChat */}
          <div className="admin-chat-container">
            <GroupChat 
              group={group} 
              key={`admin-chat-${group.id}`}
              isAdminView={true}  // Indiquer que c'est une vue d'admin
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default GroupManager;