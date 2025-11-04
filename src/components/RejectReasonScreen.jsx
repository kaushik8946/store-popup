import React, { useState } from 'react';
import { MOCK_SALE_ORDER_PRODUCTS, REJECT_REASONS } from '../data/mockData';
import './RejectReasonScreen.css';

export default function RejectReasonScreen({ onComplete, onCancel }) {
  const [productReasons, setProductReasons] = useState(
    MOCK_SALE_ORDER_PRODUCTS.map(p => ({ ...p, reason: null }))
  );

  const handleReasonSelect = (index, reasonId) => {
    const updated = [...productReasons];
    updated[index].reason = reasonId;
    setProductReasons(updated);
  };

  const handleSubmit = () => {
    const allSelected = productReasons.every(p => p.reason);
    if (!allSelected) {
      alert('Please select a reason for all products');
      return;
    }

    const damagedProducts = productReasons.filter(p => p.reason === 'damaged');

    if (damagedProducts.length > 0) {
      onComplete(productReasons, damagedProducts);
    } else {
      onComplete(productReasons, []);
    }
  };

  return (
    <div className="reject-reason-screen">
      <div className="reject-reason-header">
        <h2>Select Reject Reason</h2>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>

      <div className="reject-reason-content">
        <table className="reject-reason-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Manufacturer</th>
              <th>Order Qty</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {productReasons.map((product, index) => (
              <tr key={product.sNo}>
                <td>{product.sNo}</td>
                <td>{product.productName}</td>
                <td>{product.manufacturer}</td>
                <td>{product.orderQty}</td>
                <td>
                  <div className="reason-buttons">
                    {REJECT_REASONS.map(reason => (
                      <button
                        key={reason.id}
                        className={`reason-btn ${product.reason === reason.id ? 'selected' : ''}`}
                        onClick={() => handleReasonSelect(index, reason.id)}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="reject-reason-footer">
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
