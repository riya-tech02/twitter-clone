import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { IAuthRequest, IAPIResponse } from '../types';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already in use' 
          : 'Username already taken',
      } as IAPIResponse);
      return;
    }

    // Create new user
    const user = await User.create({
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

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    } as IAPIResponse);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as IAPIResponse);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } as IAPIResponse);
      return;
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getMe = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    } as IAPIResponse);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      } as IAPIResponse);
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const tokenPayload = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    } as IAPIResponse);
  }
};

export const logout = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    } as IAPIResponse);
  }
};

export default {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
};