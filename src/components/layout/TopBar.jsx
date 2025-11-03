import React from 'react';
import { DollarSign, Truck, ClipboardList, Home, FileText, Package } from 'lucide-react';

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
            <div className="d-flex align-items-center px-4 h-100"> 
                <img 
                    src="https://www.medplusindia.com/images/medplus_logo.png" 
                    alt="MedPlus Pharmacy Logo" 
                    style={{ height: '26px' }} 
                />
            </div>

            {/* Main Navigation */}
            <nav className="d-flex flex-grow-1 h-100 align-items-center gap-1 px-3">
                {[
                    { name: 'Sales', icon: <DollarSign size={18} /> },
                    { name: 'Transfers', icon: <Truck size={18} /> },
                    { name: 'Indents', icon: <ClipboardList size={18} /> },
                    { name: 'Customers', icon: <Home size={18} /> },
                    { name: 'Audit', icon: <FileText size={18} /> },
                    { name: 'Reports', icon: <Package size={18} /> }
                ].map(item => {
                    const isActive = 
                        (view === 'ORDER' && item.name === 'Sales') || 
                        (view === 'TRANSFER_SCREEN' && item.name === 'Transfers') ||
                        (view === 'HOME' && item.name === 'Transfers');
                    
                    return (
                        <a
                            key={item.name}
                            href="#"
                            className={`d-flex align-items-center gap-2 px-4 text-decoration-none fw-medium
                                ${isActive ? 'bg-white text-danger' : 'text-white'}`}
                            style={{ 
                                fontSize: '0.9rem',
                                transition: 'background-color 0.2s ease',
                                whiteSpace: 'nowrap',
                                backgroundColor: isActive ? 'white' : 'transparent',
                                height: '100%',
                                borderRadius: '4px'
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                if (item.name === 'Sales') setView('ORDER');
                                else if (item.name === 'Transfers') setView('TRANSFER_SCREEN');
                                else setView('HOME');
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            {/* Right Section: Time */}
            <div className="d-flex align-items-center gap-3 px-4 h-100">
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
