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
    { sNo: 1, productName: 'DOLO 650MG TAB', manufacturer: 'MICRO LABS LIMITED', batch: 'DOB54044', pack: '10', mrp: 2.06, qty: 30, userQty: 30, amount: 61.80, barcode: '1124554000123', 
      batches: [
        { batchNo: '20240731', pack: '10' },
        { batchNo: '20240801', pack: '15' },
        { batchNo: '20240815', pack: '10' },
        { batchNo: '20240901', pack: '20' }
      ]
    },
    { sNo: 2, productName: 'ECOSPRIN 75MG TAB', manufacturer: 'USV PVT LTD', batch: '25441154', pack: '10', mrp: 0.40, qty: 20, userQty: 20, amount: 8.00, barcode: '1122956000456',
      batches: [
        { batchNo: 'A123B456', pack: '10' },
        { batchNo: 'A124B457', pack: '15' },
        { batchNo: 'A125B458', pack: '10' },
        { batchNo: 'A126B459', pack: '20' }
      ]
    },
    { sNo: 3, productName: 'PAN 40MG TAB', manufacturer: 'ALKEM LABORATORIES', batch: '25441154', pack: '15', mrp: 11.22, qty: 20, userQty: 20, amount: 224.40, barcode: '1122956000789',
      batches: [
        { batchNo: 'P40MG001', pack: '15' },
        { batchNo: 'P40MG002', pack: '10' },
        { batchNo: 'P40MG003', pack: '15' },
        { batchNo: 'P40MG004', pack: '20' }
      ]
    },
    { sNo: 4, productName: 'OKACET TAB', manufacturer: 'CIPLA', batch: '5850323', pack: '10', mrp: 2.14, qty: 10, userQty: 10, amount: 21.40, barcode: '1124845001234',
      batches: [
        { batchNo: 'DL23052405', pack: '10' },
        { batchNo: 'DL23052406', pack: '15' },
        { batchNo: 'DL23052407', pack: '10' },
        { batchNo: 'DL23052408', pack: '20' }
      ]
    },
    { sNo: 5, productName: 'PARACIP 500MG', manufacturer: 'CIPLA', batch: '7789012', pack: '10', mrp: 1.50, qty: 20, userQty: 20, amount: 30.00, barcode: '1124845005678',
      batches: [
        { batchNo: '24073100', pack: '10' },
        { batchNo: '24080101', pack: '15' },
        { batchNo: '24081502', pack: '10' },
        { batchNo: '24090103', pack: '20' }
      ]
    },
    { sNo: 6, productName: 'AMOXICILLIN 250MG', manufacturer: 'GLAXO', batch: 'A1B2C3D4', pack: '10', mrp: 5.00, qty: 21, userQty: 21, amount: 105.00, barcode: '1124845009012',
      batches: [
        { batchNo: 'ABC10001', pack: '10' },
        { batchNo: 'ABC10002', pack: '15' },
        { batchNo: 'ABC10003', pack: '10' },
        { batchNo: 'ABC10004', pack: '20' }
      ]
    },
];

export const MOCK_SALE_ORDER_PRODUCTS = [
    { sNo: 1, productName: 'AB-FLO CAP', manufacturer: 'LUPIN LTD', orderQty: 1 },
    { sNo: 2, productName: 'AB FLO N TAB', manufacturer: 'LUPIN LTD', orderQty: 2 },
    { sNo: 3, productName: 'CALCIUM D3', manufacturer: 'PIRAMAL', orderQty: 5 },
    { sNo: 4, productName: 'VITAMIN C SYRUP', manufacturer: 'SUN PHARMA', orderQty: 1 },
];

// Mock transfer order data
export const MOCK_TRANSFER_ORDERS = [];
