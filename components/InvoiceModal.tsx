'use client';

import { FaTimes, FaPrint, FaWhatsapp } from 'react-icons/fa';
import { type Sale } from '@/lib/store';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export default function InvoiceModal({ sale, onClose }: InvoiceModalProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let text = `*Ramlila Pedhewale Factory - Invoice*\n`;
    text += `Bill To: ${sale.customer.name}\n`;
    if (sale.invoiceNumber) text += `Invoice #: ${sale.invoiceNumber}\n`;
    text += `Date: ${sale.date}\n\n`;
    
    text += `*Items:*\n`;
    sale.products.forEach(p => {
      text += `- ${p.productName} (x${p.quantity}): ₹${p.total.toLocaleString()}\n`;
    });
    
    text += `\n*Subtotal:* ₹${sale.subtotal.toLocaleString()}`;
    if (sale.discount > 0) text += `\n*Discount:* -₹${sale.discount.toLocaleString()}`;
    if (sale.tax > 0) text += `\n*Tax:* ₹${sale.tax.toLocaleString()}`;
    text += `\n*Total:* ₹${(sale.total || 0).toLocaleString()}`;
    if ((sale.paidAmount || 0) > 0) text += `\n*Paid:* ₹${(sale.paidAmount || 0).toLocaleString()}`;
    if ((sale.remainingAmount || 0) > 0) text += `\n*Remaining:* ₹${(sale.remainingAmount || 0).toLocaleString()}`;
    
    text += `\n\nStatus: ${sale.paymentStatus || 'Unpaid'}`;
    
    const encodedText = encodeURIComponent(text);
    let phoneNumber = sale.customer.phone ? sale.customer.phone.replace(/\D/g, '') : '';
    if (phoneNumber && phoneNumber.length === 10) {
      phoneNumber = `91${phoneNumber}`;
    }
    
    const url = phoneNumber 
      ? `https://wa.me/${phoneNumber}?text=${encodedText}` 
      : `https://wa.me/?text=${encodedText}`;
      
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Invoice / Bill</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleWhatsAppShare}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <FaWhatsapp className="text-lg" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaPrint />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Ramlila Pedhewale Factory</h1>
            <p className="text-gray-600">Traditional Sweet Manufacturing</p>
            <p className="text-sm text-gray-500 mt-2">Invoice / Bill</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="text-gray-700">{sale.customer.name}</p>
              {sale.customer.phone && <p className="text-gray-600 text-sm">Phone: {sale.customer.phone}</p>}
              {sale.customer.email && <p className="text-gray-600 text-sm">Email: {sale.customer.email}</p>}
              {sale.customer.address && <p className="text-gray-600 text-sm mt-2">{sale.customer.address}</p>}
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm">
                Invoice #: {sale.invoiceNumber ?? '—'}
              </p>
              <p className="text-gray-600 text-sm">Date: {sale.date}</p>
              <p className="text-gray-600 text-sm">Payment: {sale.paymentMethod}</p>
              <p className={`text-sm font-semibold mt-2 ${
                (sale.paymentStatus || 'Unpaid') === 'Fully Paid' ? 'text-green-600' :
                (sale.paymentStatus || 'Unpaid') === 'Partially Paid' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Status: {sale.paymentStatus || 'Unpaid'}
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.products.map((product, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{product.productName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{product.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{product.price}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{product.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto w-64">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{sale.subtotal.toLocaleString()}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Discount:</span>
                <span>-₹{sale.discount.toLocaleString()}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span>₹{sale.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-gray-300">
              <span>Total:</span>
              <span>₹{(sale.total || 0).toLocaleString()}</span>
            </div>
            {(sale.paidAmount || 0) > 0 && (
              <div className="flex justify-between text-lg text-green-600 pt-2">
                <span>Paid:</span>
                <span>₹{(sale.paidAmount || 0).toLocaleString()}</span>
              </div>
            )}
            {(sale.remainingAmount || 0) > 0 && (
              <div className="flex justify-between text-lg text-red-600 pt-2 font-semibold">
                <span>Remaining:</span>
                <span>₹{(sale.remainingAmount || 0).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Payment History */}
          {sale.payments && sale.payments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Payment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left border border-gray-300">Date</th>
                      <th className="px-3 py-2 text-left border border-gray-300">Amount</th>
                      <th className="px-3 py-2 text-left border border-gray-300">Method</th>
                      <th className="px-3 py-2 text-left border border-gray-300">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-3 py-2 border border-gray-300">{payment.date}</td>
                        <td className="px-3 py-2 border border-gray-300 font-semibold">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-3 py-2 border border-gray-300">{payment.paymentMethod}</td>
                        <td className="px-3 py-2 border border-gray-300 text-gray-600">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-2">© 2024 Ramlila Pedhewale Factory. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

