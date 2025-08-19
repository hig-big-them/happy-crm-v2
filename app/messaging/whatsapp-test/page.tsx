'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, MessageSquare, Send, Webhook, CheckCircle, XCircle, Settings } from 'lucide-react';

export default function WhatsAppTestPage() {
  const [phoneNumber, setPhoneNumber] = useState('905327994223');
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [webhookStatus, setWebhookStatus] = useState<'checking' | 'configured' | 'not_configured'>('checking');

  const sendTestMessage = async () => {
    setSendStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message || 'Test message from Happy CRM',
          type: 'text'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus('success');
        setMessage('');
        setTimeout(() => setSendStatus('idle'), 3000);
      } else {
        setSendStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSendStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  const sendTemplateMessage = async () => {
    setSendStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'hello_world',
            language: {
              code: 'en_US'
            }
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus('success');
        setTimeout(() => setSendStatus('idle'), 3000);
      } else {
        setSendStatus('error');
        setErrorMessage(data.error || 'Failed to send template message');
      }
    } catch (error) {
      setSendStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/webhook/status');
      const data = await response.json();
      setWebhookStatus(data.configured ? 'configured' : 'not_configured');
    } catch (error) {
      setWebhookStatus('not_configured');
    }
  };

  useState(() => {
    checkWebhookStatus();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">WhatsApp Test Console</h1>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/messaging/whatsapp-webhook-config'}
        >
          <Settings className="h-4 w-4 mr-2" />
          Webhook Configuration
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <div className="flex gap-2">
                <Phone className="h-5 w-5 mt-2 text-gray-500" />
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="905327994223"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter without + or country code prefix</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your test message..."
                rows={4}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={sendTestMessage}
                disabled={sendStatus === 'sending' || !phoneNumber}
                className="flex-1"
              >
                {sendStatus === 'sending' ? 'Sending...' : 'Send Text Message'}
              </Button>
              <Button 
                onClick={sendTemplateMessage}
                disabled={sendStatus === 'sending' || !phoneNumber}
                variant="outline"
                className="flex-1"
              >
                Send Template (Hello World)
              </Button>
            </div>

            {sendStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Message sent successfully!
                </AlertDescription>
              </Alert>
            )}

            {sendStatus === 'error' && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Webhook Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Webhook URL:</p>
              <code className="text-xs bg-white p-2 rounded block break-all">
                https://your-domain.com/api/whatsapp/webhook
              </code>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Verify Token:</p>
              <code className="text-xs bg-white p-2 rounded block">
                HAPPY_CRM_WEBHOOK_VERIFY_TOKEN
              </code>
            </div>

            <Alert className={webhookStatus === 'configured' ? 'bg-green-50' : 'bg-yellow-50'}>
              <AlertDescription>
                {webhookStatus === 'checking' && 'Checking webhook status...'}
                {webhookStatus === 'configured' && (
                  <span className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Webhook is configured and ready
                  </span>
                )}
                {webhookStatus === 'not_configured' && (
                  <span className="text-yellow-800">
                    Webhook needs to be configured in Meta Business Suite
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">Configuration Steps:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Go to Meta Business Suite → WhatsApp → Configuration</li>
                <li>Click on "Webhooks" section</li>
                <li>Enter the webhook URL above</li>
                <li>Use the verify token provided</li>
                <li>Subscribe to messages and message_status events</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Received Messages Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Received Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receivedMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No messages received yet</p>
                <p className="text-sm mt-2">Messages will appear here when webhook is configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedMessages.map((msg, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{msg.from}</span>
                      <span className="text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Configuration Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-700">Phone Number ID:</p>
                <code className="text-xs">660093600519552</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-700">WhatsApp Business Account ID:</p>
                <code className="text-xs">671283975824118</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-700">Test Number:</p>
                <code className="text-xs">+1 555 136 5631</code>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-700">API Version:</p>
                <code className="text-xs">v22.0</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}