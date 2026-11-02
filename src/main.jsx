import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { applyTokens } from './tokens.js';
import { boot } from './lib/collection.js';
import './styles.css';

// 팀 보드는 검정 배경을 쓰지 않으므로 항상 밝은 화면으로 고정한다.
applyTokens('light');
boot();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter><App /></HashRouter>
  </React.StrictMode>,
);
