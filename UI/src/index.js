import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css'; // Ensure your CSS is imported
import App from './App'; // Your main App component
import reportWebVitals from './reportWebVitals'; // For measuring performance
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap for styling

// Create a root for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application wrapped in Router for routing capabilities
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
