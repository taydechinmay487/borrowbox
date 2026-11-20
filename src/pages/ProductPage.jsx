import { useMemo, useState } from 'react';
import Icon from '../components/Icons';
import Stars from '../components/Stars';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, categoryById, productById } from '../data/products';
import { useApp } from '../context/AppContext';
import {
  addDaysISO,
  formatDate,
  money,
  rentalDays,
  todayISO,
} from '../lib/utils';
import { navigate } from '../lib/router';

const DURATIONS = [1, 3, 7];

export default function ProductPage({ id }) {
  const product = productById[id];
  const { location, notify } = useApp();
  const today = todayISO();
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDaysISO(today, 2));

  const days = rentalDays(start, end);
  const rental = days * (product?.price || 0);

  const similar = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (item) =>
        item.id !== product.id &&
        item.categories.some((category) => product.categories.includes(category))
    ).slice(0, 3);
  }, [product]);

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h2>Item not found</h2>
          <p>This listing may have been taken down.</p>
          <a className="btn btn--primary" href="#/browse">
            Back to browse
          </a>
        </div>
      </div>
    );
  }

  function pickDuration(duration) {
    setEnd(addDaysISO(start, duration - 1));
  }

  function changeStart(value) {
    setStart(value);
    if (value > end) setEnd(addDaysISO(value, days - 1));
  }

  function bookNow() {
    if (end < start) {
      notify('Return date must be on or after the pickup date.');
      return;
    }
    navigate(`/book/${product.id}?start=${start}&end=${end}`);
  }

  const category = categoryById[product.categories[0]];

  return (
    <div className="page">
      <div className="container">
        <a className="back-link" href="#/browse">
          <Icon name="arrowLeft" size={16} /> Back to browse
        </a>

        <div className="detail-grid">
          <div className="detail-gallery">
            <img src={product.image} alt={product.name} />
            <div className="gallery-strip">
              <div>
                <Icon name="shield" size={16} />
                <span>Deposit refundable</span>
              </div>
              <div>
                <Icon name="truck" size={16} />
                <span>Free pickup nearby</span>
              </div>
              <div>
                <Icon name="refresh" size={16} />
                <span>Sanitised after each use</span>
              </div>
            </div>
          </div>

          <div className="detail-main">
            <div className="detail-topline">
              <span className="product-cat">{category?.name}</span>
              <span className={product.available ? 'pill pill--ok' : 'pill pill--off'}>
                <span className="pill-dot" />
                {product.available
                  ? `${product.stock} available`
                  : `Available from ${formatDate(product.availableFrom)}`}
              </span>
            </div>

            <h1>{product.name}</h1>
            <p className="detail-tagline">{product.tagline}</p>

            <div className="detail-meta">
              <span className="rating-badge">
                {product.rating.toFixed(1)}
                <Stars value={product.rating} size={12} />
              </span>
              <span>{product.reviews} reviews</span>
              <span className="dot-sep" />
              <span>Condition: <strong>{product.condition}</strong></span>
              <span className="dot-sep" />
              <span>{product.distance} away</span>
            </div>

            <div className="price-panel">
              <div className="price-main">
                <strong>{money(product.price)}</strong>
                <span>per day</span>
              </div>
              <div className="price-deposit">
                <span>Refundable deposit</span>
                <strong>{money(product.deposit)}</strong>
              </div>
            </div>

            <div className="booking-box">
              <div className="booking-box-head">
                <h3>Choose your rental dates</h3>
                <span className="muted-sm">
                  {days} {days === 1 ? 'day' : 'days'} selected
                </span>
              </div>

              <div className="date-fields">
                <label>
                  <span>Pickup date</span>
                  <input
                    type="date"
                    value={start}
                    min={today}
                    onChange={(event) => changeStart(event.target.value)}
                  />
                </label>
                <label>
                  <span>Return date</span>
                  <input
                    type="date"
                    value={end}
                    min={start}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </label>
              </div>

              <div className="duration-chips">
                {DURATIONS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    className={`chip chip--button ${days === duration ? 'is-active' : ''}`}
                    onClick={() => pickDuration(duration)}
                  >
                    {duration} {duration === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>

              <div className="booking-summary-line">
                <span>
                  {money(product.price)} × {days} {days === 1 ? 'day' : 'days'}
                </span>
                <strong>{money(rental)}</strong>
              </div>
              <div className="booking-summary-line">
                <span>+ Refundable security deposit</span>
                <strong>{money(product.deposit)}</strong>
              </div>
              <div className="booking-summary-line booking-summary-line--total">
                <span>Estimated total</span>
                <strong>{money(rental + product.deposit)}</strong>
              </div>

              <button
                className="btn btn--primary btn--lg btn--block"
                onClick={bookNow}
                disabled={!product.available}
              >
                {product.available ? 'Book Now' : 'Currently unavailable'}
                {product.available && <Icon name="arrowRight" size={17} />}
              </button>
              <p className="fine-print">
                <Icon name="info" size={14} />
                No payment is taken — this is a prototype with simulated
                confirmations.
              </p>
            </div>

            <section className="detail-section">
              <h2>About this item</h2>
              <p>{product.description}</p>
              <ul className="feature-list">
                {product.features.map((feature) => (
                  <li key={feature}>
                    <Icon name="check" size={15} /> {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h2>Pickup & host</h2>
              <div className="host-card">
                <span className="avatar avatar--lg">
                  {product.owner.name.charAt(0)}
                </span>
                <div>
                  <strong>{product.owner.name}</strong>
                  <span>
                    Verified host since {product.owner.since} · {product.distance}{' '}
                    away
                  </span>
                  <span className="host-loc">
                    <Icon name="pin" size={13} /> {location} · Gate 2 pickup hub
                  </span>
                </div>
                <span className="pill pill--soft">Verified</span>
              </div>
            </section>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="section section--flush">
            <div className="section-head">
              <div>
                <span className="section-kicker">You might also need</span>
                <h2>Similar items nearby</h2>
              </div>
            </div>
            <div className="product-grid">
              {similar.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
