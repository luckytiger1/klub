import { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  splitWith: string[];
}

interface BillProps {
  restaurantName: string;
  tableNumber: string;
  items: MenuItem[];
  tax: number;
  serviceCharge: number;
  onPayBill: () => void;
  onSplitBill: () => void;
}

const BillView: React.FC<BillProps> = ({
  restaurantName,
  tableNumber,
  items,
  tax,
  serviceCharge,
  onPayBill,
  onSplitBill,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * (tax / 100);
  const serviceAmount = subtotal * (serviceCharge / 100);
  const total = subtotal + taxAmount + serviceAmount;

  return (
    <div className="bill-container">
      <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="p-4 bg-primary-600 text-white">
          <h2 className="text-xl font-bold">{restaurantName}</h2>
          <p className="text-sm">Table: {tableNumber}</p>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Your Bill</h3>
          
          <div className="mb-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`flex justify-between items-center p-2 border-b ${
                  selectedItems.includes(item.id) ? 'bg-primary-50' : ''
                }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600 block">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  {item.splitWith.length > 0 && (
                    <span className="text-xs text-primary-600 block">
                      Split with {item.splitWith.length} others
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({tax}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Charge ({serviceCharge}%):</span>
              <span>${serviceAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 flex gap-2">
          <button 
            onClick={onPayBill}
            className="btn-primary flex-1"
          >
            Pay Bill
          </button>
          <button 
            onClick={onSplitBill}
            className="btn-secondary flex-1"
          >
            Split Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillView; 