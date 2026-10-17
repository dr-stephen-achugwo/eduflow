const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

/* ==================================================
   HELPER: CALCULATE LETTER GRADE
================================================== */

const calculateLetterGrade = (grade) => {
  if (grade >= 90) return "A";
  if (grade >= 85) return "A-";
  if (grade >= 80) return "B+";
  if (grade >= 75) return "B";
  if (grade >= 70) return "B-";
  if (grade >= 65) return "C+";
  if (grade >= 60) return "C";
  if (grade >= 55) return "D";
  return "F";
};

/* ==================================================
   GET LOGGED-IN STUDENT GRADES
   GET /api/grades/my-grades
   Logged-in student
================================================== */

router.get(
  "/my-grades",
  authenticateToken,
  async (req, res) => {
    try {
      const studentId = req.user.userId;

      const [grades] = await pool.query(
        `SELECT
           g.id AS grade_id,
           g.grade,
           g.letter_grade,
           g.result_status,
           g.created_at,
           g.updated_at,

           e.id AS enrollment_id,
           e.semester,
           e.enrollment_date,

           c.id AS course_id,
           c.course_code,
           c.course_name,
           c.instructor,
           c.credits,
           c.schedule

         FROM enrollments e

         INNER JOIN courses c
           ON e.course_id = c.id

         LEFT JOIN grades g
           ON e.id = g.enrollment_id

         WHERE e.student_id = ?

         ORDER BY c.course_code ASC`,
        [studentId]
      );

      return res.status(200).json({
        success: true,
        count: grades.length,
        grades,
      });
    } catch (error) {
      console.error("Get student grades error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while retrieving grades",
      });
    }
  }
);

/* ==================================================
   GET ALL GRADES
   GET /api/grades
   Admin only
================================================== */

router.get(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [grades] = await pool.query(
        `SELECT
           g.id AS grade_id,
           g.grade,
           g.letter_grade,
           g.result_status,
           g.created_at,
           g.updated_at,

           e.id AS enrollment_id,
           e.semester,

           u.id AS student_database_id,
           u.full_name,
           u.student_id,
           u.email,

           c.id AS course_id,
           c.course_code,
           c.course_name,
           c.instructor

         FROM grades g

         INNER JOIN enrollments e
           ON g.enrollment_id = e.id

         INNER JOIN users u
           ON e.student_id = u.id

         INNER JOIN courses c
           ON e.course_id = c.id

         ORDER BY g.id DESC`
      );

      return res.status(200).json({
        success: true,
        count: grades.length,
        grades,
      });
    } catch (error) {
      console.error("Get all grades error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while retrieving all grades",
      });
    }
  }
);

/* ==================================================
   GET ONE GRADE
   GET /api/grades/:id
   Admin only
================================================== */

router.get(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const gradeId = Number(req.params.id);

      if (!Number.isInteger(gradeId) || gradeId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade ID",
        });
      }

      const [grades] = await pool.query(
        `SELECT
           g.id AS grade_id,
           g.grade,
           g.letter_grade,
           g.result_status,
           g.created_at,
           g.updated_at,

           e.id AS enrollment_id,
           e.semester,

           u.id AS student_database_id,
           u.full_name,
           u.student_id,
           u.email,

           c.id AS course_id,
           c.course_code,
           c.course_name,
           c.instructor

         FROM grades g

         INNER JOIN enrollments e
           ON g.enrollment_id = e.id

         INNER JOIN users u
           ON e.student_id = u.id

         INNER JOIN courses c
           ON e.course_id = c.id

         WHERE g.id = ?`,
        [gradeId]
      );

      if (grades.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Grade not found",
        });
      }

      return res.status(200).json({
        success: true,
        grade: grades[0],
      });
    } catch (error) {
      console.error("Get grade error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while retrieving the grade",
      });
    }
  }
);

/* ==================================================
   CREATE GRADE
   POST /api/grades/:enrollmentId
   Admin only
================================================== */

