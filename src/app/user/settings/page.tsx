'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userApi } from '@/lib/api';

interface SettingsForm {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    theme: string;
  };
  privacy: {
    shareData: boolean;
    locationTracking: boolean;
  };
}

export default function UserSettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    preferences: {
      language: 'english',
      currency: 'usd',
      theme: 'light',
    },
    privacy: {
      shareData: false,
      locationTracking: false,
    },
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // For demonstration purposes, we'll use a hardcoded user ID
        // In a real app, this would come from authentication
        const userId = 'user-123';
        
        // In a real implementation, we would fetch user settings from the backend
        // For now, we'll use the default settings defined in state
        // Example of how it would be implemented:
        // const userSettings = await userApi.getSettings(userId);
        // setSettings(userSettings);
        
        // Simulate API call
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again later.');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: checked,
      },
    });
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [name]: value,
      },
    });
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [name]: checked,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // For demonstration purposes, we'll use a hardcoded user ID
      // In a real app, this would come from authentication
      const userId = 'user-123';
      
      // In a real implementation, we would save the settings to the backend
      // Example of how it would be implemented:
      // await userApi.updateSettings(userId, settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <div>
            <Link href="/user" className="text-primary-600 hover:text-primary-800 mr-4">
              Dashboard
            </Link>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                {error}
              </div>
            )}
            
            {saveSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
                Settings saved successfully!
              </div>
            )}
            
            {/* Notification Settings */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Notification Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage how you receive notifications.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email"
                        name="email"
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={handleNotificationChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email" className="font-medium text-gray-700">Email Notifications</label>
                      <p className="text-gray-500">Receive notifications via email.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="push"
                        name="push"
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={handleNotificationChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="push" className="font-medium text-gray-700">Push Notifications</label>
                      <p className="text-gray-500">Receive push notifications on your device.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms"
                        name="sms"
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={handleNotificationChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms" className="font-medium text-gray-700">SMS Notifications</label>
                      <p className="text-gray-500">Receive notifications via SMS.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preferences */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Preferences
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Customize your app experience.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={settings.preferences.language}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={settings.preferences.currency}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                      <option value="jpy">JPY (¥)</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                      Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      value={settings.preferences.theme}
                      onChange={handlePreferenceChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Privacy Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your privacy preferences.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="shareData"
                        name="shareData"
                        type="checkbox"
                        checked={settings.privacy.shareData}
                        onChange={handlePrivacyChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="shareData" className="font-medium text-gray-700">Share Usage Data</label>
                      <p className="text-gray-500">Allow us to collect anonymous usage data to improve the app.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="locationTracking"
                        name="locationTracking"
                        type="checkbox"
                        checked={settings.privacy.locationTracking}
                        onChange={handlePrivacyChange}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="locationTracking" className="font-medium text-gray-700">Location Tracking</label>
                      <p className="text-gray-500">Allow the app to track your location for restaurant recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 