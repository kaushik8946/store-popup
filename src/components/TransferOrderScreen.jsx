import React, { useState } from 'react';
import { MOCK_SALE_ORDER_PRODUCTS } from '../data/mockData';
import './TransferOrderScreen.css';

export default function TransferOrderScreen({ onComplete, onCancel }) {
  const [transferOrders, setTransferOrders] = useState(
    MOCK_SALE_ORDER_PRODUCTS.map(p => ({
      ...p,
      fromStore: 'Central Warehouse Store 001',
      toStore: '',
      transferQty: p.orderQty,
    }))
  );

  const handleStoreChange = (index, value) => {
    const updated = [...transferOrders];
    updated[index].toStore = value;
    setTransferOrders(updated);
  };

  const handleQtyChange = (index, value) => {
    const updated = [...transferOrders];
    updated[index].transferQty = parseInt(value) || 0;
    setTransferOrders(updated);
  };

  const handleSubmit = () => {
    const allValid = transferOrders.every(to => to.toStore && to.transferQty > 0);
    if (!allValid) {
      alert('Please fill all transfer order details');
      return;
    }
    onComplete(transferOrders);
  };

  return (
    <div className="transfer-order-screen">
      <div className="transfer-order-header">
        <h2>Create Transfer Order - Rejected Products</h2>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>

      <div className="transfer-order-content">
        <table className="transfer-order-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Manufacturer</th>
              <th>From Store</th>
              <th>To Store</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {transferOrders.map((to, index) => (
              <tr key={to.sNo}>
                <td>{to.sNo}</td>
                <td>{to.productName}</td>
                <td>{to.manufacturer}</td>
                <td>{to.fromStore}</td>
                <td>
                  <input
                    type="text"
                    className="store-input"
                    placeholder="Enter store name"
                    value={to.toStore}
                    onChange={(e) => handleStoreChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="qty-input"
                    value={to.transferQty}
                    onChange={(e) => handleQtyChange(index, e.target.value)}
                    min="1"
                    max={to.orderQty}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="transfer-order-footer">
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button className="create-btn" onClick={handleSubmit}>Create Transfer Order</button>
      </div>
    </div>
  );
}
