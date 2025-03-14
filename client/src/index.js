import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const updateFavicon = () => {
  const link = document.querySelector("link[rel~='icon']");
  if (!link) {
    const newLink = document.createElement("link");
    newLink.rel = "icon";
    newLink.href = "/favicon.ico"; // Ensure this path is correct
    document.head.appendChild(newLink);
  } else {
    link.href = "/favicon.ico"; // Force browser to reload favicon
  }
};

updateFavicon(); // Call this when React app initializes

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
