'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
}

interface ApiSection {
  id: string;
  name: string;
  description: string;
  endpoints: Endpoint[];
}

const apiSections: ApiSection[] = [
  {
    id: 'birth-chart',
    name: 'Birth Chart',
    description: 'Generate and analyze Vedic birth charts (Kundli)',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/chart/generate',
        description: 'Generate a complete birth chart with planetary positions',
        parameters: [
          { name: 'date', type: 'string', required: true, description: 'Birth date in YYYY-MM-DD format' },
          { name: 'time', type: 'string', required: true, description: 'Birth time in HH:MM format (24-hour)' },
          { name: 'latitude', type: 'number', required: true, description: 'Birth location latitude' },
          { name: 'longitude', type: 'number', required: true, description: 'Birth location longitude' },
          { name: 'timezone', type: 'string', required: true, description: 'Timezone (e.g., Asia/Kolkata)' },
          { name: 'ayanamsa', type: 'string', required: false, description: 'Ayanamsa system (lahiri, raman, etc.)' },
        ],
        responseExample: `{
  "ascendant": { "sign": "Leo", "degree": 15.45 },
  "planets": [
    { "name": "Sun", "sign": "Aries", "degree": 24.32, "house": 9, "retrograde": false },
    { "name": "Moon", "sign": "Taurus", "degree": 8.15, "house": 10, "retrograde": false }
  ],
  "houses": [...],
  "nakshatras": [...]
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/chart/{id}',
        description: 'Retrieve a saved birth chart by ID',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Chart ID' },
        ],
        responseExample: `{
  "id": "chart_abc123",
  "name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "chart_data": {...}
}`,
      },
    ],
  },
  {
    id: 'panchang',
    name: 'Panchang',
    description: 'Daily Hindu calendar with tithi, nakshatra, yoga, and more',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/panchang/daily',
        description: 'Get panchang for a specific date and location',
        parameters: [
          { name: 'date', type: 'string', required: true, description: 'Date in YYYY-MM-DD format' },
          { name: 'latitude', type: 'number', required: true, description: 'Location latitude' },
          { name: 'longitude', type: 'number', required: true, description: 'Location longitude' },
          { name: 'timezone', type: 'string', required: true, description: 'Timezone' },
        ],
        responseExample: `{
  "date": "2024-01-15",
  "tithi": { "name": "Shukla Panchami", "end_time": "14:30:00" },
  "nakshatra": { "name": "Rohini", "pada": 2, "end_time": "18:45:00" },
  "yoga": { "name": "Siddhi", "end_time": "12:15:00" },
  "karana": { "name": "Bava", "end_time": "14:30:00" },
  "sunrise": "07:12:00",
  "sunset": "17:58:00"
}`,
      },
    ],
  },
  {
    id: 'matchmaking',
    name: 'Matchmaking',
    description: 'Kundli matching for marriage compatibility',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/match/calculate',
        description: 'Calculate Ashtakoot Guna Milan between two charts',
        parameters: [
          { name: 'person1', type: 'object', required: true, description: 'First person birth data' },
          { name: 'person2', type: 'object', required: true, description: 'Second person birth data' },
        ],
        responseExample: `{
  "total_score": 28,
  "max_score": 36,
  "guna_details": [
    { "name": "Varna", "score": 1, "max": 1 },
    { "name": "Vashya", "score": 2, "max": 2 }
  ],
  "doshas": {
    "manglik_person1": false,
    "manglik_person2": true,
    "nadi_dosha": false
  },
  "recommendation": "Good match with minor considerations"
}`,
      },
    ],
  },
  {
    id: 'muhurat',
    name: 'Muhurat',
    description: 'Find auspicious timings for various activities',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/muhurat/find',
        description: 'Find auspicious muhurats for a specific event type',
        parameters: [
          { name: 'event_type', type: 'string', required: true, description: 'Type of event (marriage, griha_pravesh, etc.)' },
          { name: 'start_date', type: 'string', required: true, description: 'Search start date' },
          { name: 'end_date', type: 'string', required: true, description: 'Search end date' },
          { name: 'latitude', type: 'number', required: true, description: 'Location latitude' },
          { name: 'longitude', type: 'number', required: true, description: 'Location longitude' },
        ],
        responseExample: `{
  "muhurats": [
    {
      "date": "2024-01-20",
      "start_time": "09:30",
      "end_time": "11:45",
      "quality": "excellent",
      "tithi": "Shukla Dashami",
      "nakshatra": "Hasta"
    }
  ]
}`,
      },
    ],
  },
  {
    id: 'horoscope',
    name: 'Horoscope',
    description: 'Daily, weekly, monthly predictions by rashi',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/horoscope/{rashi}',
        description: 'Get horoscope predictions for a zodiac sign',
        parameters: [
          { name: 'rashi', type: 'string', required: true, description: 'Zodiac sign (aries, taurus, etc.)' },
          { name: 'type', type: 'string', required: false, description: 'Period type (daily, weekly, monthly, yearly)' },
          { name: 'date', type: 'string', required: false, description: 'Date for prediction' },
        ],
        responseExample: `{
  "rashi": "aries",
  "type": "daily",
  "date": "2024-01-15",
  "predictions": {
    "general": "Today brings positive energy...",
    "love": "Romantic matters look favorable...",
    "career": "Professional growth indicated...",
    "health": "Focus on wellness...",
    "finance": "Good day for investments..."
  },
  "lucky_number": 7,
  "lucky_color": "Red"
}`,
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState(apiSections[0].id);
  const [apiKey, setApiKey] = useState('sk_test_xxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <>
      <Header />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              API Documentation
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Integrate Vedic astrology calculations into your applications with our 
              comprehensive REST API.
            </p>
          </div>

          {/* Quick Start */}
          <div className="mt-8 card-vedic p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Start</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Your API Key</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded bg-muted text-sm font-mono">
                    {showApiKey ? apiKey : '••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-2 rounded bg-muted hover:bg-muted/80 text-sm transition-colors"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiKey)}
                    className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Base URL</h3>
                <code className="block px-3 py-2 rounded bg-muted text-sm font-mono">
                  https://api.jyotish.app/api/v1
                </code>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Example Request</h3>
              <pre className="p-4 rounded bg-gray-900 text-gray-100 text-sm overflow-x-auto">
{`curl -X POST https://api.jyotish.app/api/v1/chart/generate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "date": "1990-05-15",
    "time": "14:30",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "Asia/Kolkata"
  }'`}
              </pre>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-8 flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <nav className="lg:w-64 shrink-0">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold text-foreground mb-4">API Reference</h3>
                <ul className="space-y-1">
                  {apiSections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          activeSection === section.id
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                            : 'text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {section.name}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-foreground">
                        Authentication →
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-foreground">
                        Rate Limits →
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-foreground">
                        Error Codes →
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-muted-foreground hover:text-foreground">
                        SDKs & Libraries →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {apiSections.map((section) => (
                <div
                  key={section.id}
                  className={cn(
                    'space-y-6',
                    activeSection !== section.id && 'hidden'
                  )}
                >
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{section.name}</h2>
                    <p className="mt-2 text-muted-foreground">{section.description}</p>
                  </div>

                  {section.endpoints.map((endpoint, index) => (
                    <div key={index} className="card-vedic overflow-hidden">
                      {/* Endpoint Header */}
                      <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-3">
                        <span className={cn('px-2 py-1 rounded text-xs font-bold', methodColors[endpoint.method])}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-4">{endpoint.description}</p>
                        
                        {/* Parameters */}
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Parameters</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Name</th>
                                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Type</th>
                                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Required</th>
                                    <th className="text-left py-2 text-muted-foreground font-medium">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param, pIndex) => (
                                    <tr key={pIndex} className="border-b border-border last:border-0">
                                      <td className="py-2 pr-4">
                                        <code className="text-primary-600 dark:text-primary-400">{param.name}</code>
                                      </td>
                                      <td className="py-2 pr-4 text-muted-foreground">{param.type}</td>
                                      <td className="py-2 pr-4">
                                        <span className={cn(
                                          'px-2 py-0.5 rounded text-xs',
                                          param.required 
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                        )}>
                                          {param.required ? 'Required' : 'Optional'}
                                        </span>
                                      </td>
                                      <td className="py-2 text-muted-foreground">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Response Example */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Response Example</h4>
                          <pre className="p-4 rounded bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                            {endpoint.responseExample}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 card-vedic p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Ready to Get Started?</h2>
            <p className="mt-2 text-muted-foreground">
              Sign up for a free account to get your API key and start building.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Get API Key
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-2 rounded-lg border border-input bg-background hover:bg-muted transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
