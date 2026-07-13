import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function SignUp() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Type: admin, user, agent
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password || !role) {
      setAlert({ type: 'error', message: 'Please enter all fields' });
      return;
    }

    const normalizedRole = role.toLowerCase().trim();
    if (normalizedRole !== 'admin' && normalizedRole !== 'user' && normalizedRole !== 'agent') {
      setAlert({ type: 'error', message: 'Type must be admin, user, or agent' });
      return;
    }

    const res = await register(firstName, lastName, username, email, password, normalizedRole);
    if (res.success) {
      if (normalizedRole === 'admin' || normalizedRole === 'agent') {
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
          <h2 className="auth-title">Sign Up</h2>
          
          {alert && (
            <div className={`custom-alert ${alert.type}`}>
              <span>{alert.message}</span>
              <button type="button" className="alert-close" onClick={() => setAlert(null)}>×</button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              className="form-input"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              className="form-input"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">User Name</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="form-input"
              placeholder="Enter user name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
              autoComplete="new-password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Type (admin, user, agent)</label>
            <input
              id="role"
              name="role"
              type="text"
              autoComplete="off"
              className="form-input"
              placeholder="Enter type (admin, user, agent)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Sign Up
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
