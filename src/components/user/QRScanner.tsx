import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the QR Reader to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-reader'), {
  ssr: false,
});

interface QRScannerProps {
  onScan: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: string | null) => {
    if (data) {
      onScan(data);
    }
  };

  const handleError = (err: Error) => {
    setError(err.message);
    console.error(err);
  };

  return (
    <div className="qr-scanner-container">
      <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="p-4 bg-primary-600 text-white">
          <h2 className="text-xl font-bold">Scan QR Code</h2>
          <p className="text-sm">Position the QR code within the frame</p>
        </div>
        
        <div className="relative">
          {error ? (
            <div className="p-4 bg-red-100 text-red-700">
              <p>Error: {error}</p>
              <p>Please make sure you've granted camera permissions.</p>
            </div>
          ) : (
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          )}
          <div className="absolute inset-0 border-2 border-primary-500 pointer-events-none"></div>
        </div>
        
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            Scan a restaurant QR code to view your bill and make a payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 