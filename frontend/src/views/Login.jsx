import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import chatBubbleIcon from '../assets/chat-bubble.svg'

function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'

  // Login form state
  const [lEmail, setLEmail] = useState('')
  const [lPassword, setLPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Register form state
  const [rName, setRName] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rPassword2, setRPassword2] = useState('')
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')

  const switchMode = (to) => {
    setMode(to)
    setLoginError('')
    setRegError('')
    setRegSuccess('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const ok = await login(lEmail.trim(), lPassword)
      if (!ok) setLoginError('Identifiants invalides.')
    } catch {
      setLoginError('Erreur de connexion.')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')
    
    if (rPassword !== rPassword2) {
      setRegError('Les mots de passe ne correspondent pas.')
      return
    }
    if (rPassword.length < 6) {
      setRegError('Mot de passe trop court (minimum 6 caractères).')
      return
    }
    
    try {
      const ok = await register(rName.trim(), rEmail.trim(), rPassword)
      if (ok) {
        setRegSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        setTimeout(() => {
          setMode('login')
          setLEmail(rEmail)
          setRegSuccess('')
        }, 2000)
      } else {
        setRegError('Impossible de créer le compte. Vérifiez vos informations.')
      }
    } catch (error) {
      setRegError('Erreur serveur. Veuillez réessayer.')
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-bg">
        <div className="bg-overlay" />
        <div className="bg-pattern" />
      </div>

      <div className="login-content">
        {/* Section Branding */}
        <section className="brand-side">
          <div className="brand-inner">
            <img src={chatBubbleIcon} alt="YMCHAT Logo" className="brand-logo" />
            <h1 className="brand-title">YMCHAT</h1>
            <p className="brand-tagline">
              Connectez-vous avec vos amis et échangez en temps réel dans un environnement sécurisé.
            </p>
          </div>
        </section>

        {/* Section Formulaire */}
        <section className="form-side">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={mode === 'login' ? 'tab active' : 'tab'}
                onClick={() => switchMode('login')}
                type="button"
              >
                Connexion
              </button>
              <button
                className={mode === 'register' ? 'tab active' : 'tab'}
                onClick={() => switchMode('register')}
                type="button"
              >
                Inscription
              </button>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="auth-form">
                <h2 className="form-title">Se connecter</h2>
                
                <div className="form-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                    placeholder="Entrez votre adresse email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Mot de passe</label>
                  <input
                    id="login-password"
                    type="password"
                    value={lPassword}
                    onChange={(e) => setLPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                    autoComplete="current-password"
                  />
                </div>

                {loginError && (
                  <div className="alert error" role="alert">
                    {loginError}
                  </div>
                )}

                <button className="btn primary full" type="submit">
                  Se connecter
                </button>

                <div className="switch-text">
                  Pas encore de compte ?
                  <span onClick={() => switchMode('register')} role="button" tabIndex={0}>
                    Créer un compte
                  </span>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="auth-form">
                <h2 className="form-title">Créer un compte</h2>
                
                <div className="form-group">
                  <label htmlFor="register-name">Nom d'utilisateur</label>
                  <input
                    id="register-name"
                    type="text"
                    value={rName}
                    onChange={(e) => setRName(e.target.value)}
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    placeholder="Entrez votre adresse email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">Mot de passe</label>
                  <input
                    id="register-password"
                    type="password"
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password2">Confirmer le mot de passe</label>
                  <input
                    id="register-password2"
                    type="password"
                    value={rPassword2}
                    onChange={(e) => setRPassword2(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {regError && (
                  <div className="alert error" role="alert">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="alert success" role="alert">
                    {regSuccess}
                  </div>
                )}

                <button className="btn success full" type="submit">
                  Créer mon compte
                </button>

                <div className="switch-text">
                  Déjà inscrit ?
                  <span onClick={() => switchMode('login')} role="button" tabIndex={0}>
                    Se connecter
                  </span>
                </div>
              </form>
            )}
          </div>

          <footer className="login-footer">
            <p>© {new Date().getFullYear()} YMCHAT • Tous droits réservés</p>
            <div className="footer-links">
              <a href="#privacy">Confidentialité</a>
              <a href="#terms">Conditions d'utilisation</a>
              <a href="#contact">Contact</a>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}

export default Login