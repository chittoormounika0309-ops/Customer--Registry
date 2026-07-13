import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Home() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRaiseComplaint = () => {
    if (token) {
      if (user?.role === 'user') {
        navigate('/raise-complaint');
      } else {
        navigate('/admin/complaints');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Customer Care Registry</h1>
          <p className="hero-text">
            Click the "Raise Complaint" button to resolve your doubts or seek assistance from our support team.
          </p>
          <button onClick={handleRaiseComplaint} className="hero-btn">
            Raise Complaint
          </button>
        </div>
        <div className="hero-image-container">
          <img 
            src="/assets/customer_care_agent.png" 
            alt="Customer Care Illustration" 
          />
        </div>
      </div>
    </div>
  );
}
