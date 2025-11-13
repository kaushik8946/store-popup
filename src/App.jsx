import React, { useState, useCallback } from 'react';
import './styles/global.css';
import { MOCK_TO_REQUEST, MOCK_CONFIG } from './data/mockData';
import TopBar from './components/layout/TopBar';
import BootstrapScripts from './components/BootstrapScripts';
import MainContent from './components/MainContent';
import PopupManager from './components/PopupManager';


/**
 * Main Application Component (Layout and State Management)
 */
const App = () => {
  // Reverted to single view state
  const [view, setView] = useState('HOME');

  const [requestData, setRequestData] = useState(MOCK_TO_REQUEST);
  const [isNotificationActive, setIsNotificationActive] = useState(true);
  const [itemsToTransfer, setItemsToTransfer] = useState([]);
  // Multi-step flow state
  const [multiStep, setMultiStep] = useState({
    step: null, // 'invoice' | 'transfer-damaged' | 'transfer-picked'
    invoiceItems: [],
    damagedItems: [],
    pickedItems: [],
  });
  const [summaryData, setSummaryData] = useState(null);
  const [finalPopupData, setFinalPopupData] = useState(null);
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

  // Multi-step flow: after submit in POSOrderScreen
  const handleContinueTransfer = useCallback((allProducts = []) => {
    console.log('[DEBUG] All products received:', allProducts);
    
    // Split products by reason/status
    const shortItems = allProducts.filter(p => p.reason === 'Short' || p.status === 'SHORT');
    const damagedItems = allProducts.filter(p => p.reason === 'Damaged' || p.status === 'DAMAGED');
    const pickedItems = allProducts.filter(p => (p.reason === 'None' || !p.reason) && p.status === 'PICKED');

    console.log('[DEBUG] Short items:', shortItems.length, shortItems);
    console.log('[DEBUG] Damaged items:', damagedItems.length, damagedItems);
    console.log('[DEBUG] Picked items:', pickedItems.length, pickedItems);

    // Always start with invoice step if there are short items
    if (shortItems.length > 0) {
      setMultiStep({
        step: 'invoice',
        invoiceItems: shortItems,
        damagedItems,
        pickedItems,
      });
      setView('INVOICE_SCREEN');
    } else if (damagedItems.length > 0) {
      // If no short items, go directly to damaged transfer
      setMultiStep({
        step: 'transfer-damaged',
        invoiceItems: [],
        damagedItems,
        pickedItems,
      });
      setItemsToTransfer(damagedItems);
      setView('TRANSFER_SCREEN');
    } else if (pickedItems.length > 0) {
      // If no short or damaged, go directly to picked transfer
      setMultiStep({
        step: 'transfer-picked',
        invoiceItems: [],
        damagedItems: [],
        pickedItems,
      });
      setItemsToTransfer(pickedItems);
      setView('TRANSFER_SCREEN');
    } else {
      setContinueMessage('No products to process');
    }
  }, []);

  // Handler for continuing from InvoiceScreen to next step
  const handleInvoiceContinue = useCallback((invoice) => {
    if (invoice) console.log('[SYSTEM] Invoice received in App:', invoice);
    console.log('[DEBUG] Invoice continue - damaged:', multiStep.damagedItems.length, 'picked:', multiStep.pickedItems.length);
    
  // store invoice and current item lists for summary (only from THIS order)
  if (invoice) setSummaryData({ invoice, shortList: multiStep.invoiceItems, damagedList: multiStep.damagedItems, pickedList: multiStep.pickedItems });

    if (multiStep.damagedItems.length > 0) {
      setMultiStep(prev => ({ ...prev, step: 'transfer-damaged' }));
      setItemsToTransfer(multiStep.damagedItems);
      setView('TRANSFER_SCREEN');
    } else if (multiStep.pickedItems.length > 0) {
      setMultiStep(prev => ({ ...prev, step: 'transfer-picked' }));
      setItemsToTransfer(multiStep.pickedItems);
      setView('TRANSFER_SCREEN');
    } else {
      // No more steps, go to HOME (nothing to transfer) - show popup if invoice exists
      const popup = {};
      if (invoice) {
        popup.invoiceId = invoice.id;
        popup.invoiceAmount = invoice.total;
      }
      setFinalPopupData(popup);
      setView('HOME');
      setRequestData(MOCK_TO_REQUEST);
      setIsNotificationActive(true);
      setMultiStep({ step: null, invoiceItems: [], damagedItems: [], pickedItems: [] });
    }
  }, [multiStep]);

  // Handler for continuing from TransferScreen to next step
  const handleTransferContinue = useCallback((itemReasons = {}) => {
    console.log('[DEBUG] Transfer continue - step:', multiStep.step, 'picked items:', multiStep.pickedItems.length);
    console.log('[DEBUG] Item reasons received:', itemReasons);
    
    // Only count damaged items from THIS order (current multiStep)
    const damagedCount = multiStep.damagedItems?.length || 0;
    
    console.log('[DEBUG] Current order damaged items:', damagedCount);
    
    if (multiStep.step === 'transfer-damaged' && multiStep.pickedItems.length > 0) {
      // After damaged transfer, generate damaged transfer id ONLY if there are damaged items
      const damagedId = damagedCount > 0 ? `TFR-D-${Date.now().toString().slice(-6)}` : null;
      setSummaryData({ 
        ...(summaryData || {}), 
        ...(damagedId ? { damagedTransferId: damagedId } : {}),
        damagedList: multiStep.damagedItems,
        damagedCount: damagedCount
      });
      setMultiStep(prev => ({ ...prev, step: 'transfer-picked' }));
      setItemsToTransfer(multiStep.pickedItems);
      setView('TRANSFER_SCREEN');
    } else {
      // After last transfer step, generate transfer ids only for non-empty lists and go HOME with final popup
      const hasPicked = multiStep.pickedItems.length > 0;
      const hasDamaged = damagedCount > 0;

      const pickedId = hasPicked ? `TFR-P-${Date.now().toString().slice(-6)}` : null;
      const damagedId = hasDamaged ? (summaryData?.damagedTransferId || `TFR-D-${(Date.now()+1).toString().slice(-6)}`) : null;

      setSummaryData({
        ...(summaryData || {}),
        damagedList: multiStep.damagedItems,
        pickedList: multiStep.pickedItems,
        damagedCount: damagedCount,
        pickedCount: multiStep.pickedItems.length,
        ...(pickedId ? { pickedTransferId: pickedId } : {}),
        ...(damagedId ? { damagedTransferId: damagedId } : {})
      });

      const popup = {};
      if (summaryData?.invoice?.id) popup.invoiceId = summaryData.invoice.id;
      if (summaryData?.invoice?.total) popup.invoiceAmount = summaryData.invoice.total;
      if (damagedId) popup.damagedTransferId = damagedId;
      if (pickedId) popup.pickedTransferId = pickedId;

      setFinalPopupData(popup);
      setView('HOME');
      setRequestData(MOCK_TO_REQUEST);
      setIsNotificationActive(true);
      setItemsToTransfer([]);
      setMultiStep({ step: null, invoiceItems: [], damagedItems: [], pickedItems: [] });
      setSummaryData(null); // Clear all summary data
    }
  }, [multiStep, summaryData]);

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


  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <BootstrapScripts />
      <TopBar view={view} setView={setView} />
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* Main Content Area */}
        <main className="flex-grow-1 overflow-y-auto position-relative">
          <MainContent
            view={view}
            multiStep={multiStep}
            itemsToTransfer={itemsToTransfer}
            continueMessage={continueMessage}
            setContinueMessage={setContinueMessage}
            handleExitOrderScreen={handleExitOrderScreen}
            handleContinueTransfer={handleContinueTransfer}
            handleInvoiceContinue={handleInvoiceContinue}
            setView={setView}
          />

          <PopupManager
            isNotificationActive={isNotificationActive}
            finalPopupData={finalPopupData}
            isMandatory={isMandatory}
            requestData={requestData}
            handleSkip={handleSkip}
            handleProcess={handleProcess}
            setFinalPopupData={setFinalPopupData}
            setIsNotificationActive={setIsNotificationActive}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
