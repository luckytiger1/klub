import Link from 'next/link';

export default function RestaurantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Klub Restaurant Dashboard</h1>
          <div>
            <Link href="/restaurant/list" className="text-primary-600 hover:text-primary-800 mr-4">
              View Restaurants
            </Link>
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Restaurants Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Restaurants</h2>
              <p className="text-gray-600 mb-4">View and manage your restaurants</p>
              <Link 
                href="/restaurant/list" 
                className="btn-primary block text-center"
              >
                Manage Restaurants
              </Link>
            </div>
            
            {/* Order Management Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Order Management</h2>
              <p className="text-gray-600 mb-4">View and manage current orders</p>
              <Link 
                href="/restaurant/orders" 
                className="btn-primary block text-center"
              >
                Manage Orders
              </Link>
            </div>
            
            {/* Payment Tracking Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Payment Tracking</h2>
              <p className="text-gray-600 mb-4">Track and manage payments</p>
              <Link 
                href="/restaurant/payments" 
                className="btn-primary block text-center"
              >
                View Payments
              </Link>
            </div>
            
            {/* Analytics Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <p className="text-gray-600 mb-4">View sales and customer analytics</p>
              <Link 
                href="/restaurant/analytics" 
                className="btn-primary block text-center"
              >
                View Analytics
              </Link>
            </div>
            
            {/* Table Management Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Table Management</h2>
              <p className="text-gray-600 mb-4">Manage tables and seating</p>
              <Link 
                href="/restaurant/tables" 
                className="btn-primary block text-center"
              >
                Manage Tables
              </Link>
            </div>
            
            {/* QR Code Generation Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">QR Code Generation</h2>
              <p className="text-gray-600 mb-4">Generate QR codes for tables</p>
              <Link 
                href="/restaurant/qr-codes" 
                className="btn-primary block text-center"
              >
                Generate QR Codes
              </Link>
            </div>
            
            {/* Settings Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <p className="text-gray-600 mb-4">Manage restaurant settings</p>
              <Link 
                href="/restaurant/settings" 
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