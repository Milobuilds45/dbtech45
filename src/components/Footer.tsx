export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-text">
            &copy; {new Date().getFullYear()} DBTech45. Fueled by caffeine and chaos.
          </div>
          <ul className="footer-links">
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#newsletter">Newsletter</a></li>
            <li><a href="/os">OS</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
