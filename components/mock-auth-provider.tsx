'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Mock user type
interface MockUser {
  id: string
  email: string
  name: string
  role: 'superuser' | 'agency' | 'user'
  avatar_url?: string
}

type MockAuthContextType = {
  user: MockUser | null
  userRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  refreshSession: async () => {},
})

// Mock users - App Review için güçlendirilmiş
const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'demo.admin@happycrm.com',
    name: 'Demo Admin',
    role: 'superuser',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2', 
    email: 'demo.manager@happycrm.com',
    name: 'Demo Manager',
    role: 'agency',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    email: 'demo.user@happycrm.com', 
    name: 'Demo User',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    email: 'halilg@gmail.com',
    name: 'Halil G',
    role: 'superuser',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
]

// Güçlü şifre gereksinimleri - App Review için
const REQUIRED_PASSWORDS: { [email: string]: string } = {
  'demo.admin@happycrm.com': 'DemoAdmin2024!@#',
  'demo.manager@happycrm.com': 'DemoManager2024!@#',
  'demo.user@happycrm.com': 'DemoUser2024!@#',
  'halilg@gmail.com': 'h4ppyh0ur5'
}

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock sign in
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 [MOCK-AUTH] Attempting sign in:', email)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Find user
    const mockUser = MOCK_USERS.find(u => u.email === email)
    
    if (!mockUser) {
      console.log('❌ [MOCK-AUTH] User not found:', email)
      return { success: false, error: 'Invalid email or password' }
    }
    
    // Güçlü şifre kontrolü - App Review için
    const requiredPassword = REQUIRED_PASSWORDS[email];
    if (!requiredPassword || password !== requiredPassword) {
      console.log('❌ [MOCK-AUTH] Invalid password for:', email)
      return { success: false, error: 'Invalid email or password' }
    }
    
    console.log('✅ [MOCK-AUTH] Sign in successful:', mockUser.name)
    
    // Set user and role
    setUser(mockUser)
    setUserRole(mockUser.role)
    
    // Save to localStorage for persistence
    localStorage.setItem('mock-auth-user', JSON.stringify(mockUser))
    
    return { success: true }
  }

  // Mock sign out
  const signOut = async (): Promise<void> => {
    console.log('🚪 [MOCK-AUTH] Signing out')
    
    setUser(null)
    setUserRole(null)
    localStorage.removeItem('mock-auth-user')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Mock session refresh
  const refreshSession = async (): Promise<void> => {
    console.log('🔄 [MOCK-AUTH] Refreshing session')
    
    try {
      const savedUser = localStorage.getItem('mock-auth-user')
      if (savedUser) {
        const user = JSON.parse(savedUser) as MockUser
        console.log('✅ [MOCK-AUTH] Found saved user:', user.name)
        setUser(user)
        setUserRole(user.role)
      } else {
        console.log('❌ [MOCK-AUTH] No saved user found')
        setUser(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error('❌ [MOCK-AUTH] Session refresh failed:', error)
      setUser(null)
      setUserRole(null)
    }
  }

  useEffect(() => {
    console.log('🔧 [MOCK-AUTH] Initializing mock auth provider')
    
    const initAuth = async () => {
      try {
        await refreshSession()
        setLoading(false)
        console.log('✅ [MOCK-AUTH] Mock auth initialization complete')
      } catch (error) {
        console.error('❌ [MOCK-AUTH] Mock auth initialization failed:', error)
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return (
    <MockAuthContext.Provider value={{
      user,
      userRole,
      loading,
      signIn,
      signOut,
      refreshSession
    }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export const useMockAuth = () => {
  const context = useContext(MockAuthContext)
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
} 