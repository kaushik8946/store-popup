import React, { useState } from 'react';
import { Truck, Barcode, ClipboardList, Package, DollarSign, X, AlertTriangle } from 'lucide-react';
import { MOCK_ORDER_PRODUCTS, MOCK_SALE_ORDER_PRODUCTS } from '../../data/mockData';
import MessageBox from '../common/MessageBox';
import { TableHeader, TableData } from '../common/TableComponents';

/**
 * Screen displayed after processing the TO request, simulating the main POS transaction screen.
 */
const POSOrderScreen = ({ onExit, onContinue, continueMessage, setContinueMessage }) => {
  // 1. Initialize State: Picklist starts with products 1, 2, and 3
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
  const [shortProductsState, setShortProductsState] = useState([]);
  const [damagedProductsState, setDamagedProductsState] = useState([]);
  const [message, setMessage] = useState(null);
  // Disable all inputs if a popup is shown
  const isPopupActive = Boolean(message) || Boolean(continueMessage);

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
          reason: isPartial ? 'None' : 'None'
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
    // Move product out of picklist into short/damaged arrays when a reason is selected
    const product = picklistProducts.find(p => p.sNo === sNo);
    if (!product) return;

    if (value === 'Short') {
      // remove from picklist
      setPicklistProducts(prev => prev.filter(p => p.sNo !== sNo));
      // add to short list (preserve qty/mrp/batch)
      setShortProductsState(prev => [...prev, { ...product, reason: 'Short', userQty: product.userQty || 0 }]);
      return;
    }

    if (value === 'Damaged') {
      setPicklistProducts(prev => prev.filter(p => p.sNo !== sNo));
      setDamagedProductsState(prev => [...prev, { ...product, reason: 'Damaged', userQty: product.userQty || 0 }]);
      return;
    }

    // If None selected, do nothing here (use explicit Clear/Remove action to move back)
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
          reason: 'None',
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
              reason: 'None',
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
              reason: 'None'
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
          reason: 'None'
        };

        const newPicklist = [...prevPicklist, newProduct].sort((a, b) => a.sNo - b.sNo);
        return newPicklist;
      }
    });

    setMessage(`${itemToRemove.productName} removed from invoice. ${removedQty} units returned to Picklist.`);
  };

  // Clear reason/userQty for a picklist product (used to remove from Damaged/Short lists)
  const handleClearReason = (sNo) => {
    // If item is in short list, remove it and return to picklist
    const fromShort = shortProductsState.find(p => p.sNo === sNo);
    if (fromShort) {
      setShortProductsState(prev => prev.filter(p => p.sNo !== sNo));
      setPicklistProducts(prev => {
        const restored = { ...fromShort, reason: 'None', userQty: 0, barcode: '' };
        return [...prev, restored].sort((a, b) => a.sNo - b.sNo);
      });
      setMessage(`${fromShort.productName} restored to picklist.`);
      return;
    }

    const fromDamaged = damagedProductsState.find(p => p.sNo === sNo);
    if (fromDamaged) {
      setDamagedProductsState(prev => prev.filter(p => p.sNo !== sNo));
      setPicklistProducts(prev => {
        const restored = { ...fromDamaged, reason: 'None', userQty: 0, barcode: '' };
        return [...prev, restored].sort((a, b) => a.sNo - b.sNo);
      });
      setMessage(`${fromDamaged.productName} restored to picklist.`);
      return;
    }

    // Fallback: ensure picklist has the item set to None if present
    setPicklistProducts(prev => prev.map(p => (p.sNo === sNo ? { ...p, reason: 'None', userQty: 0, barcode: '' } : p)));
    const prod = MOCK_ORDER_PRODUCTS.find(p => p.sNo === sNo);
    setMessage(prod ? `${prod.productName} updated.` : 'Item updated.');
  };

  const totalInvoiceAmount = invoiceProducts.reduce((sum, p) => sum + p.amount, 0).toFixed(2);

  // Derived lists for display: damaged and short products (moved out of picklist)
  const damagedProducts = damagedProductsState;
  const shortProducts = shortProductsState;

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
                <input type="text" placeholder="Barcode" className="form-control form-control-sm rounded-3" disabled={isPopupActive} />
                <input type="text" placeholder="Product ID" className="form-control form-control-sm rounded-3" disabled={isPopupActive} />
                <input type="text" placeholder="Search Batch / Composition here..." className="form-control form-control-sm rounded-3" disabled={isPopupActive} />
                <div className="d-flex align-items-center pt-2">
                  <label className="form-label mb-0 small text-secondary fw-medium me-2">Quantity</label>
                  <input type="number" defaultValue="1" min="1" className="form-control form-control-sm rounded-3 text-center" style={{ width: '60px' }} disabled={isPopupActive} />
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
                            disabled={isPopupActive}
                          >
                            {MOCK_ORDER_PRODUCTS.find(p => p.sNo === product.sNo)?.batches?.map((batch, idx) => (
                              <option key={idx} value={batch.batchNo}>{batch.batchNo}</option>
                            ))}
                          </select>
                        </TableData>
                        <TableData>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="form-control form-control-sm rounded-3 bg-white border-dark border-opacity-25 fw-semibold text-primary"
                            value={product.barcode}
                            onChange={(e) => handleBarcodeChange(product.sNo, e.target.value.replace(/[^0-9]/g, ''))}
                            style={{width: '110px', cursor: (product.qty < parseInt(product.pack) || product.reason !== 'None' || isPopupActive) ? 'not-allowed' : 'text'}}
                            disabled={product.qty < parseInt(product.pack) || product.reason !== 'None' || isPopupActive}
                            placeholder={product.reason === 'None' ? 'Scan here...' : ''}
                          />
                        </TableData>
                        <TableData className='fw-semibold text-primary'>{product.qty}</TableData>
                        <TableData>
                          <select
                            disabled={!isReasonRequired || isPopupActive}
                            value={product.reason}
                            onChange={(e) => handleReasonChange(product.sNo, e.target.value)}
                            className={`form-select form-select-sm rounded-3 ${isReasonRequired ? 'bg-warning-subtle border-warning' : 'bg-light text-secondary'}`}
                            style={{width: '120px'}}>
                            <option value="None">None</option>
                            <option value="Short">Short</option>
                            <option value="Damaged">Damaged</option>
                          </select>
                        </TableData>
                      </tr>
                    );
                  })}
                  {picklistProducts.length === 0 && (
                    <tr key="empty-picklist">
                      <td colSpan="8" className="text-center py-3 text-secondary fst-italic">All Items picked</td>
                    </tr>
                  )}
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
          {/* Damaged Products Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <h4 className="card-header p-2 small fw-bold bg-danger-subtle text-danger border-0 d-flex align-items-center">
              <AlertTriangle size={16} className="me-2" /> Damaged Products (To Return)
            </h4>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table table-hover table-sm mb-0">
                <thead><tr>
                  <TableHeader>S.No</TableHeader>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Manufacturer</TableHeader>
                  <TableHeader>Pack</TableHeader>
                  <TableHeader>Batch</TableHeader>
                  <TableHeader>Qty</TableHeader>
                  <TableHeader>Remove</TableHeader>
                </tr></thead>
                <tbody>
                  {damagedProducts.map((product, idx) => (
                    <tr key={`dam-${product.sNo}-${idx}`}>
                      <TableData>{idx + 1}</TableData>
                      <TableData className="fw-medium">{product.productName}</TableData>
                      <TableData>{product.manufacturer}</TableData>
                      <TableData>{product.pack}</TableData>
                      <TableData>{product.selectedBatch || product.batch}</TableData>
                      <TableData className='fw-semibold'>{product.userQty || product.qty}</TableData>
                      <TableData>
                        <button
                          onClick={() => handleClearReason(product.sNo)}
                          className="btn btn-sm btn-danger-subtle text-danger rounded-3 shadow-sm d-flex align-items-center"
                        >
                          <X size={14} className='me-1' /> Remove
                        </button>
                      </TableData>
                    </tr>
                  ))}
                  {damagedProducts.length === 0 && (
                    <tr key="empty-damaged">
                      <td colSpan="7" className="text-center py-3 text-secondary fst-italic">No damaged items.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Short Products Table */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <h4 className="card-header p-2 small fw-bold bg-warning-subtle text-warning-emphasis border-0 d-flex align-items-center">
              <DollarSign size={16} className="me-2" /> Short Products (Store Shortage)
            </h4>
            <div className="card-body p-0 overflow-x-auto">
              <table className="table table-hover table-sm mb-0">
                <thead><tr>
                  <TableHeader>S.No</TableHeader>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Manufacturer</TableHeader>
                  <TableHeader>Pack</TableHeader>
                  <TableHeader>Batch</TableHeader>
                  <TableHeader>Qty</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Remove</TableHeader>
                </tr></thead>
                <tbody>
                  {shortProducts.map((product, idx) => (
                    <tr key={`short-${product.sNo}-${idx}`}>
                      <TableData>{idx + 1}</TableData>
                      <TableData className="fw-medium">{product.productName}</TableData>
                      <TableData>{product.manufacturer}</TableData>
                      <TableData>{product.pack}</TableData>
                      <TableData>{product.selectedBatch || product.batch}</TableData>
                      <TableData className='fw-semibold text-warning'>
                        {/* allow short qty editing inline if desired in future; for now display stored userQty or qty */}
                        {product.userQty || product.qty || 0}
                      </TableData>
                      <TableData className='fw-bold text-danger'>₹{(((product.userQty || product.qty || 0) * (product.mrp || 0))).toFixed(2)}</TableData>
                      <TableData>
                        <button
                          onClick={() => handleClearReason(product.sNo)}
                          className="btn btn-sm btn-danger-subtle text-danger rounded-3 shadow-sm d-flex align-items-center"
                        >
                          <X size={14} className='me-1' /> Remove
                        </button>
                      </TableData>
                    </tr>
                  ))}
                  {shortProducts.length === 0 && (
                    <tr key="empty-short">
                      <td colSpan="8" className="text-center py-3 text-secondary fst-italic">No short items.</td>
                    </tr>
                  )}
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
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="small fw-semibold text-secondary">Total Invoice Amount:</span>
              <span className="fs-5 fw-bolder text-danger">₹{totalInvoiceAmount}</span>
              <button
                className="btn btn-lg btn-success rounded-3 shadow"
                onClick={() => {
                  // Validation: all products must be either Short, Damaged or Picked
                  const pickedSNos = new Set(invoiceProducts.map(p => p.sNo));

                  const invalidProducts = picklistProducts.filter(p => {
                    // If product is already picked (present in invoice) it's OK
                    if (pickedSNos.has(p.sNo)) return false;
                    // Otherwise it must have a reason Short or Damaged
                    return !(p.reason === 'Short' || p.reason === 'Damaged');
                  });

                  if (invalidProducts.length > 0) {
                    setMessage('Pick all products or select reason');
                    return;
                  }

                  // Collect all products: invoice products (picked) + picklist products that have a reason (Short/Damaged)
                  // Collect reasoned products from the dedicated short/damaged states
                  const reasonedPicklist = [
                    ...shortProductsState,
                    ...damagedProductsState
                  ].map(p => ({
                    sNo: p.sNo,
                    productName: p.productName,
                    manufacturer: p.manufacturer,
                    pack: p.pack,
                    batch: p.selectedBatch || p.batch,
                    mrp: p.mrp,
                    barcode: p.barcode,
                    qty: p.qty,
                    amount: p.qty * p.mrp,
                    reason: p.reason,
                    status: p.reason === 'Short' ? 'SHORT' : 'DAMAGED'
                  }));

                  const allProducts = [
                    ...invoiceProducts,
                    ...reasonedPicklist
                  ];

                  if (allProducts.length === 0) {
                    setContinueMessage('No products to process');
                    return;
                  }

                  onContinue(allProducts);
                }}
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
