'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield, Users, CheckCircle, ArrowLeft } from 'lucide-react';

export default function DemoMessagingInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/10">
            <MessageSquare className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Messaging Özelliği
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            WhatsApp Business API entegrasyonu ile güçlü mesajlaşma deneyimi
          </p>
        </div>

        {/* Demo Restriction Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Shield className="h-5 w-5" />
              Demo Kullanıcı Kısıtlaması
            </CardTitle>
            <CardDescription className="text-orange-700">
              Güvenlik nedenleriyle demo kullanıcılar messaging özelliğine erişemez
            </CardDescription>
          </CardHeader>
          <CardContent className="text-orange-800">
            <p className="mb-4">
              Demo hesaplar sadece sistem özelliklerini keşfetmek için tasarlanmıştır. 
              Gerçek mesajlaşma işlemleri için lütfen gerçek bir hesap ile giriş yapın.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          
          {/* WhatsApp Business API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp Business API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Professional messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Template messages
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automated responses
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Multi-Channel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Multi-Channel Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  WhatsApp integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SMS notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Email campaigns
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Enterprise Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  End-to-end encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Access control
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Audit logging
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Available Demo Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Hesabınızla Keşfedebileceğiniz Alanlar</CardTitle>
            <CardDescription>
              Bu özellikler demo hesabınızla tam olarak kullanılabilir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">✅ Erişilebilir Özellikler</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard ve analytics</li>
                  <li>• Lead yönetimi</li>
                  <li>• Pipeline tracking</li>
                  <li>• Raporlama</li>
                  <li>• Kullanıcı profili</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">🔒 Kısıtlı Özellikler</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• WhatsApp mesajlaşma</li>
                  <li>• SMS gönderimi</li>
                  <li>• Email kampanyaları</li>
                  <li>• Gerçek müşteri verileri</li>
                  <li>• Webhook entegrasyonları</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Gerçek bir hesap için lütfen sistem yöneticiniz ile iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
}
