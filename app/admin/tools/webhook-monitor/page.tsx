'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import { Textarea } from '../../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { createClient } from '@/lib/utils/supabase/client'

interface WebhookLog {
  id: string
  service: string
  event_type: string
  payload: any
  processed_at: string
  status?: string
  error?: string
}

interface TransferNotification {
  id: string
  transfer_id: string
  notification_type: string
  notification_channel: string
  status: string
  twilio_sid?: string
  created_at: string
  updated_at: string
}

export default function WebhookMonitorPage() {
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [transferNotifications, setTransferNotifications] = useState<TransferNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const supabase = createClient()

  const fetchWebhookLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('webhook_logs')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(50)

      if (selectedService !== 'all') {
        query = query.eq('service', selectedService)
      }

      const { data, error } = await query

      if (error) {
        console.error('Webhook logları yüklenirken hata:', error)
        return
      }

      setWebhookLogs(data || [])
    } catch (error) {
      console.error('Webhook logları yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransferNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('transfer_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Transfer bildirimleri yüklenirken hata:', error)
        return
      }

      setTransferNotifications(data || [])
    } catch (error) {
      console.error('Transfer bildirimleri yüklenirken hata:', error)
    }
  }

  useEffect(() => {
    fetchWebhookLogs()
    fetchTransferNotifications()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchWebhookLogs()
        fetchTransferNotifications()
      }, 5000) // 5 saniyede bir güncelle

      return () => clearInterval(interval)
    }
  }, [selectedService, autoRefresh])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <Badge variant="default">Başarılı</Badge>
      case 'error':
      case 'failed':
        return <Badge variant="destructive">Hata</Badge>
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'whatsapp':
        return <Badge variant="default">WhatsApp</Badge>
      case 'twilio':
        return <Badge variant="secondary">Twilio</Badge>
      case 'deadline':
        return <Badge variant="outline">Deadline</Badge>
      default:
        return <Badge variant="outline">{service}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Webhook Monitor</h1>
        <p className="text-gray-600 mt-2">
          Webhook loglarını ve transfer bildirimlerini gerçek zamanlı olarak izleyin
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Servis seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Servisler</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="twilio">Twilio</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => setAutoRefresh(!autoRefresh)}
          variant={autoRefresh ? 'default' : 'outline'}
        >
          {autoRefresh ? 'Otomatik Yenileme Açık' : 'Otomatik Yenileme Kapalı'}
        </Button>

        <Button onClick={fetchWebhookLogs} variant="outline">
          Manuel Yenile
        </Button>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="webhooks">Webhook Logları</TabsTrigger>
          <TabsTrigger value="notifications">Transfer Bildirimleri</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Logları</CardTitle>
                <CardDescription>
                  Son 50 webhook logu - {loading ? 'Yükleniyor...' : `${webhookLogs.length} kayıt`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhookLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getServiceBadge(log.service)}
                          <Badge variant="outline">{log.event_type}</Badge>
                          {log.status && getStatusBadge(log.status)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(log.processed_at)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {log.error ? (
                          <div className="text-red-600">
                            <strong>Hata:</strong> {log.error}
                          </div>
                        ) : (
                          <div>
                            <strong>Payload:</strong> {JSON.stringify(log.payload).substring(0, 200)}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {webhookLogs.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-8">
                      Henüz webhook logu bulunmuyor
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Bildirimleri</CardTitle>
              <CardDescription>
                Son 50 transfer bildirimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transferNotifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{notification.notification_type}</Badge>
                        <Badge variant="secondary">{notification.notification_channel}</Badge>
                        {getStatusBadge(notification.status)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Transfer ID:</strong> {notification.transfer_id}</div>
                      {notification.twilio_sid && (
                        <div><strong>Twilio SID:</strong> {notification.twilio_sid}</div>
                      )}
                      <div><strong>Güncellenme:</strong> {formatDate(notification.updated_at)}</div>
                    </div>
                  </div>
                ))}
                
                {transferNotifications.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Henüz transfer bildirimi bulunmuyor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Webhook Log Detayı</h2>
              <Button onClick={() => setSelectedLog(null)} variant="outline">
                Kapat
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <strong>Servis:</strong> {selectedLog.service}
              </div>
              <div>
                <strong>Event Type:</strong> {selectedLog.event_type}
              </div>
              <div>
                <strong>İşlenme Zamanı:</strong> {formatDate(selectedLog.processed_at)}
              </div>
              {selectedLog.status && (
                <div>
                  <strong>Durum:</strong> {selectedLog.status}
                </div>
              )}
              {selectedLog.error && (
                <div>
                  <strong>Hata:</strong> {selectedLog.error}
                </div>
              )}
              <div>
                <strong>Payload:</strong>
                <Textarea
                  value={JSON.stringify(selectedLog.payload, null, 2)}
                  readOnly
                  rows={15}
                  className="font-mono text-sm mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
