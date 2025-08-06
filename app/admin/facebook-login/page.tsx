'use client';

/**
 * Facebook Login Demo Page
 * 
 * Facebook SDK ve login işlemlerini test etmek için demo sayfası
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FacebookSDKProvider, useFacebookSDK } from '@/components/auth/facebook-sdk-provider';
import { FacebookLoginButton, FacebookLogoutButton } from '@/components/auth/facebook-login-button';

function FacebookLoginDemo() {
  const { isSDKLoaded, isInitialized, FB } = useFacebookSDK();
  const [loginData, setLoginData] = useState<any>(null);
  const [apiData, setApiData] = useState<any>(null);

  const handleLoginSuccess = (data: any) => {
    console.log('🎉 Login successful:', data);
    setLoginData(data);
  };

  const handleLoginError = (error: any) => {
    console.error('❌ Login error:', error);
    setLoginData(null);
  };

  const handleLogoutSuccess = () => {
    console.log('👋 Logout successful');
    setLoginData(null);
    setApiData(null);
  };

  // Facebook API test
  const testFacebookAPI = () => {
    if (!FB || !loginData?.authResponse?.accessToken) {
      console.error('❌ No Facebook SDK or access token');
      return;
    }

    // User info al
    FB.api('/me', 'GET', { 
      fields: 'id,name,email,picture.type(large)',
      access_token: loginData.authResponse.accessToken
    }, (response: any) => {
      console.log('📊 Facebook API response:', response);
      setApiData(prev => ({...prev, userInfo: response}));
    });

    // Permissions al
    FB.api('/me/permissions', 'GET', {
      access_token: loginData.authResponse.accessToken
    }, (response: any) => {
      console.log('🔑 User permissions:', response);
      setApiData(prev => ({...prev, permissions: response}));
    });

    // Business accounts al (eğer permission varsa)
    FB.api('/me/businesses', 'GET', {
      access_token: loginData.authResponse.accessToken
    }, (response: any) => {
      console.log('🏢 Business accounts:', response);
      setApiData(prev => ({...prev, businesses: response}));
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facebook Login Demo</h1>
          <p className="text-muted-foreground">
            Facebook JavaScript SDK ve OAuth integration testi
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSDKLoaded ? "default" : "secondary"}>
            SDK: {isSDKLoaded ? 'Loaded' : 'Loading...'}
          </Badge>
          <Badge variant={isInitialized ? "default" : "secondary"}>
            Status: {isInitialized ? 'Ready' : 'Initializing...'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SDK Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Facebook SDK Status</CardTitle>
            <CardDescription>
              Current SDK loading and initialization status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>SDK Loaded:</span>
              <Badge variant={isSDKLoaded ? "default" : "secondary"}>
                {isSDKLoaded ? '✅ Yes' : '⏳ Loading'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Initialized:</span>
              <Badge variant={isInitialized ? "default" : "secondary"}>
                {isInitialized ? '✅ Yes' : '⏳ Initializing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>FB Object:</span>
              <Badge variant={FB ? "default" : "secondary"}>
                {FB ? '✅ Available' : '❌ Not Available'}
              </Badge>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p><strong>App ID:</strong> 1369235900792698</p>
              <p><strong>Version:</strong> v23.0</p>
              <p><strong>Scopes:</strong> email, public_profile, whatsapp_business_management</p>
            </div>
          </CardContent>
        </Card>

        {/* Login Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Login Controls</CardTitle>
            <CardDescription>
              Facebook login and logout buttons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FacebookLoginButton
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                className="w-full"
                size="lg"
              />
              
              {loginData && (
                <FacebookLogoutButton
                  onSuccess={handleLogoutSuccess}
                  className="w-full"
                  size="md"
                />
              )}
            </div>

            {loginData && (
              <div className="space-y-2">
                <Separator />
                <button
                  onClick={testFacebookAPI}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                >
                  🧪 Test Facebook API
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Data Card */}
        {loginData && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Login Response Data</CardTitle>
              <CardDescription>
                Facebook login response and user information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Auth Response:</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                    <div><strong>Access Token:</strong> {loginData.authResponse?.accessToken?.substring(0, 20)}...</div>
                    <div><strong>User ID:</strong> {loginData.authResponse?.userID}</div>
                    <div><strong>Expires In:</strong> {loginData.authResponse?.expiresIn}s</div>
                    <div><strong>Granted Scopes:</strong> {loginData.authResponse?.grantedScopes}</div>
                  </div>
                </div>
                
                {loginData.userInfo && (
                  <div>
                    <h4 className="font-semibold mb-2">User Info:</h4>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div><strong>Name:</strong> {loginData.userInfo.name}</div>
                      <div><strong>Email:</strong> {loginData.userInfo.email}</div>
                      <div><strong>ID:</strong> {loginData.userInfo.id}</div>
                      {loginData.userInfo.picture && (
                        <div className="mt-2">
                          <img 
                            src={loginData.userInfo.picture.data.url} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Data Card */}
        {apiData && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Facebook API Test Results</CardTitle>
              <CardDescription>
                Results from Facebook Graph API calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiData.userInfo && (
                  <div>
                    <h4 className="font-semibold mb-2">User Info (/me):</h4>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(apiData.userInfo, null, 2)}
                    </pre>
                  </div>
                )}

                {apiData.permissions && (
                  <div>
                    <h4 className="font-semibold mb-2">Permissions (/me/permissions):</h4>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(apiData.permissions, null, 2)}
                    </pre>
                  </div>
                )}

                {apiData.businesses && (
                  <div>
                    <h4 className="font-semibold mb-2">Business Accounts (/me/businesses):</h4>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(apiData.businesses, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            How to test Facebook integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure Facebook SDK is loaded and initialized (green badges above)</li>
            <li>Click "Facebook ile Giriş Yap" to start OAuth flow</li>
            <li>Authorize the app in Facebook login popup</li>
            <li>Check the login response data below</li>
            <li>Click "Test Facebook API" to make Graph API calls</li>
            <li>Review the API responses</li>
            <li>Use "Facebook Çıkış" to logout</li>
          </ol>
          
          <Separator className="my-4" />
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> This is a demo page for testing Facebook integration.</p>
            <p>In production, the login flow should redirect users to appropriate pages.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FacebookLoginPage() {
  return (
    <FacebookSDKProvider debug={true}>
      <FacebookLoginDemo />
    </FacebookSDKProvider>
  );
}