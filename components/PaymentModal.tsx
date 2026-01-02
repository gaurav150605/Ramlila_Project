'use client';

import { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { type Sale, type PaymentRecord, store } from '@/lib/store';

interface PaymentModalProps {
  sale: Sale | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PaymentModal({ sale, onClose, onUpdate }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!sale) return null;

  const handleAddPayment = () => {
    const amount = Number(paymentAmount);
    if (amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    const remaining = sale.remainingAmount || sale.total || 0;
    if (amount > remaining) {
      alert(`Payment amount cannot exceed remaining amount of ₹${remaining.toLocaleString()}`);
      return;
    }

    const payment: PaymentRecord = {
      id: Date.now().toString(),
      date: paymentDate,
      amount: amount,
      paymentMethod: paymentMethod,
      notes: notes || undefined,
    };

    store.addPaymentToSale(sale.id, payment);
    onUpdate();
    onClose();
    alert('Payment recorded successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Payment</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Sale Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Sale Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Customer:</span>
                <span className="ml-2 font-medium">{sale.customer.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 font-medium">₹{(sale.total || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Paid Amount:</span>
                <span className="ml-2 font-medium text-green-600">₹{(sale.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <span className="ml-2 font-medium text-red-600">₹{(sale.remainingAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                max={sale.remainingAmount || sale.total || 0}
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Max: ₹${(sale.remainingAmount || sale.total || 0).toLocaleString()}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this payment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment History */}
          {sale.payments && sale.payments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Payment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Method</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.payments.map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="px-3 py-2">{payment.date}</td>
                        <td className="px-3 py-2 font-semibold">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-3 py-2">{payment.paymentMethod}</td>
                        <td className="px-3 py-2 text-gray-600">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPayment}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaSave />
              <span>Record Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

