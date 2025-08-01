import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';

function GroupChat({ group }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Charger les messages du groupe
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getGroupMessages(token, group.id);
      if (response.status) {
        // Trier les messages par date (du plus ancien au plus récent)
        const sortedMessages = [...(response.data || [])].sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        setMessages(sortedMessages);
      } else {
        setError('Erreur lors de la récupération des messages');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (token && group) {
      fetchMessages();
    }
  }, [token, group]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Envoyer un nouveau message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await messageService.sendMessage(token, group.id, newMessage);
      if (response.status) {
        setNewMessage('');
        fetchMessages(); // Recharger les messages pour voir le nouveau message
      } else {
        setError(response.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Chargement des messages...</div>;
  }

  return (
    <div className="group-chat">
      <div className="chat-header">
        <h3>Messages du groupe "{group.name}"</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {messages.length > 0 ? (
          <ul className="messages-list">
            {messages.map(message => (
              <li 
                key={message.id} 
                className={`message-item ${message.userId === user.id ? 'my-message' : ''}`}
              >
                <div className="message-header">
                  <strong>
                    {message.user?.name || message.user?.email || `Utilisateur #${message.userId}`}
                  </strong>
                  <span className="message-time">{formatDate(message.createdAt)}</span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        ) : (
          <p className="no-messages">Aucun message dans ce groupe.</p>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
        />
        <button type="submit" className="send-btn">Envoyer</button>
      </form>
    </div>
  );
}

export default GroupChat;