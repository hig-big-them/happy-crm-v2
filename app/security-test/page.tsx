'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecurityTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSecurityTest = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const response = await fetch('/api/test-security');
      const data = await response.json();

      if (response.ok) {
        setTestResults(data);
      } else {
        setError(`Test failed: ${data.error}`);
      }
    } catch (err: any) {
      setError(`Request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRateLimit = async () => {
    setLoading(true);
    try {
      // Make multiple rapid requests to test rate limiting
      console.log('🚦 Testing rate limiting with rapid requests...');
      
      for (let i = 0; i < 5; i++) {
        const response = await fetch('/api/test-security');
        const data = await response.json();
        
        console.log(`Request ${i + 1}:`, {
          status: response.status,
          remaining: data.securityStatus?.rateLimiting?.result?.remaining
        });
        
        if (response.status === 429) {
          setError(`Rate limit hit on request ${i + 1}! Rate limiting is working.`);
          break;
        }
      }
    } catch (err: any) {
      setError(`Rate limit test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSentryError = async () => {
    setLoading(true);
    try {
      // Trigger an intentional error
      throw new Error('Intentional test error for Sentry');
    } catch (err: any) {
      // This should be caught by Sentry
      setError(`Sentry test error triggered: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🛡️ Security Features Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rate Limiting Test */}
        <Card>
          <CardHeader>
            <CardTitle>🚦 Rate Limiting Test</CardTitle>
            <CardDescription>
              Test if rate limiting is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runSecurityTest} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test Security Features'}
            </Button>
            <Button 
              onClick={testRateLimit} 
              disabled={loading} 
              variant="outline" 
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Rate Limiting (5 requests)'}
            </Button>
          </CardContent>
        </Card>

        {/* Error Monitoring Test */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Error Monitoring Test</CardTitle>
            <CardDescription>
              Test if Sentry error monitoring is working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testSentryError} 
              disabled={loading} 
              variant="destructive" 
              className="w-full"
            >
              {loading ? 'Testing...' : 'Trigger Test Error (Sentry)'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">⚠️ Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {testResults && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>✅ Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Rate Limiting Status */}
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">🚦 Rate Limiting</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    {testResults.securityStatus.rateLimiting.enabled ? (
                      <span className="text-green-600">✅ Enabled</span>
                    ) : (
                      <span className="text-orange-600">⚠️ Disabled</span>
                    )}
                  </div>
                  {testResults.securityStatus.rateLimiting.result && (
                    <>
                      <div>
                        <span className="font-medium">Limit:</span>{' '}
                        {testResults.securityStatus.rateLimiting.result.limit}
                      </div>
                      <div>
                        <span className="font-medium">Remaining:</span>{' '}
                        {testResults.securityStatus.rateLimiting.result.remaining}
                      </div>
                      <div>
                        <span className="font-medium">Reset:</span>{' '}
                        {new Date(testResults.securityStatus.rateLimiting.result.reset).toLocaleTimeString()}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error Monitoring Status */}
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">📊 Error Monitoring</h3>
                <div className="text-sm">
                  <div>
                    <span className="font-medium">Sentry Configured:</span>{' '}
                    {testResults.securityStatus.errorMonitoring.sentryConfigured ? (
                      <span className="text-green-600">✅ Yes</span>
                    ) : (
                      <span className="text-red-600">❌ No</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Test Message Sent:</span>{' '}
                    {testResults.securityStatus.errorMonitoring.testMessageSent ? (
                      <span className="text-green-600">✅ Yes</span>
                    ) : (
                      <span className="text-red-600">❌ No</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Environment Status */}
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">🌍 Environment</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Node Environment:</span>{' '}
                    {testResults.securityStatus.environment.nodeEnv}
                  </div>
                  <div>
                    <span className="font-medium">Client IP:</span>{' '}
                    {testResults.clientIP}
                  </div>
                  <div>
                    <span className="font-medium">Redis URL:</span>{' '}
                    {testResults.securityStatus.environment.redis.url ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Redis Token:</span>{' '}
                    {testResults.securityStatus.environment.redis.token ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Sentry DSN:</span>{' '}
                    {testResults.securityStatus.environment.sentry.dsn ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                <p>Test completed at: {testResults.timestamp}</p>
                <p>If rate limiting is enabled, try the "Test Rate Limiting" button to see it in action.</p>
                <p>If Sentry is configured, check your Sentry dashboard for test messages.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
