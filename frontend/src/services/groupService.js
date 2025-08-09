const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const groupService = {
  // Récupérer les groupes dont l'utilisateur est propriétaire
  async getMyGroups(token) {
    try {
      const response = await fetch(`${API_URL}/api/mygroups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      return { status: false, message: 'Erreur de connexion au serveur', data: [] };
    }
  },

  // Récupérer les groupes dont l'utilisateur est membre
  async getGroupsMember(token) {
    try {
      const response = await fetch(`${API_URL}/api/groupsmember`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching member groups:', error);
      return { status: false, message: 'Erreur de connexion au serveur', data: [] };
    }
  },

  // Créer un nouveau groupe
  async createGroup(token, name) {
    try {
      const response = await fetch(`${API_URL}/api/mygroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      return { status: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // Récupérer les membres d'un groupe
  async getGroupMembers(token, groupId) {
    try {
      const response = await fetch(`${API_URL}/api/mygroups/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching group members:', error);
      return { status: false, message: 'Erreur de connexion au serveur', data: [] };
    }
  },

  // Ajouter un utilisateur à un groupe
  async addUserToGroup(token, groupId, userId) {
    try {
      const response = await fetch(`${API_URL}/api/mygroups/${groupId}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding user to group:', error);
      return { status: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // Supprimer un utilisateur d'un groupe
  async removeUserFromGroup(token, groupId, userId) {
    try {
      const response = await fetch(`${API_URL}/api/mygroups/${groupId}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing user from group:', error);
      return { status: false, message: 'Erreur de connexion au serveur' };
    }
  }
};

export default groupService;