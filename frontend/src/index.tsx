import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import the Home page component from internal dependency
import Home from "./pages/Home";

// Locate the root element in the HTML document
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element with id 'root' not found");
}

// Create a React root and render the application with proper routing
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);