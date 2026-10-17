const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET logged-in student profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
         id,
         full_name,
         student_id,
         email,
         major,
         phone,
         role,
         created_at
       FROM users
       WHERE id = ?`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      message: "Student profile retrieved successfully",
      user: {
        id: user.id,
        fullName: user.full_name,
        studentId: user.student_id,
        email: user.email,
        major: user.major,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving profile",
    });
  }
});

module.exports = router;