import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Form, Button, Alert } from 'react-bootstrap'

function LoginForm({ prefillEmail = '' }) {
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  useEffect(() => {
    setEmail(prefillEmail)
  }, [prefillEmail])

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setError('Email invalide')
    } else {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      setError('Email invalide')
      return
    }
    
    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="auth-form login-form">
      <h2>Se Connecter</h2>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            id="login-email" 
            value={email} 
            onChange={handleEmailChange}
            placeholder="Entrez votre email"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label>Mot de Passe</Form.Label>
          <Form.Control 
            type="password" 
            id="login-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            required
          />
        </Form.Group>
        
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        
        <div className="d-grid">
          <Button variant="primary" type="submit" size="lg">
            Se Connecter
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default LoginForm