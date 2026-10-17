import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      id: 1,
      title: "Manage Courses",
      description:
        "View your registered courses and access important course information.",
    },
    {
      id: 2,
      title: "View Grades",
      description:
        "Check your academic grades and monitor your university progress.",
    },
    {
      id: 3,
      title: "Student Profile",
      description:
        "View your personal and academic information in one secure place.",
    },
  ];

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-subtitle">Welcome to your university portal</p>

          <h1>Student Portal System</h1>

          <p>
            Manage your courses, grades, and student information easily through
            one modern and simple platform.
          </p>

          <div className="hero-buttons">
            <Link to="/courses" className="primary-button">
              View Courses
            </Link>

            <Link to="/login" className="secondary-button">
              Student Login
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <h2>Portal Features</h2>
          <p>Everything a student needs in one place.</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.id}>
              <div className="feature-number">{feature.id}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;