const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'soundcraft_studio_ultra_secret_key_987654321_jwt';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

/**
 * Helper to generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'producer',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * @desc    Register a new producer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, username, avatar_url } = req.body;

    // 1. Validation
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and username.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Check if user already exists in Supabase
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 3. Salt and Hash password with bcrypt
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Create user in Supabase/database
    const newUser = await User.create({
      email,
      password_hash,
      username,
      avatar_url,
      role: 'producer',
    });

    // 5. Generate JWT token
    const token = generateToken(newUser);

    // 6. Return response excluding password_hash
    const { password_hash: _discard, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Producer account created successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.',
      });
    }

    // 1. Find user by email in Supabase
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // 2. Compare password against stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    // 3. Generate JWT Token
    const token = generateToken(user);

    // 4. Safe user payload
    const { password_hash: _discard, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (JWT Required)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user preferences (theme, accent color, buffer size)
 * @route   PUT /api/auth/settings
 * @access  Private (JWT Required)
 */
const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings payload is required.',
      });
    }

    const updatedUser = await User.updateSettings(req.user.id, settings);

    return res.status(200).json({
      success: true,
      message: 'Studio settings updated.',
      settings: updatedUser.settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateSettings,
};
