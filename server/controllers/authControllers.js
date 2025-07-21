const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const redisClient = require('../config/redis');
const {generateAccessToken, generateRefreshToken} = require("../utils/tokenUtils");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendRes = require("../utils/sendRes");

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

const saveRefreshTokenToCookie = (res, token) => {

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: REFRESH_TOKEN_TTL * 1000
  });

}

exports.login = async function (req, res) {
  const {email, password} = req.body;

  try {

    const key = `login_fail_${email}`;
    const blockKey = `login_block_${email}`;

    const isBlocked = await redisClient.get(blockKey);
    if (isBlocked) {
      return sendRes(res, 403, "Too many login attempts. Please try again later.", {});
    }

    const user = await UserModel.findOne({email: email}, null, {lean: true});

    if (!user) {
      return sendRes(res, 400, "Invalid Credentials", {});
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      let attempts = parseInt(await redisClient.get(key)) || 0;

      attempts += 1;
      await redisClient.set(key, attempts, {EX: BLOCK_TIME});

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await redisClient.set(blockKey, 'true', {EX: BLOCK_TIME});
        return sendRes(res, 403, "Too many login attempts. Please try again later.", {});
      }

      return sendRes(res, 400, "Invalid Credentials", {});
    }

    await redisClient.del(key);
    await redisClient.del(blockKey);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await redisClient.set(refreshToken, user._id.toString(), { EX: REFRESH_TOKEN_TTL });

    saveRefreshTokenToCookie(res, refreshToken);

    delete user.password;

    return sendRes(res, 200, "Login successful", {
      accessToken,
      user
    });

  } catch (error) {

    console.error('Login error:', error);
    return sendRes(res, 500, "Server error while login", {});

  }
}

exports.register = async function (req, res) {
  const {email, password, firstName, lastName} = req.body

  try {

    const existing = await UserModel.findOne({
      email: email
    }, null, {lean: true});

    if (existing) {
      return sendRes(res, 400, "User already exists", {});
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = new UserModel({
      firstName,
      lastName,
      email,
      password: hashed
    });

    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    saveRefreshTokenToCookie(res, refreshToken);

    delete user.password;

    return sendRes(res, 201, "User registered successfully", {
      accessToken,
      user
    });

  } catch (error) {

    console.error('Registration error:', error);
    return sendRes(res, 500, "Server error while registration", {});

  }
}

exports.refreshToken = async (req, res) => {
  try {

    const token = req.cookies.refreshToken;
    if (!token) return sendRes(res, 401, "No refresh token provided", {});

    const userId = await redisClient.get(token);
    if (!userId) return sendRes(res, 403, "Invalid or expired token", {});
    await redisClient.del(token);

    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken();
    await redisClient.set(newRefreshToken, userId, { EX: REFRESH_TOKEN_TTL });

    saveRefreshTokenToCookie(res, newRefreshToken);

    return sendRes(res, 200, "Token refreshed successfully", {
      accessToken: newAccessToken,
    });

  } catch (err) {

    console.error('Token refresh error:', err);
    return sendRes(res, 500, "Server error while token refresh", {});

  }
}

exports.logout = async function (req, res) {
  try {

    await redisClient.del(`login_fail_${req.userId}`);
    await redisClient.del(`login_block_${req.userId}`);

    const token = req.cookies.refreshToken;

    if (token) {
      await redisClient.del(token);
      res.clearCookie('refreshToken');
    }

    return sendRes(res, 200, "Logout successful", {});

  } catch (error) {

    console.error('Logout error:', error);
    return sendRes(res, 500, "Server error while logout", {});

  }
}

exports.getUser = async function (req, res) {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return sendRes(res, 404, "User not found", {});
    }

    return sendRes(res, 200, "User retrieved successfully", {
      user
    });

  } catch (error) {

    console.error('Get user error:', error);
    return sendRes(res, 500, "Server error while retrieval", {});

  }
}


exports.sendEmailToVerifyUserEmail = async function (req, res) {
  const userId = req.userId
  const email = req.body.email

  try {
    const emailToken = jwt.sign(
      {id: userId},
      process.env.EMAIL_SECRET,
      {expiresIn: '1d'}
    );

    await redisClient.set(`verify:${emailToken}`, userId.toString(), {EX: 24 * 60 * 60});

    const verificationUrl = `http://localhost:5173/verify-email?token=${emailToken}`;

    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: `
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    });

    return sendRes(res, 200, "Verify your email", {});

  } catch (error) {

    console.error('Error sending verification email:', error);
    return sendRes(res, 500, "Server error while sending verification email", {});

  }
}


exports.verifyEmail = async function (req, res) {
  const { token } = req.query;

  try {
    jwt.verify(token, process.env.EMAIL_SECRET);
    const userId = await redisClient.get(`verify:${token}`);

    if (!userId) {
      return sendRes(res, 401, "Invalid or expired verification", {});
    }

    await UserModel.findByIdAndUpdate(userId, {
      isVerified: true
    });
    await redisClient.del(`verify:${token}`);

    return sendRes(res, 200, "Email verified successfully", {});

  } catch (error) {

    console.error('Email verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return sendRes(res, 400, "Verification token has expired", {});
    }

    return sendRes(res, 500, "Server error while verification", {});

  }
}


exports.sendEmailToResetPassword = async function (req, res) {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email: email }, null, { lean: true });

    if (!user) {
      return sendRes(res, 404, "User not found", {});
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: '1h' }
    );

    await redisClient.set(`reset:${resetToken}`, user._id.toString(), { EX: 60 * 60 });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `
    });

    return sendRes(res, 200, "Password reset email sent successfully", {});

  } catch (error) {

    console.error('Error sending password reset email:', error);
    return sendRes(res, 500, "Server error while sending email", {});

  }
}


exports.resetPassword = async function (req, res) {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const userId = await redisClient.get(`reset:${token}`);

    if (!userId) {
      return sendRes(res, 400, "Invalid or expired reset token", {});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });

    await redisClient.del(`reset:${token}`);

    return sendRes(res, 200, "Password reset successfully", {});

  } catch (error) {

    console.error('Reset password error:', error);
    if (error.name === 'TokenExpiredError') {
      return sendRes(res, 400, "Reset token has expired", {});
    }

    return sendRes(res, 500, "Server error while resetting password", {});

  }
}

