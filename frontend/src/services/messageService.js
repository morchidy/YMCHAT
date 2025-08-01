const API_URL = 'http://localhost:3000';

const messageService = {
  // Récupérer les messages d'un groupe
  async getGroupMessages(token, groupId) {
    try {
      const response = await fetch(`${API_URL}/api/messages/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return { status: false, message: 'Erreur de connexion au serveur', data: [] };
    }
  },

  // Envoyer un message dans un groupe
  async sendMessage(token, groupId, content) {
    try {
      const response = await fetch(`${API_URL}/api/messages/${groupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return { status: false, message: 'Erreur de connexion au serveur' };
    }
  }
};

export default messageService;