'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { billApi } from '@/lib/api';

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
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  joined_at: string;
}

export default function JoinBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billId = searchParams.get('id');
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) {
        setError('No bill ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch bill data from the API
        const billData = await billApi.getById(billId);
        
        // Fetch participants if not included
        if (!billData.participants) {
          const participantsData = await billApi.getById(`${billId}/participants`);
          billData.participants = participantsData || [];
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
  }, [billId]);

  const handleJoinBill = async () => {
    if (!bill || !name.trim()) return;
    
    setJoining(true);
    
    try {
      // Add participant to the bill via API
      const newParticipant = {
        name: name.trim(),
        email: email.trim() || undefined
      };
      
      await billApi.update(`${bill.id}/participants`, newParticipant);
      
      // Fetch updated bill data
      const updatedBill = await billApi.getById(bill.id);
      setBill(updatedBill);
      
      setJoined(true);
    } catch (err) {
      console.error('Error joining bill:', err);
      setError('Failed to join the bill. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleViewBill = () => {
    router.push(`/bill/${billId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Join Bill</h1>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading bill details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Join Bill</h1>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            <p>{error}</p>
            <button 
              onClick={() => router.back()}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Join Bill</h1>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-10">
            <p className="text-gray-600">Bill not found.</p>
            <Link 
              href="/"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Bill</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            Home
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">{bill.restaurant_name}</h2>
                <p className="text-sm text-gray-500">Table {bill.table_number} • Total: ${bill.total_amount.toFixed(2)}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(bill.created_at).toLocaleString()}
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {joined ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="mt-3 text-lg font-medium text-gray-900">You've joined the bill!</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    You can now view the bill and contribute to the payment.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleViewBill}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Bill
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Join this bill</h3>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-4">
                      You've been invited to join a bill at {bill.restaurant_name}. Enter your name to join.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (optional)</label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Participants ({bill.participants.length})</h4>
                    <div className="space-y-2">
                      {bill.participants.map(participant => (
                        <div key={participant.id} className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(participant.joined_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleJoinBill}
                    disabled={!name.trim() || joining}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {joining ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </>
                    ) : (
                      'Join Bill'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 