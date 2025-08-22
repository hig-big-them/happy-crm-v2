'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('title', 'Privacy Policy')}
            </h1>
            <p className="text-gray-600">
              {t('lastUpdated', 'Last Updated: January 22, 2025')}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('intro.title', 'Introduction')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('intro.content', 
                'Happy CRM ("we", "our", or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WhatsApp Business Platform integration services.'
              )}
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('collection.title', 'Information We Collect')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {t('collection.personal.title', 'Personal Information')}
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('collection.personal.name', 'Name and contact information')}</li>
                  <li>{t('collection.personal.phone', 'Phone numbers (for WhatsApp, SMS, and notification services)')}</li>
                  <li>{t('collection.personal.email', 'Email addresses')}</li>
                  <li>{t('collection.personal.business', 'Business information and preferences')}</li>
                  <li>{t('collection.personal.profile', 'User profile data including username and role')}</li>
                  <li>{t('collection.personal.agency', 'Agency affiliation and organizational structure')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {t('collection.messaging.title', 'Messaging and Communication Data')}
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('collection.messaging.content', 'Message content across all channels (WhatsApp, SMS, Email, Notes)')}</li>
                  <li>{t('collection.messaging.media', 'Media files including URLs and file types')}</li>
                  <li>{t('collection.messaging.metadata', 'Message metadata (timestamps, delivery status, read receipts)')}</li>
                  <li>{t('collection.messaging.sessions', 'WhatsApp 24-hour conversation session data')}</li>
                  <li>{t('collection.messaging.templates', 'Template message usage and parameters')}</li>
                  <li>{t('collection.messaging.webhooks', 'Webhook data from WhatsApp Business API')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {t('collection.system.title', 'System and Operational Data')}
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('collection.system.leads', 'Lead and customer relationship data')}</li>
                  <li>{t('collection.system.routes', 'Business routes and location information')}</li>
                  <li>{t('collection.system.notifications', 'Notification preferences and phone number lists')}</li>
                  <li>{t('collection.system.activity', 'User activity logs and session information')}</li>
                  <li>{t('collection.system.api', 'API usage and integration statistics')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('usage.title', 'How We Use Your Information')}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t('usage.provide', 'To provide multi-channel messaging services (WhatsApp, SMS, Email)')}</li>
              <li>{t('usage.messages', 'To facilitate message sending and receiving through WhatsApp Cloud API')}</li>
              <li>{t('usage.templates', 'To manage and deliver message templates')}</li>
              <li>{t('usage.sessions', 'To manage WhatsApp 24-hour conversation sessions')}</li>
              <li>{t('usage.notifications', 'To send notifications based on your preferences')}</li>
              <li>{t('usage.support', 'To provide customer support and respond to inquiries')}</li>
              <li>{t('usage.improve', 'To improve our services and develop new features')}</li>
              <li>{t('usage.comply', 'To comply with legal obligations and Meta\'s policies')}</li>
              <li>{t('usage.analytics', 'To analyze usage patterns and optimize performance')}</li>
              <li>{t('usage.security', 'To detect, prevent, and address technical issues and security threats')}</li>
              <li>{t('usage.roles', 'To manage user roles and permissions within the system')}</li>
            </ul>
          </section>

          {/* Data Sharing and Disclosure */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('sharing.title', 'Data Sharing and Disclosure')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('sharing.intro', 'We may share your information in the following circumstances:')}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong>{t('sharing.meta.title', 'With Meta/WhatsApp:')}</strong> {t('sharing.meta.content', 'We share necessary information with Meta to enable WhatsApp Business Platform functionality in accordance with their policies.')}
              </li>
              <li>
                <strong>{t('sharing.providers.title', 'Service Providers:')}</strong> {t('sharing.providers.content', 'We may share information with third-party service providers who assist us in operating our platform (e.g., cloud hosting, analytics).')}
              </li>
              <li>
                <strong>{t('sharing.legal.title', 'Legal Requirements:')}</strong> {t('sharing.legal.content', 'We may disclose information if required by law or in response to valid legal requests.')}
              </li>
              <li>
                <strong>{t('sharing.consent.title', 'With Your Consent:')}</strong> {t('sharing.consent.content', 'We may share information with your explicit consent or at your direction.')}
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('security.title', 'Data Security')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('security.content', 
                'We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure API connections, access controls, and regular security audits. All WhatsApp communications are processed through Meta\'s secure Cloud API infrastructure.'
              )}
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('retention.title', 'Data Retention')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('retention.content', 
                'We retain your information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Message data is retained according to WhatsApp Business Platform policies and your configured settings.'
              )}
            </p>
          </section>

          {/* User Roles and Access Control */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('roles.title', 'User Roles and Access Control')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('roles.intro', 'Our platform uses role-based access control to protect your data:')}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t('roles.superuser', 'Superuser: System administrators with full platform access')}</li>
              <li>{t('roles.admin', 'Admin: Agency administrators who manage users and settings')}</li>
              <li>{t('roles.user', 'User: Standard users with access to assigned leads and messages')}</li>
              <li>{t('roles.agency', 'Agency Structure: Multi-tenant architecture ensuring data isolation between agencies')}</li>
              <li>{t('roles.rls', 'Row Level Security: Database-level security ensuring users only access their authorized data')}</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('rights.title', 'Your Rights')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('rights.intro', 'You have the following rights regarding your personal information:')}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t('rights.access', 'Access and receive a copy of your personal data')}</li>
              <li>{t('rights.correct', 'Correct inaccurate or incomplete information')}</li>
              <li>{t('rights.delete', 'Request deletion of your personal data')}</li>
              <li>{t('rights.restrict', 'Restrict or object to certain processing activities')}</li>
              <li>{t('rights.portability', 'Data portability where applicable')}</li>
              <li>{t('rights.withdraw', 'Withdraw consent at any time')}</li>
              <li>{t('rights.notifications', 'Manage your notification preferences and phone numbers')}</li>
              <li>{t('rights.optout', 'Opt-out of marketing communications')}</li>
            </ul>
          </section>

          {/* WhatsApp Specific Policies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('whatsapp.title', 'WhatsApp Business Platform Compliance')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('whatsapp.content', 
                'Our use of the WhatsApp Business Platform is subject to Meta\'s terms and policies. We comply with:'
              )}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t('whatsapp.terms', 'WhatsApp Business Terms of Service')}</li>
              <li>{t('whatsapp.policy', 'WhatsApp Business Policy')}</li>
              <li>{t('whatsapp.commerce', 'WhatsApp Commerce Policy')}</li>
              <li>{t('whatsapp.data', 'Meta\'s Data Processing Terms')}</li>
            </ul>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('international.title', 'International Data Transfers')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('international.content', 
                'Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your country. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.'
              )}
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('children.title', 'Children\'s Privacy')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('children.content', 
                'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete such information.'
              )}
            </p>
          </section>

          {/* Updates to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('updates.title', 'Updates to This Privacy Policy')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('updates.content', 
                'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.'
              )}
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('contact.title', 'Contact Us')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('contact.intro', 'If you have any questions about this Privacy Policy or our data practices, please contact us at:')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>{t('contact.email', 'Email:')}</strong> privacy@happycrm.com
              </p>
              <p className="text-gray-700">
                <strong>{t('contact.address', 'Address:')}</strong> Happy CRM Privacy Team
              </p>
              <p className="text-gray-700">
                <strong>{t('contact.phone', 'Phone:')}</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← {t('back', 'Back to Home')}
              </Link>
              <p className="text-sm text-gray-500">
                © 2025 Happy CRM. {t('rights.reserved', 'All rights reserved.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}