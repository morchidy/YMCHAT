import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

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
    <div className="form-container">
      <h2>Se Connecter</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input 
            type="email" 
            id="login-email" 
            value={email} 
            onChange={handleEmailChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="login-password">Mot de Passe</label>
          <input 
            type="password" 
            id="login-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit">Se Connecter</button>
      </form>
    </div>
  )
}

export default LoginForm