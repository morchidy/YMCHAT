import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

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
    <div className="form-container">
      <h2>Enregistrez-vous</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-name">Nom</label>
          <input 
            type="text" 
            id="register-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input 
            type="email" 
            id="register-email" 
            value={email} 
            onChange={handleEmailChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="register-password">Mot de Passe</label>
          <input 
            type="password" 
            id="register-password" 
            value={password} 
            onChange={handlePasswordChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="register-confirm-password">Confirmez votre Mot de Passe</label>
          <input 
            type="password" 
            id="register-confirm-password" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit">S'enregistrer</button>
      </form>
    </div>
  )
}

export default RegisterForm