/**
 * 🔔 Notification Store - Zustand
 * 
 * Uygulama genelinde bildirim yönetimi
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  templateId?: string;
  templateName?: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // Template specific
  addTemplateApprovalNotification: (templateId: string, templateName: string, status: 'approved' | 'rejected') => void;
  addTemplateSubmittedNotification: (templateName: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isRead: false,
          createdAt: new Date(),
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.isRead;
          
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      addTemplateApprovalNotification: (templateId, templateName, status) => {
        const { addNotification } = get();
        
        addNotification({
          type: status === 'approved' ? 'success' : 'error',
          title: status === 'approved' ? 'Template Onaylandı! 🎉' : 'Template Reddedildi ❌',
          message: status === 'approved' 
            ? `"${templateName}" template'iniz Meta tarafından onaylandı ve kullanıma hazır.`
            : `"${templateName}" template'iniz Meta tarafından reddedildi. Lütfen kontrol edin.`,
          templateId,
          templateName,
          actionUrl: '/admin/whatsapp-templates',
        });
      },

      addTemplateSubmittedNotification: (templateName) => {
        const { addNotification } = get();
        
        addNotification({
          type: 'info',
          title: 'Template Onaya Gönderildi 📤',
          message: `"${templateName}" template'iniz Meta'ya onay için gönderildi. Sonuç bildirim olarak gelecektir.`,
          templateName,
          actionUrl: '/admin/whatsapp-templates',
        });
      },
    }),
    {
      name: 'notification-store',
      // Sadece notifications ve unreadCount'u persist et
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
