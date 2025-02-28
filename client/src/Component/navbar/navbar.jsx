import { useState, useEffect } from "react";
import "./navbar.css";
import { GiLockedChest } from "react-icons/gi";
import { FaSearch, FaUserCircle, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to check if user is logged in and get user data
  const handleUserIconClick = async () => {
    const token = sessionStorage.getItem("token");
    
    if (!token) {
      // If no token, redirect to login page
      navigate("/login");
      return;
    }
    
    // If we already have user data, just show the modal
    if (userData) {
      setShowModal(true);
      return;
    }
    
    // If token exists but we don't have user data yet, fetch it
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:1337/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If error fetching user data, token might be invalid
      sessionStorage.removeItem("jwt");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("jwt");
    setUserData(null);
    setShowModal(false);
    // Stay on current page as requested
  };

  // Format registration date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="navbar">
      <div className="wrapper1">
        <div>
          <GiLockedChest className="icon" />
        </div>
        <div className="extreme">Extreme Chest</div>
      </div>
      <div className="wrapper2">
        <div className="search-box">
          <input type="text" placeholder="Search Game" className="search-input" />
          <FaSearch className="search-icon" />
        </div>
      </div>
      <div className="wrapper3">
        <div className={`tab ${location.pathname === "/store" ? "active" : ""}`}>
          <Link className="link" to="/store">Store</Link>
        </div>
        <div className={`tab ${location.pathname === "/libery" ? "active" : ""}`}>
          <Link className="link" to="/libery">Libery</Link>
        </div>
        <div className={`tab ${location.pathname === "/cart" ? "active" : ""}`}>
          <Link className="link" to="/cart">Cart</Link>
        </div>
        <div className={`tab ${location.pathname === "/wish_list" ? "active" : ""}`}>
          <Link className="link" to="/wish_list">Wishlist</Link>
        </div>
        <div className={`tab ${location.pathname === "/about" ? "active" : ""}`}>
          <Link className="link" to="/about">About</Link>
        </div>
        <div className="wrapper4">
          <div 
            className="user_icon" 
            onClick={handleUserIconClick} 
            style={{ cursor: "pointer" }}
          >
            <FaUserCircle />
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showModal && userData && (
        <div className="user-modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <h2>User Profile</h2>
              <button 
                className="close-button" 
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="user-modal-body">
              <div className="user-info-item">
                <strong>Username:</strong>
                <span>{userData.username}</span>
              </div>
              <div className="user-info-item">
                <strong>Email:</strong>
                <span>{userData.email}</span>
              </div>
              <div className="user-info-item">
                <strong>Registration Date:</strong>
                <span>{formatDate(userData.createdAt)}</span>
              </div>
            </div>
            <div className="user-modal-footer">
              <button 
                className="logout-button" 
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Navbar;