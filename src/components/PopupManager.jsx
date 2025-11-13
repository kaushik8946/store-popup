import React from 'react';
import MiniFulfillmentNotification from './notifications/MiniFulfillmentNotification';
import MessageBox from './common/MessageBox';

const PopupManager = ({
  isNotificationActive,
  finalPopupData,
  isMandatory,
  requestData,
  handleSkip,
  handleProcess,
  setFinalPopupData,
  setIsNotificationActive,
}) => (
  <>
    {/* --- NOTIFICATION RENDERING (Skippable or Mandatory) --- */}
    {isNotificationActive && !finalPopupData && (
      <div className={`position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${isMandatory ? 'bg-black bg-opacity-25' : ''}`} style={{ zIndex: 1040 }}>
        <MiniFulfillmentNotification
          request={requestData}
          onSkip={handleSkip}
          onProcess={handleProcess}
          isMandatory={isMandatory}
        />
      </div>
    )}
    {/* Final popup after transfer completion (invoice + transfer ids) */}
    {finalPopupData && (
      <MessageBox
        message={(
          <div>
            {finalPopupData.invoiceId && (
              <div className="mb-2"><strong>Invoice:</strong> {finalPopupData.invoiceId}</div>
            )}
            {typeof finalPopupData.invoiceAmount !== 'undefined' && finalPopupData.invoiceAmount !== null && (
              <div className="mb-2"><strong>Amount:</strong> ₹{finalPopupData.invoiceAmount}</div>
            )}
            {finalPopupData.damagedTransferId && (
              <div className="mb-2 text-nowrap"><strong>Damaged Transfer ID:</strong> {finalPopupData.damagedTransferId}</div>
            )}
            {finalPopupData.pickedTransferId && (
              <div className="mb-0 text-nowrap"><strong>Picked Transfer ID:</strong> {finalPopupData.pickedTransferId}</div>
            )}
          </div>
        )}
        onClose={() => {
          setFinalPopupData(null);
          setIsNotificationActive(true);
        }}
      />
    )}
  </>
);

export default PopupManager;
