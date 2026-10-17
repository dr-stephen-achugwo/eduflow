const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

/* ==================================================
   GET ALL COURSES
   GET /api/courses
   Public route
================================================== */

router.get("/", async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT
         id,
         course_code,
         course_name,
         instructor,
         credits,
         schedule,
         status,
         created_at,
         updated_at
       FROM courses
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving courses",
    });
  }
});

/* ==================================================
   GET ONE COURSE
   GET /api/courses/:id
   Public route
================================================== */

router.get("/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const [courses] = await pool.query(
      `SELECT
         id,
         course_code,
         course_name,
         instructor,
         credits,
         schedule,
         status,
         created_at,
         updated_at
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

    return res.status(200).json({
      success: true,
      course: courses[0],
    });
  } catch (error) {
    console.error("Get course error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving the course",
    });
  }
});

/* ==================================================
   CREATE COURSE
   POST /api/courses
   Admin only
================================================== */

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        courseCode,
        courseName,
        instructor,
        credits,
        schedule,
        status,
      } = req.body;

      if (!courseCode || !courseName || !instructor || !credits) {
        return res.status(400).json({
          success: false,
          message:
            "Course code, course name, instructor and credits are required",
        });
      }

      const parsedCredits = Number(credits);

      if (
        !Number.isInteger(parsedCredits) ||
        parsedCredits < 1 ||
        parsedCredits > 6
      ) {
        return res.status(400).json({
          success: false,
          message: "Credits must be an integer between 1 and 6",
        });
      }

      const normalizedCode = courseCode.trim().toUpperCase();
      const normalizedName = courseName.trim();
      const normalizedInstructor = instructor.trim();
      const normalizedSchedule = schedule ? schedule.trim() : null;
      const normalizedStatus = status
        ? status.trim().toLowerCase()
        : "active";

      if (!["active", "inactive"].includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
      }

      const [existingCourses] = await pool.query(
        `SELECT id
         FROM courses
         WHERE course_code = ?`,
        [normalizedCode]
      );

      if (existingCourses.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Course code already exists",
        });
      }

      const [result] = await pool.query(
        `INSERT INTO courses
         (
           course_code,
           course_name,
           instructor,
           credits,
           schedule,
           status
         )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          normalizedCode,
          normalizedName,
          normalizedInstructor,
          parsedCredits,
          normalizedSchedule,
          normalizedStatus,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Course created successfully",
        course: {
          id: result.insertId,
          courseCode: normalizedCode,
          courseName: normalizedName,
          instructor: normalizedInstructor,
          credits: parsedCredits,
          schedule: normalizedSchedule,
          status: normalizedStatus,
        },
      });
    } catch (error) {
      console.error("Create course error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while creating the course",
      });
    }
  }
);

/* ==================================================
   UPDATE COURSE
   PUT /api/courses/:id
   Admin only
================================================== */

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const courseId = Number(req.params.id);

      const {
        courseCode,
        courseName,
        instructor,
        credits,
        schedule,
        status,
      } = req.body;

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      if (!courseCode || !courseName || !instructor || !credits) {
        return res.status(400).json({
          success: false,
          message:
            "Course code, course name, instructor and credits are required",
        });
      }

      const parsedCredits = Number(credits);

      if (
        !Number.isInteger(parsedCredits) ||
        parsedCredits < 1 ||
        parsedCredits > 6
      ) {
        return res.status(400).json({
          success: false,
          message: "Credits must be an integer between 1 and 6",
        });
      }

      const normalizedCode = courseCode.trim().toUpperCase();
      const normalizedName = courseName.trim();
      const normalizedInstructor = instructor.trim();
      const normalizedSchedule = schedule ? schedule.trim() : null;
      const normalizedStatus = status
        ? status.trim().toLowerCase()
        : "active";

      if (!["active", "inactive"].includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
      }

      const [existingCourse] = await pool.query(
        `SELECT id
         FROM courses
         WHERE id = ?`,
        [courseId]
      );

      if (existingCourse.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const [duplicateCourses] = await pool.query(
        `SELECT id
         FROM courses
         WHERE course_code = ?
           AND id != ?`,
        [normalizedCode, courseId]
      );

      if (duplicateCourses.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Course code already exists",
        });
      }

      await pool.query(
        `UPDATE courses
         SET
           course_code = ?,
           course_name = ?,
           instructor = ?,
           credits = ?,
           schedule = ?,
           status = ?
         WHERE id = ?`,
        [
          normalizedCode,
          normalizedName,
          normalizedInstructor,
          parsedCredits,
          normalizedSchedule,
          normalizedStatus,
          courseId,
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: {
          id: courseId,
          courseCode: normalizedCode,
          courseName: normalizedName,
          instructor: normalizedInstructor,
          credits: parsedCredits,
          schedule: normalizedSchedule,
          status: normalizedStatus,
        },
      });
    } catch (error) {
      console.error("Update course error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while updating the course",
      });
    }
  }
);

/* ==================================================
   DELETE COURSE
   DELETE /api/courses/:id
   Admin only
================================================== */

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const courseId = Number(req.params.id);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const [existingCourses] = await pool.query(
        `SELECT id, course_code, course_name
         FROM courses
         WHERE id = ?`,
        [courseId]
      );

      if (existingCourses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      await pool.query(
        `DELETE FROM courses
         WHERE id = ?`,
        [courseId]
      );

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        deletedCourse: {
          id: existingCourses[0].id,
          courseCode: existingCourses[0].course_code,
          courseName: existingCourses[0].course_name,
        },
      });
    } catch (error) {
      console.error("Delete course error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Server error while deleting the course",
      });
    }
  }
);

module.exports = router;