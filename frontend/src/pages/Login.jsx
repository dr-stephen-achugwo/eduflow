import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        setMessageType("error");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful. Redirecting to your profile...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
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
      <div className="login-container">
        <div className="login-header">
          <h1>Student Login</h1>
          <p>Enter your university account information.</p>
        </div>

        {message && (
          <div className={`form-message ${messageType}`}>
            {message}
          </div>
        )}

        <form className="portal-form" onSubmit={handleLogin}>
          <label htmlFor="loginEmail">Email Address</label>

          <input
            type="email"
            id="loginEmail"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            placeholder="student@university.edu"
            required
          />

          <label htmlFor="loginPassword">Password</label>

          <input
            type="password"
            id="loginPassword"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            minLength="6"
            required
          />

          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="form-note">
          Do not have an account?{" "}
          <Link to="/signup" className="form-link">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;