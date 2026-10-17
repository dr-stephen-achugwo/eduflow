function About() {
  return (
    <main className="page">
      <div className="page-header">
        <h1>About Our Portal</h1>
        <p>Learn more about the Student Portal System.</p>
      </div>

      <section className="about-container">
        <div className="information-card">
          <h2>Project Overview</h2>

          <p>
            The Student Portal System is a web application designed to help
            university students access their academic information easily.
          </p>

          <p>
            Students can view their courses, grades, profile information, and
            communicate with the university through one organized platform.
          </p>
        </div>

        <div className="information-card">
          <h2>Our Mission</h2>

          <p>
            Our mission is to provide students with a simple, responsive, and
            user-friendly system that saves time and improves access to
            university services.
          </p>
        </div>

        <div className="information-card">
          <h2>Technologies Used</h2>

          <ul className="technology-list">
            <li>ReactJS</li>
            <li>React Router</li>
            <li>JavaScript</li>
            <li>HTML5</li>
            <li>CSS3</li>
            <li>Vite</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default About;