import React, { useState } from 'react';
import { adminLogin, adminSignup } from '../../services/api'; // Add adminSignup API
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'; // Import your CSS file

const LoginSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
  const [showPassword, setShowPassword] = useState(false); // Password visibility
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (isSignup) {
      const passwordRegex = /^(?=.*[A-Z]).{8,20}$/;
      if (!passwordRegex.test(password)) {
        toast.error('Password must be between 8 and 20 characters and contain at least one uppercase letter.');
        return;
      }
    }

    try {
      if (isSignup) {
        const response = await adminSignup({ email, password });
        if (response.success) {
          toast.success('Signup successful! Wait for the admin to approve your request.');
          setIsSignup(false);
        } else {
          toast.error(response.errors || 'Signup failed.');
        }
      } else {
        if (!isOtpSent) {
          // Send OTP logic
          const otpResponse = await sendOtp({ email });
          if (otpResponse.success) {
            setIsOtpSent(true);
            toast.success('OTP sent to your email!');
          } else {
            toast.error(otpResponse.errors || 'Failed to send OTP.');
          }
        } else if (!isOtpVerified) {
          // Verify OTP logic
          const verifyResponse = await verifyOtp({ email, otp });
          if (verifyResponse.success) {
            setIsOtpVerified(true);
            toast.success('OTP verified! You can now log in.');
          } else {
            toast.error(verifyResponse.errors || 'Invalid OTP. Please try again.');
          }
        } else {
          // Login logic
          const response = await adminLogin({ email, password });
          if (response.success) {
            localStorage.setItem('admin_token', response.token);
            toast.success('Login successful! Redirecting...');
            navigate('/admin/dashboard');
            window.location.reload();
          } else {
            toast.error(response.errors || 'Login failed.');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.errors || 'An error occurred.');
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isSignup ? 'Admin Signup' : 'Admin Login'}</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label>Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={togglePasswordVisibility}
              style={{
                cursor: 'pointer',
                position: 'absolute',
                right: '10px',
                top: '60%',
                transform: 'translateY(-50%)',
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {isOtpSent && !isOtpVerified && (
            <div>
              <label>OTP:</label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                required
              />
            </div>
          )}
          <button type="submit">
            {isSignup ? 'Sign up' : isOtpSent ? (isOtpVerified ? 'Log in' : 'Verify OTP') : 'Send OTP'}
          </button>
        </form>
        <p>
          {isSignup ? (
            <>
              Already have an account?{' '}
              <span
                className="link"
                onClick={() => setIsSignup(false)}
              >
                Log in
              </span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span
                className="link"
                onClick={() => setIsSignup(true)}
              >
                Sign up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
