import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import CreateGroup from './CreateGroup';
import GroupManager from './GroupManager';
import GroupChat from './GroupChat'; // Importez le composant GroupChat

function GroupList() {
  const { token } = useAuth();
  const [memberGroups, setMemberGroups] = useState([]);
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMemberGroup, setSelectedMemberGroup] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'manage', 'view'

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Récupérer les groupes dont l'utilisateur est membre
      const memberResponse = await groupService.getGroupsMember(token);
      console.log('Member groups response:', memberResponse);
      
      if (memberResponse.status) {
        // Si l'API renvoie des données, les utiliser
        setMemberGroups(memberResponse.data || []);
      } else {
        setError('Erreur lors de la récupération des groupes membres');
      }
      
      // Récupérer les groupes dont l'utilisateur est propriétaire
      const ownedResponse = await groupService.getMyGroups(token);
      console.log('Owned groups response:', ownedResponse);
      
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
    console.log('Groupe sélectionné pour administration:', group);
  };

  // Gérer la sélection d'un groupe dont l'utilisateur est membre
  const handleMemberGroupClick = (group) => {
    setSelectedMemberGroup(group);
    setViewMode('view');
    console.log('Groupe membre sélectionné pour visualisation:', group);
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
    return <div className="loading">Chargement des groupes...</div>;
  }

  // Si un groupe est sélectionné pour être administré
  if (viewMode === 'manage' && selectedGroup) {
    return <GroupManager group={selectedGroup} onBack={handleBackToList} />;
  }

  // Si un groupe est sélectionné pour voir ses messages
  if (viewMode === 'view' && selectedMemberGroup) {
    return (
      <div className="group-view">
        <div className="manager-header">
          <button onClick={handleBackToList} className="back-btn">Retour</button>
          <h2>Messages du groupe "{selectedMemberGroup.name}"</h2>
        </div>
        <GroupChat group={selectedMemberGroup} />
      </div>
    );
  }

  return (
    <div className="group-lists">
      {error && <div className="error-message">{error}</div>}
      
      <div className="group-section">
        <h3>Ceux dont je suis membre</h3>
        {memberGroups && memberGroups.length > 0 ? (
          <ul className="group-list">
            {memberGroups.map((group, index) => (
              <li 
                key={group.id || `member-${index}`} 
                className="group-item"
                onClick={() => handleMemberGroupClick(group)}
                style={{ cursor: 'pointer' }}
              >
                {group.name || <p style={{ color: '#000' }}>Groupe sans nom</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#ccc' }}>Vous n'êtes membre d'aucun groupe.</p>
        )}
      </div>
      
      <div className="group-section">
        <h3>Ceux que j'administre</h3>
        {ownedGroups && ownedGroups.length > 0 ? (
          <ul className="group-list">
            {ownedGroups.map((group, index) => (
              <li 
                key={group.id || `owner-${index}`} 
                className="group-item"
                onClick={() => handleGroupClick(group)}
                style={{ cursor: 'pointer' }}
              >
                {group.name || "Groupe sans nom"}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#ccc' }}>Vous n'administrez aucun groupe.</p>
        )}
      </div>
      
      <CreateGroup onGroupCreated={fetchGroups} />
    </div>
  );
}

export default GroupList;