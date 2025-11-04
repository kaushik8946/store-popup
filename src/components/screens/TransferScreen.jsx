import React, { useState } from 'react';
import { Truck, Barcode, Package, FileText, AlertTriangle } from 'lucide-react';
import { TableHeader, TableData } from '../common/TableComponents';

/**
 * Transfer Screen (TO Screen)
 * This screen accepts transferProducts via props.
 */
const TransferScreen = ({ onExit, transferItems, setView }) => {
  const transferProducts = transferItems || [];

  // State to manage reasons for rejected items
  const [itemReasons, setItemReasons] = useState({});

  const transferDetails = {
    transferType: 'Emergency',
    labId: '26010',
    jobId: 'NA/PH/2503/38',
    fromStore: 'NAPHYSS0038A(PRT&A-OHS-HYD-INVENT)',
    toStore: 'NAPHYSS0038A(PRT&A-OHS-HYD-INVENT)',
  };

  // Filter out rejected items from total calculation
  const totalTransferAmount = transferProducts
    .filter(p => p.status !== 'REJECTED/BOUNCED')
    .reduce((sum, p) => sum + p.amount, 0)
    .toFixed(2);

  // Check if there are any rejected items
  const hasRejectedItems = transferProducts.some(p => p.status === 'REJECTED/BOUNCED');

  // Handle reason change for rejected items
  const handleReasonChange = (sNo, reason) => {
    setItemReasons(prev => ({
      ...prev,
      [sNo]: reason
    }));
  };

  return (
    <div className="container-fluid p-3">
      <h2 className="fs-5 fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center">
        <Truck size={24} className='me-2 text-primary' /> Transfer Screen
      </h2>

      {/* Alert for Rejected Items */}
      {hasRejectedItems && (
        <div className="alert alert-warning d-flex align-items-center mb-3 py-2" role="alert">
          <AlertTriangle size={20} className="me-2 flex-shrink-0" />
          <div>
            <strong>Transfer Order Rejected.</strong> Please select a reason (Short/Damaged) for each rejected item before submitting.
          </div>
        </div>
      )}

      <div className="row g-3">

        {/* Left Panel: Search and Transfer Details */}
        <div className="col-lg-3 d-grid gap-3">
          {/* Product Search */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-2">
              <h3 className="fs-6 fw-semibold text-secondary mb-2 border-bottom pb-2 d-flex align-items-center">
                <Barcode size={18} className="me-2 text-primary" /> Product Search
              </h3>
              <div className="d-grid gap-2">
                <input type="text" placeholder="Barcode" className="form-control form-control-sm rounded-3" />
                <input type="text" placeholder="Product ID" className="form-control form-control-sm rounded-3" />
                <input type="text" placeholder="Search Batch / Composition here..." className="form-control form-control-sm rounded-3" />
                <div className="d-flex align-items-center pt-1">
                  <label className="form-label mb-0 small text-secondary fw-medium me-2">Transfer Qty</label>
                  <input type="number" defaultValue="1" min="1" className="form-control form-control-sm rounded-3 text-center" style={{ width: '60px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-2 small d-grid gap-2">
              <h3 className="fs-6 fw-semibold text-secondary mb-1 border-bottom pb-2 d-flex align-items-center">
                <FileText size={18} className="me-2 text-danger" /> Transfer Details
              </h3>
              <div className="d-grid gap-2">
                <div>
                  <label className="form-label mb-1 text-secondary fw-medium small">Transfer Type</label>
                  <select className="form-select form-select-sm rounded-3">
                    <option>{transferDetails.transferType}</option>
                    <option>Regular</option>
                  </select>
                </div>
                <div className='d-flex gap-3'>
                  <div className='flex-grow-1'>
                    <label className="form-label mb-1 text-secondary fw-medium small">Lab ID</label>
                    <input type="text" value={transferDetails.labId} readOnly className="form-control form-control-sm rounded-3 bg-light" />
                  </div>
                  <div className='flex-grow-1'>
                    <label className="form-label mb-1 text-secondary fw-medium small">Job ID</label>
                    <input type="text" value={transferDetails.jobId} readOnly className="form-control form-control-sm rounded-3 bg-light" />
                  </div>
                </div>

                <div>
                  <label className="form-label mb-1 text-secondary fw-medium small">From Store/Inventory</label>
                  <select className="form-select form-select-sm rounded-3">
                    <option>{transferDetails.fromStore}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label mb-1 text-secondary fw-medium small">To Store/Inventory</label>
                  <select className="form-select form-select-sm rounded-3">
                    <option>{transferDetails.toStore}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Transfer Products Table */}
        <div className="col-lg-9">
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <h4 className="card-header p-2 small fw-bold bg-info-subtle text-info-emphasis border-0 d-flex align-items-center">
              <Package size={16} className="me-2" /> Transfer Products
            </h4>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table table-hover table-sm mb-0">
                <thead><tr>
                  <TableHeader>S.No</TableHeader>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Manufacturer</TableHeader>
                  <TableHeader>Pack</TableHeader>
                  <TableHeader>Batch</TableHeader>
                  <TableHeader>Dt Exp</TableHeader>
                  <TableHeader>MRP</TableHeader>
                  <TableHeader>Qty</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Reason</TableHeader>
                  <TableHeader>Barcode</TableHeader>
                </tr></thead>
                <tbody>
                  {transferProducts.map((product, index) => {
                    const isRejected = product.status === 'REJECTED/BOUNCED';
                    const currentReason = itemReasons[product.sNo] || '';

                    return (
                      <tr key={product.sNo || index}>
                        <TableData>{index + 1}</TableData>
                        <TableData className="fw-medium">{product.productName}</TableData>
                        <TableData>{product.manufacturer}</TableData>
                        <TableData>{product.pack}</TableData>
                        <TableData>{product.batch}</TableData>
                        <TableData>{product.dt}</TableData>
                        <TableData>₹{product.mrp.toFixed(2)}</TableData>
                        <TableData className='fw-semibold'>{product.qty}</TableData>
                        <TableData className={`fw-bold ${isRejected ? 'text-danger' : 'text-danger'}`}>
                          {isRejected ? 'REJECTED' : `₹${product.amount.toFixed(2)}`}
                        </TableData>
                        <TableData>
                          {isRejected ? (
                            <select
                              className="form-select form-select-sm bg-danger-subtle text-danger border-danger rounded-3"
                              style={{ width: '120px' }}
                              value={currentReason}
                              onChange={(e) => handleReasonChange(product.sNo, e.target.value)}
                            >
                              <option value="">Select Reason</option>
                              <option value="Short">Short</option>
                              <option value="Damaged">Damaged</option>
                            </select>
                          ) : (
                            <span className="text-secondary">N/A</span>
                          )}
                        </TableData>
                        <TableData>{product.barcode}</TableData>
                      </tr>
                    );
                  })}
                  {transferProducts.length === 0 && (
                    <tr key="empty-transfer">
                      <td colSpan="11" className="text-center py-3 text-secondary fst-italic">
                        No items available for transfer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="d-flex justify-content-between align-items-center p-2 mt-3 bg-white rounded-3 border-top shadow-sm">
            <div className='d-flex gap-2'>
              <button className="btn btn-sm btn-secondary">Remove Selected</button>
              <button className="btn btn-sm btn-danger" onClick={onExit}>Clear</button>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="small fw-semibold text-secondary">Total Transfer Value:</span>
              <span className="fs-5 fw-bolder text-danger">₹{totalTransferAmount}</span>
              <button className="btn btn-success rounded-3 shadow">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferScreen;
