import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';

function GroupChat({ group, isAdminView = false }) {  // Ajout du paramètre isAdminView
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastFetchedTimestampRef = useRef(null);
  const initialScrollDoneRef = useRef(false);

  // Charger les messages du groupe
  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await messageService.getGroupMessages(token, group.id);
      if (response.status) {
        // Toujours trier les messages par date (du plus ancien au plus récent)
        const sortedMessages = [...(response.data || [])].sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        setMessages(sortedMessages);
        
        if (sortedMessages.length > 0) {
          lastFetchedTimestampRef.current = new Date().getTime();
        }
      } else {
        if (!silent) setError('Erreur lors de la récupération des messages');
      }
    } catch (err) {
      console.error("Erreur fetchMessages:", err);
      if (!silent) setError('Erreur de connexion au serveur');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const scrollToBottom = (force = false) => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    });
  };

  // Effet pour charger les messages initiaux et configurer le polling
  useEffect(() => {
    if (token && group && group.id) {
      console.log(`Initialisation du chat pour le groupe ${group.id} (admin: ${isAdminView})`);
      
      // Nettoyer l'état précédent
      setMessages([]);
      setNewMessage('');
      setLoading(true);
      setError('');
      initialScrollDoneRef.current = false;
      lastFetchedTimestampRef.current = null;
      
      // Charger les messages
      fetchMessages();
      
      // Configurer le polling pour les mises à jour
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        fetchMessages(true);
      }, 3000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [token, group?.id, isAdminView]);

  // Effet pour gérer le défilement initial et lors des mises à jour
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      // Toujours défiler vers le bas lors du premier chargement et spécifiquement pour les groupes administrés
      if (!initialScrollDoneRef.current || isAdminView) {
        initialScrollDoneRef.current = true;
        scrollToBottom();
      } else {
        // Pour les mises à jour ultérieures, vérifier si l'utilisateur est déjà en bas
        const isScrolledToBottom = 
          messagesContainerRef.current && 
          (messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight <= 
          messagesContainerRef.current.scrollTop + 100);
        
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages, loading, isAdminView]);

  // Ajout d'un effet spécifique pour assurer le défilement dans la vue admin après le rendu
  useEffect(() => {
    if (isAdminView && messages.length > 0 && !loading) {
      // Utiliser un délai court pour s'assurer que le DOM a été mis à jour
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdminView, messages.length, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await messageService.sendMessage(token, group.id, newMessage);
      if (response.status) {
        const newMsg = response.data;
        
        newMsg.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        
        setMessages(prevMessages => [...prevMessages, newMsg]);
        setNewMessage('');
        scrollToBottom(true);
        
        setTimeout(() => fetchMessages(true), 300);
      } else {
        setError(response.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (err) {
      console.error("Erreur d'envoi:", err);
      setError('Erreur de connexion au serveur');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} / ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading && messages.length === 0) {
    return <div className="loading-messages">Chargement des messages...</div>;
  }

  return (
    <div className="messages-wrapper">
      <div 
        className="messages-container" 
        ref={messagesContainerRef}
      >
        {messages.length > 0 ? (
          messages.map(message => {
            const isMyMessage = message.userId === user.id;
            return (
              <div 
                key={message.id} 
                className={`message ${isMyMessage ? 'my-message' : 'other-message'}`}
              >
                {!isMyMessage && (
                  <div className="message-avatar">
                    {message.user?.name?.charAt(0) || message.user?.email?.charAt(0) || '?'}
                  </div>
                )}
                <div className="message-content">
                  {!isMyMessage && (
                    <div className="message-sender">
                      {message.user?.name || message.user?.email || `Utilisateur #${message.userId}`}
                    </div>
                  )}
                  <div className="message-bubble">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">{formatDate(message.createdAt)}</div>
                  </div>
                </div>
                {isMyMessage && (
                  <div className="message-status">
                    <span className="delivered">Delivered</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-messages">Aucun message dans ce groupe.</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Enter message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
        />
        <div className="message-counter">{newMessage.length}/700</div>
        <button type="submit" className="send-button">
          <i className="bi bi-arrow-right-short" style={{fontSize: "1.5rem"}}></i>
        </button>
      </form>
    </div>
  );
}

export default GroupChat;