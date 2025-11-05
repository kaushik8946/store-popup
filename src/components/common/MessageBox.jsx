import React from 'react';

/**
 * Custom Modal/Message Box (Replaces alert() and confirm())
 */
const MessageBox = ({ message, onClose }) => (
  <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
  <div className="modal-dialog modal-lg modal-dialog-centered" style={{maxWidth: '400px'}}>
      <div className="modal-content border-top border-4 border-primary rounded-3 shadow-lg">
        <div className="modal-body p-4">
          <div className="mb-3 text-start">{message}</div>
          <button
            onClick={onClose}
            className="btn btn-primary w-100 fw-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default MessageBox;