router.post(
  "/:enrollmentId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const enrollmentId = Number(req.params.enrollmentId);
      const numericGrade = Number(req.body.grade);

      if (
        !Number.isInteger(enrollmentId) ||
        enrollmentId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid enrollment ID",
        });
      }

      if (
        req.body.grade === undefined ||
        req.body.grade === null ||
        req.body.grade === "" ||
        Number.isNaN(numericGrade) ||
        numericGrade < 0 ||
        numericGrade > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Grade must be a number between 0 and 100",
        });
      }

      const [enrollments] = await pool.query(
        `SELECT
           e.id,
           e.student_id,
           e.course_id,
           e.semester,

           u.full_name,
           u.student_id AS university_student_id,

           c.course_code,
           c.course_name

         FROM enrollments e

         INNER JOIN users u
           ON e.student_id = u.id

         INNER JOIN courses c
           ON e.course_id = c.id

         WHERE e.id = ?`,
        [enrollmentId]
      );

      if (enrollments.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found",
        });
      }

      const [existingGrades] = await pool.query(
        `SELECT id
         FROM grades
         WHERE enrollment_id = ?`,
        [enrollmentId]
      );

      if (existingGrades.length > 0) {
        return res.status(409).json({
          success: false,
          message: "A grade already exists for this enrollment",
        });
      }

      const letterGrade = calculateLetterGrade(numericGrade);

      const resultStatus =
        numericGrade >= 60 ? "passed" : "failed";

      const [result] = await pool.query(
        `INSERT INTO grades
         (
           enrollment_id,
           grade,
           letter_grade,
           result_status
         )
         VALUES (?, ?, ?, ?)`,
        [
          enrollmentId,
          numericGrade,
          letterGrade,
          resultStatus,
        ]
      );

      const enrollment = enrollments[0];

      return res.status(201).json({
        success: true,
        message: "Grade created successfully",
        grade: {
          id: result.insertId,
          enrollmentId,
          studentName: enrollment.full_name,
          studentId: enrollment.university_student_id,
          courseCode: enrollment.course_code,
          courseName: enrollment.course_name,
          semester: enrollment.semester,
          grade: numericGrade,
          letterGrade,
          resultStatus,
        },
      });
    } catch (error) {
      console.error("Create grade error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while creating the grade",
      });
    }
  }
);

/* ==================================================
   UPDATE GRADE
   PUT /api/grades/:id
   Admin only
================================================== */

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const gradeId = Number(req.params.id);
      const numericGrade = Number(req.body.grade);

      if (!Number.isInteger(gradeId) || gradeId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade ID",
        });
      }

      if (
        req.body.grade === undefined ||
        req.body.grade === null ||
        req.body.grade === "" ||
        Number.isNaN(numericGrade) ||
        numericGrade < 0 ||
        numericGrade > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Grade must be a number between 0 and 100",
        });
      }

      const [existingGrades] = await pool.query(
        `SELECT
           id,
           enrollment_id
         FROM grades
         WHERE id = ?`,
        [gradeId]
      );

      if (existingGrades.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Grade not found",
        });
      }

      const letterGrade = calculateLetterGrade(numericGrade);

      const resultStatus =
        numericGrade >= 60 ? "passed" : "failed";

      await pool.query(
        `UPDATE grades
         SET
           grade = ?,
           letter_grade = ?,
           result_status = ?
         WHERE id = ?`,
        [
          numericGrade,
          letterGrade,
          resultStatus,
          gradeId,
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Grade updated successfully",
        grade: {
          id: gradeId,
          enrollmentId: existingGrades[0].enrollment_id,
          grade: numericGrade,
          letterGrade,
          resultStatus,
        },
      });
    } catch (error) {
      console.error("Update grade error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while updating the grade",
      });
    }
  }
);

/* ==================================================
   DELETE GRADE
   DELETE /api/grades/:id
   Admin only
================================================== */

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const gradeId = Number(req.params.id);

      if (!Number.isInteger(gradeId) || gradeId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade ID",
        });
      }

      const [existingGrades] = await pool.query(
        `SELECT
           g.id,
           g.grade,
           g.letter_grade,
           g.result_status,

           u.full_name,

           c.course_code,
           c.course_name

         FROM grades g

         INNER JOIN enrollments e
           ON g.enrollment_id = e.id

         INNER JOIN users u
           ON e.student_id = u.id

         INNER JOIN courses c
           ON e.course_id = c.id

         WHERE g.id = ?`,
        [gradeId]
      );

      if (existingGrades.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Grade not found",
        });
      }

      await pool.query(
        `DELETE FROM grades
         WHERE id = ?`,
        [gradeId]
      );

      const deletedGrade = existingGrades[0];

      return res.status(200).json({
        success: true,
        message: "Grade deleted successfully",
        deletedGrade: {
          id: deletedGrade.id,
          studentName: deletedGrade.full_name,
          courseCode: deletedGrade.course_code,
          courseName: deletedGrade.course_name,
          grade: deletedGrade.grade,
          letterGrade: deletedGrade.letter_grade,
          resultStatus: deletedGrade.result_status,
        },
      });
    } catch (error) {
      console.error("Delete grade error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while deleting the grade",
      });
    }
  }
);

module.exports = router;