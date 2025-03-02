'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { restaurantApi } from '@/lib/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
}

interface MenuResponse {
  items: MenuItem[];
}

export default function RestaurantMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table');
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        // Fetch restaurant details
        const restaurantData = await restaurantApi.getById(params.id);
        setRestaurant(restaurantData);
        
        // Fetch menu items
        const menuData = await restaurantApi.getById(`${params.id}/menu`) as MenuResponse;
        const items = menuData.items || [];
        setMenuItems(items);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
        setCategories(uniqueCategories);
        
        // Set the first category as selected by default
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
        
      } catch (err) {
        console.error('Error fetching restaurant and menu:', err);
        setError('Failed to load restaurant menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantAndMenu();
  }, [params.id]);

  const handleStartOrder = () => {
    if (!tableNumber) return;
    
    // Navigate to the bill creation page with restaurant and table info
    router.push(`/scan?restaurant=${params.id}&table=${tableNumber}`);
  };

  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
            {restaurant && (
              <p className="text-gray-600">{restaurant.name}</p>
            )}
            {tableNumber && (
              <p className="text-gray-600">Table: {tableNumber}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-800"
            >
              Back
            </button>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading menu...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              <p>{error}</p>
              <button 
                onClick={() => router.back()}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div>
              {/* Category tabs */}
              <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${selectedCategory === category
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Menu items */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
                    {item.image_url && (
                      <div className="h-48 w-full overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Start order button */}
              {tableNumber && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleStartOrder}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Start Order
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 