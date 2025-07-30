import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      // Decode le token JWT pour extraire les informations utilisateur
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(window.atob(base64))
        setUser({
          id: payload.id,
          email: payload.email,
          name: payload.name,
          isAdmin: payload.isAdmin
        })
      } catch (error) {
        console.error('Erreur lors du décodage du token', error)
        logout()
      }
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setToken(data.token)
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Erreur de connexion' }
      }
    } catch (err) {
      return { success: false, message: 'Erreur de connexion au serveur' }
    }
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}