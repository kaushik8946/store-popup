import React from 'react';
import HomeView from './screens/HomeView';
import POSOrderScreen from './screens/POSOrderScreen';
import TransferScreen from './screens/TransferScreen';
import InvoiceScreen from './screens/InvoiceScreen';

const MainContent = ({
  view,
  multiStep,
  itemsToTransfer,
  continueMessage,
  setContinueMessage,
  handleExitOrderScreen,
  handleContinueTransfer,
  handleInvoiceContinue,
  setView,
}) => {
  let mainContent;
  if (view === 'HOME') {
    mainContent = <HomeView />;
  } else if (view === 'ORDER') {
    mainContent = <POSOrderScreen onExit={handleExitOrderScreen} onContinue={handleContinueTransfer} continueMessage={continueMessage} setContinueMessage={setContinueMessage} />;
  } else if (view === 'INVOICE_SCREEN') {
    mainContent = <InvoiceScreen invoiceItems={multiStep.invoiceItems} onContinue={handleInvoiceContinue} setView={setView} />;
  } else if (view === 'TRANSFER_SCREEN') {
    let transferItems = itemsToTransfer;
    const fromStoreId = 'NAPHYSS0038A(PRT&A-OHS-HYD-INVENT)';
    let toStoreId = fromStoreId;
    if (multiStep.step === 'transfer-damaged') {
      toStoreId = 'NAPHYSS0039R(RETURN-INVENTORY)';
      transferItems = itemsToTransfer.map(item => ({ ...item, destination: toStoreId, transferType: 'Damaged Items' }));
    } else if (multiStep.step === 'transfer-picked') {
      toStoreId = 'NAPHYSS0040S(SALE-HUB)';
      transferItems = itemsToTransfer.map(item => ({ ...item, destination: toStoreId, transferType: 'Picked Items' }));
    }
    mainContent = <TransferScreen 
      onExit={handleExitOrderScreen} 
      transferItems={transferItems} 
      setView={setView} 
      onSubmit={handleContinueTransfer}
      transferType={multiStep.step === 'transfer-damaged' ? 'Damaged Items (Return Inventory)' : multiStep.step === 'transfer-picked' ? 'Picked Items (Sale Hub)' : 'Transfer Order'}
      fromStoreName={'miyapur x-road'}
      fromStoreId={fromStoreId}
      toStoreId={toStoreId}
    />;
  }
  return mainContent;
};

export default MainContent;
