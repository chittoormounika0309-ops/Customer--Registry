const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isConnected, jsonDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'customer_care_registry_secret_key_12345';

// Register User
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    // Check if MongoDB is connected
    if (isConnected()) {
      const userExists = await User.findOne({ 
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }] 
      });

      if (userExists) {
        return res.status(400).json({ message: 'User with this email or username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstName,
        lastName,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'user',
      });

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      
      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } else {
      // JSON DB Fallback
      const users = jsonDb.read('User');
      const userExists = users.find(u => u.email === normalizedEmail || u.username === normalizedUsername);
      if (userExists) {
        return res.status(400).json({ message: 'User with this email or username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'mock_usr_' + Date.now() + Math.random().toString(36).substr(2, 5),
        firstName,
        lastName,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      jsonDb.write('User', users);

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isConnected()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // JSON DB Fallback
      const users = jsonDb.read('User');
      const user = users.find(u => u.email === normalizedEmail);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// Get User Profile (Me)
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    if (isConnected()) {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    } else {
      const users = jsonDb.read('User');
      const user = users.find(u => u._id === userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};
