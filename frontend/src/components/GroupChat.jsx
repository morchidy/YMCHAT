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
  const messagesContainerRef = useRef(null);
  const intervalRef = useRef(null); // Référence pour stocker l'intervalle
  const lastMessageIdRef = useRef(null); // Pour suivre le dernier ID de message
  const initialScrollDoneRef = useRef(false); // Pour suivre si le premier scroll a été fait

  // Charger les messages du groupe
  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await messageService.getGroupMessages(token, group.id);
      if (response.status) {
        // Trier les messages par date (du plus ancien au plus récent)
        const sortedMessages = [...(response.data || [])].sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        // Vérifier s'il y a de nouveaux messages
        const hasNewMessages = sortedMessages.length > 0 && 
                             (!lastMessageIdRef.current || 
                              sortedMessages[sortedMessages.length - 1].id > lastMessageIdRef.current);
        
        // Mettre à jour les messages seulement s'il y a des changements
        if (hasNewMessages || messages.length === 0) {
          setMessages(sortedMessages);
          
          // Mémoriser l'ID du dernier message
          if (sortedMessages.length > 0) {
            lastMessageIdRef.current = sortedMessages[sortedMessages.length - 1].id;
          }
        }
      } else {
        if (!silent) setError('Erreur lors de la récupération des messages');
      }
    } catch (err) {
      if (!silent) setError('Erreur de connexion au serveur');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Faire défiler vers le bas mais seulement après le premier chargement ou lors de nouveaux messages
  const scrollToBottom = () => {
    // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    });
  };

  // Chargement initial des messages
  useEffect(() => {
    if (token && group) {
      fetchMessages();
      
      // Configurer la mise à jour automatique toutes les 5 secondes
      intervalRef.current = setInterval(() => {
        fetchMessages(true); // Mettre silent à true pour éviter de montrer le chargement
      }, 5000);
      
      // Nettoyer l'intervalle lors du démontage du composant
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        initialScrollDoneRef.current = false; // Réinitialiser pour le prochain montage
      };
    }
  }, [token, group]);

  // Scroll vers le bas uniquement lorsque les messages sont chargés la première fois
  // ou lorsqu'un nouveau message est ajouté
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      // Si c'est le chargement initial et qu'on n'a pas encore défilé
      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        
        // Placer directement la barre de défilement en bas sans animation
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      } 
      // Sinon, si on ajoute un nouveau message et que l'utilisateur est déjà en bas
      else {
        const isScrolledToBottom = 
          messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight <= 
          messagesContainerRef.current.scrollTop + 100; // Tolérance de 100px
        
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages, loading]);

  // Envoyer un nouveau message sans recharger tous les messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await messageService.sendMessage(token, group.id, newMessage);
      if (response.status) {
        // Ajouter directement le nouveau message à la liste au lieu de recharger tous les messages
        const newMsg = response.data;
        
        // Ajouter les informations de l'utilisateur au message
        newMsg.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        
        // Mettre à jour l'état des messages en ajoutant le nouveau message
        setMessages(prevMessages => [...prevMessages, newMsg]);
        
        // Mettre à jour le dernier ID de message connu
        lastMessageIdRef.current = newMsg.id;
        
        // Effacer le champ de saisie
        setNewMessage('');
        
        // Défiler vers le bas après avoir envoyé un message
        scrollToBottom();
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

  if (loading && messages.length === 0) {
    return <div className="loading">Chargement des messages...</div>;
  }

  return (
    <div className="group-chat">
      <div className="chat-header">
        <h3>Messages du groupe "{group.name}"</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div 
        className="messages-container" 
        ref={messagesContainerRef}
        style={{ overflowY: 'auto', maxHeight: '400px' }} // S'assurer que le conteneur a une hauteur max
      >
        {messages.length > 0 ? (
          <ul className="messages-list">
            {messages.map(message => {
              const isMyMessage = message.userId === user.id;
              return (
                <li 
                  key={message.id} 
                  className={`message-item ${isMyMessage ? 'my-message' : ''}`}
                >
                  <div className="message-header">
                    {!isMyMessage && (
                      <strong>
                        {message.user?.name || message.user?.email || `Utilisateur #${message.userId}`}
                      </strong>
                    )}
                    <span className="message-time">{formatDate(message.createdAt)}</span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </li>
              );
            })}
            <div ref={messagesEndRef} style={{ height: '1px', visibility: 'hidden' }} />
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