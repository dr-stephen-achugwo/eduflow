import { NavLink, useLocation } from "react-router-dom";

function Navbar() {
  useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "admin";

  const getLinkClass = ({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link";

  return (
    <header className="navbar">
      <NavLink to="/" className="logo">
        Student Portal
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" className={getLinkClass}>
          Home
        </NavLink>

        <NavLink to="/about" className={getLinkClass}>
          About
        </NavLink>

        <NavLink to="/courses" className={getLinkClass}>
          Courses
        </NavLink>

        <NavLink to="/my-courses" className={getLinkClass}>
          My Courses
        </NavLink>

        <NavLink to="/grades" className={getLinkClass}>
          Grades
        </NavLink>

        <NavLink to="/profile" className={getLinkClass}>
          Profile
        </NavLink>

        <NavLink to="/contact" className={getLinkClass}>
          Contact
        </NavLink>

        {isAdmin && (
          <>
            <NavLink
              to="/admin/courses"
              className={getLinkClass}
            >
              Manage Courses
            </NavLink>

            <NavLink
              to="/admin/grades"
              className={getLinkClass}
            >
              Manage Grades
            </NavLink>
          </>
        )}

        <NavLink to="/signup" className={getLinkClass}>
          Signup
        </NavLink>

        <NavLink to="/login" className="login-link">
          Login
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;