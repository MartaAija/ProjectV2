import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import LegalAndEthics from "./pages/Compliance";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Logout from "./pages/Logout";
import AttackEducation from "./pages/Attacks"; 
import Settings from './pages/Settings';
import ForgotPassword from "./pages/ForgotPassword";
import { jwtDecode } from "jwt-decode"; 

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Get current time in seconds
        if (decoded.exp < currentTime) {
          // Token is expired
          localStorage.removeItem("token"); // Remove expired token
          setIsAuthenticated(false); // Set authenticated state to false
        } else {
          setIsAuthenticated(true); // Token is valid
        }
      } catch (error) {
        console.error("Token validation error:", error);
        localStorage.removeItem("token"); // Remove invalid token
        setIsAuthenticated(false); // Set authenticated state to false
      }
    } else {
      // No token found, user is not authenticated
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <div style={{ flex: 1, marginLeft: "220px" }}>
          <Routes>
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/home" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } 
            />
            <Route path="/compliance" element={<LegalAndEthics />} />
            <Route path="/education" element={<AttackEducation />} /> 
            <Route path="/logout" element={<Logout />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/home" />} /> {/* Redirect to home */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
