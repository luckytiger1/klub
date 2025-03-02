'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { restaurantApi, billApi } from '@/lib/api';

// Dynamically import the QR scanner to avoid SSR issues
const QrScanner = dynamic(() => import('react-qr-scanner'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
      <p className="text-gray-500">Loading scanner...</p>
    </div>
  )
});

interface Restaurant {
  id: string;
  name: string;
  address: string;
  logo_url?: string;
}

interface Bill {
  id: string;
  table_number: number;
  status: 'open' | 'paid' | 'closed';
  created_at: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingBills, setExistingBills] = useState<Bill[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Reset state when component mounts
    setScanning(true);
    setScannedData(null);
    setRestaurant(null);
    setTableNumber(null);
    setLoading(false);
    setError(null);
    setExistingBills([]);
    setShowOptions(false);
  }, []);

  const handleScan = async (data: { text: string } | null) => {
    if (data && data.text && !scannedData) {
      setScannedData(data.text);
      setScanning(false);
      setLoading(true);

      try {
        // Parse the QR code data
        console.log('Scanned QR code:', data.text);
        const url = new URL(data.text);
        let restaurantId: string;
        let tableNum: number;
        
        // Handle two different QR code formats:
        // 1. klub://restaurant/{restaurantId}/table/{tableNumber}
        // 2. https://klub.app/scan?restaurant={restaurantId}&table={tableNumber}
        // 3. http://localhost:3000/scan?restaurant={restaurantId}&table={tableNumber} (for development)
        
        if (url.protocol === 'klub:') {
          // Original format: klub://restaurant/{restaurantId}/table/{tableNumber}
          const pathParts = url.pathname.split('/').filter(Boolean);
          
          if (pathParts[0] !== 'restaurant' || pathParts[2] !== 'table') {
            console.log('Invalid QR code path format:', url.pathname);
            throw new Error('Invalid QR code format');
          }
          
          restaurantId = pathParts[1];
          tableNum = parseInt(pathParts[3], 10);
        } else {
          // Web URL formats: 
          // - https://klub.app/scan?restaurant={restaurantId}&table={tableNumber}
          // - http://localhost:3000/scan?restaurant={restaurantId}&table={tableNumber}
          console.log('Processing web URL format:', url.toString());
          
          const restaurantParam = url.searchParams.get('restaurant');
          const tableParam = url.searchParams.get('table');
          
          if (!restaurantParam || !tableParam) {
            console.log('Missing restaurant ID or table number in URL parameters');
            throw new Error('Invalid QR code format');
          }
          
          restaurantId = restaurantParam;
          tableNum = parseInt(tableParam, 10);
        }

        if (isNaN(tableNum)) {
          throw new Error('Invalid table number');
        }

        setTableNumber(tableNum);

        // Fetch restaurant details from the API
        const restaurantData = await restaurantApi.getById(restaurantId);
        setRestaurant(restaurantData);

        // Fetch existing open bills for this table
        const bills = await billApi.getAll();
        const openBills = bills.filter((bill: Bill) => 
          bill.table_number === tableNum && 
          bill.status === 'open'
        );
        
        setExistingBills(openBills);
        setShowOptions(true);
      } catch (err) {
        console.error('Error processing QR code:', err);
        setError('Invalid QR code or error connecting to server. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err: Error) => {
    console.error('QR Scanner error:', err);
    setError('Error accessing camera. Please check permissions and try again.');
  };

  const handleViewMenu = () => {
    if (!restaurant) return;
    
    router.push(`/restaurant/${restaurant.id}/menu?table=${tableNumber}`);
  };

  const handleJoinBill = (billId: string) => {
    router.push(`/bill/join?id=${billId}`);
  };

  const handleCreateBill = async () => {
    if (!restaurant || tableNumber === null) return;
    
    setLoading(true);
    
    try {
      // Create a new bill via the API
      const newBill = await billApi.create({
        restaurant_id: restaurant.id,
        table_number: tableNumber,
        status: 'open'
      });
      
      // Navigate to the bill page
      router.push(`/bill/${newBill.id}`);
    } catch (err) {
      console.error('Error creating bill:', err);
      setError('Failed to create bill. Please try again.');
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setScannedData(null);
    setRestaurant(null);
    setTableNumber(null);
    setLoading(false);
    setError(null);
    setExistingBills([]);
    setShowOptions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            Home
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {scanning ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Scan a restaurant QR code
                </h2>
                <div className="mb-4">
                  <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%', height: 'auto' }}
                    constraints={{ video: { facingMode: "environment" } }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Position the QR code within the scanner frame to scan it automatically.
                </p>
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                    <p>{error}</p>
                    <button 
                      onClick={resetScanner}
                      className="mt-2 text-red-600 hover:text-red-800 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                <p className="mt-2 text-gray-600">Processing...</p>
              </div>
            </div>
          ) : restaurant && showOptions ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex items-center">
                {restaurant.logo_url && (
                  <img 
                    src={restaurant.logo_url} 
                    alt={restaurant.name} 
                    className="h-12 w-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{restaurant.name}</h2>
                  <p className="text-sm text-gray-500">Table {tableNumber}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">What would you like to do?</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleViewMenu}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      View Menu
                    </div>
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {existingBills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Join Existing Bill</h4>
                      {existingBills.map(bill => (
                        <button
                          key={bill.id}
                          onClick={() => handleJoinBill(bill.id)}
                          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-2"
                        >
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Join Bill (Created {new Date(bill.created_at).toLocaleTimeString()})
                          </div>
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={handleCreateBill}
                    className="w-full flex items-center justify-between px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Start New Bill
                    </div>
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={resetScanner}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="h-5 w-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Scan Again
                  </button>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                  <p>{error}</p>
                  <button 
                    onClick={resetScanner}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">No data scanned. Please try again.</p>
                <button 
                  onClick={resetScanner}
                  className="mt-2 text-primary-600 hover:text-primary-800 font-medium"
                >
                  Restart Scanner
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 