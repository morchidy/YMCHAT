import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import userService from '../services/userService';
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

  if (loading) {
    return <div className="loading">Chargement des membres...</div>;
  }

  // Filtrer les utilisateurs qui ne sont pas déjà membres
  const availableUsers = allUsers.filter(
    u => !members.some(m => m.id === u.id)
  );

   // Fonction pour changer d'onglet
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="group-manager">
      <div className="manager-header">
        <button onClick={onBack} className="back-btn">Retour</button>
        <h2>Groupe "{group.name}"</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => changeTab('members')}
        >
          Membres
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => changeTab('chat')}
        >
          Messages
        </button>
      </div>

      {activeTab === 'members' ? (
        <>
          <div className="add-member-section">
            <h3>Ajouter un membre</h3>
            <form onSubmit={handleAddMember} className="add-member-form">
              {/* Votre code existant pour l'ajout de membres */}
              <select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="user-select"
              >
                <option value="">Sélectionnez un utilisateur</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              <button type="submit" className="add-btn">Ajouter</button>
            </form>
          </div>

          <div className="members-section">
            <h3>Liste des membres</h3>
            {members.length > 0 ? (
              <ul className="members-list">
                {members.map(member => (
                  <li key={member.id} className="member-item">
                    <span>{member.email}</span>
                    <button 
                      onClick={() => handleRemoveMember(member.id)} 
                      className="remove-btn"
                      disabled={member.id === user.id}
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun membre dans ce groupe.</p>
            )}
          </div>
        </>
      ) : (
        <GroupChat group={group} />
      )}
    </div>
  );
}

export default GroupManager;