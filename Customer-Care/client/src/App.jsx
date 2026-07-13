import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import WriteComplaint from './pages/WriteComplaint';
import MyComplaints from './pages/MyComplaints';
import Chat from './pages/Chat';
import AdminComplaints from './pages/AdminComplaints';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/raise-complaint" element={<WriteComplaint />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
