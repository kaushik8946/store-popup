import React, { useState } from 'react';
import { Truck, Barcode, ClipboardList, Package, DollarSign, X } from 'lucide-react';
import { MOCK_ORDER_PRODUCTS, MOCK_SALE_ORDER_PRODUCTS } from '../../data/mockData';
import MessageBox from '../common/MessageBox';
import { TableHeader, TableData } from '../common/TableComponents';

/**
 * Screen displayed after processing the TO request, simulating the main POS transaction screen.
 */
const POSOrderScreen = ({ onExit, onContinue, continueMessage, setContinueMessage }) => {
  // 1. Initialize State: Picklist starts with products 1, 2, and 3
  const initialPicklist = MOCK_ORDER_PRODUCTS.slice(0, 3).map(p => {
    // Find a batch where pack size divides qty evenly, otherwise use first batch
    let selectedBatchData = p.batches ? p.batches[0] : null;
    
    if (p.batches) {
      const divisibleBatch = p.batches.find(batch => p.qty % parseInt(batch.pack) === 0);
      if (divisibleBatch) {
        selectedBatchData = divisibleBatch;
      }
    }
    
    return {
      ...p,
      userQty: 0, // Start with 0 picked quantity (Input is for user entry)
      reason: 'None', // Default reason
      barcode: '', // Start with empty barcode
      selectedBatch: selectedBatchData ? selectedBatchData.batchNo : p.batch, // Default to divisible batch
      pack: selectedBatchData ? selectedBatchData.pack : p.pack // Default to divisible batch's pack size
    };
  });

  // 2. Initialize State: Invoice starts empty (as requested)
  const initialInvoice = [];

  const [picklistProducts, setPicklistProducts] = useState(initialPicklist);
  const [invoiceProducts, setInvoiceProducts] = useState(initialInvoice);
  const [message, setMessage] = useState(null);

  // Show continueMessage if present
  React.useEffect(() => {
    if (continueMessage) {
      setTimeout(() => setContinueMessage(null), 2500);
    }
  }, [continueMessage, setContinueMessage]);

  // Helper function to find the original product template by sNo
  const getOriginalProduct = (sNo) => {
    return MOCK_ORDER_PRODUCTS.find(p => p.sNo === sNo);
  }

  // Handler to update the quantity the user intends to pick
  const handleQtyChange = (sNo, value) => {
    const newQty = parseInt(value, 10) || 0;
    setPicklistProducts(prev => prev.map(product => {
      if (product.sNo === sNo) {
        const requiredQty = product.qty;
        const isPartial = newQty < requiredQty && newQty >= 0;
        return {
          ...product,
          userQty: newQty,
          reason: isPartial ? 'N/A' : 'N/A'
        };
      }
      return product;
    }));
  };

  // Handler to update the Barcode in the Picklist and auto-add when 10 digits entered
  const handleBarcodeChange = (sNo, value) => {
    setPicklistProducts(prev => prev.map(product => {
      if (product.sNo === sNo) {
        return { ...product, barcode: value };
      }
      return product;
    }));

    // Auto-add units equal to pack size when 10-digit barcode is entered
    if (value.length === 10 && /^\d{10}$/.test(value)) {
      const productToAdd = picklistProducts.find(p => p.sNo === sNo);
      if (productToAdd) {
        const packSize = parseInt(productToAdd.pack) || 1;
        // Create a modified product with quantity equal to pack size
        const productWithQty = { ...productToAdd, userQty: packSize, barcode: value };
        handleAddOneItem(productWithQty);
      }
    }
  };

  const handleReasonChange = (sNo, value) => {
    setPicklistProducts(prev => prev.map(product => {
      if (product.sNo === sNo) {
        return { ...product, reason: value };
      }
      return product;
    }));
  };

  const handleBatchChange = (sNo, batchNo) => {
    setPicklistProducts(prev => prev.map(product => {
      if (product.sNo === sNo) {
        const originalProduct = MOCK_ORDER_PRODUCTS.find(p => p.sNo === sNo);
        const selectedBatchData = originalProduct.batches.find(b => b.batchNo === batchNo);
        return { 
          ...product, 
          selectedBatch: batchNo,
          pack: selectedBatchData ? selectedBatchData.pack : product.pack
        };
      }
      return product;
    }));
  };

  /**
   * Adds the user-specified quantity of the product to the invoice (incrementing quantity if it exists)
   * and decrements the required quantity in the picklist.
   */
  const handleAddOneItem = (productToPick) => {
    if (productToPick.reason !== 'None') {
      setMessage("Can't add short or damaged product");
      setPicklistProducts(prev =>
        prev.map(p =>
          p.sNo === productToPick.sNo ? { ...p, barcode: '' } : p
        )
      );
      return;
    }

    const qtyToAdd = productToPick.userQty;
    const requiredQty = productToPick.qty;

    if (qtyToAdd <= 0 || isNaN(qtyToAdd)) {
      setMessage(`Please enter a valid quantity greater than 0 for ${productToPick.productName}.`);
      return;
    }

    if (qtyToAdd > requiredQty) {
      setMessage(`Cannot add ${qtyToAdd} units. Only ${requiredQty} units are required for ${productToPick.productName}.`);
      return;
    }

    // --- 1. Update the Invoice Products (Increment existing or add new) ---
    setInvoiceProducts(prevInvoice => {
      const existingIndex = prevInvoice.findIndex(p => p.sNo === productToPick.sNo);

      if (existingIndex > -1) {
        return prevInvoice.map((p, index) => {
          if (index === existingIndex) {
            const newQty = p.qty + qtyToAdd;
            const originalProduct = getOriginalProduct(p.sNo);
            return {
              ...p,
              qty: newQty,
              amount: newQty * (originalProduct ? originalProduct.mrp : p.mrp)
            };
          }
          return p;
        });
      } else {
        const newInvoiceItem = {
          sNo: productToPick.sNo,
          productName: productToPick.productName,
          manufacturer: productToPick.manufacturer,
          pack: productToPick.pack,
          batch: productToPick.batch,
          mrp: productToPick.mrp,
          barcode: productToPick.barcode,
          qty: qtyToAdd,
          amount: qtyToAdd * productToPick.mrp,
          reason: 'N/A',
          status: 'PICKED' // Add status field for transfer screen
        };
        return [...prevInvoice, newInvoiceItem];
      }
    });

    // --- 2. Update the Picklist (Reduce required quantity) ---
    setPicklistProducts(prevPicklist => {
      const qtyRemaining = requiredQty - qtyToAdd;

      if (qtyRemaining > 0) {
        return prevPicklist.map(p =>
          p.sNo === productToPick.sNo
            ? {
              ...p,
              qty: qtyRemaining,
              userQty: 0,
              reason: 'N/A',
              barcode: '' // Reset barcode to empty
            }
            : p
        );
      } else {
        setMessage(`${productToPick.productName} fully added.`);
        return prevPicklist.filter(p => p.sNo !== productToPick.sNo);
      }
    });

    setMessage(`${productToPick.productName} added (${qtyToAdd} units). ${requiredQty - qtyToAdd} required units remaining.`);
  };

  /**
   * Removes an item from the Invoice and returns its quantity to the Picklist.
   */
  const handleRemoveItem = (itemToRemove) => {
    const removedQty = itemToRemove.qty;

    setInvoiceProducts(prevInvoice =>
      prevInvoice.filter(p => p.sNo !== itemToRemove.sNo)
    );

    setPicklistProducts(prevPicklist => {
      const existingPicklist = prevPicklist.find(p => p.sNo === itemToRemove.sNo);

      if (existingPicklist) {
        return prevPicklist.map(p => {
          if (p.sNo === itemToRemove.sNo) {
            return {
              ...p,
              qty: p.qty + removedQty,
              userQty: 0,
              reason: 'N/A'
            };
          }
          return p;
        });
      } else {
        const originalProduct = getOriginalProduct(itemToRemove.sNo);

        if (!originalProduct) return prevPicklist;

        const newProduct = {
          ...originalProduct,
          qty: removedQty,
          userQty: 0,
          reason: 'N/A'
        };

        const newPicklist = [...prevPicklist, newProduct].sort((a, b) => a.sNo - b.sNo);
        return newPicklist;
      }
    });

    setMessage(`${itemToRemove.productName} removed from invoice. ${removedQty} units returned to Picklist.`);
  };

  const totalInvoiceAmount = invoiceProducts.reduce((sum, p) => sum + p.amount, 0).toFixed(2);

  return (
    <div className="container-fluid py-3">
      {message && <MessageBox message={message} onClose={() => setMessage(null)} type="danger" />}
      {continueMessage && <MessageBox message={continueMessage} onClose={() => setContinueMessage(null)} type="warning" />}

      <h2 className="fs-5 fw-bold text-dark mb-4 border-bottom pb-2 d-flex align-items-center">
        <Truck size={24} className='me-2 text-danger' /> Transaction POS Screen
      </h2>

      {/* Top Section: Product Search and Tables */}
      <div className="row g-4">
        {/* Left Panel: Product Search (col-md-3) */}
        <div className="col-lg-3">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-3">
              <h3 className="fs-6 fw-semibold text-secondary mb-3 border-bottom pb-2 d-flex align-items-center">
                <Barcode size={20} className="me-2 text-primary" /> Product Search
              </h3>
              <div className="d-grid gap-3">
                <input type="text" placeholder="Barcode" className="form-control form-control-sm rounded-3" />
                <input type="text" placeholder="Product ID" className="form-control form-control-sm rounded-3" />
                <input type="text" placeholder="Search Batch / Composition here..." className="form-control form-control-sm rounded-3" />
                <div className="d-flex align-items-center pt-2">
                  <label className="form-label mb-0 small text-secondary fw-medium me-2">Quantity</label>
                  <input type="number" defaultValue="1" min="1" className="form-control form-control-sm rounded-3 text-center" style={{ width: '60px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Invoice Details Tables (col-md-9) */}
        <div className="col-lg-9 d-grid gap-4">

          {/* Picklist Products Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <h4 className="card-header p-2 small fw-bold bg-primary-subtle text-primary border-0 d-flex align-items-center">
              <ClipboardList size={16} className="me-2" /> Picklist Products (Fulfillment Needed)
            </h4>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table table-hover table-sm mb-0">
                <thead><tr>
                  <TableHeader>S.No</TableHeader>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Manufacturer</TableHeader>
                  <TableHeader>Pack Size</TableHeader>
                  <TableHeader>Batch</TableHeader>
                  <TableHeader>Barcode</TableHeader>
                  <TableHeader>Req. Units</TableHeader>
                  <TableHeader>Reason</TableHeader>
                </tr></thead>
                <tbody>
                  {picklistProducts.map((product) => {
                    const packSize = parseInt(product.pack) || 1;
                    const isDivisible = product.qty % packSize === 0;
                    const isReasonRequired = isDivisible;

                    return (
                      <tr key={product.sNo}>
                        <TableData>{product.sNo}</TableData>
                        <TableData className="fw-medium">{product.productName}</TableData>
                        <TableData>{product.manufacturer}</TableData>
                        <TableData className='fw-semibold text-info'>{product.pack}</TableData>
                        <TableData>
                          <select 
                            className="form-select form-select-sm rounded-3 bg-white border-dark border-opacity-25" 
                            style={{width: '120px'}}
                            value={product.selectedBatch || product.batch}
                            onChange={(e) => handleBatchChange(product.sNo, e.target.value)}
                          >
                            {MOCK_ORDER_PRODUCTS.find(p => p.sNo === product.sNo)?.batches?.map((batch, idx) => (
                              <option key={idx} value={batch.batchNo}>{batch.batchNo}</option>
                            ))}
                          </select>
                        </TableData>
                        <TableData>
                          <input
                            type="text"
                            className="form-control form-control-sm rounded-3 bg-white border-dark border-opacity-25 fw-semibold text-primary"
                            value={product.barcode}
                            onChange={(e) => handleBarcodeChange(product.sNo, e.target.value)}
                            style={{width: '110px', cursor: (product.qty < parseInt(product.pack) || product.reason !== 'None') ? 'not-allowed' : 'text'}}
                            disabled={product.qty < parseInt(product.pack) || product.reason !== 'None'}
                            placeholder={product.reason === 'None' ? 'Scan here...' : ''}
                          />
                        </TableData>
                        <TableData className='fw-semibold text-primary'>{product.qty}</TableData>
                        <TableData>
                          <select
                            disabled={!isReasonRequired}
                            value={product.reason}
                            onChange={(e) => handleReasonChange(product.sNo, e.target.value)}
                            className={`form-select form-select-sm rounded-3 ${isReasonRequired ? 'bg-warning-subtle border-warning' : 'bg-light text-secondary'}`}
                            style={{width: '120px'}}
                          >
                            <option value="None">None</option>
                            <option value="Short">Short</option>
                            <option value="Damaged">Damaged</option>
                          </select>
                        </TableData>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Products Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <h4 className="card-header p-2 small fw-bold bg-success-subtle text-success border-0 d-flex align-items-center">
              <Package size={16} className="me-2" /> Invoice Products (Confirmed for Sale)
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
                  <TableHeader>Remove</TableHeader>
                </tr></thead>
                <tbody>
                  {invoiceProducts.map((product, index) => (
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
                      <TableData>
                        <button
                          onClick={() => handleRemoveItem(product)}
                          className="btn btn-sm btn-danger-subtle text-danger rounded-3 shadow-sm d-flex align-items-center"
                        >
                          <X size={14} className='me-1' /> Remove
                        </button>
                      </TableData>
                    </tr>
                  ))}
                  {invoiceProducts.length === 0 && (
                    <tr key="empty-invoice">
                      <td colSpan="11" className="text-center py-3 text-secondary fst-italic">
                        No items added to the invoice yet. Add items from the picklist above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sale Order Products and Totals */}
      <div className='row g-4 mt-2'>
        <div className='col-lg-3'>
          <div className="p-3"></div>
        </div>

        <div className="col-lg-9 d-grid gap-4">
          {/* Sale Order Products Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <h4 className="card-header p-2 small fw-bold bg-warning-subtle text-warning-emphasis border-0 d-flex align-items-center">
              <DollarSign size={16} className="me-2" /> Sale Order Products (Customer Request)
            </h4>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table table-hover table-sm mb-0">
                <thead><tr>
                  <TableHeader>S.No</TableHeader>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Manufacturer</TableHeader>
                  <TableHeader>Pack</TableHeader>
                  <TableHeader>Batch</TableHeader>
                  <TableHeader>Order Qty</TableHeader>
                  <TableHeader>Alternatives</TableHeader>
                  <TableHeader>Suggestions</TableHeader>
                  <TableHeader></TableHeader>
                  <TableHeader className="text-center"></TableHeader>
                </tr></thead>
                <tbody>
                  {MOCK_SALE_ORDER_PRODUCTS.map((product) => (
                    <tr key={product.sNo}>
                      <TableData>{product.sNo}</TableData>
                      <TableData className="fw-medium">{product.productName}</TableData>
                      <TableData>{product.manufacturer}</TableData>
                      <TableData>-</TableData>
                      <TableData>-</TableData>
                      <TableData className='fw-semibold'>{product.orderQty}</TableData>
                      <TableData>
                        <button className="btn btn-sm btn-info-subtle text-info rounded-3">Alternatives</button>
                      </TableData>
                      <TableData>
                        <button className="btn btn-sm btn-info-subtle text-info rounded-3">Suggestions</button>
                      </TableData>
                      <TableData>-</TableData>
                      <TableData></TableData>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions and Totals */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 bg-white rounded-3 border-top shadow">
            <div className='d-flex flex-column gap-2 mb-3 mb-sm-0'>
              <div className='d-flex gap-2'>
                <button className="btn btn-sm btn-secondary">Reset</button>
                <button className="btn btn-sm btn-danger d-flex align-items-center">E-Prescription</button>
              </div>
              <div className='d-flex gap-2'>
                <button className="btn btn-sm btn-primary">Submit Bounce/Indent</button>
                <button className="btn btn-sm btn-info text-white" onClick={onExit}>Exit</button>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="small fw-semibold text-secondary">Total Invoice Amount:</span>
              <span className="fs-5 fw-bolder text-danger">₹{totalInvoiceAmount}</span>
              <button
                className="btn btn-lg btn-success rounded-3 shadow"
                onClick={() => onContinue(invoiceProducts)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POSOrderScreen;
