import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    alert("Your message has been sent successfully.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>Send us a message if you need help or have any questions.</p>
      </div>

      <div className="contact-container">
        <section className="contact-information">
          <h2>Contact Information</h2>

          <p>
            Our support team is available to help students with portal-related
            questions.
          </p>

          <div className="contact-item">
            <strong>Email</strong>
            <span>support@studentportal.edu</span>
          </div>

          <div className="contact-item">
            <strong>Phone</strong>
            <span>+961 1 234 567</span>
          </div>

          <div className="contact-item">
            <strong>Address</strong>
            <span>Beirut, Lebanon</span>
          </div>
        </section>

        <form className="portal-form" onSubmit={handleSubmit}>
          <label htmlFor="contactName">Full Name</label>
          <input
            type="text"
            id="contactName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="contactEmail">Email Address</label>
          <input
            type="email"
            id="contactEmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="contactSubject">Subject</label>
          <input
            type="text"
            id="contactSubject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter message subject"
            required
          />

          <label htmlFor="contactMessage">Message</label>
          <textarea
            id="contactMessage"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message"
            rows="5"
            required
          />

          <button type="submit" className="form-button">
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}

export default Contact;