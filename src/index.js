import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
document.title = "Bulk App";
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
