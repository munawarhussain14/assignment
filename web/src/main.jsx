// Import required dependencies from React and other modules
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

// Create root element and render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  // Enable strict mode for additional checks and warnings
  <React.StrictMode>
    {/* Wrap app in AuthProvider for authentication context */}
    <AuthProvider>
      {/* Render main App component */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
