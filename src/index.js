import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 🟢 1. Import Polaris Styles (Required for the UI to look right)
import '@shopify/polaris/build/esm/styles.css';

// 🟢 2. Import the Provider and Translations
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 🟢 3. Wrap your entire App in AppProvider */}
    <AppProvider i18n={enTranslations}>
      <App />
    </AppProvider>
  </React.StrictMode>
);