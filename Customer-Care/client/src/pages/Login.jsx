import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Please enter all fields' });
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      // Check user role from localstorage
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.role === 'admin' || savedUser?.role === 'agent') {
        navigate('/admin/complaints');
      } else {
        navigate('/');
      }
    } else {
      setAlert({ type: 'error', message: res.message });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2 className="auth-title">Login</h2>
          
          {alert && (
            <div className={`custom-alert ${alert.type}`}>
              <span>{alert.message}</span>
              <button type="button" className="alert-close" onClick={() => setAlert(null)}>×</button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="form-input"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Login
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
