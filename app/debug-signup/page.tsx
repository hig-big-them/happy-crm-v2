'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

export default function DebugSignupPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [envCheck, setEnvCheck] = useState<any>(null)

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/auth/debug-env')
      const data = await response.json()
      setEnvCheck(data)
    } catch (error) {
      console.error('Environment check failed:', error)
      setEnvCheck({ error: 'Environment check failed' })
    }
  }

  const testSignup = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      console.log('🧪 Testing signup with:', { email, password })

      const response = await fetch('/api/auth/simple-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('📝 Signup response:', data)
      setResult(data)
    } catch (error) {
      console.error('💥 Signup test error:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsLoading(false)
    }
  }

  const testSimpleSignup = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      console.log('🧪 Testing simple signup with:', { email, password })

      const response = await fetch('/api/auth/test-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('📝 Simple signup response:', data)
      setResult(data)
    } catch (error) {
      console.error('💥 Simple signup test error:', error)
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Signup Debug</h1>
        <p className="text-muted-foreground">
          Hesap oluşturma işlemini test etmek için kullanın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
          <CardDescription>
            Sistem ayarlarını kontrol edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEnvironment} disabled={isLoading}>
            Environment Kontrol Et
          </Button>

          {envCheck && (
            <Alert className={envCheck.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                <pre className="text-sm">{JSON.stringify(envCheck, null, 2)}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signup Test</CardTitle>
          <CardDescription>
            Hesap oluşturma işlemini test edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testSimpleSignup} disabled={isLoading}>
              {isLoading ? 'Test Ediliyor...' : 'Test Signup'}
            </Button>
            <Button onClick={testSignup} disabled={isLoading} variant="outline">
              {isLoading ? 'Test Ediliyor...' : 'Real Signup'}
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
