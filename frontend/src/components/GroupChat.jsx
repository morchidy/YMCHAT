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
  const intervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const initialScrollDoneRef = useRef(false);

  // Charger les messages du groupe
  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await messageService.getGroupMessages(token, group.id);
      if (response.status) {
        const sortedMessages = [...(response.data || [])].sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        const hasNewMessages = sortedMessages.length > 0 && 
                             (!lastMessageIdRef.current || 
                              sortedMessages[sortedMessages.length - 1].id > lastMessageIdRef.current);
        
        if (hasNewMessages || messages.length === 0) {
          setMessages(sortedMessages);
          
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

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (token && group) {
      fetchMessages();
      
      intervalRef.current = setInterval(() => {
        fetchMessages(true);
      }, 5000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        initialScrollDoneRef.current = false;
      };
    }
  }, [token, group]);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      } else {
        const isScrolledToBottom = 
          messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight <= 
          messagesContainerRef.current.scrollTop + 100;
        
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages, loading]);

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
        lastMessageIdRef.current = newMsg.id;
        setNewMessage('');
        scrollToBottom();
      } else {
        setError(response.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (err) {
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
                      {message.user?.email !== message.user?.name && message.user?.name && ` (${message.user.email})`}
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
          <i className="bi bi-cursor-fill"></i>
        </button>
      </form>
    </div>
  );
}

export default GroupChat;