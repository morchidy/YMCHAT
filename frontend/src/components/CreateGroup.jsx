import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';

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
    <div className="create-group">
      <form onSubmit={handleSubmit} className="create-group-form">
        <input
          type="text"
          placeholder="nom du nouveau groupe"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={loading}
          className="create-group-input"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="create-group-btn"
        >
          Créer
        </button>
      </form>
      {error && <div className="create-group-error">{error}</div>}
    </div>
  );
}

export default CreateGroup;