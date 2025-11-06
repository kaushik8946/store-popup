# Project Structure

## 📁 Folder Organization

```
src/
├── components/
│   ├── common/
│   │   ├── MessageBox.jsx          # Reusable message/alert modal
│   │   └── TableComponents.jsx     # Reusable table header & data components
│   ├── layout/
│   │   └── TopBar.jsx               # Navigation bar with logo, menu & time
│   ├── notifications/
│   │   └── MiniFulfillmentNotification.jsx  # Popup notification for transfers
│   └── screens/
│       ├── HomeView.jsx             # Dashboard landing page
│       ├── POSOrderScreen.jsx       # POS transaction screen
│       └── TransferScreen.jsx       # Transfer order screen
├── data/
│   └── mockData.js                  # Mock data and configuration
├── App.jsx                          # Main app component & routing logic
├── App.css                          # Custom app styles
├── index.css                        # Global styles
└── main.jsx                         # App entry point
```

## 🧩 Component Descriptions

### Common Components
- **MessageBox** - Modal dialog for displaying messages to users
- **TableHeader** - Consistent table header cell component
- **TableData** - Consistent table data cell component

### Layout Components
- **TopBar** - Red navigation bar with MedPlus branding, menu items, and live date/time

### Notification Components
- **MiniFulfillmentNotification** - Transfer order notification with Skip/Accept actions

### Screen Components
- **HomeView** - Landing dashboard with welcome message
- **POSOrderScreen** - Complete POS interface with picklist, invoice, and sale order tables
- **TransferScreen** - Transfer order management screen

### Data
- **mockData.js** - Centralized mock data for products, orders, and configuration

### Main App
- **App.jsx** - Main application container handling routing, state management, and navigation

## 🎨 Features

✅ Modular component structure  
✅ Separated concerns (UI, Data, Logic)  
✅ Reusable components  
✅ Clean import/export pattern  
✅ Easy to maintain and scale  
✅ Red-themed navigation bar  
✅ Bootstrap 5 integration  
✅ Lucide React icons  

## 🚀 Running the App

```bash
npm install
npm run dev
```
