import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsDashboardProps {
  salesData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  paymentMethodsData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
  popularItemsData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  salesData,
  paymentMethodsData,
  popularItemsData,
}) => {
  const [timeRange, setTimeRange] = useState('week');

  // Options for the charts
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Over Time',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Payment Methods',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Popular Items',
      },
    },
  };

  return (
    <div className="analytics-dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${
                timeRange === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 rounded ${
                timeRange === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 rounded ${
                timeRange === 'year' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="card col-span-1 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
            <div className="h-80">
              <Line options={lineOptions} data={salesData} />
            </div>
          </div>

          {/* Payment Methods Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="h-64">
              <Doughnut options={doughnutOptions} data={paymentMethodsData} />
            </div>
          </div>

          {/* Popular Items Chart */}
          <div className="card col-span-1 md:col-span-2 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Popular Items</h3>
            <div className="h-64">
              <Bar options={barOptions} data={popularItemsData} />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="card col-span-1 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-primary-700">$12,345</p>
                <p className="text-xs text-green-600">+12.5% from last period</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-primary-700">$42.50</p>
                <p className="text-xs text-green-600">+5.2% from last period</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-primary-700">291</p>
                <p className="text-xs text-green-600">+8.7% from last period</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-primary-700">87</p>
                <p className="text-xs text-green-600">+15.3% from last period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 