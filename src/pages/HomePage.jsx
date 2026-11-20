import Icon from '../components/Icons';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import {
  CATEGORIES,
  LOCATIONS,
  PRODUCTS,
  categoryCount,
} from '../data/products';
import { useApp } from '../context/AppContext';
import { money } from '../lib/utils';
import { navigate } from '../lib/router';
import suitcaseImg from '../assets/travel-suitcase.jpg';

const STEPS = [
  {
    icon: 'search',
    title: 'Find it nearby',
    text: 'Search 10 everyday products listed by verified hosts within walking distance of your campus.',
  },
  {
    icon: 'calendar',
    title: 'Pick your dates',
    text: 'Choose how long you need it. Pay per day, with a refundable deposit held against the item.',
  },
  {
    icon: 'package',
    title: 'Pick up & return',
    text: 'Collect from your neighbourhood hub, use it, and return on the due date to get the deposit back.',
  },
];

export default function HomePage() {
  const { location, setLocation } = useApp();
  const popular = PRODUCTS.filter((product) => product.popular);
  const recommended = PRODUCTS.filter((product) => !product.popular);

  function handleSearch(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const q = String(data.get('q') || '').trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    navigate(`/browse${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" /> Now live in 5 campus neighbourhoods
            </span>
            <h1>
              Rent what you need,
              <br />
              <em>when you need it.</em>
            </h1>
            <p className="lede">
              A projector for movie night. A drill for one shelf. A suitcase for
              one trip. BorrowBox lets students and hostel residents rent
              everyday things from neighbours — for a fraction of the price of
              buying.
            </p>

            <form className="search-bar" onSubmit={handleSearch} role="search">
              <div className="search-field">
                <Icon name="search" size={19} />
                <input
                  name="q"
                  type="search"
                  placeholder="Search projector, drill, suitcase…"
                  aria-label="Search products"
                />
              </div>
              <div className="loc-field">
                <Icon name="pin" size={17} />
                <select
                  aria-label="Your location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  {LOCATIONS.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn--primary" type="submit">
                Search
              </button>
            </form>

            <div className="hero-stats">
              <div>
                <strong>{PRODUCTS.length}+</strong>
                <span>items nearby</span>
              </div>
              <div>
                <strong>₹25<span>/day</span></strong>
                <span>starting price</span>
              </div>
              <div>
                <strong>2,400+</strong>
                <span>student rentals</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="hero-card">
              <img src={suitcaseImg} alt="A cabin-size suitcase available to rent" />
              <div className="hero-card-caption">
                <div>
                  <span className="hero-card-label">Travel Suitcase</span>
                  <span className="hero-card-price">{money(90)} / day</span>
                </div>
                <span className="pill pill--ok pill--light">
                  <span className="pill-dot" /> Available
                </span>
              </div>
            </div>

            <div className="float-badge float-badge--rating">
              <span className="badge-icon">
                <Icon name="star" size={16} fill="currentColor" />
              </span>
              <div>
                <strong>4.8 average rating</strong>
                <span>from 2,400+ rentals</span>
              </div>
            </div>

            <div className="float-badge float-badge--deposit">
              <span className="badge-icon badge-icon--soft">
                <Icon name="shield" size={16} />
              </span>
              <div>
                <strong>Deposit fully refundable</strong>
                <span>Back in 24 hrs of return</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">Browse by category</span>
              <h2>What do you need today?</h2>
            </div>
            <a className="link-arrow" href="#/browse">
              All items <Icon name="arrowRight" size={16} />
            </a>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <a
                className="category-card"
                key={category.id}
                href={`#/browse?category=${category.id}`}
              >
                <span className="category-icon">
                  <Icon name={category.icon} size={22} />
                </span>
                <span className="category-name">{category.name}</span>
                <span className="category-blurb">{category.blurb}</span>
                <span className="category-count">
                  {`${categoryCount(category.id)} ${
                    categoryCount(category.id) === 1 ? 'item' : 'items'
                  }`}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">Popular this week</span>
              <h2>Most borrowed near {location.split(',')[0]}</h2>
            </div>
            <a className="link-arrow" href="#/browse">
              Browse all <Icon name="arrowRight" size={16} />
            </a>
          </div>

          <div className="product-grid">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="how-strip">
            <div className="how-strip-copy">
              <span className="section-kicker">Three steps, no paperwork</span>
              <h2>Renting should take two minutes</h2>
              <p>
                No membership fee, no credit checks. Just your student email,
                your dates and a pickup window.
              </p>
              <a className="btn btn--primary" href="#/how-it-works">
                See how it works <Icon name="arrowRight" size={16} />
              </a>
            </div>
            <div className="step-list">
              {STEPS.map((step, index) => (
                <div className="step" key={step.title}>
                  <span className="step-number">0{index + 1}</span>
                  <div>
                    <h3>
                      <Icon name={step.icon} size={16} /> {step.title}
                    </h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker">Recommended for you</span>
              <h2>Based on your campus and budget</h2>
            </div>
          </div>
          <div className="product-grid">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="value-grid">
            <div className="value-card">
              <span className="category-icon">
                <Icon name="shield" size={20} />
              </span>
              <h3>Save up to 90%</h3>
              <p>
                A ₹32,000 projector for ₹120 a night — you only pay for the days
                you actually use.
              </p>
            </div>
            <div className="value-card">
              <span className="category-icon">
                <Icon name="pin" size={20} />
              </span>
              <h3>Walk to your pickup</h3>
              <p>
                Every listing is within 1.5 km of campus. No courier, no delivery
                fee, no waiting.
              </p>
            </div>
            <div className="value-card">
              <span className="category-icon">
                <Icon name="refresh" size={20} />
              </span>
              <h3>Deposit back in 24 hrs</h3>
              <p>
                Return on time and your refundable deposit is released the next
                day. No deductions for normal wear.
              </p>
            </div>
          </div>

          <div className="cta-band">
            <div>
              <h2>Your hostel room is not a warehouse.</h2>
              <p>
                Join students in {location.split(',')[0]} who borrow instead of
                buy. Pick up your first rental from the campus hub today.
              </p>
            </div>
            <div className="cta-actions">
              <a className="btn btn--light btn--lg" href="#/browse">
                Browse items
              </a>
              <a className="btn btn--outline-light btn--lg" href="#/signup">
                Create account
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
