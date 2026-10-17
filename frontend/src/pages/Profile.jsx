import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
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
          setMessage(data.message || "Failed to load student profile.");
          return;
        }

        setStudent(data.user);
      } catch (error) {
        setMessage(
          "Cannot connect to the server. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Loading Profile...</h1>
          <p>Please wait while your information is being loaded.</p>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Student Profile</h1>
        </div>

        <div className="form-message error">
          {message}
        </div>
      </main>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Student Profile</h1>
        <p>View your personal and academic information.</p>
      </div>

      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {student.fullName
              ? student.fullName.charAt(0).toUpperCase()
              : "S"}
          </div>

          <div>
            <h2>{student.fullName}</h2>
            <p>{student.major}</p>
          </div>
        </div>

        <div className="profile-information">
          <div className="profile-item">
            <span>Student ID</span>
            <strong>{student.studentId || "Not available"}</strong>
          </div>

          <div className="profile-item">
            <span>Email Address</span>
            <strong>{student.email}</strong>
          </div>

          <div className="profile-item">
            <span>Major</span>
            <strong>{student.major || "Not available"}</strong>
          </div>

          <div className="profile-item">
            <span>Phone Number</span>
            <strong>{student.phone || "Not added"}</strong>
          </div>

          <div className="profile-item">
            <span>Account Role</span>
            <strong>{student.role}</strong>
          </div>

          <div className="profile-item">
            <span>Account Created</span>
            <strong>
              {student.createdAt
                ? new Date(student.createdAt).toLocaleDateString()
                : "Not available"}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="card-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default Profile;