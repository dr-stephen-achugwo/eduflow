import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Grades() {
  const navigate = useNavigate();

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/grades/my-grades",
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
          setMessage(data.message || "Failed to load grades.");
          return;
        }

        setGrades(data.grades || []);
      } catch (error) {
        setMessage(
          "Cannot connect to the server. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [navigate]);

  const completedGrades = grades.filter(
    (item) => item.grade !== null
  );

  const totalGrades = completedGrades.reduce(
    (sum, item) => sum + Number(item.grade),
    0
  );

  const average =
    completedGrades.length > 0
      ? (totalGrades / completedGrades.length).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Loading Grades...</h1>
          <p>Please wait while your grades are being loaded.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>My Grades</h1>

        <p>
          View your academic results for your registered courses.
        </p>
      </div>

      {message && (
        <div className="form-message error">
          {message}
        </div>
      )}

      {!message && grades.length === 0 ? (
        <div className="empty-state">
          <h2>No Grades Available</h2>

          <p>
            You are not enrolled in any courses or no grades are
            available yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grade-summary">
            <div>
              <span>Registered Courses</span>
              <strong>{grades.length}</strong>
            </div>

            <div>
              <span>Completed Grades</span>
              <strong>{completedGrades.length}</strong>
            </div>

            <div>
              <span>Average</span>
              <strong>{average}%</strong>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Semester</th>
                  <th>Grade</th>
                  <th>Letter Grade</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {grades.map((item) => (
                  <tr key={item.enrollment_id}>
                    <td>{item.course_code}</td>

                    <td>{item.course_name}</td>

                    <td>{item.semester}</td>

                    <td>
                      {item.grade !== null
                        ? Number(item.grade).toFixed(2)
                        : "Pending"}
                    </td>

                    <td>
                      {item.letter_grade || "-"}
                    </td>

                    <td>
                      <span
                        className={
                          item.result_status === "passed"
                            ? "grade-status passed-status"
                            : item.result_status === "failed"
                              ? "grade-status failed-status"
                              : "grade-status pending-status"
                        }
                      >
                        {item.result_status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default Grades;