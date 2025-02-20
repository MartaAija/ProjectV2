import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState(null);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      
      if ((name === 'newPassword' && confirmPasswordTouched) || name === 'confirmNewPassword') {
        setPasswordMatchError(newFormData.newPassword !== newFormData.confirmNewPassword);
      }
      
      return newFormData;
    });

    if (name === 'confirmNewPassword' && !confirmPasswordTouched) {
      setConfirmPasswordTouched(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password changed successfully!");
        navigate("/login");
      } else {
        setError(data.message || "Password change failed!");
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  return (
    <div className="login-container">
      <h2>Forgot Password</h2>
      {error && <p className="error-message">{error}</p>}
      {confirmPasswordTouched && passwordMatchError && (
        <p className="error-message">Passwords do not match</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">New Password:</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Confirm New Password:</label>
          <input
            type="password"
            name="confirmNewPassword"
            placeholder="Confirm new password"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="login-button">Change Password</button>
      </form>
      <p className="signup-link">
        Remember your password? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default ForgotPassword; 