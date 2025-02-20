import React from "react";
import { Link } from "react-router-dom";
import "../App.css"; // Import the CSS file

const Logout = () => {
  return (
    <div className="logout-container"> 
      <h1>You have successfully logged out!</h1>
      <p>See you soon!</p>
      <div className="logout-links">
        <Link to="/login" className="logout-link">Log in again</Link>
        <Link to="/home" className="logout-link">Return to Home</Link>
      </div>
    </div>
  );
};

export default Logout;