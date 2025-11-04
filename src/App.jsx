import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_TO_REQUEST, MOCK_CONFIG, MOCK_ORDER_PRODUCTS } from './data/mockData';
import TopBar from './components/layout/TopBar';
import HomeView from './components/screens/HomeView';
import POSOrderScreen from './components/screens/POSOrderScreen';
import TransferScreen from './components/screens/TransferScreen';
import MiniFulfillmentNotification from './components/notifications/MiniFulfillmentNotification';

// Load Bootstrap CSS and JS scripts
const BootstrapScripts = () => (
  <>
    {/* Using standard Bootstrap 5 CDN */}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"></script>
  </>
);

/**
 * Main Application Component (Layout and State Management)
 */
const App = () => {
  // Reverted to single view state
  const [view, setView] = useState('HOME');

  const [requestData, setRequestData] = useState(MOCK_TO_REQUEST);
  const [isNotificationActive, setIsNotificationActive] = useState(true);
  const [itemsToTransfer, setItemsToTransfer] = useState([]);
  const [continueMessage, setContinueMessage] = useState(null);

  // Derived states
  const MAX_SKIPS = MOCK_CONFIG.noOfTimes - 1;
  const isFinalAttempt = requestData.timesDisplayed >= MAX_SKIPS;
  const isSkippableConfig = MOCK_CONFIG.isSkippable === 'Y';
  const isMandatory = isNotificationActive && (isFinalAttempt || !isSkippableConfig);

  const handleProcess = useCallback((qtyTransferred, isPartial) => {
    console.log(`[SYSTEM] Initiating TO Process with Qty: ${qtyTransferred}.`);
    setIsNotificationActive(false);
    setView('ORDER');
  }, []);

  const handleReject = useCallback(() => {
    console.log('[SYSTEM] TO Draft Rejected. Preparing bounce/indent.');
    setIsNotificationActive(false);

    // Create rejected items for all products in the order (first 3 products from MOCK_ORDER_PRODUCTS)
    const rejectedTransferItems = MOCK_ORDER_PRODUCTS.slice(0, 3).map((product) => ({
      sNo: product.sNo,
      productName: product.productName,
      manufacturer: product.manufacturer,
      pack: product.pack,
      batch: product.batch,
      dt: product.dt,
      mrp: product.mrp,
      qty: product.qty,
      amount: 0, // Amount is 0 for rejected items
      barcode: product.barcode,
      status: 'REJECTED/BOUNCED',
    }));

    // Set all rejected items and navigate to the Transfer Screen
    setItemsToTransfer(rejectedTransferItems);
    setView('TRANSFER_SCREEN');
  }, []);

  const handleSkip = useCallback(() => {
    const newTimesDisplayed = requestData.timesDisplayed + 1;
    setRequestData(prev => ({
      ...prev,
      timesDisplayed: newTimesDisplayed
    }));

    console.log(`[SYSTEM] TO Draft Skipped. Times displayed: ${newTimesDisplayed}/${MOCK_CONFIG.noOfTimes}`);
    setIsNotificationActive(false);

    setTimeout(() => {
      setIsNotificationActive(true);
    }, MOCK_CONFIG.popupIntervalTime * 1000);

  }, [requestData]);

  const handleContinueTransfer = useCallback((invoicedItems) => {
    if (invoicedItems.length === 0 || !invoicedItems.some(item => item.reason === 'Damaged')) {
      setContinueMessage('No products to transfer');
      return;
    }
    // Only include products with reason 'None'
    const filteredItems = invoicedItems.filter(item => item.reason === 'None');
    setItemsToTransfer(filteredItems);
    setView('TRANSFER_SCREEN');
  }, []);

  const handleTransferComplete = useCallback((transferOrders) => {
    console.log('[SYSTEM] Transfer Orders Created:', transferOrders);
    setView('HOME');
    setRequestData(MOCK_TO_REQUEST);
    setIsNotificationActive(true);
    setItemsToTransfer([]);
  }, []);

  const handleExitOrderScreen = useCallback(() => {
    setView('HOME'); // Set view back to HOME
    setRequestData(MOCK_TO_REQUEST);
    setIsNotificationActive(true);
    setItemsToTransfer([]);
  }, []);

  // Conditional Content Rendering
  let mainContent;
  if (view === 'HOME') {
    mainContent = <HomeView />;
  } else if (view === 'ORDER') {
    mainContent = <POSOrderScreen onExit={handleExitOrderScreen} onContinue={handleContinueTransfer} continueMessage={continueMessage} setContinueMessage={setContinueMessage} />;
  } else if (view === 'TRANSFER_SCREEN') {
    mainContent = <TransferScreen onExit={handleExitOrderScreen} transferItems={itemsToTransfer} setView={setView} />;
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <BootstrapScripts />
      <TopBar view={view} setView={setView} />
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* Main Content Area */}
        <main className="flex-grow-1 overflow-y-auto position-relative">
          {mainContent}

          {/* --- NOTIFICATION RENDERING (Skippable or Mandatory) --- */}
          {isNotificationActive && (
            <div className={`position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${isMandatory ? 'bg-black bg-opacity-25' : ''}`} style={{ zIndex: 1040 }}>
              <MiniFulfillmentNotification
                request={requestData}
                onSkip={handleSkip}
                onProcess={handleProcess}
                onReject={handleReject}
                isMandatory={isMandatory}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
