import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
        // Save token and user info in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("isAuthenticated", "true");

        // Redirect to the homepage
        navigate("/home");
        window.location.reload(); 
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="form-label">Username:</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={credentials.username}
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
            placeholder="Enter your password"
            value={credentials.password}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="login-button">Log In</button>
      </form>
      <p className="signup-link">
        Don't have an account? <Link to="/sign-up">Sign up here</Link>
      </p>
      <p className="forgot-password-link">
        Forgot your password? <Link to="/forgot-password">Click here</Link>
      </p>
    </div>
  );
};

export default Login;
