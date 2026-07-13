import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, ChevronDown } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const currentPath = location.pathname;

  // Poll for complaints updates or new messages to trigger notifications
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        // Fetch complaints to see if status changed
        const compRes = await axios.get('/complaints');
        const list = compRes.data;
        
        const newNotifications = [];
        list.forEach(c => {
          if (c.status === 'resolved') {
            newNotifications.push({
              id: `notif-resolved-${c._id}`,
              text: `Your complaint #${c._id.substring(c._id.length - 6)} is now resolved!`,
              time: 'Just now'
            });
          } else if (c.status === 'in progress') {
            newNotifications.push({
              id: `notif-progress-${c._id}`,
              text: `Your complaint #${c._id.substring(c._id.length - 6)} is in progress.`,
              time: 'Recently'
            });
          }
        });
        
        // Let's add some mock notifications if list is empty to make it look active
        if (newNotifications.length === 0) {
          newNotifications.push({
            id: 'welcome',
            text: 'Welcome to Customer Care Registry!',
            time: 'System'
          });
        }
        setNotifications(newNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine Brand Name (Care vs Gifts)
  // Screenshot 6 shows "Gifts" on the chat screen, others show "Care"
  const brandName = currentPath === '/chat' ? 'Gifts' : 'Care';

  // Determine which links to render
  // Screenshot 6 (chat view): Home, Bell, Logout, Dropdown
  // Screenshots 4,5 (customer view): Home, Bell, ChatWithAgent, MyComplaints, Logout, Dropdown
  // Screenshots 1,2,3 (welcome/login/signup view): Home, Complaints, Customers, Agents, Logout
  
  const isChatView = currentPath === '/chat';
  
  // If logged in as customer (user) and NOT in chat view
  const isCustomerView = token && user?.role === 'user' && !isChatView;
  
  // If agent / admin or if we are guests (matching screenshots 1,2,3)
  const isAgentOrGuestView = !token || user?.role === 'agent' || user?.role === 'admin' || (!isCustomerView && !isChatView);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        {brandName}
      </Link>

      <div className="nav-links">
        {/* Home is common to all */}
        <Link to="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
          Home
        </Link>

        {/* 1. Chat view specific layout (Screenshot 6) */}
        {isChatView && (
          <>
            {/* Bell Icon */}
            <div className="notification-bell-container">
              <button className="nav-link" onClick={() => setBellOpen(!bellOpen)}>
                <Bell size={18} />
                {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
              </button>
              
              {bellOpen && (
                <div className="notifications-menu">
                  <div className="notification-header">
                    <span>Notifications</span>
                    <button className="notification-clear-btn" onClick={() => setNotifications([])}>Clear</button>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="notification-item">
                        <span className="notification-item-text">{n.text}</span>
                        <span className="notification-item-time">{n.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="notifications-empty">No notifications</div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="nav-link">
              Logout
            </button>

            {/* Dropdown */}
            <div className="dropdown-container">
              <button className="dropdown-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Dropdown <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/my-complaints" className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Complaints</Link>
                  <Link to="/raise-complaint" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Raise Complaint</Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* 2. Customer view specific layout (Screenshots 4 & 5) */}
        {isCustomerView && (
          <>
            {/* Bell Icon */}
            <div className="notification-bell-container">
              <button className="nav-link" onClick={() => setBellOpen(!bellOpen)}>
                <Bell size={18} />
                {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
              </button>
              
              {bellOpen && (
                <div className="notifications-menu">
                  <div className="notification-header">
                    <span>Notifications</span>
                    <button className="notification-clear-btn" onClick={() => setNotifications([])}>Clear</button>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="notification-item">
                        <span className="notification-item-text">{n.text}</span>
                        <span className="notification-item-time">{n.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="notifications-empty">No notifications</div>
                  )}
                </div>
              )}
            </div>

            <Link to="/chat" className={`nav-link ${currentPath === '/chat' ? 'active' : ''}`}>
              ChatWithAgent
            </Link>

            <Link to="/my-complaints" className={`nav-link ${currentPath === '/my-complaints' ? 'active' : ''}`}>
              MyComplaints
            </Link>

            <button onClick={handleLogout} className="nav-link">
              Logout
            </button>

            {/* Dropdown */}
            <div className="dropdown-container">
              <button className="dropdown-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Dropdown <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/raise-complaint" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Raise Complaint</Link>
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); handleLogout(); }}>Sign Out</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* 3. Agent / Guest view specific layout (Screenshots 1 & 2 & 3) */}
        {isAgentOrGuestView && (
          <>
            {token && (user?.role === 'admin' || user?.role === 'agent') ? (
              <Link to="/admin/complaints" className={`nav-link ${currentPath === '/admin/complaints' ? 'active' : ''}`}>
                Complaints
              </Link>
            ) : (
              <Link to="/login" className="nav-link">
                Complaints
              </Link>
            )}

            <button onClick={() => navigate('/login')} className="nav-link">
              Customers
            </button>

            <button onClick={() => navigate('/login')} className="nav-link">
              Agents
            </button>

            {token ? (
              <button onClick={handleLogout} className="nav-link">
                Logout
              </button>
            ) : (
              <Link to="/login" className={`nav-link ${currentPath === '/login' ? 'active' : ''}`}>
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
