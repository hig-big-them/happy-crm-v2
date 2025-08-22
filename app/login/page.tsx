"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useMockAuth } from '../../components/mock-auth-provider'
import { Loader2, Eye, EyeOff, Info } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const { signIn, user, loading } = useMockAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDemoInfo, setShowDemoInfo] = useState(true) // App Review için demo bilgileri göster
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        console.log('✅ Login successful')
        router.push('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn(demoEmail, 'demo123')
      
      if (result.success) {
        console.log('✅ Demo login successful')
        router.push('/dashboard')
      } else {
        setError(result.error || 'Demo login failed')
      }
    } catch (error) {
      console.error('Demo login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Happy CRM
          </CardTitle>
          <CardDescription className="text-gray-600">
            Müşteri İlişkileri Yönetim Sistemi
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Demo Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Demo Modu Aktif</p>
                <p className="text-blue-700">
                  Test için aşağıdaki hesapları kullanabilirsiniz:
                </p>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => handleDemoLogin('admin@happycrm.com')}
                    className="block text-left text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    👑 Admin: admin@happycrm.com
                  </button>
                  <button
                    onClick={() => handleDemoLogin('agency@happycrm.com')}
                    className="block text-left text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    🏢 Agency: agency@happycrm.com
                  </button>
                  <button
                    onClick={() => handleDemoLogin('user@happycrm.com')}
                    className="block text-left text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    👤 User: user@happycrm.com
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Şifre: herhangi bir şey (3+ karakter)
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>
        </CardContent>
        
        {/* Demo Bilgileri - App Review için */}
        {showDemoInfo && (
          <CardContent className="pt-0">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-semibold mb-2">📋 Demo Hesapları (App Review)</div>
                  <div className="space-y-1 text-xs">
                    <div><strong>Admin:</strong> demo.admin@happycrm.com</div>
                    <div><strong>Manager:</strong> demo.manager@happycrm.com</div>
                    <div><strong>User:</strong> demo.user@happycrm.com</div>
                    <div className="text-blue-600 mt-2">
                      <strong>Şifreler güçlendirilmiştir - App Review ekibi için ayrıca paylaşılacaktır</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-gray-600">
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 underline">
              Şifremi unuttum
            </Link>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            Demo modunda çalışıyor • App Review için hazırlandı
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 