function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        &copy; {currentYear} Student Portal System. All rights reserved.
      </p>

      <p>CSCI426 Advanced Web Programming Project</p>
    </footer>
  );
}

export default Footer;