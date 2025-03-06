import { useState } from "react";
import { GiLockedChest } from "react-icons/gi";
import { FaEye, FaEyeSlash, FaEnvelope, FaUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Register.css";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(true);
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
    setSubmitEnabled(false);
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch', 
        text: 'Passwords do not match. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
          confirmButton: 'custom-swal-confirm-button'
        },
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#D70000'
      });
      setSubmitEnabled(true);
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Logging registration details
      console.log('--- Registration Response Details ---');
      console.log('Full Response:', response.data);
      console.log('User ID:', response.data.user.id);
      console.log('Username:', response.data.user.username);
      console.log('User Email:', response.data.user.email);
      
      // Show success message
      await Swal.fire({
        title: 'Registration Successful',
        text: 'Welcome to Extreme Chest!',
        icon: 'success',
        confirmButtonText: 'Continue',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
          confirmButton: 'custom-swal-confirm-button'
        },
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#3D9BDC'
      });

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      
      // Show error message
      Swal.fire({
        title: 'Registration Failed', 
        text: error.response?.data?.error?.message || 'Unable to create account',
        icon: 'error',
        confirmButtonText: 'Try Again',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          content: 'custom-swal-content',
          confirmButton: 'custom-swal-confirm-button'
        },
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#D70000'
      });

      setSubmitEnabled(true);
    }
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
            <label htmlFor="confirmPassword">Confirm Password</label>
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
          
          <div className="signup-link">
            <a href="/login">Already have an account? Sign in</a>
          </div>
          
          <button 
            type="submit" 
            className="continue-button"
            disabled={!submitEnabled}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;