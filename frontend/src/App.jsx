import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import Grades from "./pages/Grades";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminCourses from "./pages/AdminCourses";
import AdminGrades from "./pages/AdminGrades";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/admin/courses"
            element={<AdminCourses />}
          />

          <Route
            path="/admin/grades"
            element={<AdminGrades />}
          />

          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;