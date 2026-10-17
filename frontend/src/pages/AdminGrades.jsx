import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminGrades() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [draftGrades, setDraftGrades] = useState({});

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
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

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchEnrollments = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/enrollments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setMessage("Access denied. Admin permission is required.");
        setMessageType("error");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Failed to load enrollments.");
        setMessageType("error");
        return;
      }

      const loadedEnrollments = data.enrollments || [];

      setEnrollments(loadedEnrollments);

      const initialGrades = {};

      loadedEnrollments.forEach((item) => {
        initialGrades[item.enrollment_id] =
          item.grade !== null ? String(item.grade) : "";
      });

      setDraftGrades(initialGrades);
    } catch {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

    fetchEnrollments();
  }, [fetchEnrollments, navigate]);

  const handleGradeChange = (enrollmentId, value) => {
    setDraftGrades((previousGrades) => ({
      ...previousGrades,
      [enrollmentId]: value,
    }));
  };

  const handleSaveGrade = async (enrollment) => {
    const token = localStorage.getItem("token");
    const enteredGrade = draftGrades[enrollment.enrollment_id];

    if (
      enteredGrade === undefined ||
      enteredGrade === "" ||
      Number.isNaN(Number(enteredGrade)) ||
      Number(enteredGrade) < 0 ||
      Number(enteredGrade) > 100
    ) {
      setMessage("Grade must be a number between 0 and 100.");
      setMessageType("error");
      return;
    }

    const hasExistingGrade = enrollment.grade_id !== null;

    const url = hasExistingGrade
      ? `http://localhost:5000/api/grades/${enrollment.grade_id}`
      : `http://localhost:5000/api/grades/${enrollment.enrollment_id}`;

    const method = hasExistingGrade ? "PUT" : "POST";

    try {
      setSavingId(enrollment.enrollment_id);
      setMessage("");
      setMessageType("");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade: Number(enteredGrade),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setMessage("Access denied. Admin permission is required.");
        setMessageType("error");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Failed to save grade.");
        setMessageType("error");
        return;
      }

      setMessage(
        hasExistingGrade
          ? "Grade updated successfully."
          : "Grade created successfully."
      );

      setMessageType("success");

      await fetchEnrollments();
    } catch {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteGrade = async (enrollment) => {
    if (!enrollment.grade_id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the grade for ${enrollment.full_name} in ${enrollment.course_code}?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setDeletingId(enrollment.enrollment_id);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `http://localhost:5000/api/grades/${enrollment.grade_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setMessage("Access denied. Admin permission is required.");
        setMessageType("error");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Failed to delete grade.");
        setMessageType("error");
        return;
      }

      setMessage("Grade deleted successfully.");
      setMessageType("success");

      await fetchEnrollments();
    } catch {
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
          <h1>Loading Student Enrollments...</h1>
          <p>Please wait while the information is loading.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Admin Grades Panel</h1>

        <p>
          Add, update, and delete grades for registered students.
        </p>
      </div>

      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <h2>No Student Enrollments</h2>

          <p>
            Students must register in courses before grades can be added.
          </p>
        </div>
      ) : (
        <div className="table-container admin-grades-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Grade</th>
                <th>Letter</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((item) => (
                <tr key={item.enrollment_id}>
                  <td>{item.full_name}</td>

                  <td>{item.student_id}</td>

                  <td>
                    <strong>{item.course_code}</strong>
                    <br />
                    {item.course_name}
                  </td>

                  <td>{item.semester}</td>

                  <td>
                    <input
                      type="number"
                      className="grade-input"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        draftGrades[item.enrollment_id] ?? ""
                      }
                      onChange={(event) =>
                        handleGradeChange(
                          item.enrollment_id,
                          event.target.value
                        )
                      }
                      placeholder="0-100"
                    />
                  </td>

                  <td>{item.letter_grade || "-"}</td>

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

                  <td>
                    <div className="admin-grade-actions">
                      <button
                        type="button"
                        className="save-grade-button"
                        disabled={
                          savingId === item.enrollment_id
                        }
                        onClick={() =>
                          handleSaveGrade(item)
                        }
                      >
                        {savingId === item.enrollment_id
                          ? "Saving..."
                          : item.grade_id
                            ? "Update"
                            : "Add"}
                      </button>

                      {item.grade_id && (
                        <button
                          type="button"
                          className="delete-grade-button"
                          disabled={
                            deletingId === item.enrollment_id
                          }
                          onClick={() =>
                            handleDeleteGrade(item)
                          }
                        >
                          {deletingId === item.enrollment_id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AdminGrades;