import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    major: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            studentId: formData.studentId,
            email: formData.email,
            password: formData.password,
            major: formData.major,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Signup failed.");
        setMessageType("error");
        return;
      }

      setMessage("Account created successfully. Redirecting to login...");
      setMessageType("success");

      setFormData({
        fullName: "",
        studentId: "",
        email: "",
        password: "",
        confirmPassword: "",
        major: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Make sure the backend is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page login-page">
      <div className="login-container signup-container">
        <div className="login-header">
          <h1>Create Student Account</h1>
          <p>Enter your personal and university information.</p>
        </div>

        {message && (
          <div className={`form-message ${messageType}`}>
            {message}
          </div>
        )}

        <form className="portal-form" onSubmit={handleSubmit}>
          <label htmlFor="signupFullName">Full Name</label>
          <input
            type="text"
            id="signupFullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="signupStudentId">Student ID</label>
          <input
            type="text"
            id="signupStudentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Example: STU2026001"
            required
          />

          <label htmlFor="signupEmail">Email Address</label>
          <input
            type="email"
            id="signupEmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@university.edu"
            required
          />

          <label htmlFor="signupMajor">Major</label>
          <input
            type="text"
            id="signupMajor"
            name="major"
            value={formData.major}
            onChange={handleChange}
            placeholder="Example: Computer Science"
            required
          />

          <label htmlFor="signupPassword">Password</label>
          <input
            type="password"
            id="signupPassword"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            minLength="6"
            required
          />

          <label htmlFor="signupConfirmPassword">
            Confirm Password
          </label>
          <input
            type="password"
            id="signupConfirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Enter the password again"
            minLength="6"
            required
          />

          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="form-note">
          Already have an account?{" "}
          <Link to="/login" className="form-link">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;