import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Form, Button, Alert } from 'react-bootstrap'

function RegisterForm({ onRegisterSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()

  // Validation en temps réel
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validateForm = () => {
    if (!name) {
      setError('Le nom est requis')
      return false
    }
    if (!validateEmail(email)) {
      setError('Email invalide')
      return false
    }
    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return false
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    setError('')
    return true
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

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (value && !validatePassword(value)) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
    } else if (confirmPassword && value !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
    } else {
      setError('')
    }
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (value !== password) {
      setError('Les mots de passe ne correspondent pas')
    } else {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const result = await register(name, email, password)
    
    if (result.success) {
      // Vider le formulaire
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      
      // Informer le parent du succès de l'enregistrement
      onRegisterSuccess(email)
    } else {
      setError(result.message)
    }
  }

  return (
    <div>
      <h2 className="text-center mb-4">Enregistrez-vous</h2>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nom</Form.Label>
          <Form.Control 
            type="text" 
            id="register-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez votre nom"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            id="register-email" 
            value={email} 
            onChange={handleEmailChange}
            placeholder="Entrez votre email"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Mot de Passe</Form.Label>
          <Form.Control 
            type="password" 
            id="register-password" 
            value={password} 
            onChange={handlePasswordChange}
            placeholder="Mot de passe (au moins 6 caractères)"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Confirmez votre Mot de Passe</Form.Label>
          <Form.Control 
            type="password" 
            id="register-confirm-password" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange}
            placeholder="Confirmez votre mot de passe"
            required
          />
        </Form.Group>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="d-grid gap-2">
          <Button variant="primary" type="submit">
            S'enregistrer
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default RegisterForm