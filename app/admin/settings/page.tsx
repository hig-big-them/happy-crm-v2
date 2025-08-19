"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowRight, UserPlus, Loader2, TestTube, Phone, Webhook, Mail, FileText, Settings } from "lucide-react";
import { createClient } from '../../../lib/supabase/client';
import { useI18n } from '@/lib/i18n/client';

export default function AdminSettings() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Sadece admin erişimi
        const userRole = session.user.app_metadata?.role;
        if (userRole !== 'admin') {
          router.push('/dashboard');
          return;
        }
        
        setUserData(session.user);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="container">
        <h1 className="text-3xl font-bold mb-4">{t.admin?.settings?.pageTitle || (locale === 'tr' ? 'Admin Ayarları' : 'Admin Settings')}</h1>
        <p className="text-muted-foreground mb-6">
          {t.admin?.settings?.pageDesc || (locale === 'tr' ? 'Sistem yönetimi ve kullanıcı işlemleri için admin araçları' : 'Admin tools for system management and user operations')}
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Kullanıcı Yönetimi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {t.admin?.settings?.userMgmt.title || (locale === 'tr' ? 'Kullanıcı Yönetimi' : 'User Management')}
              </CardTitle>
              <CardDescription>
                {t.admin?.settings?.userMgmt.desc || (locale === 'tr' ? 'Kullanıcıları görüntüle ve yönet' : 'View and manage users')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/manage-users')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t.admin?.settings?.userMgmt.allUsers || (locale === 'tr' ? 'Tüm Kullanıcılar' : 'All Users')}
              </Button>
            </CardContent>
          </Card>

          {/* Ajans Yönetimi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                {t.admin?.settings?.agencies.title || (locale === 'tr' ? 'Ajans Yönetimi' : 'Agency Management')}
              </CardTitle>
              <CardDescription>
                {t.admin?.settings?.agencies.desc || (locale === 'tr' ? 'Ajansları yönet' : 'Manage agencies')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/agencies')}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {t.admin?.settings?.agencies.view || (locale === 'tr' ? 'Ajansları Görüntüle' : 'View Agencies')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/ajans-ve-kullanici-olustur')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t.admin?.settings?.agencies.create || (locale === 'tr' ? 'Ajans & Kullanıcı Oluştur' : 'Create Agency & User')}
              </Button>
            </CardContent>
          </Card>

          {/* Transfer Yönetimi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                {t.admin?.settings?.transfers.title || (locale === 'tr' ? 'Transfer İşlemleri' : 'Transfer Operations')}
              </CardTitle>
              <CardDescription>
                {t.admin?.settings?.transfers.desc || (locale === 'tr' ? 'Transfer yönetimi' : 'Manage transfers')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/transfers')}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {t.admin?.settings?.transfers.all || (locale === 'tr' ? 'Tüm Transferler' : 'All Transfers')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/transfers/new')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t.admin?.settings?.transfers.create || (locale === 'tr' ? 'Yeni Transfer' : 'New Transfer')}
              </Button>
            </CardContent>
          </Card>

          {/* Test Araçları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                {t.admin?.settings?.tools.title || (locale === 'tr' ? 'Test Araçları' : 'Test Tools')}
              </CardTitle>
              <CardDescription>
                {t.admin?.settings?.tools.desc || (locale === 'tr' ? 'Sistem testleri' : 'System tests')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/tools/twilio-test')}
              >
                <Phone className="mr-2 h-4 w-4" />
                {t.admin?.settings?.tools.twilioTest || 'Twilio Test'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/tools/email-test')}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t.admin?.settings?.tools.emailTest || (locale === 'tr' ? 'E-posta Test' : 'Email Test')}
              </Button>
            </CardContent>
          </Card>

          {/* Bildirim & Cron İzleme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.admin?.settings?.monitor.title || (locale === 'tr' ? 'Bildirim & Cron İzleme' : 'Notifications & Cron Monitor')}
              </CardTitle>
              <CardDescription>
                {t.admin?.settings?.monitor.desc || (locale === 'tr' ? 'Cron işleri ve bildirimleri izleyin' : 'Monitor cron jobs and notifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/admin/notification-monitor')}
              >
                <Settings className="mr-2 h-4 w-4" />
                {t.admin?.settings?.monitor.notificationMonitor || (locale === 'tr' ? 'Bildirim İzleme' : 'Notification Monitor')}
              </Button>
            </CardContent>
          </Card>

          {/* Sistem Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.admin?.settings?.system.title || (locale === 'tr' ? 'Sistem Bilgileri' : 'System Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{t.admin?.settings?.system.version || (locale === 'tr' ? 'Sürüm' : 'Version')}</h3>
                <p className="text-gray-500">v3.0.0</p>
              </div>
              <div>
                <h3 className="font-medium">{t.admin?.settings?.system.lastUpdate || (locale === 'tr' ? 'Son Güncelleme' : 'Last Update')}</h3>
                <p className="text-gray-500">{new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p>
              </div>
              <div>
                <h3 className="font-medium">{t.admin?.settings?.system.permissionSystem || (locale === 'tr' ? 'Yetki Sistemi' : 'Permission System')}</h3>
                <p className="text-gray-500">Basit 3-Rol Sistemi</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
} 