'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { restaurantApi } from '@/lib/api';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  created_at: string;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await restaurantApi.getById(id);
        setRestaurant(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await restaurantApi.delete(id);
      router.push('/restaurant/list');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setError('Failed to delete restaurant. Please try again later.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Details</h1>
          <div>
            <Link href="/restaurant/list" className="text-primary-600 hover:text-primary-800 mr-4">
              All Restaurants
            </Link>
            <Link href="/restaurant" className="text-primary-600 hover:text-primary-800">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading restaurant details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              {error}
            </div>
          ) : restaurant ? (
            <div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {restaurant.name}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Restaurant details and information.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Link 
                      href={`/restaurant/${id}/edit`}
                      className="btn-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="btn-danger"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{restaurant.name}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{restaurant.address || 'Not provided'}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{restaurant.phone || 'Not provided'}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{restaurant.email || 'Not provided'}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{restaurant.description || 'Not provided'}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(restaurant.created_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">QR Codes</h2>
                  <p className="text-gray-600 mb-4">Generate and manage QR codes for tables</p>
                  <Link 
                    href={`/restaurant/${id}/qr-codes`}
                    className="btn-primary block text-center"
                  >
                    Manage QR Codes
                  </Link>
                </div>
                
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Bills</h2>
                  <p className="text-gray-600 mb-4">View and manage bills for this restaurant</p>
                  <Link 
                    href={`/restaurant/${id}/bills`}
                    className="btn-primary block text-center"
                  >
                    View Bills
                  </Link>
                </div>
                
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Payments</h2>
                  <p className="text-gray-600 mb-4">Track payments for this restaurant</p>
                  <Link 
                    href={`/restaurant/${id}/payments`}
                    className="btn-primary block text-center"
                  >
                    View Payments
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">Restaurant not found.</p>
              <p className="mt-2">
                <Link href="/restaurant/list" className="text-primary-600 hover:underline">
                  Back to all restaurants
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 