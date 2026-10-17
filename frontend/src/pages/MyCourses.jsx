import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyCourses() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchMyCourses = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/enrollments/my-courses",
        {
          method: "GET",
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

      if (!response.ok) {
        setMessage(data.message || "Failed to load registered courses.");
        setMessageType("error");
        return;
      }

      setEnrollments(data.enrollments || []);
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const handleDeleteEnrollment = async (enrollmentId, courseName) => {
    const token = localStorage.getItem("token");

    const confirmed = window.confirm(
      `Are you sure you want to remove ${courseName} from your courses?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(enrollmentId);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `http://localhost:5000/api/enrollments/${enrollmentId}`,
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

      if (!response.ok) {
        setMessage(data.message || "Failed to remove the course.");
        setMessageType("error");
        return;
      }

      setEnrollments((previousEnrollments) =>
        previousEnrollments.filter(
          (item) => item.enrollment_id !== enrollmentId
        )
      );

      setMessage("Course removed successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Loading My Courses...</h1>
          <p>Please wait while your registered courses are loading.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>My Registered Courses</h1>

        <p>
          View the courses you registered for during the current semester.
        </p>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <h2>No Registered Courses</h2>

          <p>
            You have not enrolled in any courses yet. Open the Courses page
            and select a course.
          </p>
        </div>
      ) : (
        <div className="cards-container">
          {enrollments.map((item) => (
            <article
              className="course-card"
              key={item.enrollment_id}
            >
              <div className="course-card-header">
                <span className="course-code">
                  {item.course_code}
                </span>

                <span className="status-badge">
                  {item.status}
                </span>
              </div>

              <h2>{item.course_name}</h2>

              <div className="course-details">
                <p>
                  <strong>Instructor:</strong>{" "}
                  {item.instructor}
                </p>

                <p>
                  <strong>Credits:</strong>{" "}
                  {item.credits}
                </p>

                <p>
                  <strong>Schedule:</strong>{" "}
                  {item.schedule || "Not specified"}
                </p>

                <p>
                  <strong>Semester:</strong>{" "}
                  {item.semester}
                </p>

                <p>
                  <strong>Grade:</strong>{" "}
                  {item.grade !== null
                    ? `${item.grade} - ${item.letter_grade}`
                    : "Pending"}
                </p>
              </div>

              <button
                type="button"
                className="delete-button"
                disabled={deletingId === item.enrollment_id}
                onClick={() =>
                  handleDeleteEnrollment(
                    item.enrollment_id,
                    item.course_name
                  )
                }
              >
                {deletingId === item.enrollment_id
                  ? "Removing..."
                  : "Remove Course"}
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyCourses;