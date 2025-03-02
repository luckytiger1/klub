'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { billApi, paymentApi, restaurantApi } from '@/lib/api';

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Bill {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  table_number: number;
  status: 'open' | 'paid' | 'closed';
  total_amount: number;
  created_at: string;
  items: BillItem[];
}

export default function BillPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        // Fetch bill data from the API
        const billData = await billApi.getById(params.id);
        
        // If restaurant name is not included in the bill data, fetch it
        if (!billData.restaurant_name && billData.restaurant_id) {
          const restaurantData = await restaurantApi.getById(billData.restaurant_id);
          billData.restaurant_name = restaurantData.name;
        }
        
        // Fetch bill items if not included
        if (!billData.items) {
          const itemsData = await billApi.getItems(params.id);
          billData.items = itemsData;
        }
        
        setBill(billData);
      } catch (err) {
        console.error('Error fetching bill:', err);
        setError('Failed to load bill details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBill();
  }, [params.id]);

  const handlePayment = async () => {
    if (!paymentMethod || !bill) return;
    
    setIsProcessingPayment(true);
    
    try {
      // Process payment through the API
      await paymentApi.create({
        bill_id: bill.id,
        amount: bill.total_amount,
        method: paymentMethod,
        status: 'completed'
      });
      
      // Update bill status to paid
      await billApi.update(bill.id, { status: 'paid' });
      
      // Set payment success
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleViewMenu = () => {
    if (!bill) return;
    
    // Navigate to the restaurant menu
    router.push(`/restaurant/${bill.restaurant_id}/menu?table=${bill.table_number}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Bill</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            Home
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading bill details...</p>
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
          ) : paymentSuccess ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-3 text-lg font-medium text-gray-900">Payment Successful!</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Thank you for your payment. Your receipt has been sent to your email.
                </p>
              </div>
              
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Return Home
                </Link>
              </div>
            </div>
          ) : bill ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{bill.restaurant_name}</h2>
                  <p className="text-sm text-gray-500">Table {bill.table_number}</p>
                </div>
                <button
                  onClick={handleViewMenu}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  View Menu
                </button>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Items</h3>
                
                <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bill.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={3} scope="row" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Total
                        </th>
                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                          ${bill.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`relative block w-full rounded-lg border-2 p-4 focus:outline-none ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">Credit/Debit Card</h4>
                        <p className="text-xs text-gray-500">Pay with Visa, Mastercard, etc.</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`relative block w-full rounded-lg border-2 p-4 focus:outline-none ${
                      paymentMethod === 'apple_pay'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">Apple Pay</h4>
                        <p className="text-xs text-gray-500">Fast and secure payment</p>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={!paymentMethod || isProcessingPayment}
                    className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay $${bill.total_amount.toFixed(2)}`
                    )}
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <Link
                    href={`/bill/split?id=${bill.id}`}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Split this bill with friends
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">Bill not found.</p>
              <Link 
                href="/"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Return Home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 