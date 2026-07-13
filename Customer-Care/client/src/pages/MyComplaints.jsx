import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function MyComplaints() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/complaints');
        setComplaints(res.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token, navigate]);

  // Format date helper matching screen details (e.g. 7/4/2025)
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div>
      <Navbar />
      <div className="my-complaints-container">
        <h1 className="page-title">My Complaints</h1>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>Loading your complaints...</p>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>You have not raised any complaints yet.</p>
            <button onClick={() => navigate('/raise-complaint')} className="submit-btn">Raise a Complaint</button>
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map((c) => (
              <div 
                key={c._id} 
                className={`complaint-card status-${c.status === 'in progress' ? 'progress' : c.status}`}
              >
                <div className="complaint-card-id">ID: {c._id}</div>
                <div className="complaint-card-detail">
                  <strong>Complaint:</strong> {c.details}
                </div>
                <div className="complaint-card-date">
                  <strong>Date:</strong> {formatDate(c.date)}
                </div>
                <div className="complaint-card-status">
                  <strong>Status:</strong>{' '}
                  <span className={`status-${c.status === 'in progress' ? 'progress' : c.status}-text`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
