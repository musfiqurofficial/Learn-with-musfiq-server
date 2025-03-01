const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

exports.register = async (req, res) => {
  const { name, email, password, verificationCode } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !verificationCode) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // // Validate role
    // if (!["user", "admin"].includes(role)) {
    //   return res.status(400).json({ message: "Invalid role. Role must be either 'user' or 'admin'." });
    // }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create the user
    const user = new User({ name, email, password });
    await user.save();

    // Generate a token for the user
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.protectedRoute = async (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;
    const templatePath = path.join(__dirname, "../forgotPassword.html");
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");
    emailTemplate = emailTemplate.replace("{{resetUrl}}", resetUrl);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: 'no-reply" <no-reply@learnwithmusfiq.com>',
      to: user.email,
      subject: "Password Reset",
      html: emailTemplate,
    });

    res.json({ message: "Reset email sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verificationCodes = new Map();
exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate verification code
    const verificationCode = Math.floor(
      10000 + Math.random() * 90000
    ).toString();

    // Store the code in memory
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 3600000, // 1 hour
    });

    // Read and format email template
    const templatePath = path.join(__dirname, "../emailVerification.html");
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");
    emailTemplate = emailTemplate.replace(
      "{{verificationCode}}",
      verificationCode
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "No Reply <no-reply@learnwithmusfiq.com>",
      to: email,
      subject: "Email Verification Code",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Verification code sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const storedCode = verificationCodes.get(email);

    if (
      !storedCode ||
      storedCode.code !== code ||
      storedCode.expires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
