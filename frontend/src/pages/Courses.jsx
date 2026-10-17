import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/courses"
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load courses.");
          setMessageType("error");
          return;
        }

        setCourses(data.courses);
      } catch (error) {
        setMessage(
          "Cannot connect to the server. Make sure the backend is running."
        );
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollment = async (courseId) => {
    const token = localStorage.getItem("token");

    setMessage("");
    setMessageType("");

    if (!token) {
      setMessage("Please login before enrolling in a course.");
      setMessageType("error");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

      return;
    }

    try {
      setEnrollingCourseId(courseId);

      const response = await fetch(
        `http://localhost:5000/api/enrollments/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            semester: "Summer 2025-2026",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setMessage("Your login session expired. Please login again.");
        setMessageType("error");

        setTimeout(() => {
          navigate("/login");
        }, 1200);

        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Course enrollment failed.");
        setMessageType("error");
        return;
      }

      setMessage("Course enrollment completed successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Loading Courses...</h1>
          <p>Please wait while courses are being loaded.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Available Courses</h1>
        <p>
          View available courses and register for the current semester.
        </p>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="empty-state">
          <h2>No Courses Available</h2>
          <p>There are currently no courses in the database.</p>
        </div>
      ) : (
        <div className="cards-container">
          {courses.map((course) => (
            <article className="course-card" key={course.id}>
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

              <button
                type="button"
                className="card-button"
                onClick={() => handleEnrollment(course.id)}
                disabled={
                  course.status !== "active" ||
                  enrollingCourseId === course.id
                }
              >
                {enrollingCourseId === course.id
                  ? "Enrolling..."
                  : course.status === "active"
                    ? "Enroll Now"
                    : "Unavailable"}
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Courses;