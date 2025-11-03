// --- MOCK DATA AND CONFIGURATION ---

// Simulated data for the Draft Transfer Order Request
export const MOCK_TO_REQUEST = {
    id: 'TO_DRAFT_12345',
    storeName: 'Central Warehouse Store 001',
    productName: 'Enhance Joint Support (60ct)',
    requiredQuantity: 15,
    availableQuantity: 10, // Stock On Hand (SOH) at this location
    timesDisplayed: 0, 
};

// Simulated configuration data (from 'Warehouse ETA Configuration' Master)
export const MOCK_CONFIG = {
    popupIntervalTime: 2, // Used in simulation for re-displaying notification
    noOfTimes: 3, // Max 3 times displayed (Max skips = 2)
    isSkippable: 'Y', // 'Y' or 'N'
};

// Mock product data for the POS Order Screen (Extended)
export const MOCK_ORDER_PRODUCTS = [
    { sNo: 1, productName: 'DOLO 650MG TAB', manufacturer: 'MICRO LABS LIMITED', batch: 'DOB54044', pack: '40', dt: '09-27', mrp: 2.06, qty: 15, userQty: 15, amount: 30.90, barcode: '1124554000123' },
    { sNo: 2, productName: 'ECOSPRIN 75MG TAB', manufacturer: 'USV PVT LTD', batch: '25441154', pack: '10', dt: '03-27', mrp: 0.40, qty: 14, userQty: 14, amount: 5.60, barcode: '1122956000456' },
    { sNo: 3, productName: 'PAN 40MG TAB', manufacturer: 'ALKEM LABORATORIES', batch: '25441154', pack: '100', dt: '09-27', mrp: 11.22, qty: 15, userQty: 15, amount: 168.30, barcode: '1122956000789' },
    { sNo: 4, productName: 'OKACET TAB', manufacturer: 'CIPLA', batch: '5850323', pack: '20', dt: '03-28', mrp: 2.14, qty: 10, userQty: 10, amount: 21.40, barcode: '1124845001234' },
    { sNo: 5, productName: 'PARACIP 500MG', manufacturer: 'CIPLA', batch: '7789012', pack: '15', dt: '11-26', mrp: 1.50, qty: 8, userQty: 8, amount: 12.00, barcode: '1124845005678' },
    { sNo: 6, productName: 'AMOXICILLIN 250MG', manufacturer: 'GLAXO', batch: 'A1B2C3D4', pack: '10', dt: '12-26', mrp: 5.00, qty: 20, userQty: 20, amount: 100.00, barcode: '1124845009012' },
];

export const MOCK_SALE_ORDER_PRODUCTS = [
    { sNo: 1, productName: 'AB-FLO CAP', manufacturer: 'LUPIN LTD', orderQty: 1 },
    { sNo: 2, productName: 'AB FLO N TAB', manufacturer: 'LUPIN LTD', orderQty: 2 },
    { sNo: 3, productName: 'CALCIUM D3', manufacturer: 'PIRAMAL', orderQty: 5 },
    { sNo: 4, productName: 'VITAMIN C SYRUP', manufacturer: 'SUN PHARMA', orderQty: 1 },
];

// Mock transfer order data
export const MOCK_TRANSFER_ORDERS = [];
