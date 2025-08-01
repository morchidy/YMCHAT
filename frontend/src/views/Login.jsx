import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

function Login() {
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleRegisterSuccess = (email) => {
    setRegisteredEmail(email)
  }

  return (
    <div className="login-view">
      <h1>Réseau Social</h1>
      
      <div className="auth-container">
        <div className="auth-form">
          <LoginForm prefillEmail={registeredEmail} />
        </div>
        
        <div className="auth-form">
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </div>
      </div>
    </div>
  )
}

export default Login