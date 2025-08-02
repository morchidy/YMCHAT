import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import CreateGroup from './CreateGroup';
import GroupManager from './GroupManager';
import GroupChat from './GroupChat';
import { Card, ListGroup, Button, Spinner, Alert } from 'react-bootstrap';

function GroupList() {
  const { token } = useAuth();
  const [memberGroups, setMemberGroups] = useState([]);
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMemberGroup, setSelectedMemberGroup] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Récupérer les groupes dont l'utilisateur est membre
      const memberResponse = await groupService.getGroupsMember(token);
      
      if (memberResponse.status) {
        setMemberGroups(memberResponse.data || []);
      } else {
        setError('Erreur lors de la récupération des groupes membres');
      }
      
      // Récupérer les groupes dont l'utilisateur est propriétaire
      const ownedResponse = await groupService.getMyGroups(token);
      
      if (ownedResponse.status) {
        setOwnedGroups(ownedResponse.data || []);
      } else {
        setError('Erreur lors de la récupération des groupes administrés');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token]);

  // Gérer la sélection d'un groupe à administrer
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setViewMode('manage');
  };

  // Gérer la sélection d'un groupe dont l'utilisateur est membre
  const handleMemberGroupClick = (group) => {
    setSelectedMemberGroup(group);
    setViewMode('view');
  };

  // Retour à la liste des groupes
  const handleBackToList = () => {
    setSelectedGroup(null);
    setSelectedMemberGroup(null);
    setViewMode('list');
    // Rafraîchir les groupes après modifications
    fetchGroups();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement des groupes...</span>
        </Spinner>
      </div>
    );
  }

  // Si un groupe est sélectionné pour être administré
  if (viewMode === 'manage' && selectedGroup) {
    return <GroupManager group={selectedGroup} onBack={handleBackToList} />;
  }

  // Si un groupe est sélectionné pour voir ses messages
  if (viewMode === 'view' && selectedMemberGroup) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="secondary" onClick={handleBackToList}>
            <i className="bi bi-arrow-left"></i> Retour
          </Button>
          <h3 className="mt-3">Messages du groupe "{selectedMemberGroup.name}"</h3>
        </div>
        <GroupChat group={selectedMemberGroup} />
      </div>
    );
  }

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header as="h5">Ceux dont je suis membre</Card.Header>
        <Card.Body>
          {memberGroups && memberGroups.length > 0 ? (
            <ListGroup>
              {memberGroups.map((group, index) => (
                <ListGroup.Item 
                  key={group.id || `member-${index}`} 
                  action
                  onClick={() => handleMemberGroupClick(group)}
                >
                  {group.name || "Groupe sans nom"}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">Vous n'êtes membre d'aucun groupe.</p>
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header as="h5">Ceux que j'administre</Card.Header>
        <Card.Body>
          {ownedGroups && ownedGroups.length > 0 ? (
            <ListGroup>
              {ownedGroups.map((group, index) => (
                <ListGroup.Item 
                  key={group.id || `owner-${index}`} 
                  action
                  onClick={() => handleGroupClick(group)}
                >
                  {group.name || "Groupe sans nom"}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">Vous n'administrez aucun groupe.</p>
          )}
        </Card.Body>
      </Card>
      
      <CreateGroup onGroupCreated={fetchGroups} />
    </div>
  );
}

export default GroupList;