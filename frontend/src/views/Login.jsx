import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import { Container, Row, Col, Card } from 'react-bootstrap'

function Login() {
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleRegisterSuccess = (email) => {
    setRegisteredEmail(email)
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-4">
        <Col md={8} className="text-center">
          <h1 className="display-4 mb-4">YMCHAT</h1>
        </Col>
      </Row>
      
      <Row className="justify-content-center">
        <Col md={5} className="mb-4 mb-md-0">
          <Card className="shadow-sm">
            <Card.Body>
              <LoginForm prefillEmail={registeredEmail} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Login