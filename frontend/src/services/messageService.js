const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const messageService = {
  // Récupérer les messages d'un groupe
  async getGroupMessages(token, groupId) {
    try {
      // Ajout d'un paramètre timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/api/messages/${groupId}?_=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Si nous avons des données, nous trions les messages
      if (data.status && Array.isArray(data.data)) {
        // Trier les messages du plus ancien au plus récent
        data.data = this.sortMessages(data.data);
      }
      
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
  },
  
  // Fonction utilitaire pour trier les messages
  sortMessages(messages) {
    if (!Array.isArray(messages)) return [];
    
    return [...messages].sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }
};

export default messageService;