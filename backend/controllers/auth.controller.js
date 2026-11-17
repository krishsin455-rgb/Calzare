
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { makeToken, publicUser } from "../utils/token.js";
import { sendEmail } from "../utils/email.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Name, email and password (at least 8 characters) are required"
      });
    }

    const exists = await User.findOne({
      email: email.toLowerCase()
    });

    if (exists) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      emailVerified: false,
      emailVerificationToken: crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex"),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    const verifyUrl =
      `${process.env.API_URL}/api/auth/verify-email/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Calzare account",
      html: `
        <h2>Welcome to CALZARE!</h2>
        <p>Please verify your email address.</p>
        <a href="${verifyUrl}">Verify My Email</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account."
    });

  } catch (error) {
   console.error("Registration error details:", {
  name: error.name,
  message: error.message,
  code: error.code,
  command: error.command,
  responseCode: error.responseCode,
  response: error.response
});
    res.status(500).json({
      message: "Registration could not be completed. Please try again."
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).send("Verification link is invalid or expired.");
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.send("Your Calzare email has been verified successfully. You can now log in.");

  } catch (error) {
    res.status(500).send("Email verification failed. Please try again.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email?.toLowerCase()
    }).select("+password");

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({
        message: "Incorrect email or password"
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in."
      });
    }

    res.json({
      token: makeToken(user),
      user: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed. Please try again."
    });
  }
};

export const me = (req, res) => {
  res.json({ user: publicUser(req.user) });
};
