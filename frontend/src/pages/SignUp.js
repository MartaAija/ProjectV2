import React, { useState } from "react";
import "../App.css"; // Import the CSS file
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    company: "", // Optional field
  });

  const [error, setError] = useState(null);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      
      // Check password match only if confirm password field has been touched
      if ((name === 'password' && confirmPasswordTouched) || name === 'confirmPassword') {
        setPasswordMatchError(newFormData.password !== newFormData.confirmPassword);
      }
      
      return newFormData;
    });

    // Mark confirm password field as touched when user starts typing
    if (name === 'confirmPassword' && !confirmPasswordTouched) {
      setConfirmPasswordTouched(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check password match before submitting
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/sign-up", {  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        setError(data.message || "Signup failed!");
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };  

  return (
    <div className="login-container"> 
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      {confirmPasswordTouched && passwordMatchError && (
        <p className="error-message">Passwords do not match</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="form-label">First Name:</label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Last Name:</label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Username:</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="input-container">
          <label className="form-label">Company:</label>
          <input
            type="text"
            name="company"
            placeholder="Company (Optional)"
            value={formData.company}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <button type="submit" className="login-button">Sign Up</button>
      </form>
      <p className="signup-link">
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default Signup;
