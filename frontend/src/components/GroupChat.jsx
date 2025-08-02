import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';

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

  // Faire défiler vers le bas
  const scrollToBottom = () => {
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

  // Scroll vers le bas
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      } 
      else {
        const isScrolledToBottom = 
          messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight <= 
          messagesContainerRef.current.scrollTop + 100;
        
        if (isScrolledToBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages, loading]);

  // Envoyer un nouveau message
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
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement des messages...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '70vh' }}>
      {error && <Alert variant="danger">{error}</Alert>}

      <div 
        ref={messagesContainerRef}
        className="flex-grow-1 overflow-auto mb-3 p-3 bg-light rounded"
        style={{ maxHeight: '100%' }}
      >
        {messages.length > 0 ? (
          <div>
            {messages.map(message => {
              const isMyMessage = message.userId === user.id;
              return (
                <div 
                  key={message.id} 
                  className={`mb-2 ${isMyMessage ? 'text-end' : ''}`}
                >
                  <Card 
                    className={`d-inline-block text-start ${isMyMessage ? 'bg-primary text-white' : ''}`}
                    style={{ 
                      maxWidth: '75%', 
                      borderRadius: '1rem',
                      backgroundColor: isMyMessage ? '#0d6efd' : '#f8f9fa'
                    }}
                  >
                    <Card.Body className="py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        {!isMyMessage && (
                          <small className="fw-bold">
                            {message.user?.name || message.user?.email || `Utilisateur #${message.userId}`}
                          </small>
                        )}
                        <small className={`text-${isMyMessage ? 'light' : 'muted'} ms-2`}>
                          {formatDate(message.createdAt)}
                        </small>
                      </div>
                      <div>{message.content}</div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <p className="text-center text-muted mt-4">Aucun message dans ce groupe.</p>
        )}
      </div>

      <Form onSubmit={handleSendMessage} className="d-flex">
        <Form.Control
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="me-2"
        />
        <Button type="submit" variant="primary">
          Envoyer
        </Button>
      </Form>
    </div>
  );
}

export default GroupChat;