import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

// This is the entry point of the React application.
// It initializes the root of the DOM and renders the main App component.

// Find the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');

// Use the modern createRoot API to render the app.
// This provides better performance and new features compared to the legacy ReactDOM.render().
const root = ReactDOM.createRoot(rootElement);

// Render the App component inside a React.StrictMode wrapper.
// StrictMode is a tool for highlighting potential problems in an application.
// It does not render any visible UI but activates extra checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
