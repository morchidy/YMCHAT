const API_URL = 'http://localhost:3000';

const userService = {
  // Récupérer tous les utilisateurs
  async getAllUsers(token) {
    try {
      const response = await fetch(`http://localhost:3000/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { status: false, message: 'Erreur de connexion au serveur', data: [] };
    }
  }
};

export default userService;