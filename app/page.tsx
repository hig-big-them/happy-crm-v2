"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";

export default function Home() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Happy <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">CRM</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            {t.home.hero.subtitle}
          </p>
          <p className="text-lg text-gray-500 mb-12">
            {t.home.hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8 py-3 text-lg">
                {t.home.hero.getStarted}
              </Button>
            </Link>
            <Link href="/messaging">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                {t.home.hero.viewDemo}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.home.features.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.home.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* WhatsApp Integration */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.features.whatsapp.title}</h3>
            <p className="text-gray-600">
              {t.home.features.whatsapp.description}
            </p>
          </div>

          {/* Lead Management */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.features.leadManagement.title}</h3>
            <p className="text-gray-600">
              {t.home.features.leadManagement.description}
            </p>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.features.analytics.title}</h3>
            <p className="text-gray-600">
              {t.home.features.analytics.description}
            </p>
          </div>

          {/* Automation */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.features.automation.title}</h3>
            <p className="text-gray-600">
              {t.home.features.automation.description}
            </p>
          </div>

          {/* Team Collaboration */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.features.teamCollaboration.title}</h3>
            <p className="text-gray-600">
              {t.home.features.teamCollaboration.description}
            </p>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.home.features.security.title}</h3>
            <p className="text-gray-600">
              {t.home.features.security.description}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.home.cta.title}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t.home.cta.subtitle}
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              {t.home.cta.button}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}