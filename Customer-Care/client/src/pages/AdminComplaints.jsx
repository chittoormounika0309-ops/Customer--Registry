import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function AdminComplaints() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin' && user.role !== 'agent') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const compRes = await axios.get('/complaints');
        setComplaints(compRes.data);
        
        const agentRes = await axios.get('/users/agents');
        setAgents(agentRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`/complaints/${id}`, { status: newStatus });
      setComplaints(prev => prev.map(c => c._id === id ? res.data : c));
      setAlert({ type: 'success', message: `Complaint status updated to "${newStatus}"` });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update complaint status.' });
    }
  };

  const handleAssignAgent = async (id, agentId) => {
    try {
      const res = await axios.put(`/complaints/${id}`, { assignedTo: agentId || null });
      setComplaints(prev => prev.map(c => c._id === id ? res.data : c));
      setAlert({ type: 'success', message: 'Agent assignment updated successfully.' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to assign agent.' });
    }
  };

  const handleOpenChat = (creator) => {
    if (!creator) return;
    // Go to chat page. In the chat page, this customer will be preselected
    navigate('/chat');
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard-container">
        <div className="admin-header-flex">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Complaints Dashboard</h1>
          <span style={{ fontSize: '0.85rem', color: '#6c757d', backgroundColor: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
            Logged in as: <strong>{user?.firstName} ({user?.role})</strong>
          </span>
        </div>

        {alert && (
          <div className={`custom-alert ${alert.type}`}>
            <span>{alert.message}</span>
            <button type="button" className="alert-close" onClick={() => setAlert(null)}>×</button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>Loading complaints list...</p>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <p style={{ color: '#6c757d' }}>No customer complaints found in the registry.</p>
          </div>
        ) : (
          <div className="complaints-table-container">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const creator = c.createdBy;
                  const currentAssigneeId = c.assignedTo?._id || c.assignedTo || '';
                  
                  return (
                    <tr key={c._id}>
                      <td>{formatDate(c.date)}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          #{c._id.substring(c._id.length - 6)}
                        </span>
                      </td>
                      <td>{c.name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span>{c.phone}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>{c.email}</span>
                        </div>
                      </td>
                      <td>{c.details}</td>
                      <td>
                        <span className={`status-badge ${c.status === 'in progress' ? 'progress' : c.status}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="action-select"
                          value={currentAssigneeId}
                          onChange={(e) => handleAssignAgent(c._id, e.target.value)}
                        >
                          <option value="">-- Unassigned --</option>
                          {agents.map(a => (
                            <option key={a._id || a.id} value={a._id || a.id}>
                              {a.firstName} {a.lastName} ({a.role})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select 
                            className="action-select"
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          
                          <button 
                            className="action-btn-small"
                            onClick={() => handleOpenChat(creator)}
                          >
                            Chat
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
