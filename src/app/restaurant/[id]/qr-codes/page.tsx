'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { restaurantApi } from '@/lib/api';
import QRCode from 'qrcode.react';

interface Restaurant {
  id: string;
  name: string;
}

interface QRCodeData {
  id: string;
  restaurant_id: string;
  table_number: number;
  created_at: string;
  url: string;
}

export default function RestaurantQRCodesPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant details
        const restaurantData = await restaurantApi.getById(id);
        setRestaurant(restaurantData);
        
        // In a real app, we would fetch QR codes for this restaurant
        // For now, we'll use mock data
        setQrCodes([
          {
            id: '1',
            restaurant_id: id,
            table_number: 1,
            created_at: new Date().toISOString(),
            url: `https://klub.app/scan?restaurant=${id}&table=1`
          },
          {
            id: '2',
            restaurant_id: id,
            table_number: 2,
            created_at: new Date().toISOString(),
            url: `https://klub.app/scan?restaurant=${id}&table=2`
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load restaurant data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleGenerateQRCode = async () => {
    if (!tableNumber || tableNumber < 1) {
      setGenerateError('Please enter a valid table number');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      // In a real app, we would call the API to generate a QR code
      // For now, we'll simulate it
      const newQRCode = {
        id: Date.now().toString(),
        restaurant_id: id,
        table_number: tableNumber,
        created_at: new Date().toISOString(),
        url: `https://klub.app/scan?restaurant=${id}&table=${tableNumber}`
      };

      setQrCodes(prev => [...prev, newQRCode]);
      setTableNumber(prev => prev + 1);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setGenerateError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintQRCode = (qrCode: QRCodeData) => {
    // In a real app, we would handle printing
    // For now, we'll just log to console
    console.log('Printing QR code for table', qrCode.table_number);
    alert(`Printing QR code for table ${qrCode.table_number}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 max-w-md">
          <p>{error}</p>
          <div className="mt-4">
            <Link href={`/restaurant/${id}`} className="text-primary-600 hover:underline">
              Back to restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
          <div>
            <Link href={`/restaurant/${id}`} className="text-primary-600 hover:text-primary-800 mr-4">
              Back to Restaurant
            </Link>
            <Link href="/restaurant" className="text-primary-600 hover:text-primary-800">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Generate QR Code for {restaurant?.name}
            </h2>
            
            {generateError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                {generateError}
              </div>
            )}
            
            <div className="flex items-end space-x-4">
              <div>
                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="number"
                  id="tableNumber"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <button
                onClick={handleGenerateQRCode}
                disabled={isGenerating}
                className="btn-primary"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">Existing QR Codes</h3>
          
          {qrCodes.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <p className="text-gray-600">No QR codes generated yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((qrCode) => (
                <div key={qrCode.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Table {qrCode.table_number}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(qrCode.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <QRCode 
                      value={qrCode.url} 
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500 break-all">{qrCode.url}</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={() => handlePrintQRCode(qrCode)}
                      className="btn-secondary text-sm"
                    >
                      Print QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 