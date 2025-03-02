import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  restaurantId: string;
  onSave: (tableNumber: string, qrCodeData: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ restaurantId, onSave }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [qrSize, setQrSize] = useState(256);

  const generateQRCode = () => {
    if (!tableNumber) return;
    
    // Create a data object to encode in the QR code
    const data = {
      restaurantId,
      tableNumber,
      timestamp: new Date().toISOString(),
    };
    
    // Convert to JSON string
    const qrData = JSON.stringify(data);
    setQrValue(qrData);
  };

  const handleSave = () => {
    if (qrValue && tableNumber) {
      onSave(tableNumber, qrValue);
      // Reset form
      setTableNumber('');
      setQrValue('');
    }
  };

  const handleDownload = () => {
    // This is a simple way to trigger download of the QR code
    // In a real app, you might want to use a more sophisticated approach
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = qrSize;
        canvas.height = qrSize;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        // Download the PNG
        const downloadLink = document.createElement('a');
        downloadLink.download = `table-${tableNumber}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="qr-generator-container">
      <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="p-4 bg-primary-600 text-white">
          <h2 className="text-xl font-bold">QR Code Generator</h2>
          <p className="text-sm">Create QR codes for your restaurant tables</p>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Table Number
            </label>
            <input
              type="text"
              id="tableNumber"
              className="input-field"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="qrSize" className="block text-sm font-medium text-gray-700 mb-1">
              QR Code Size
            </label>
            <select
              id="qrSize"
              className="input-field"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
            >
              <option value="128">Small (128px)</option>
              <option value="256">Medium (256px)</option>
              <option value="512">Large (512px)</option>
            </select>
          </div>
          
          <button 
            onClick={generateQRCode}
            className="btn-primary w-full mb-4"
            disabled={!tableNumber}
          >
            Generate QR Code
          </button>
          
          {qrValue && (
            <div className="text-center">
              <div className="mb-4 inline-block p-4 bg-white border rounded-lg">
                <QRCodeSVG
                  id="qr-code"
                  value={qrValue}
                  size={qrSize}
                  level="H" // High error correction
                  includeMargin={true}
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="btn-primary flex-1"
                >
                  Save
                </button>
                <button 
                  onClick={handleDownload}
                  className="btn-secondary flex-1"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator; 