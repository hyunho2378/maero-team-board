import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { applyTokens } from './tokens.js';
import { boot } from './lib/collection.js';
import './styles.css';

const mq = window.matchMedia('(prefers-color-scheme: dark)');
applyTokens(mq.matches ? 'dark' : 'light');
mq.addEventListener?.('change', (e) => applyTokens(e.matches ? 'dark' : 'light'));
boot();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter><App /></HashRouter>
  </React.StrictMode>,
);
