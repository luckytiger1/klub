'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { billApi, paymentApi } from '@/lib/api';

interface Bill {
  id: string;
  restaurant_id: string;
  table_number: number;
  status: string;
  total_amount: number;
  created_at: string;
  restaurant_name?: string;
}

interface Payment {
  id: string;
  user_id: string;
  bill_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface FormData {
  amount: number;
  payment_method: string;
  card_number?: string;
  card_expiry?: string;
  card_cvc?: string;
  name_on_card?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    amount: 0,
    payment_method: 'credit_card',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
    name_on_card: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch bill details
        const billData = await billApi.getById(id);
        setBill(billData);
        
        // Fetch bill payments
        const paymentsData = await paymentApi.getByBill(id);
        setPayments(paymentsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching bill data:', err);
        setError('Failed to load bill data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (bill) {
      const paidAmount = calculatePaidAmount();
      const remainingAmount = Math.max(0, bill.total_amount - paidAmount);
      setFormData(prev => ({
        ...prev,
        amount: remainingAmount
      }));
    }
  }, [bill, payments]);

  const calculatePaidAmount = () => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateRemainingAmount = () => {
    if (!bill) return 0;
    const paidAmount = calculatePaidAmount();
    return Math.max(0, bill.total_amount - paidAmount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Ensure amount is a valid number and not greater than the remaining amount
      const numValue = parseFloat(value);
      const maxAmount = calculateRemainingAmount();
      
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData(prev => ({
          ...prev,
          [name]: Math.min(numValue, maxAmount)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (formData.amount <= 0) {
      setSubmitError('Payment amount must be greater than zero.');
      return false;
    }

    if (formData.payment_method === 'credit_card') {
      if (!formData.card_number || formData.card_number.length < 15) {
        setSubmitError('Please enter a valid card number.');
        return false;
      }
      
      if (!formData.card_expiry || !formData.card_expiry.match(/^\d{2}\/\d{2}$/)) {
        setSubmitError('Please enter a valid expiry date (MM/YY).');
        return false;
      }
      
      if (!formData.card_cvc || !formData.card_cvc.match(/^\d{3,4}$/)) {
        setSubmitError('Please enter a valid CVC code.');
        return false;
      }
      
      if (!formData.name_on_card) {
        setSubmitError('Please enter the name on the card.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // In a real app, we would process the payment with a payment processor
      // For now, we'll simulate a successful payment
      const paymentData = {
        bill_id: id,
        amount: formData.amount,
        payment_method: formData.payment_method,
        // In a real app, we would get the user_id from authentication
        user_id: 'current_user_id',
        status: 'completed'
      };
      
      await paymentApi.create(paymentData);
      
      // Redirect to the bill detail page
      router.push(`/bill/${id}`);
    } catch (err) {
      console.error('Error processing payment:', err);
      setSubmitError('Failed to process payment. Please try again later.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading bill details...</p>
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
            <Link href="/" className="text-primary-600 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 max-w-md">
          <p>Bill not found.</p>
          <div className="mt-4">
            <Link href="/" className="text-primary-600 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (calculateRemainingAmount() <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 max-w-md">
          <p>This bill has been fully paid.</p>
          <div className="mt-4">
            <Link href={`/bill/${id}`} className="text-primary-600 hover:underline">
              View Bill Details
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
          <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
          <div>
            <Link href={`/bill/${id}`} className="text-primary-600 hover:text-primary-800 mr-4">
              Back to Bill
            </Link>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Bill Summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bill Summary
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {bill.restaurant_name || 'Restaurant'} - Table {bill.table_number}
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${bill.total_amount.toFixed(2)}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${calculatePaidAmount().toFixed(2)}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                    ${calculateRemainingAmount().toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Payment Form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Enter your payment information below.
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {submitError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                  {submitError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Payment Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      step="0.01"
                      min="0.01"
                      max={calculateRemainingAmount()}
                      value={formData.amount}
                      onChange={handleChange}
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="apple_pay">Apple Pay</option>
                    <option value="google_pay">Google Pay</option>
                  </select>
                </div>
                
                {formData.payment_method === 'credit_card' || formData.payment_method === 'debit_card' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="card_number"
                        id="card_number"
                        value={formData.card_number}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="card_expiry" className="block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="card_expiry"
                          id="card_expiry"
                          value={formData.card_expiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="card_cvc" className="block text-sm font-medium text-gray-700">
                          CVC
                        </label>
                        <input
                          type="text"
                          name="card_cvc"
                          id="card_cvc"
                          value={formData.card_cvc}
                          onChange={handleChange}
                          placeholder="123"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="name_on_card" className="block text-sm font-medium text-gray-700">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="name_on_card"
                        id="name_on_card"
                        value={formData.name_on_card}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">
                      You will be redirected to complete your payment with {formData.payment_method.replace('_', ' ')}.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Link
                    href={`/bill/${id}`}
                    className="btn-secondary"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || formData.amount <= 0}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 