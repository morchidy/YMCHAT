import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import GroupChat from '../components/GroupChat';
import CreateGroup from '../components/CreateGroup';
import GroupManager from '../components/GroupManager';

function Accueil() {
  const { user, token, logout } = useAuth();
  const [memberGroups, setMemberGroups] = useState([]);
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewMode, setViewMode] = useState('chat'); // 'chat' ou 'manage'
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token]);

  const handleGroupClick = (group, isOwned = false) => {
    setSelectedGroup(group);
    setViewMode(isOwned ? 'manage' : 'chat');
    setSidebarOpen(false); // Fermer la sidebar sur mobile après sélection
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="chat-layout">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="mobile-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
          <div className="chat-brand">YMCHAT</div>
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || user?.email}</span>
          <button onClick={logout} className="logout-btn">Log out</button>
        </div>
      </div>

      <div className="chat-container">
        {/* Overlay pour fermer la sidebar sur mobile */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        ></div>

        {/* Sidebar pour les groupes */}
        <div className={`chat-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="search-container">
            <input type="text" placeholder="Search" className="search-input" />
            <button className="search-btn">
              <i className="bi bi-search"></i>
            </button>
          </div>

          <div className="group-section">
            <h3>Ceux dont je suis membre</h3>
            <ul className="group-list">
              {memberGroups.map((group) => (
                <li 
                  key={group.id} 
                  className={`group-item ${selectedGroup?.id === group.id && viewMode === 'chat' ? 'active' : ''}`}
                  onClick={() => handleGroupClick(group)}
                >
                  <div className="group-avatar">{(group.name || "").charAt(0).toUpperCase()}</div>
                  <div className="group-info">
                    <div className="group-name">{group.name || "Groupe sans nom"}</div>
                    <div className="group-preview">Cliquez pour voir les messages</div>
                  </div>
                </li>
              ))}
              {memberGroups.length === 0 && (
                <li className="no-groups">Vous n'êtes membre d'aucun groupe</li>
              )}
            </ul>
          </div>

          <div className="group-section">
            <h3>Ceux que j'administre</h3>
            <ul className="group-list">
              {ownedGroups.map((group) => (
                <li 
                  key={group.id} 
                  className={`group-item ${selectedGroup?.id === group.id && viewMode === 'manage' ? 'active' : ''}`}
                  onClick={() => handleGroupClick(group, true)}
                >
                  <div className="group-avatar admin">{(group.name || "").charAt(0).toUpperCase()}</div>
                  <div className="group-info">
                    <div className="group-name">{group.name || "Groupe sans nom"}</div>
                    <div className="group-preview">Vous administrez ce groupe</div>
                  </div>
                </li>
              ))}
              {ownedGroups.length === 0 && (
                <li className="no-groups">Vous n'administrez aucun groupe</li>
              )}
            </ul>
          </div>

          <div className="create-group-container">
            <CreateGroup onGroupCreated={fetchGroups} />
          </div>
        </div>

        {/* Zone principale pour les messages ou gestion de groupe */}
        <div className="chat-main">
          {selectedGroup ? (
            viewMode === 'chat' ? (
              <div className="chat-content">
                <div className="chat-content-header">
                  <h3>Discussion sur le groupe {selectedGroup.name}</h3>
                  <div className="chat-actions">
                    <button className="settings-btn">
                      <i className="bi bi-gear"></i>
                    </button>
                  </div>
                </div>
                <GroupChat group={selectedGroup} />
              </div>
            ) : (
              <GroupManager 
                group={selectedGroup} 
                onBack={() => setSelectedGroup(null)}
              />
            )
          ) : (
            <div className="select-conversation">
              <div className="empty-state">
                <i className="bi bi-chat-dots"></i>
                <h3>Sélectionnez un groupe pour commencer à discuter</h3>
                <p>Ou créez un nouveau groupe à partir de la barre latérale</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Accueil;