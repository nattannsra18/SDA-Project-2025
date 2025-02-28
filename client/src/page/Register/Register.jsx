import { useState } from "react";
import { GiLockedChest } from "react-icons/gi";
import { FaEye, FaEyeSlash, FaEnvelope, FaUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:1337/api/auth/local/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data && response.data.jwt) {
        // Store JWT token in sessionStorage
        sessionStorage.setItem("token", response.data.jwt);
        // Show success modal
        setShowModal(true);
      }
    } catch (error) {
      setError(
        error.response?.data?.error?.message || 
        "Registration failed. Please try again."
      );
      console.error("Registration error:", error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/store");
  };

  return (
    <div className="register-container">
      <div className="wrapper2">
        <p>EXTREME CHEST</p>
      </div>
      
      <div className="register-box">
        <div className="chest-icon">
          <GiLockedChest size={64} color="#fff" />
        </div>
        
        <h2 className="create-account-text">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <div className="input-icon">
                <FaEnvelope />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-container password-container">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-container password-container">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="continue-button">
            Continue
          </button>
        </form>
      </div>
      
      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Registration Successful</h2>
            <p>Your account has been created successfully!</p>
            <button onClick={handleModalClose} className="modal-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;