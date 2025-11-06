import React from 'react';
import { AlertTriangle, X, SkipForward, Check } from 'lucide-react';
import { MOCK_CONFIG, MOCK_TO_REQUEST } from '../data/mockData';

const MiniFulfillmentNotification = ({ request, onSkip, onProcess, isMandatory }) => {
  const skipsLeft = MOCK_CONFIG.noOfTimes - request.timesDisplayed - 1;
  const isSkippableConfig = MOCK_CONFIG.isSkippable === 'Y';
  const isSkipAllowed = isSkippableConfig && request.timesDisplayed < (MOCK_CONFIG.noOfTimes - 1);

  const handleAccept = () => {
    const qtyToTransfer = MOCK_TO_REQUEST.availableQuantity;
    const isPartial = qtyToTransfer < MOCK_TO_REQUEST.requiredQuantity;
    onProcess(qtyToTransfer, isPartial);
  };

  const borderColor = isMandatory ? 'border-danger' : 'border-warning';
  const textColor = isMandatory ? 'text-danger' : 'text-warning';

  return (
    <div className={`position-fixed top-50 start-50 translate-middle p-4 bg-dark text-white rounded-3 shadow-lg d-flex flex-column gap-3 border-top border-4 ${borderColor}`} style={{ maxWidth: '350px', zIndex: 1050 }}>

      <div className={`d-flex align-items-center gap-3 ${textColor}`}>
        <AlertTriangle size={20} className="flex-shrink-0" />
        <div className="flex-grow-1 overflow-hidden">
          <p className="mb-0 fw-bold text-truncate small">FULFILLMENT REQUIRED ({isMandatory ? 'MANDATORY' : 'PENDING'})</p>
          <p className="mb-0 text-secondary" style={{ fontSize: '10px' }}>
            {isSkipAllowed ? `(${skipsLeft} skips left)` : isMandatory ? 'FINAL WARNING: ACTION REQUIRED' : 'MANDATORY ACTION REQUIRED'}
          </p>
        </div>
      </div>

      <div className="d-flex justify-content-between gap-3">
        {isSkipAllowed && (
          <button
            onClick={onSkip}
            className="btn btn-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center"
          >
            <SkipForward size={16} className="me-1" /> Skip
          </button>
        )}

        <button
          onClick={handleAccept}
          className={`btn btn-success btn-sm flex-grow-1 d-flex align-items-center justify-content-center ${!isSkipAllowed ? 'w-100' : ''}`}
        >
          <Check size={16} className="me-1" /> Accept Transfer
        </button>
      </div>
    </div>
  );
};

export default MiniFulfillmentNotification;
