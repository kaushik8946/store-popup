import React, { useState } from 'react';
import { TableHeader, TableData } from '../common/TableComponents';
import { Package } from 'lucide-react';
import MessageBox from '../common/MessageBox';

const InvoiceScreen = ({ invoiceItems = [], onContinue, setView }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const totalInvoiceAmount = invoiceItems.reduce((sum, p) => sum + p.amount, 0).toFixed(2);

  const createInvoice = () => {
    if (invoiceItems.length === 0) {
      setMessage('No items to invoice.');
      return;
    }

    setIsCreating(true);

    // Build simple invoice object
    const invoiceId = `INV-${Date.now()}`;
    const invoice = {
      id: invoiceId,
      date: new Date().toISOString(),
      billedTo: 'Store Incharge',
      items: invoiceItems,
      total: parseFloat(totalInvoiceAmount),
    };

    // Simulate saving invoice (could be API call). Here we just log.
    console.log('[SYSTEM] Invoice created:', invoice);

    setMessage(`Invoice ${invoiceId} created (billed to Store Incharge).`);

    // Short delay to show message then continue to next step
    setTimeout(() => {
      setIsCreating(false);
      setMessage(null);
      if (onContinue) onContinue(invoice);
    }, 800);
  };

  return (
    <div className="container-fluid p-3">
      <h2 className="fs-5 fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center">
        <Package size={24} className='me-2 text-success' /> Invoice Screen - Short Products
      </h2>

      

      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        <h4 className="card-header p-2 small fw-bold bg-success-subtle text-success border-0 d-flex align-items-center">
          Invoice Products (Short Reason)
        </h4>
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-hover table-sm mb-0">
            <thead><tr>
              <TableHeader>S.No</TableHeader>
              <TableHeader>Product Name</TableHeader>
              <TableHeader>Manufacturer</TableHeader>
              <TableHeader>Pack</TableHeader>
              <TableHeader>Batch</TableHeader>
              <TableHeader>MRP</TableHeader>
              <TableHeader>Qty</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Barcode</TableHeader>
            </tr></thead>
            <tbody>
              {invoiceItems.map((product, index) => (
                <tr key={`${product.sNo}-${index}`}>
                  <TableData>{index + 1}</TableData>
                  <TableData className="fw-medium">{product.productName}</TableData>
                  <TableData>{product.manufacturer}</TableData>
                  <TableData>{product.pack}</TableData>
                  <TableData>{product.batch}</TableData>
                  <TableData>₹{product.mrp.toFixed(2)}</TableData>
                  <TableData className='fw-semibold'>{product.qty}</TableData>
                  <TableData className='fw-bold text-danger'>₹{product.amount.toFixed(2)}</TableData>
                  <TableData>{product.barcode}</TableData>
                </tr>
              ))}
              {invoiceItems.length === 0 && (
                <tr key="empty-invoice">
                  <td colSpan="9" className="text-center py-3 text-secondary fst-italic">
                    No items to invoice for "Short" reason.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex justify-content-end align-items-center mt-3">
        <div className="me-3 d-flex align-items-center">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => {
              if (setView) setView('ORDER');
            }}
          >
            Go Back
          </button>
        </div>
        <div className="me-3 text-end">
          <div className="small fw-semibold text-secondary">Invoiced Against</div>
          <div className="fw-bold">Store Incharge</div>
        </div>

        <div className="me-3 text-end">
          <span className="small fw-semibold text-secondary me-3">Total Invoice Amount:</span>
          <div className="fs-5 fw-bolder text-danger">₹{totalInvoiceAmount}</div>
        </div>

        <div>
          <button className="btn btn-success rounded-3 shadow" onClick={createInvoice} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </div>

      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
};

export default InvoiceScreen;
