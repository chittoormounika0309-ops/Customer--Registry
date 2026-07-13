import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function WriteComplaint() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [alert, setAlert] = useState(null);

  // Initialize fields with current logged-in user if available
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(`${user.firstName} ${user.lastName}`);
      setEmail(user.email);
    }
  }, [user, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email || !details) {
      setAlert({ type: 'error', message: 'All fields are required.' });
      return;
    }

    try {
      await axios.post('/complaints', {
        name,
        phone,
        email,
        details
      });
      setAlert({ type: 'success', message: 'Complaint submitted successfully!' });
      // Clear details field
      setDetails('');
      // Redirect after 1.5s
      setTimeout(() => {
        navigate('/my-complaints');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error submitting complaint. Please try again.';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="complaint-container">
        <div className="complaint-image-container">
          <img 
            src="/assets/complaints_tablet.png" 
            alt="Tablet with Complaints screen" 
          />
        </div>
        <div className="complaint-form-container">
          <h2 className="complaint-form-title">Write Your Complaint</h2>
          
          {alert && (
            <div className={`custom-alert ${alert.type}`}>
              <span>{alert.message}</span>
              <button type="button" className="alert-close" onClick={() => setAlert(null)}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="form-input"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                autoComplete="tel"
                className="form-input"
                placeholder="Enter phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              <label htmlFor="details">Complaint Details</label>
              <textarea
                id="details"
                className="form-input form-textarea"
                placeholder="Describe your complaint here..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="submit-container">
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
