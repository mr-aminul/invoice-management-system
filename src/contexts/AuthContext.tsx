import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Demo account for testing
    const demoAccounts: Record<string, { password: string; name: string }> = {
      'demo@easyinvoice.com': { password: 'demo123', name: 'Demo User' },
      'admin@easyinvoice.com': { password: 'admin123', name: 'Admin User' },
    }
    
    // Check if it's a demo account
    if (demoAccounts[email] && demoAccounts[email].password === password) {
      const userData = { email, name: demoAccounts[email].name }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return
    }
    
    // For demo purposes, accept any email/password combination
    // In production, this would validate against a backend
    const userData = { email, name: email.split('@')[0] }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (name: string, lastName: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const userData = { email, name: `${name} ${lastName}` }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
