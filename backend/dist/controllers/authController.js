"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.getMe = exports.login = exports.signup = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const signup = async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already in use'
                    : 'Username already taken',
            });
            return;
        }
        // Create new user
        const user = await User_1.default.create({
            username,
            email,
            password,
            displayName,
        });
        // Generate tokens
        const tokenPayload = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message,
        });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        // Generate tokens
        const tokenPayload = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message,
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message,
        });
    }
};
exports.getMe = getMe;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }
        // Verify refresh token
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Generate new access token
        const tokenPayload = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
        };
        const newAccessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
            },
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token',
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message,
        });
    }
};
exports.logout = logout;
exports.default = {
    signup: exports.signup,
    login: exports.login,
    getMe: exports.getMe,
    refreshToken: exports.refreshToken,
    logout: exports.logout,
};
//# sourceMappingURL=authController.js.map