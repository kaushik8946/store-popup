import React from 'react';
import { TableHeader, TableData } from '../common/TableComponents';

const SummaryScreen = ({ data = {}, onDone, setView }) => {
  const invoice = data.invoice;
  const shortList = data.shortList || invoice?.items || [];
  const damagedList = data.damagedList || [];
  const pickedList = data.pickedList || [];

  const renderTable = (items) => {
    if (!items || items.length === 0) {
      return <div className="text-secondary fst-italic p-3">No items</div>;
    }

    return (
      <div className="table-responsive">
        <table className="table table-sm table-hover mb-0">
          <thead>
            <tr>
              <TableHeader>S.No</TableHeader>
              <TableHeader>Product</TableHeader>
              <TableHeader>Qty</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Reason</TableHeader>
            </tr>
          </thead>
          <tbody>
            {items.map((p, idx) => (
              <tr key={`${p.sNo || idx}-${idx}`}>
                <TableData>{idx + 1}</TableData>
                <TableData className="fw-medium">{p.productName || p.name || '-'}</TableData>
                <TableData className="fw-semibold">{p.qty ?? p.quantity ?? '-'}</TableData>
                <TableData className="fw-bold text-danger">{p.amount != null ? `₹${Number(p.amount).toFixed(2)}` : '-'}</TableData>
                <TableData>{p.reason || p.status || '-'}</TableData>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid p-3">
      <h2 className="fs-5 fw-bold text-dark mb-3 border-bottom pb-2">Summary</h2>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 p-3 h-100">
            <h5 className="fs-6 fw-semibold">Short / Invoice</h5>
            {invoice ? (
              <div className="mb-3">
                <div className="small text-secondary">Invoice ID</div>
                <div className="fw-bold mb-1">{invoice.id}</div>
                <div className="small text-secondary">Billed To</div>
                <div className="fw-bold mb-1">{invoice.billedTo}</div>
                <div className="small text-secondary">Total</div>
                <div className="fw-bold text-danger">₹{invoice.total?.toFixed ? invoice.total.toFixed(2) : invoice.total}</div>
              </div>
            ) : (
              <div className="text-secondary fst-italic mb-3">No invoice was created.</div>
            )}
            {renderTable(shortList)}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 p-3 h-100">
            <h5 className="fs-6 fw-semibold">Damaged / Returned</h5>
            {renderTable(damagedList)}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 p-3 h-100">
            <h5 className="fs-6 fw-semibold">Picked / Sale Hub</h5>
            {renderTable(pickedList)}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary" onClick={() => { if (setView) setView('HOME'); }}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SummaryScreen;
