import React from 'react';

/**
 * Custom Modal/Message Box (Replaces alert() and confirm())
 */
const MessageBox = ({ message, onClose }) => (
  <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
    <div className="modal-dialog modal-sm modal-dialog-centered">
      <div className="modal-content border-top border-4 border-primary rounded-3 shadow-lg">
        <div className="modal-body p-4">
          <p className="fw-semibold mb-3">{message}</p>
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
