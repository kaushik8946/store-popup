import React from 'react';
import { X, SkipForward, Check, AlertTriangle } from 'lucide-react';
import { MOCK_CONFIG, MOCK_TO_REQUEST } from '../../data/mockData';

/**
 * Small, non-intrusive notification containing all fulfillment actions.
 */
const MiniFulfillmentNotification = ({ request, onSkip, onProcess, onReject, isMandatory, isClosing }) => {
  const skipsLeft = MOCK_CONFIG.noOfTimes - request.timesDisplayed - 1;
  const isSkippableConfig = MOCK_CONFIG.isSkippable === 'Y';
  // isSkipAllowed is always false if isMandatory is true (final attempt)
  const isSkipAllowed = isSkippableConfig && request.timesDisplayed < (MOCK_CONFIG.noOfTimes - 1);

  // Default action (simulating full available fulfillment)
  const handleAccept = () => {
    // When accepted from the mini notification, we automatically use the max available quantity (10)
    const qtyToTransfer = MOCK_TO_REQUEST.availableQuantity;
    const isPartial = qtyToTransfer < MOCK_TO_REQUEST.requiredQuantity;
    onProcess(qtyToTransfer, isPartial);
  };

  // Determine glow color based on progression through total displays
  // Green at start, Yellow at middle, Red at end
  const totalDisplays = MOCK_CONFIG.noOfTimes;
  const currentDisplay = request.timesDisplayed + 1; // 1-indexed for easier calculation
  const progressPercentage = (currentDisplay / totalDisplays) * 100;

  let glowColor, glowColorRgba, borderColor, textColor, glowAnimation;

  if (progressPercentage < 50) {
    // First half - Green
    glowColor = 'success';
    glowColorRgba = '40, 167, 69'; // Bootstrap success green
    borderColor = 'border-success';
    textColor = 'text-success';
    glowAnimation = 'glowGreen';
  } else if (progressPercentage < 100) {
    // Second half (not final) - Yellow
    glowColor = 'warning';
    glowColorRgba = '255, 193, 7'; // Bootstrap warning yellow
    borderColor = 'border-warning';
    textColor = 'text-warning';
    glowAnimation = 'glowYellow';
  } else {
    // Final display - Red
    glowColor = 'danger';
    glowColorRgba = '220, 53, 69'; // Bootstrap danger red
    borderColor = 'border-danger';
    textColor = 'text-danger';
    glowAnimation = 'glowRed';
  }

  return (
    <>
      <style>{`
                @keyframes glowGreen {
                    0%, 100% {
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                    0 0 20px rgba(40, 167, 69, 0.6), 
                                    0 0 40px rgba(40, 167, 69, 0.4), 
                                    0 0 60px rgba(40, 167, 69, 0.2);
                    }
                    50% {
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                    0 0 30px rgba(40, 167, 69, 0.8), 
                                    0 0 60px rgba(40, 167, 69, 0.6), 
                                    0 0 90px rgba(40, 167, 69, 0.4);
                    }
                }
                @keyframes glowYellow {
                    0%, 100% {
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                    0 0 20px rgba(255, 193, 7, 0.6), 
                                    0 0 40px rgba(255, 193, 7, 0.4), 
                                    0 0 60px rgba(255, 193, 7, 0.2);
                    }
                    50% {
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                    0 0 30px rgba(255, 193, 7, 0.8), 
                                    0 0 60px rgba(255, 193, 7, 0.6), 
                                    0 0 90px rgba(255, 193, 7, 0.4);
                    }
                }
                @keyframes glowRed {
                    0%, 100% {
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                    0 0 20px rgba(220, 53, 69, 0.6), 
                                    0 0 40px rgba(220, 53, 69, 0.4), 
                                    0 0 60px rgba(220, 53, 69, 0.2);
                    }
                    50% {
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                    0 0 30px rgba(220, 53, 69, 0.8), 
                                    0 0 60px rgba(220, 53, 69, 0.6), 
                                    0 0 90px rgba(220, 53, 69, 0.4);
                    }
                }
                .glow-green {
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                0 0 20px rgba(40, 167, 69, 0.6), 
                                0 0 40px rgba(40, 167, 69, 0.4), 
                                0 0 60px rgba(40, 167, 69, 0.2);
                    animation: glowGreen 2s ease-in-out infinite;
                }
                .glow-yellow {
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                0 0 20px rgba(255, 193, 7, 0.6), 
                                0 0 40px rgba(255, 193, 7, 0.4), 
                                0 0 60px rgba(255, 193, 7, 0.2);
                    animation: glowYellow 2s ease-in-out infinite;
                }
                .glow-red {
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5),
                                0 0 20px rgba(220, 53, 69, 0.6), 
                                0 0 40px rgba(220, 53, 69, 0.4), 
                                0 0 60px rgba(220, 53, 69, 0.2);
                    animation: glowRed 2s ease-in-out infinite;
                }
            `}</style>
      <div
        className={`position-fixed p-4 bg-dark text-white rounded-3 d-flex flex-column gap-3 border-top border-4 ${borderColor} glow-${glowColor}`}
        style={{
          top: '80px',
          right: '20px',
          maxWidth: '350px',
          zIndex: 1050
        }}
      >

        {/* Header/Info Row */}
        <div className={`d-flex align-items-center gap-3 ${textColor}`}>
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div className="flex-grow-1 overflow-hidden">
            <p className="mb-0 fw-bold text-truncate small">FULFILLMENT REQUIRED ({isMandatory ? 'MANDATORY' : 'PENDING'})</p>
            <p className="mb-0 text-secondary" style={{ fontSize: '10px' }}>
              {isSkipAllowed ? `(${skipsLeft} skips left)` : isMandatory ? 'FINAL WARNING: ACTION REQUIRED' : 'MANDATORY ACTION REQUIRED'}
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="d-flex justify-content-between gap-3">

          {/* Reject Button */}
          <button
            onClick={onReject}
            className="btn btn-danger btn-sm flex-grow-1 d-flex align-items-center justify-content-center"
          >
            <X size={16} className="me-1" /> Reject
          </button>

          {/* Skip Button (Conditional) */}
          {isSkipAllowed && (
            <button
              onClick={onSkip}
              className="btn btn-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center"
            >
              <SkipForward size={16} className="me-1" /> Skip
            </button>
          )}

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className={`btn btn-success btn-sm flex-grow-1 d-flex align-items-center justify-content-center ${!isSkipAllowed ? 'w-100' : ''}`}
          >
            <Check size={16} className="me-1" /> Accept Transfer
          </button>
        </div>
      </div>
    </>
  );
};

export default MiniFulfillmentNotification;
