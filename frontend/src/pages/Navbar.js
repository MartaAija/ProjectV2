import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css"; // Import the CSS file

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in by looking for a token in localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const toggleNavbar = () => {
    setIsVisible(!isVisible);
  };

  const handleLogout = () => {
    // Remove the token and other user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    navigate("/logout"); // Redirect to the logout page
  };
  

  return (
    <>
      {/* Navbar */}
      <div className={`navbar ${!isVisible ? "shrunk" : ""}`}>     
        {/* Close Button */}
        {isVisible && (
          <button onClick={toggleNavbar} aria-label="Close Menu">
            ✖
          </button>
        )}

        <h2>Menu</h2>
        <nav>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/history">History</Link>
                </li>
              </>
            )}
            <li>
              <Link to="/compliance">Compliance</Link>
            </li>
            <li>
              <Link to="/education">Learn About Attacks</Link>
            </li>
            {/* Conditionally render login/signup or logout */}
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/sign-up">Sign Up</Link>
                </li>
              </>
            ) : (
              <>
                {/* Settings link before Log Out */}
                <li>
                  <Link to="/settings" style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    ⚙️ Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    Log Out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Conditionally render Copyright Text */}
        {isVisible && (
          <div className="navbar-footer">
            <p>&copy; 2025 CyberSageX</p>
          </div>
        )}
      </div>

      {/* Hamburger Button */}
      {!isVisible && (
        <button onClick={toggleNavbar} aria-label="Open Menu" className="navbar-button">
          ☰
        </button>
      )}
    </>
  );
};

export default Navbar;
