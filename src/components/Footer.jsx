import Icon from './Icons';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a className="brand" href="#/">
            <span className="brand-mark">
              <Icon name="box" size={20} />
            </span>
            <span className="brand-text">
              Borrow<span>Box</span>
            </span>
          </a>
          <p>
            Rent what you need, when you need it. A hyperlocal rental platform
            built for students and hostel residents.
          </p>
          <p className="footer-note">
            Prototype for an academic startup project. Mock data only.
          </p>
        </div>

        <div className="footer-col">
          <h4>Rent</h4>
          <a href="#/browse?category=electronics">Electronics</a>
          <a href="#/browse?category=study">Study essentials</a>
          <a href="#/browse?category=sports">Sports equipment</a>
          <a href="#/browse?category=events">Event supplies</a>
        </div>

        <div className="footer-col">
          <h4>Platform</h4>
          <a href="#/how-it-works">How it works</a>
          <a href="#/bookings">My bookings</a>
          <a href="#/browse">Browse items</a>
          <a href="#/signup">Create account</a>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="#/how-it-works">FAQs</a>
          <a href="#/how-it-works">Deposits & refunds</a>
          <a href="#/how-it-works">Pickup points</a>
          <a href="#/how-it-works">Contact</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} BorrowBox. Demo project.</span>
        <span className="footer-locations">
          <Icon name="pin" size={14} /> Koramangala · Powai · Noida · Pune · Chennai
        </span>
      </div>
    </footer>
  );
}
