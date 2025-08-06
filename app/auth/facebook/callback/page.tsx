'use client';

/**
 * Facebook OAuth Callback Page
 * 
 * Facebook OAuth flow'dan dönen authorization code'u handle eder
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface CallbackState {
  status: 'loading' | 'success' | 'error' | 'processing';
  message: string;
  data?: any;
  error?: string;
}

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing Facebook OAuth callback...'
  });

  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // URL parametrelerini al
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const errorReason = searchParams.get('error_reason');

        console.log('📥 Facebook OAuth callback params:', {
          code: code ? 'PROVIDED' : 'MISSING',
          state,
          error,
          errorDescription,
          errorReason
        });

        // Error handling
        if (error) {
          let errorMessage = 'Facebook OAuth failed';
          
          if (error === 'access_denied') {
            errorMessage = 'User denied permission or cancelled login';
          } else if (error === 'invalid_request') {
            errorMessage = 'Invalid OAuth request';
          } else if (error === 'unsupported_response_type') {
            errorMessage = 'Unsupported response type';
          }

          setCallbackState({
            status: 'error',
            message: errorMessage,
            error: errorDescription || error
          });

          toast({
            title: "Facebook OAuth Error",
            description: errorMessage,
            variant: "destructive"
          });

          return;
        }

        // Code missing
        if (!code) {
          setCallbackState({
            status: 'error',
            message: 'Authorization code not found',
            error: 'No authorization code received from Facebook'
          });

          toast({
            title: "OAuth Error",
            description: "No authorization code received",
            variant: "destructive"
          });

          return;
        }

        // Success case - process the code
        setCallbackState({
          status: 'processing',
          message: 'Exchanging authorization code for access token...'
        });

        setAuthData({
          code,
          state,
          timestamp: new Date().toISOString(),
          provider: 'facebook'
        });

        // Token exchange API call
        const response = await fetch('/api/auth/facebook/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
            redirect_uri: window.location.origin + '/auth/facebook/callback'
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setCallbackState({
            status: 'success',
            message: 'Facebook authentication successful!',
            data: result.data
          });

          toast({
            title: "Facebook OAuth Successful",
            description: "Access token obtained and saved securely",
            variant: "default"
          });

          // Redirect to admin panel after 3 seconds
          setTimeout(() => {
            router.push('/admin/whatsapp-settings');
          }, 3000);

        } else {
          setCallbackState({
            status: 'error',
            message: 'Token exchange failed',
            error: result.error || 'Unknown error during token exchange'
          });

          toast({
            title: "Token Exchange Failed",
            description: result.error || "Failed to exchange authorization code",
            variant: "destructive"
          });
        }

      } catch (error: any) {
        console.error('❌ Callback processing error:', error);
        
        setCallbackState({
          status: 'error',
          message: 'Callback processing failed',
          error: error.message
        });

        toast({
          title: "Callback Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      }
    };

    processCallback();
  }, [searchParams, router, toast]);

  const getStatusIcon = () => {
    switch (callbackState.status) {
      case 'loading':
      case 'processing':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📱';
    }
  };

  const getStatusColor = () => {
    switch (callbackState.status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const retryCallback = () => {
    window.location.reload();
  };

  const goToSettings = () => {
    router.push('/admin/whatsapp-settings');
  };

  const goToLogin = () => {
    router.push('/admin/facebook-login');
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Facebook OAuth Callback
        </h1>
        <p className="text-muted-foreground">
          Processing your Facebook authentication...
        </p>
      </div>

      {/* Main Status Card */}
      <Card className={`mb-6 ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">{getStatusIcon()}</div>
          <CardTitle className="text-xl">
            {callbackState.message}
          </CardTitle>
          <div className="flex justify-center">
            <Badge variant={callbackState.status === 'success' ? 'default' : 
                           callbackState.status === 'error' ? 'destructive' : 'secondary'}>
              {callbackState.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        {(callbackState.status === 'loading' || callbackState.status === 'processing') && (
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your authentication...
            </p>
          </CardContent>
        )}

        {callbackState.status === 'success' && callbackState.data && (
          <CardContent>
            <div className="space-y-3">
              <div className="text-center text-green-600 mb-4">
                <p className="font-semibold">🎉 Authentication successful!</p>
                <p className="text-sm">You will be redirected to WhatsApp settings shortly.</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Token Type:</strong> {callbackState.data.token_type || 'Bearer'}
                </div>
                <div>
                  <strong>Expires In:</strong> {callbackState.data.expires_in ? `${callbackState.data.expires_in}s` : 'Never'}
                </div>
                {callbackState.data.business_id && (
                  <div className="md:col-span-2">
                    <strong>Business ID:</strong> {callbackState.data.business_id}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}

        {callbackState.status === 'error' && (
          <CardContent>
            <div className="space-y-3">
              <div className="text-center text-red-600 mb-4">
                <p className="font-semibold">Authentication failed</p>
                <p className="text-sm">Please try again or contact support if the issue persists.</p>
              </div>
              
              {callbackState.error && (
                <>
                  <Separator />
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {callbackState.error}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Auth Data Debug Card */}
      {authData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Callback Information</CardTitle>
            <CardDescription>
              Details received from Facebook OAuth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Authorization Code:</strong>
                  <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                    {authData.code ? `${authData.code.substring(0, 20)}...` : 'Not provided'}
                  </p>
                </div>
                <div>
                  <strong>State Parameter:</strong>
                  <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {authData.state || 'Not provided'}
                  </p>
                </div>
                <div>
                  <strong>Timestamp:</strong>
                  <p className="text-xs text-muted-foreground">
                    {new Date(authData.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <strong>Provider:</strong>
                  <Badge variant="outline">{authData.provider}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {callbackState.status === 'success' && (
              <Button onClick={goToSettings} className="w-full sm:w-auto">
                🚀 Go to WhatsApp Settings
              </Button>
            )}
            
            {callbackState.status === 'error' && (
              <>
                <Button onClick={retryCallback} variant="outline" className="w-full sm:w-auto">
                  🔄 Retry
                </Button>
                <Button onClick={goToLogin} className="w-full sm:w-auto">
                  🔑 Try Again
                </Button>
              </>
            )}
            
            {(callbackState.status === 'loading' || callbackState.status === 'processing') && (
              <Button disabled className="w-full sm:w-auto">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>
          This page handles the Facebook OAuth authentication flow.
        </p>
        <p>
          If you're experiencing issues, please contact our support team.
        </p>
      </div>
    </div>
  );
}

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Facebook OAuth callback...</p>
        </div>
      </div>
    }>
      <FacebookCallbackContent />
    </Suspense>
  );
}