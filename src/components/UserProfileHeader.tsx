'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function UserProfileHeader() {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect is handled in the auth context
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <button
          type="button"
          className="flex items-center space-x-2 text-sm focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
            {user?.user_metadata?.name ? (
              user.user_metadata.name.charAt(0).toUpperCase()
            ) : (
              user?.email?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <span className="hidden md:inline-block font-medium text-gray-700">
            {user?.user_metadata?.name || user?.email || 'User'}
          </span>
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          
          <Link
            href="/user/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Your Profile
          </Link>
          
          <Link
            href="/user/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Settings
          </Link>
          
          <button
            type="button"
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
} 