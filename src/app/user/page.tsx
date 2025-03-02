'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import UserProfileHeader from '@/components/UserProfileHeader';

export default function UserPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Klub Customer</h1>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Back to Home
            </Link>
            {user ? <UserProfileHeader /> : (
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-800">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? `Welcome, ${user.user_metadata?.name || 'User'}!` : 'Welcome to Klub!'}
            </h2>
            <p className="text-gray-600">
              Manage your restaurant payments and bills from your dashboard.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* QR Scanner Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
              <p className="text-gray-600 mb-4">Scan a restaurant QR code to view your bill</p>
              <Link 
                href="/scan" 
                className="btn-primary block text-center"
              >
                Open Scanner
              </Link>
            </div>
            
            {/* Recent Bills Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
              <p className="text-gray-600 mb-4">View your recent restaurant bills</p>
              <Link 
                href="/user/bills" 
                className="btn-primary block text-center"
              >
                View Bills
              </Link>
            </div>
            
            {/* Profile Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <p className="text-gray-600 mb-4">Manage your account and payment methods</p>
              <Link 
                href={user ? "/user/profile" : "/auth/login?redirectTo=/user/profile"} 
                className="btn-primary block text-center"
              >
                View Profile
              </Link>
            </div>
            
            {/* Payment History Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Payment History</h2>
              <p className="text-gray-600 mb-4">View your payment history and receipts</p>
              <Link 
                href={user ? "/user/payments" : "/auth/login?redirectTo=/user/payments"} 
                className="btn-primary block text-center"
              >
                View Payments
              </Link>
            </div>
            
            {/* Split Bill Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Split Bill</h2>
              <p className="text-gray-600 mb-4">Split a bill with friends and family</p>
              <Link 
                href="/bill/split" 
                className="btn-primary block text-center"
              >
                Split a Bill
              </Link>
            </div>
            
            {/* Settings Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <p className="text-gray-600 mb-4">Manage your app settings and preferences</p>
              <Link 
                href={user ? "/user/settings" : "/auth/login?redirectTo=/user/settings"} 
                className="btn-primary block text-center"
              >
                View Settings
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 