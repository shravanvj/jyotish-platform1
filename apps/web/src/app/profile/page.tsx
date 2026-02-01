'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  timezone?: string;
  preferredAyanamsa: 'lahiri' | 'raman' | 'krishnamurti' | 'true_chitrapaksha';
  preferredChartStyle: 'south' | 'north';
  emailNotifications: boolean;
  weeklyHoroscope: boolean;
  panchangAlerts: boolean;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  planExpiresAt?: string;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

const tabs = [
  { id: 'profile', name: 'Profile', icon: '👤' },
  { id: 'birth-data', name: 'Birth Data', icon: '🌟' },
  { id: 'preferences', name: 'Preferences', icon: '⚙️' },
  { id: 'notifications', name: 'Notifications', icon: '🔔' },
  { id: 'api-keys', name: 'API Keys', icon: '🔑' },
  { id: 'billing', name: 'Billing', icon: '💳' },
  { id: 'security', name: 'Security', icon: '🔒' },
];

const ayanamsaOptions = [
  { value: 'lahiri', label: 'Lahiri (Chitrapaksha)' },
  { value: 'raman', label: 'Raman' },
  { value: 'krishnamurti', label: 'Krishnamurti (KP)' },
  { value: 'true_chitrapaksha', label: 'True Chitrapaksha' },
];

const mockProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  birthDate: '1990-05-15',
  birthTime: '14:30',
  birthPlace: 'New Delhi, India',
  timezone: 'Asia/Kolkata',
  preferredAyanamsa: 'lahiri',
  preferredChartStyle: 'south',
  emailNotifications: true,
  weeklyHoroscope: true,
  panchangAlerts: false,
  plan: 'basic',
  planExpiresAt: '2024-12-31',
  createdAt: '2023-06-15',
};

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production App',
    key: 'jy_live_xxxx...xxxx1234',
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    usageCount: 1523,
  },
  {
    id: '2',
    name: 'Development',
    key: 'jy_test_xxxx...xxxx5678',
    createdAt: '2024-01-10',
    lastUsed: '2024-01-19',
    usageCount: 892,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateApiKey = () => {
    const newKey: ApiKey = {
      id: String(apiKeys.length + 1),
      name: 'New API Key',
      key: `jy_live_xxxx...xxxx${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
  };

  const planDetails = {
    free: { name: 'Free', price: '$0', charts: 10, matches: 5, api: 100 },
    basic: { name: 'Basic', price: '$9.99/mo', charts: 50, matches: 25, api: 1000 },
    pro: { name: 'Professional', price: '$29.99/mo', charts: 'Unlimited', matches: 'Unlimited', api: 10000 },
    enterprise: { name: 'Enterprise', price: 'Custom', charts: 'Unlimited', matches: 'Unlimited', api: 'Unlimited' },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-8 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Account Settings
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your profile, preferences, and account settings
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <nav className="lg:w-64 shrink-0">
              <div className="card-vedic p-2">
                <ul className="space-y-1">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                          activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <span>{tab.icon}</span>
                        <span className="text-sm font-medium">{tab.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="card-vedic p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-3xl">
                        {profile.name.charAt(0)}
                      </div>
                      <div>
                        <button type="button" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                          Change Avatar
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or GIF. Max 2MB
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Timezone
                        </label>
                        <select
                          value={profile.timezone || ''}
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="Europe/Paris">Europe/Paris (CET)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Birth Data Tab */}
              {activeTab === 'birth-data' && (
                <div className="card-vedic p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-2">Birth Data</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your birth data is used to generate your personal horoscope and for quick chart generation.
                  </p>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Birth Date
                        </label>
                        <input
                          type="date"
                          value={profile.birthDate || ''}
                          onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Birth Time
                        </label>
                        <input
                          type="time"
                          value={profile.birthTime || ''}
                          onChange={(e) => setProfile({ ...profile, birthTime: e.target.value })}
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Birth Place
                        </label>
                        <input
                          type="text"
                          value={profile.birthPlace || ''}
                          onChange={(e) => setProfile({ ...profile, birthPlace: e.target.value })}
                          placeholder="City, Country"
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your exact birth location for accurate chart calculations
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="text-sm font-medium text-foreground mb-2">Your Ascendant Chart</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">Leo</p>
                          <p className="text-xs text-muted-foreground">Ascendant</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Taurus</p>
                          <p className="text-xs text-muted-foreground">Moon Sign</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">Aries</p>
                          <p className="text-xs text-muted-foreground">Sun Sign</p>
                        </div>
                      </div>
                      <Link
                        href="/chart"
                        className="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View Full Chart →
                      </Link>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Birth Data'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="card-vedic p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Calculation Preferences</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ayanamsa
                      </label>
                      <select
                        value={profile.preferredAyanamsa}
                        onChange={(e) => setProfile({ ...profile, preferredAyanamsa: e.target.value as UserProfile['preferredAyanamsa'] })}
                        className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {ayanamsaOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ayanamsa is used to calculate the precession of equinoxes for sidereal positions
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Preferred Chart Style
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="chartStyle"
                            value="south"
                            checked={profile.preferredChartStyle === 'south'}
                            onChange={() => setProfile({ ...profile, preferredChartStyle: 'south' })}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm text-foreground">South Indian</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="chartStyle"
                            value="north"
                            checked={profile.preferredChartStyle === 'north'}
                            onChange={() => setProfile({ ...profile, preferredChartStyle: 'north' })}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm text-foreground">North Indian</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="card-vedic p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Email Notifications</h3>
                        <p className="text-xs text-muted-foreground">Receive updates about your account</p>
                      </div>
                      <button
                        onClick={() => setProfile({ ...profile, emailNotifications: !profile.emailNotifications })}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          profile.emailNotifications ? 'bg-primary-600' : 'bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            profile.emailNotifications ? 'left-7' : 'left-1'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Weekly Horoscope</h3>
                        <p className="text-xs text-muted-foreground">Get your personalized weekly horoscope every Monday</p>
                      </div>
                      <button
                        onClick={() => setProfile({ ...profile, weeklyHoroscope: !profile.weeklyHoroscope })}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          profile.weeklyHoroscope ? 'bg-primary-600' : 'bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            profile.weeklyHoroscope ? 'left-7' : 'left-1'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Panchang Alerts</h3>
                        <p className="text-xs text-muted-foreground">Get notified about important muhurtas and festivals</p>
                      </div>
                      <button
                        onClick={() => setProfile({ ...profile, panchangAlerts: !profile.panchangAlerts })}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          profile.panchangAlerts ? 'bg-primary-600' : 'bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            profile.panchangAlerts ? 'left-7' : 'left-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api-keys' && (
                <div className="card-vedic p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
                      <p className="text-sm text-muted-foreground">Manage your API keys for programmatic access</p>
                    </div>
                    <button
                      onClick={handleCreateApiKey}
                      className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      + Create Key
                    </button>
                  </div>

                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-foreground">{apiKey.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono mt-1">{apiKey.key}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                          >
                            Revoke
                          </button>
                        </div>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Created: {apiKey.createdAt}</span>
                          <span>Last used: {apiKey.lastUsed || 'Never'}</span>
                          <span>Requests: {apiKey.usageCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h3 className="text-sm font-medium text-foreground mb-2">API Usage</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Requests this month</span>
                      <span className="font-medium text-foreground">2,415 / 10,000</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="card-vedic p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
                    <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-950 rounded-lg">
                      <div>
                        <p className="text-xl font-bold text-foreground">{planDetails[profile.plan].name}</p>
                        <p className="text-sm text-muted-foreground">{planDetails[profile.plan].price}</p>
                        {profile.planExpiresAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Renews on {profile.planExpiresAt}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/pricing"
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Upgrade Plan
                      </Link>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {planDetails[profile.plan].charts}
                        </p>
                        <p className="text-xs text-muted-foreground">Charts/month</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {planDetails[profile.plan].matches}
                        </p>
                        <p className="text-xs text-muted-foreground">Kundli Matches</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {planDetails[profile.plan].api}
                        </p>
                        <p className="text-xs text-muted-foreground">API Calls</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-vedic p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
                    <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="text-2xl">💳</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                      </div>
                      <button className="ml-auto text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="card-vedic p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Billing History</h2>
                    <div className="space-y-3">
                      {[
                        { date: '2024-01-01', amount: '$9.99', status: 'Paid', invoice: 'INV-001' },
                        { date: '2023-12-01', amount: '$9.99', status: 'Paid', invoice: 'INV-000' },
                      ].map((invoice) => (
                        <div key={invoice.invoice} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{invoice.date}</span>
                            <span className="text-sm font-medium text-foreground">{invoice.amount}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              {invoice.status}
                            </span>
                          </div>
                          <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="card-vedic p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Change Password</h2>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="input w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="card-vedic p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Two-Factor Authentication</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="card-vedic p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Active Sessions</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💻</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">Chrome on Windows</p>
                            <p className="text-xs text-muted-foreground">Mumbai, India • Current session</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📱</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">Safari on iPhone</p>
                            <p className="text-xs text-muted-foreground">Mumbai, India • 2 days ago</p>
                          </div>
                        </div>
                        <button className="text-xs text-red-600 dark:text-red-400 hover:underline">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card-vedic p-6 border-red-200 dark:border-red-900">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
