import User from '../models/user.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'member', adminCode } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim()?.toLowerCase();
    const trimmedPassword = password?.trim();

    if (!trimmedName) return res.status(400).json({ message: 'Name is required' });
    if (!trimmedEmail) return res.status(400).json({ message: 'Email is required' });
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let finalRole = 'member';
    if (role === 'admin') {
      const serverCode = process.env.ADMIN_SIGNUP_CODE;

      // Fix: if ADMIN_SIGNUP_CODE is not set in .env, block all admin registrations
      // rather than letting any string pass (any string !== undefined is true)
      if (!serverCode) {
        return res.status(403).json({ message: 'Admin registration is disabled on this server' });
      }
      if (!adminCode || adminCode.trim() !== serverCode) {
        return res.status(403).json({ message: 'Invalid or missing admin security code' });
      }
      finalRole = 'admin';
    }

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: finalRole
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ message: 'Your account has been disabled' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fix: include isActive so AuthContext has the full user object after refresh
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};