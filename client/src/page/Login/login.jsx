import { useState } from "react";
import { GiLockedChest } from "react-icons/gi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(true);
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
    setSubmitEnabled(false);
  
    try {
      const response = await axios.post("http://localhost:1337/api/auth/local", {
        identifier: credentials.identifier,
        password: credentials.password
      });

      // Logging detailed user information
      console.log('--- Login Response Details ---');
      console.log('Full Response:', response.data);
      console.log('JWT Token:', response.data.jwt);
      console.log('User ID:', response.data.user.id);
      console.log('Username:', response.data.user.username);
      console.log('User Email:', response.data.user.email);
      
      // Store user information in session storage
      sessionStorage.setItem("token", response.data.jwt);
      sessionStorage.setItem("userId", response.data.user.id);
      sessionStorage.setItem("username", response.data.user.username);
      sessionStorage.setItem("email", response.data.user.email);
      sessionStorage.setItem("userDocumentId", response.data.user.documentId);
      
      // Log stored session storage items
      console.log('--- Stored Session Data ---');
      console.log('Stored Token:', sessionStorage.getItem("token"));
      console.log('Stored User ID:', sessionStorage.getItem("userId"));
      console.log('Stored Username:', sessionStorage.getItem("username"));
      console.log('Stored documentId:', sessionStorage.getItem("userDocumentId"));
      // Set default authorization header
      axios.defaults.headers.common = {
        Authorization: `Bearer ${response.data.jwt}`,
      };
      
      // Customize SweetAlert2 to match the website's UI
      await Swal.fire({
        title: 'Login Successful',
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
  
      // Navigate to home page
      navigate("/home");
    } catch (error) {
      console.error("Login Error:", error);
      
      // Customized error SweetAlert
      Swal.fire({
        title: 'Login Failed', 
        text: 'Please check your username or password',
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
    <div className="login-container">
      <div className="wrapper2">
        <p>EXTREME CHEST</p>
      </div>
      
      <div className="login-box">
        <div className="chest-icon">
          <GiLockedChest size={64} color="#fff" />
        </div>
        
        <h2 className="sign-in-text">Sign In</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="identifier">Email or Username</label>
            <div className="input-container">
              <input
                type="text"
                id="identifier"
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
            <a href="/regis">Click here to sign up</a>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={!submitEnabled}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;