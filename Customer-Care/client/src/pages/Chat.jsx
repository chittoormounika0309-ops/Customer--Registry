import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send } from 'lucide-react';
import axios from 'axios';

export default function Chat() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // If agent/admin, they chat with a selected customer. If customer, they chat with an agent (assigned receiver)
  const [selectedCustomer, setSelectedCustomer] = useState(null); 
  const [customersList, setCustomersList] = useState([]);
  
  // Stats for the active customer in the sidebar card
  const [stats, setStats] = useState({ total: 0, solved: 0, pending: 0 });
  
  const chatEndRef = useRef(null);

  // 1. Initial Auth Check and Data Fetching
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (user?.role === 'admin' || user?.role === 'agent') {
      // Agents list all customers who raised complaints
      const fetchCustomers = async () => {
        try {
          const res = await axios.get('/users/customers');
          setCustomersList(res.data);
          if (res.data.length > 0 && !selectedCustomer) {
            setSelectedCustomer(res.data[0]); // Select first customer by default
          }
        } catch (err) {
          console.error('Error fetching customers:', err);
        }
      };
      fetchCustomers();
    } else if (user?.role === 'user') {
      // Customer is chatting with agents, so target customer is themselves
      setSelectedCustomer(user);
    }
  }, [token, user, navigate]);

  // 2. Fetch Stats for the selected user (Rohan/Customer)
  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchUserStats = async () => {
      try {
        // Fetch complaints associated with the target customer
        const res = await axios.get('/complaints');
        const list = res.data;
        
        // Filter by customer id (if agent, complaints are already populated with creator info)
        const targetId = selectedCustomer.id || selectedCustomer._id;
        const userComplaints = list.filter(c => {
          const creatorId = c.createdBy?._id || c.createdBy;
          return creatorId === targetId;
        });

        const total = userComplaints.length;
        const solved = userComplaints.filter(c => c.status === 'resolved').length;
        const pending = userComplaints.filter(c => c.status === 'pending' || c.status === 'in progress').length;

        setStats({ total, solved, pending });
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
    };

    fetchUserStats();
    // Refresh stats every 5s
    const interval = setInterval(fetchUserStats, 5000);
    return () => clearInterval(interval);
  }, [selectedCustomer]);

  // 3. Fetch and Poll Messages
  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchMessages = async () => {
      try {
        const targetId = selectedCustomer.id || selectedCustomer._id;
        // Fetch messages with target customer
        const res = await axios.get(`/messages?targetUserId=${targetId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    // Poll every 3 seconds for mock real-time chat experience
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedCustomer]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedCustomer) return;

    try {
      const targetId = selectedCustomer.id || selectedCustomer._id;
      let receiverId = targetId;

      // If sender is customer, receiver is any agent or admin
      if (user?.role === 'user') {
        // If customer, we can just send to a default agent or admin user, or we can look up an agent
        // For simplicity, we can fetch the agent list and set the first agent as receiver
        try {
          const agentsRes = await axios.get('/users/agents');
          if (agentsRes.data.length > 0) {
            receiverId = agentsRes.data[0]._id || agentsRes.data[0].id;
          } else {
            receiverId = 'admin_fallback_id'; // Fallback
          }
        } catch (e) {
          receiverId = 'admin_fallback_id';
        }
      }

      const res = await axios.post('/messages', {
        receiver: receiverId,
        content: inputText.trim()
      });

      // Optimistically append message
      setMessages(prev => [...prev, res.data]);
      setInputText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Helper to format date matching: 25 Mar 2025, 11:18 am
  const formatMsgTime = (timestamp) => {
    const date = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes} ${ampm}`;
  };

  // Name to show on details card
  const chatPartnerName = selectedCustomer 
    ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` 
    : 'Customer';

  return (
    <div>
      <Navbar />
      <div className="chat-page-container">
        
        {/* Left Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-title">Chat Info</div>
          
          {/* Active User Card Details (matching Screenshot 6 layout) */}
          <div className="chat-sidebar-card">
            <h3 className="chat-sidebar-name">{chatPartnerName}</h3>
            <span className="chat-sidebar-subtitle">Complaint Details</span>
            
            <div className="chat-sidebar-stats">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-val">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">solved</span>
                <span className="stat-val">{stats.solved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-val">{stats.pending}</span>
              </div>
            </div>
          </div>

          {/* If agent/admin, show other customer chat listings */}
          {(user?.role === 'admin' || user?.role === 'agent') && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
              <div className="chat-sidebar-title">Select Customer</div>
              <div className="agent-user-list">
                {customersList.map(c => (
                  <div 
                    key={c._id || c.id} 
                    className={`agent-user-item ${selectedCustomer && (selectedCustomer._id === c._id || selectedCustomer.id === c.id) ? 'active' : ''}`}
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <span className="agent-user-item-name">{c.firstName} {c.lastName}</span>
                    <span className="agent-user-item-msg">@{c.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Chat Main */}
        <div className="chat-main">
          <div className="chat-header">
            <span>{chatPartnerName}</span>
          </div>

          <div className="chat-body">
            {messages.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '0.75rem 1.5rem', borderRadius: '20px', fontSize: '0.85rem', color: '#6c757d' }}>
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map(m => {
                // If sender is me, align right. If sender is not me, align left.
                const isSentByMe = (m.sender?._id || m.sender) === (user?.id || user?._id);
                return (
                  <div key={m._id} className={`chat-bubble-container ${isSentByMe ? 'sent' : 'received'}`}>
                    <div className="chat-bubble">
                      {m.content}
                    </div>
                    <span className="chat-time">{formatMsgTime(m.timestamp)}</span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input bar */}
          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Type a message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="chat-send-btn">
              <Send size={18} fill="currentColor" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
