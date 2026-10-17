import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialFormData = {
  courseCode: "",
  courseName: "",
  instructor: "",
  credits: 3,
  schedule: "",
  status: "active",
};

function AdminCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/courses"
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load courses.");
        setMessageType("error");
        return;
      }

      setCourses(data.courses || []);
    } catch {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!user || user.role !== "admin") {
      navigate("/profile");
      return;
    }

    fetchCourses();
  }, [fetchCourses, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const url = editingId
        ? `http://localhost:5000/api/courses/${editingId}`
        : "http://localhost:5000/api/courses";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          instructor: formData.instructor,
          credits: Number(formData.credits),
          schedule: formData.schedule,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        setMessage("Access denied. Admin permission is required.");
        setMessageType("error");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Failed to save course.");
        setMessageType("error");
        return;
      }

      setMessage(
        editingId
          ? "Course updated successfully."
          : "Course created successfully."
      );

      setMessageType("success");

      resetForm();
      await fetchCourses();
    } catch {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);

    setFormData({
      courseCode: course.course_code,
      courseName: course.course_name,
      instructor: course.instructor,
      credits: course.credits,
      schedule: course.schedule || "",
      status: course.status,
    });

    setMessage("");
    setMessageType("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${course.course_code} - ${course.course_name}?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDeletingId(course.id);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `http://localhost:5000/api/courses/${course.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        setMessage("Access denied. Admin permission is required.");
        setMessageType("error");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Failed to delete course.");
        setMessageType("error");
        return;
      }

      setCourses((previousCourses) =>
        previousCourses.filter(
          (item) => item.id !== course.id
        )
      );

      if (editingId === course.id) {
        resetForm();
      }

      setMessage("Course deleted successfully.");
      setMessageType("success");
    } catch {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1>Admin Courses Panel</h1>

        <p>
          Add, update, and delete courses from the Student Portal.
        </p>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      <section className="admin-course-layout">
        <form
          className="portal-form admin-course-form"
          onSubmit={handleSubmit}
        >
          <h2>
            {editingId ? "Update Course" : "Add New Course"}
          </h2>

          <label htmlFor="adminCourseCode">
            Course Code
          </label>

          <input
            type="text"
            id="adminCourseCode"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            placeholder="Example: CSCI426"
            required
          />

          <label htmlFor="adminCourseName">
            Course Name
          </label>

          <input
            type="text"
            id="adminCourseName"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            placeholder="Enter course name"
            required
          />

          <label htmlFor="adminInstructor">
            Instructor
          </label>

          <input
            type="text"
            id="adminInstructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            placeholder="Enter instructor name"
            required
          />

          <label htmlFor="adminCredits">
            Credits
          </label>

          <input
            type="number"
            id="adminCredits"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            min="1"
            max="6"
            required
          />

          <label htmlFor="adminSchedule">
            Schedule
          </label>

          <input
            type="text"
            id="adminSchedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            placeholder="Example: Monday and Wednesday"
          />

          <label htmlFor="adminStatus">
            Status
          </label>

          <select
            id="adminStatus"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="submit"
            className="form-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Course"
                : "Add Course"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel Editing
            </button>
          )}
        </form>

        <section className="admin-courses-list">
          <h2>Current Courses</h2>

          {loading ? (
            <div className="empty-state">
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <h3>No Courses Available</h3>
              <p>Add your first course using the form.</p>
            </div>
          ) : (
            <div className="admin-courses-grid">
              {courses.map((course) => (
                <article
                  className="course-card"
                  key={course.id}
                >
                  <div className="course-card-header">
                    <span className="course-code">
                      {course.course_code}
                    </span>

                    <span
                      className={
                        course.status === "active"
                          ? "status-badge"
                          : "status-badge inactive-status"
                      }
                    >
                      {course.status}
                    </span>
                  </div>

                  <h2>{course.course_name}</h2>

                  <div className="course-details">
                    <p>
                      <strong>Instructor:</strong>{" "}
                      {course.instructor}
                    </p>

                    <p>
                      <strong>Credits:</strong>{" "}
                      {course.credits}
                    </p>

                    <p>
                      <strong>Schedule:</strong>{" "}
                      {course.schedule || "Not specified"}
                    </p>
                  </div>

                  <div className="admin-card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      disabled={deletingId === course.id}
                      onClick={() => handleDelete(course)}
                    >
                      {deletingId === course.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminCourses;