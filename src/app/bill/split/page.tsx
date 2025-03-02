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
  splitCount: number;
  assignedTo: string[];
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

interface SplitParticipant {
  id: string;
  name: string;
  email: string;
  items: string[];
  amount: number;
}

export default function BillSplitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billId = searchParams.get('id');
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [participants, setParticipants] = useState<SplitParticipant[]>([
    { id: 'user-1', name: 'You', email: '', items: [], amount: 0 }
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'itemized'>('equal');
  const [linkCopied, setLinkCopied] = useState(false);
  const [splitComplete, setSplitComplete] = useState(false);

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
        
        // Fetch bill items if not included
        if (!billData.items) {
          const itemsData = await billApi.getItems(billId);
          billData.items = itemsData;
        }
        
        // Add splitCount and assignedTo properties to each item
        const enhancedItems = billData.items.map((item: any) => ({
          ...item,
          splitCount: 0,
          assignedTo: []
        }));
        
        setBill({
          ...billData,
          items: enhancedItems
        });
      } catch (err) {
        console.error('Error fetching bill:', err);
        setError('Failed to load bill details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBill();
  }, [billId]);

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;
    
    const newParticipant: SplitParticipant = {
      id: `user-${participants.length + 1}`,
      name: newParticipantName.trim(),
      email: newParticipantEmail.trim(),
      items: [],
      amount: 0
    };
    
    setParticipants([...participants, newParticipant]);
    setNewParticipantName('');
    setNewParticipantEmail('');
  };

  const removeParticipant = (id: string) => {
    // Don't remove the first participant (You)
    if (id === 'user-1') return;
    
    // Remove participant
    setParticipants(participants.filter(p => p.id !== id));
    
    // Unassign items from this participant
    if (bill) {
      const updatedItems = bill.items.map(item => ({
        ...item,
        assignedTo: item.assignedTo.filter(userId => userId !== id),
        splitCount: item.assignedTo.filter(userId => userId !== id).length
      }));
      
      setBill({
        ...bill,
        items: updatedItems
      });
    }
  };

  const toggleItemAssignment = (itemId: string, participantId: string) => {
    if (!bill) return;
    
    const updatedItems = bill.items.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(participantId);
        
        if (isAssigned) {
          // Remove assignment
          return {
            ...item,
            assignedTo: item.assignedTo.filter(id => id !== participantId),
            splitCount: item.assignedTo.filter(id => id !== participantId).length
          };
        } else {
          // Add assignment
          return {
            ...item,
            assignedTo: [...item.assignedTo, participantId],
            splitCount: item.assignedTo.length + 1
          };
        }
      }
      return item;
    });
    
    setBill({
      ...bill,
      items: updatedItems
    });
  };

  const calculateEqualSplit = () => {
    if (!bill) return 0;
    return bill.total_amount / participants.length;
  };

  const calculateItemizedAmounts = () => {
    if (!bill) return;
    
    // Reset all participant amounts
    const updatedParticipants = participants.map(p => ({
      ...p,
      amount: 0
    }));
    
    // Calculate amounts based on item assignments
    bill.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      
      if (item.splitCount === 0) {
        // If item is not assigned to anyone, assign to first participant (You)
        const firstParticipant = updatedParticipants.find(p => p.id === 'user-1');
        if (firstParticipant) {
          firstParticipant.amount += itemTotal;
        }
      } else {
        // Split item cost among assigned participants
        const perPersonCost = itemTotal / item.splitCount;
        
        item.assignedTo.forEach(participantId => {
          const participant = updatedParticipants.find(p => p.id === participantId);
          if (participant) {
            participant.amount += perPersonCost;
          }
        });
      }
    });
    
    setParticipants(updatedParticipants);
  };

  const handleSplitMethodChange = (method: 'equal' | 'itemized') => {
    setSplitMethod(method);
    
    if (method === 'equal') {
      // Update participant amounts for equal split
      const equalAmount = calculateEqualSplit();
      const updatedParticipants = participants.map(p => ({
        ...p,
        amount: equalAmount
      }));
      setParticipants(updatedParticipants);
    } else {
      // Update participant amounts for itemized split
      calculateItemizedAmounts();
    }
  };

  useEffect(() => {
    // Update amounts when participants change
    if (splitMethod === 'equal') {
      const equalAmount = calculateEqualSplit();
      const updatedParticipants = participants.map(p => ({
        ...p,
        amount: equalAmount
      }));
      setParticipants(updatedParticipants);
    } else {
      calculateItemizedAmounts();
    }
  }, [participants.length, splitMethod]);

  useEffect(() => {
    // Update itemized amounts when item assignments change
    if (splitMethod === 'itemized') {
      calculateItemizedAmounts();
    }
  }, [bill?.items]);

  const copyShareLink = () => {
    if (!billId) return;
    
    const shareLink = `${window.location.origin}/bill/join?id=${billId}`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  const completeSplit = async () => {
    if (!bill) return;
    
    try {
      // Save the split information to the API
      await billApi.update(`${bill.id}/split`, {
        participants: participants.map(p => ({
          name: p.name,
          email: p.email || undefined,
          amount: p.amount
        }))
      });
      
      setSplitComplete(true);
    } catch (err) {
      console.error('Error completing split:', err);
      setError('Failed to save split information. Please try again.');
    }
  };

  const sendPaymentRequests = async () => {
    if (!bill) return;
    
    try {
      // Send payment requests via the API
      await billApi.update(`${bill.id}/payment-requests`, {
        participants: participants.filter(p => p.id !== 'user-1')
      });
      
      // Navigate back to the bill page
      router.push(`/bill/${billId}`);
    } catch (err) {
      console.error('Error sending payment requests:', err);
      setError('Failed to send payment requests. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Split Bill</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Split Bill</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Split Bill</h1>
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

  if (splitComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Split Complete</h1>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-lg font-medium text-gray-900">Bill Split Complete!</h2>
              <p className="mt-2 text-sm text-gray-500">
                The bill has been split successfully. You can now send payment requests to your friends.
              </p>
            </div>
            
            <div className="mt-6">
              <button
                onClick={sendPaymentRequests}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Send Payment Requests
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Split Bill</h1>
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
              <Link
                href={`/bill/${bill.id}`}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                View Bill
              </Link>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Split Method</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                <button
                  type="button"
                  onClick={() => handleSplitMethodChange('equal')}
                  className={`relative block w-full rounded-lg border-2 p-4 focus:outline-none ${
                    splitMethod === 'equal'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">Split Equally</h4>
                      <p className="text-xs text-gray-500">Everyone pays the same amount</p>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSplitMethodChange('itemized')}
                  className={`relative block w-full rounded-lg border-2 p-4 focus:outline-none ${
                    splitMethod === 'itemized'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">Split by Items</h4>
                      <p className="text-xs text-gray-500">Assign specific items to each person</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participants</h3>
              
              <div className="space-y-4 mb-6">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                        {participant.email && (
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 mr-4">
                        ${participant.amount.toFixed(2)}
                      </p>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeParticipant(participant.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Add Participant</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Name"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Email (optional)"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addParticipant}
                  disabled={!newParticipantName.trim()}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Add Participant
                </button>
              </div>
              
              {splitMethod === 'itemized' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Items</h3>
                  
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
                          {participants.map(participant => (
                            <th key={participant.id} scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {participant.name.substring(0, 3)}
                            </th>
                          ))}
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
                            {participants.map(participant => (
                              <td key={`${item.id}-${participant.id}`} className="px-2 py-4 whitespace-nowrap text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleItemAssignment(item.id, participant.id)}
                                  className={`h-5 w-5 rounded ${
                                    item.assignedTo.includes(participant.id)
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-200 text-gray-400'
                                  }`}
                                >
                                  {item.assignedTo.includes(participant.id) && (
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={calculateItemizedAmounts}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Recalculate Amounts
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 space-y-4 sm:space-y-0">
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-5 w-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {linkCopied ? 'Link Copied!' : 'Share Link'}
                </button>
                
                <button
                  type="button"
                  onClick={completeSplit}
                  className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Complete Split
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 