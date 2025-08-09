import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import { Container, Row, Col, Card } from 'react-bootstrap'
import chatBubbleIcon from '../assets/chat-bubble.svg'

function Login() {
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleRegisterSuccess = (email) => {
    setRegisteredEmail(email)
  }

  return (
    <div className="login-page">
      <div className="login-background"></div>
      <div className="login-overlay"></div>
      
      <Container className="login-container">
        <div className="brand-header">
          <div className="brand-logo">
            <img src={chatBubbleIcon} alt="YMCHAT Logo" className="app-logo" />
          </div>
          <h1 className="brand-name">YMCHAT</h1>
          <p className="brand-tagline">Restez connectés. Discutez en temps réel.</p>
        </div>

        <Row className="justify-content-center g-4">
          <Col lg={5} md={6} className="mb-4">
            <Card className="auth-card shadow">
              <Card.Body>
                <LoginForm prefillEmail={registeredEmail} />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={5} md={6} className="mb-4">
            <Card className="auth-card shadow">
              <Card.Body>
                <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <footer className="login-footer">
        <p>© {new Date().getFullYear()} YMCHAT. Tous droits réservés.</p>
        <div className="footer-links">
          <a href="#">Confidentialité</a>
          <a href="#">Conditions d'utilisation</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default Login