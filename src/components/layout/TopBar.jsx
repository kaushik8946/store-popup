import React from 'react';
import { DollarSign, Truck, ClipboardList, Home, FileText, Package } from 'lucide-react';
import medplusLogo from '../../assets/medplus_logo.png';

const TopBar = ({ view, setView }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="d-flex align-items-center bg-danger shadow-sm" style={{ height: '56px', minHeight: '56px', maxHeight: '56px' }}>
      {/* Left Section: Logo */}
      <div className="d-flex align-items-center h-100">
        <img
          src={medplusLogo}
          alt="MedPlus Pharmacy Logo"
          style={{ height: '45px', marginLeft: '16px' }}
        />
      </div>

      {/* Center Title */}
      <div className="flex-grow-1 text-center">
        <span className="fw-bold text-white" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>
          Back Order Store Popup Demonstration
        </span>
      </div>

      {/* Right Section: Time */}
      <div className="d-flex align-items-center gap-3 h-100 pe-4">
        <div className="d-flex align-items-center gap-2 text-white fw-medium" style={{ fontSize: '0.9rem' }}>
          <span>{currentDate}</span>
          <span>•</span>
          <span>{currentTime}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
