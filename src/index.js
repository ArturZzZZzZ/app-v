import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import '@fontsource/roboto'; // Defaults to weight 400.
import { AppProvider } from './utils/AppContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AppProvider>
        <App />
    </AppProvider>
);

