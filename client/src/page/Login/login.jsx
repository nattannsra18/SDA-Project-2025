import { useState } from "react";
import { GiLockedChest } from "react-icons/gi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1337/api/auth/local", {
        identifier: credentials.identifier,
        password: credentials.password
      });
      
      // If successful, show success modal
      if (response.data) {
        // Store token/user info if needed
        sessionStorage.setItem("token", response.data.jwt);
        setShowModal(true);
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/store");
  };

  return (
    <div className="login-container">
      <div className="wrapper2">
        <p>EXTREME CHEST</p>
      </div>
      
      <div className="login-box">
        <div className="chest-icon">
          <GiLockedChest size={64} color="#fff" />
        </div>
        
        <h2 className="sign-in-text">Sing In</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="identifier"
                value={credentials.identifier}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-container password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
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
          
          <div className="signup-link">
            <a href="#">Click this for sing up</a>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            sing in
          </button>
        </form>
      </div>
      
      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Login Successful</h2>
            <p>You have successfully logged in!</p>
            <button onClick={handleModalClose} className="modal-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;