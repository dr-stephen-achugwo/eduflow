const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

/* =========================
   SIGNUP
========================= */

router.post("/signup", async (req, res) => {
  try {
    const { fullName, studentId, email, password, major } = req.body;

    if (!fullName || !studentId || !email || !password || !major) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim();

    const [existingUsers] = await pool.query(
      `SELECT id
       FROM users
       WHERE email = ? OR student_id = ?`,
      [normalizedEmail, normalizedStudentId]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or student ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (full_name, student_id, email, password, major, role)
       VALUES (?, ?, ?, ?, ?, 'student')`,
      [
        fullName.trim(),
        normalizedStudentId,
        normalizedEmail,
        hashedPassword,
        major.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
      user: {
        id: result.insertId,
        fullName: fullName.trim(),
        studentId: normalizedStudentId,
        email: normalizedEmail,
        major: major.trim(),
        role: "student",
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while creating the account",
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      `SELECT
         id,
         full_name,
         student_id,
         email,
         password,
         major,
         phone,
         role
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        studentId: user.student_id,
        email: user.email,
        major: user.major,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
});

module.exports = router;