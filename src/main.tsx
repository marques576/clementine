import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installClementineApi } from './lib/clementineApi';
import './index.css';

// Expose the scripting API (window.clementine) before the UI mounts.
installClementineApi();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
