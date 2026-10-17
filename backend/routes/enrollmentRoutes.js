const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

/* ==================================================
   GET ALL ENROLLMENTS
   GET /api/enrollments
   Admin only
================================================== */

router.get(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [enrollments] = await pool.query(
        `SELECT
           e.id AS enrollment_id,
           e.semester,
           e.enrollment_date,

           u.id AS user_id,
           u.full_name,
           u.student_id,
           u.email,
           u.major,

           c.id AS course_id,
           c.course_code,
           c.course_name,
           c.instructor,
           c.credits,

           g.id AS grade_id,
           g.grade,
           g.letter_grade,
           g.result_status

         FROM enrollments e

         INNER JOIN users u
           ON e.student_id = u.id

         INNER JOIN courses c
           ON e.course_id = c.id

         LEFT JOIN grades g
           ON e.id = g.enrollment_id

         ORDER BY e.id DESC`
      );

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        enrollments,
      });
    } catch (error) {
      console.error(
        "Get all enrollments error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while retrieving enrollments",
      });
    }
  }
);

/* ==================================================
   GET LOGGED-IN STUDENT COURSES
   GET /api/enrollments/my-courses
================================================== */

router.get(
  "/my-courses",
  authenticateToken,
  async (req, res) => {
    try {
      const studentId = req.user.userId;

      const [enrollments] = await pool.query(
        `SELECT
           e.id AS enrollment_id,
           e.semester,
           e.enrollment_date,

           c.id AS course_id,
           c.course_code,
           c.course_name,
           c.instructor,
           c.credits,
           c.schedule,
           c.status,

           g.id AS grade_id,
           g.grade,
           g.letter_grade,
           g.result_status

         FROM enrollments e

         INNER JOIN courses c
           ON e.course_id = c.id

         LEFT JOIN grades g
           ON e.id = g.enrollment_id

         WHERE e.student_id = ?

         ORDER BY e.enrollment_date DESC`,
        [studentId]
      );

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        enrollments,
      });
    } catch (error) {
      console.error(
        "Get student enrollments error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while retrieving enrolled courses",
      });
    }
  }
);

/* ==================================================
   ENROLL IN COURSE
   POST /api/enrollments/:courseId
================================================== */

router.post(
  "/:courseId",
  authenticateToken,
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);
      const { semester } = req.body;
      const studentId = req.user.userId;

      if (
        !Number.isInteger(courseId) ||
        courseId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      if (!semester || !semester.trim()) {
        return res.status(400).json({
          success: false,
          message: "Semester is required",
        });
      }

      const normalizedSemester = semester.trim();

      const [courses] = await pool.query(
        `SELECT
           id,
           course_code,
           course_name,
           status
         FROM courses
         WHERE id = ?`,
        [courseId]
      );

      if (courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (courses[0].status !== "active") {
        return res.status(400).json({
          success: false,
          message:
            "You cannot enroll in an inactive course",
        });
      }

      const [existingEnrollments] =
        await pool.query(
          `SELECT id
           FROM enrollments
           WHERE student_id = ?
             AND course_id = ?
             AND semester = ?`,
          [
            studentId,
            courseId,
            normalizedSemester,
          ]
        );

      if (existingEnrollments.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Student is already enrolled in this course",
        });
      }

      const [result] = await pool.query(
        `INSERT INTO enrollments
         (
           student_id,
           course_id,
           semester
         )
         VALUES (?, ?, ?)`,
        [
          studentId,
          courseId,
          normalizedSemester,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Course enrollment completed successfully",
        enrollment: {
          id: result.insertId,
          studentId,
          courseId,
          courseCode: courses[0].course_code,
          courseName: courses[0].course_name,
          semester: normalizedSemester,
        },
      });
    } catch (error) {
      console.error(
        "Create enrollment error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while enrolling in the course",
      });
    }
  }
);

/* ==================================================
   DELETE OWN ENROLLMENT
   DELETE /api/enrollments/:id
================================================== */

router.delete(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const enrollmentId = Number(req.params.id);
      const studentId = req.user.userId;

      if (
        !Number.isInteger(enrollmentId) ||
        enrollmentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid enrollment ID",
        });
      }

      const [result] = await pool.query(
        `DELETE FROM enrollments
         WHERE id = ?
           AND student_id = ?`,
        [enrollmentId, studentId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Enrollment deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete enrollment error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while deleting enrollment",
      });
    }
  }
);

module.exports = router;