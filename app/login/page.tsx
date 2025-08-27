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
import { Loader2, Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Checkbox } from "../../components/ui/checkbox"

export default function LoginPage() {
  const { signIn, user, loading } = useMockAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  
  // URL'den restriction parametresini kontrol et
  const [restrictionMessage, setRestrictionMessage] = useState<string | null>(null)
  
  // Kayıt modal state'leri
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signupError, setSignupError] = useState<string | null>(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const restricted = urlParams.get('restricted')
    const success = urlParams.get('success')
    const message = urlParams.get('message')
    
    if (restricted === 'messaging') {
      setRestrictionMessage('Access to messaging features is restricted for security reasons. Please sign in with valid credentials.')
    }
    
    if (success === 'email_verified' && message) {
      setError(`✅ ${decodeURIComponent(message)}`)
    }
  }, [])

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
        // Login successful - redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(result.error || 'Giriş başarısız')
      }
    } catch (error) {
      // Handle login error without exposing details
      setError('Beklenmeyen bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTermsAccept = () => {
    if (acceptedTerms) {
      setShowTermsModal(false)
      setShowSignupForm(true)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError(null)
    
    if (signupPassword !== confirmPassword) {
      setSignupError('Şifreler eşleşmiyor')
      return
    }
    
    if (signupPassword.length < 6) {
      setSignupError('Şifre en az 6 karakter olmalıdır')
      return
    }
    
    setIsSigningUp(true)
    
    try {
      // Test modu kontrolü (development için)
      const isTestMode = false // Gerçek Supabase kayıt işlemi
      
      const apiEndpoint = isTestMode ? '/api/auth/test-signup' : '/api/auth/simple-signup'
      
      console.log('📝 Signup attempt:', { email: signupEmail, endpoint: apiEndpoint, isTestMode })
      
      // Basit kayıt API çağrısı
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword
        })
      })
      
      console.log('🔍 Response status:', response.status, response.statusText)
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log('🔍 Raw response:', responseText)
      
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError)
        console.error('❌ Response was:', responseText)
        throw new Error(`API returned invalid JSON: ${responseText.substring(0, 100)}...`)
      }
      
      if (result.success) {
        setShowSignupForm(false)
        setEmail(signupEmail)
        setPassword(signupPassword)
        
        // Email confirmation mesajı göster
        setSignupError(null)
        setError(`✅ Hesap başarıyla oluşturuldu! 
        
📧 ${signupEmail} adresine gönderilen onay linkine tıklayarak hesabınızı aktifleştirin.
        
⚠️ Email gelmezse spam klasörünüzü kontrol edin.`)
        
        // Auto login denemesi (email onaylandıysa çalışır)
        setTimeout(async () => {
          const loginResult = await signIn(signupEmail, signupPassword)
          if (loginResult.success) {
            router.push('/dashboard')
          }
        }, 2000)
      } else {
        console.error('Signup API error:', result)
        setSignupError(result.error || 'Kayıt başarısız')
      }
    } catch (error) {
      console.error('Signup error:', error)
      if (error instanceof Error) {
        setSignupError(`Kayıt hatası: ${error.message}`)
      } else {
        setSignupError('Beklenmeyen bir hata oluştu')
      }
    } finally {
      setIsSigningUp(false)
    }
  }

  const resetSignupState = () => {
    setShowTermsModal(false)
    setShowSignupForm(false)
    setAcceptedTerms(false)
    setSignupEmail('')
    setSignupPassword('')
    setConfirmPassword('')
    setSignupError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl flex gap-12 items-center">
        {/* Özellikler Tanıtımı */}
        <div className="hidden lg:block flex-1 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Happy CRM</h1>
            <p className="text-xl text-gray-600 mb-8">Customer relationship and WhatsApp messaging platform</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Business Entegrasyonu</h3>
                <p className="text-gray-600 text-sm">Müşterilerinizle WhatsApp üzerinden profesyonel mesajlaşma. Template mesajları ve otomatik yanıtlar.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Müşteri ve Lead Yönetimi</h3>
                <p className="text-gray-600 text-sm">Lead takibi, pipeline yönetimi ve müşteri ilişkileri. Satış süreçlerinizi optimize edin.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analitik ve Raporlama</h3>
                <p className="text-gray-600 text-sm">Detaylı performans raporları, mesaj analizleri ve müşteri davranış analizleri.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Formu */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Happy CRM'e Giriş
            </CardTitle>
            <CardDescription className="text-gray-600">
              CRM hesabınıza giriş yapmak için bilgilerinizi girin
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Restriction Message */}
            {restrictionMessage && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <div className="font-semibold mb-1">🔒 Access Restricted</div>
                    <div>{restrictionMessage}</div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Hesabınız yok mu?</span>
                </div>
              </div>
            </div>

            <div className="w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={isLoading}
                onClick={() => setShowTermsModal(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Hesap Oluştur
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 underline">
                Şifrenizi mi unuttunuz?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Terms of Service Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Kullanım Şartları ve Gizlilik Politikası</DialogTitle>
            <DialogDescription>
              Happy CRM hizmetlerini kullanmadan önce lütfen aşağıdaki şartları okuyun ve kabul edin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">1. Hizmet Kullanımı</h3>
              <p className="mb-3">
                Happy CRM, müşteri ilişkileri yönetimi ve WhatsApp Business entegrasyonu sağlayan bir platformdur. 
                Hizmetimizi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3">2. Hesap Güvenliği</h3>
              <p className="mb-3">
                Hesabınızın güvenliğinden siz sorumlusunuz. Güçlü şifreler kullanın ve hesap bilgilerinizi 
                kimseyle paylaşmayın. Şüpheli aktiviteleri hemen bildirin.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3">3. Veri Gizliliği</h3>
              <p className="mb-3">
                Müşteri verilerinizi güvenle saklarız. Verileriniz sadece hizmet sağlamak amacıyla kullanılır 
                ve üçüncü taraflarla paylaşılmaz. GDPR ve KVKK uyumluluğu sağlanmıştır.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3">4. WhatsApp Business Kullanımı</h3>
              <p className="mb-3">
                WhatsApp Business API kullanımı Meta'nın politikalarına uygun olmalıdır. Spam, 
                yanıltıcı içerik veya kötüye kullanım yasaktır.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3">5. Hizmet Sınırlamaları</h3>
              <p className="mb-3">
                Hizmetimiz "olduğu gibi" sunulur. Kesintisiz hizmet garantisi verilmez. 
                Önemli güncellemeler önceden bildirilir.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3">6. Fesih</h3>
              <p className="mb-3">
                Bu anlaşmayı herhangi bir zamanda feshedebilirsiniz. Fesih sonrası verileriniz 
                30 gün içinde silinir.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-3">7. İletişim</h3>
              <p className="mb-3">
                Sorularınız için support@happycrm.com adresinden bizimle iletişime geçebilirsiniz.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                Kullanım şartlarını ve gizlilik politikasını okudum ve kabul ediyorum
              </Label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowTermsModal(false)
                resetSignupState()
              }}
            >
              <X className="mr-2 h-4 w-4" />
              İptal
            </Button>
            <Button
              type="button"
              className="w-full"
              disabled={!acceptedTerms}
              onClick={handleTermsAccept}
            >
              <Check className="mr-2 h-4 w-4" />
              Kabul Ediyorum
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Form Modal */}
      <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>CRM Hesabı Oluştur</DialogTitle>
            <DialogDescription>
              Happy CRM'e hoş geldiniz. Yeni hesabınızı oluşturun.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="example@company.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                disabled={isSigningUp}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password">Şifre</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="En az 6 karakter"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                disabled={isSigningUp}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Şifre Tekrar</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSigningUp}
              />
            </div>

            {signupError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{signupError}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowSignupForm(false)
                  resetSignupState()
                }}
                disabled={isSigningUp}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  'Hesap Oluştur'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}