import { useState } from 'react';
import Icon from '../components/Icons';
import Stars from '../components/Stars';
import { productById } from '../data/products';
import { useApp } from '../context/AppContext';
import {
  addDaysISO,
  formatDate,
  money,
  parseDate,
  rentalDays,
  todayISO,
} from '../lib/utils';
import { navigate, useRoute } from '../lib/router';

export default function BookingPage({ id }) {
  const product = productById[id];
  const { query } = useRoute();
  const { user, location, addBooking } = useApp();
  const today = todayISO();

  const initialStart =
    query.start && parseDate(query.start) && query.start >= today ? query.start : today;
  const initialEnd =
    query.end && parseDate(query.end) && query.end >= initialStart
      ? query.end
      : addDaysISO(initialStart, 2);

  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState('');

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h2>Item not found</h2>
          <a className="btn btn--primary" href="#/browse">
            Back to browse
          </a>
        </div>
      </div>
    );
  }

  const days = rentalDays(start, end);
  const rental = days * product.price;
  const total = rental + product.deposit;

  function confirm() {
    if (end < start) {
      setError('The return date must be on or after the pickup date.');
      return;
    }
    if (!name.trim()) {
      setError('Please add the name for the booking.');
      return;
    }
    setError('');
    const booking = addBooking({
      productId: product.id,
      startDate: start,
      endDate: end,
      days,
      rental,
      deposit: product.deposit,
      total,
      renter: name.trim(),
      pickup: `${location} · Gate 2 pickup hub`,
    });
    setConfirmed(booking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (confirmed) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <div className="confirm-card">
            <span className="confirm-icon">
              <Icon name="check" size={30} />
            </span>
            <span className="section-kicker">Booking confirmed</span>
            <h1>You're all set, {confirmed.renter.split(' ')[0]}!</h1>
            <p className="page-sub">
              This is a simulated confirmation — no payment was taken. Show your
              booking code at the pickup hub.
            </p>

            <div className="confirm-code">
              <span>Booking code</span>
              <strong>{confirmed.id}</strong>
            </div>

            <div className="confirm-item">
              <img src={product.image} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>
                  {formatDate(confirmed.startDate)} → {formatDate(confirmed.endDate)}{' '}
                  · {confirmed.days} {confirmed.days === 1 ? 'day' : 'days'}
                </span>
                <span>{confirmed.pickup}</span>
              </div>
            </div>

            <dl className="confirm-totals">
              <div>
                <dt>Rental charges</dt>
                <dd>{money(confirmed.rental)}</dd>
              </div>
              <div>
                <dt>Refundable deposit</dt>
                <dd>{money(confirmed.deposit)}</dd>
              </div>
              <div className="is-total">
                <dt>Total (pay at pickup)</dt>
                <dd>{money(confirmed.total)}</dd>
              </div>
            </dl>

            <div className="confirm-actions">
              <a className="btn btn--primary" href="#/bookings">
                View my bookings <Icon name="arrowRight" size={16} />
              </a>
              <a className="btn btn--ghost" href="#/browse">
                Continue browsing
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <a className="back-link" href={`#/product/${product.id}`}>
          <Icon name="arrowLeft" size={16} /> Back to item
        </a>

        <div className="page-head page-head--compact">
          <div>
            <span className="section-kicker">Checkout</span>
            <h1>Confirm your rental</h1>
          </div>
          <div className="stepper">
            <span className="step-item is-done">
              <span className="step-dot">
                <Icon name="check" size={11} />
              </span>
              Item
            </span>
            <span className="step-line" />
            <span className="step-item is-current">
              <span className="step-dot">2</span>
              Details
            </span>
            <span className="step-line" />
            <span className="step-item">
              <span className="step-dot">3</span>
              Confirmed
            </span>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-main">
            <section className="panel">
              <div className="panel-head">
                <h2>Selected item</h2>
                <a className="link-arrow" href={`#/product/${product.id}`}>
                  Change
                </a>
              </div>
              <div className="booking-item">
                <img src={product.image} alt={product.name} />
                <div className="booking-item-info">
                  <strong>{product.name}</strong>
                  <span className="muted-sm">{product.tagline}</span>
                  <span className="rating-inline">
                    <Stars value={product.rating} size={12} /> {product.rating}
                  </span>
                </div>
                <div className="booking-item-price">
                  <strong>{money(product.price)}</strong>
                  <span>/ day</span>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>Rental period</h2>
                <span className="pill pill--soft">
                  {days} {days === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="date-fields">
                <label>
                  <span>Start date</span>
                  <input
                    type="date"
                    value={start}
                    min={today}
                    onChange={(event) => {
                      setStart(event.target.value);
                      if (event.target.value > end) {
                        setEnd(event.target.value);
                      }
                    }}
                  />
                </label>
                <label>
                  <span>End date</span>
                  <input
                    type="date"
                    value={end}
                    min={start}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </label>
              </div>
              <p className="inline-note">
                <Icon name="clock" size={14} />
                Pickup after 4 PM on your start date · Return before 6 PM on{' '}
                {formatDate(end)}.
              </p>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>Who is renting?</h2>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Aarav Sharma"
                  />
                </label>
                <label className="field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>
              </div>
              <p className="inline-note">
                <Icon name="pin" size={14} />
                Pickup from {location} · Gate 2 hub, 8 AM – 9 PM.
              </p>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>Deposit & cancellation</h2>
              </div>
              <ul className="policy-list">
                <li>
                  <Icon name="shield" size={16} />
                  <span>
                    A refundable deposit of {money(product.deposit)} is collected
                    at pickup and released within 24 hours of return.
                  </span>
                </li>
                <li>
                  <Icon name="refresh" size={16} />
                  <span>
                    Free cancellation up to 12 hours before pickup. Cancel later
                    and 20% of the rental is retained.
                  </span>
                </li>
                <li>
                  <Icon name="package" size={16} />
                  <span>
                    Late returns are charged at {money(product.price)} per extra
                    day, capped at the deposit.
                  </span>
                </li>
              </ul>
              {error && (
                <p className="form-error">
                  <Icon name="info" size={14} /> {error}
                </p>
              )}
            </section>
          </div>

          <aside className="bill-card">
            <h2>Price details</h2>
            <dl className="bill-list">
              <div>
                <dt>
                  {money(product.price)} × {days} {days === 1 ? 'day' : 'days'}
                </dt>
                <dd>{money(rental)}</dd>
              </div>
              <div>
                <dt>Security deposit</dt>
                <dd>{money(product.deposit)}</dd>
              </div>
              <div>
                <dt>Platform fee</dt>
                <dd className="is-free">Free</dd>
              </div>
              <div>
                <dt>Delivery / pickup</dt>
                <dd className="is-free">Free</dd>
              </div>
              <div className="bill-total">
                <dt>Total estimated amount</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            <p className="bill-note">
              {money(product.deposit)} of this is refundable when the item is
              returned.
            </p>
            <button className="btn btn--primary btn--lg btn--block" onClick={confirm}>
              Confirm Booking
            </button>
            <p className="fine-print">
              <Icon name="info" size={14} /> Prototype only — no real payment or
              delivery.
            </p>
            <ul className="bill-trust">
              <li>
                <Icon name="check" size={14} /> Instant mock confirmation
              </li>
              <li>
                <Icon name="check" size={14} /> Cancel free up to 12 hrs before
              </li>
              <li>
                <Icon name="check" size={14} /> Verified host nearby
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
