import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AndroidCompact } from "./screens/AndroidCompact";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { AddCar } from "./screens/AddCar/AddCar";
import { EmailConfirmation } from "./screens/EmailConfirmation/EmailConfirmation";
import ServicesList from "./screens/Services/ServicesList";
import { AuthGuard } from "./components/AuthGuard"; 
import { LoginGuard } from "./components/LoginGuard"; 
import PlanSelection from "./screens/PlanSelection/PlanSelection"; // Remove curly braces
import { Profile } from "./screens/Profile/Profile";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Apply LoginGuard to the root route */}
        <Route path="/" element={
          <LoginGuard>
            <AndroidCompact />
          </LoginGuard>
        } />
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
        <Route path="/services" element={<ServicesList />} />
        <Route path="/plan-selection" element={<PlanSelection />} />
        <Route path="/profile" element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        } />
      </Routes>
    </Router>
  </StrictMode>
);