import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AndroidCompact } from "./screens/AndroidCompact";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { AddCar } from "./screens/AddCar/AddCar";
import { EmailConfirmation } from "./screens/EmailConfirmation/EmailConfirmation"; // Import the new component
import { AuthGuard } from "./components/AuthGuard"; 

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AndroidCompact />} />
        {/* Add this route to handle auth callbacks */}
        <Route path="/auth/callback" element={<EmailConfirmation />} />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        <Route path="/add-car" element={
          <AuthGuard>
            <AddCar />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  </StrictMode>
);