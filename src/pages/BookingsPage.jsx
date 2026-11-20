import { useMemo, useState } from 'react';
import Icon from '../components/Icons';
import { productById } from '../data/products';
import { useApp } from '../context/AppContext';
import { bookingStatus, formatDate, money, rentalDays } from '../lib/utils';

const TABS = ['Upcoming', 'Active', 'Completed'];

export default function BookingsPage() {
  const { bookings, completeBooking } = useApp();
  const [tab, setTab] = useState('Upcoming');

  const enriched = useMemo(
    () =>
      bookings
        .map((booking) => ({
          ...booking,
          status: bookingStatus(booking),
          product: productById[booking.productId],
        }))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [bookings]
  );

  const counts = TABS.reduce((acc, name) => {
    acc[name] = enriched.filter((booking) => booking.status === name).length;
    return acc;
  }, {});

  const visible = enriched
    .filter((booking) => booking.status === tab)
    .sort((a, b) =>
      tab === 'Completed'
        ? b.startDate.localeCompare(a.startDate)
        : a.startDate.localeCompare(b.startDate)
    );

  const activeCount = counts.Active;

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <span className="section-kicker">
              <a href="#/">Home</a> / My bookings
            </span>
            <h1>My Bookings</h1>
            <p className="page-sub">
              {bookings.length} total rentals · {activeCount} out on rent right now
            </p>
          </div>
          <a className="btn btn--primary" href="#/browse">
            Rent something new
          </a>
        </div>

        <div className="tabs" role="tablist">
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={tab === name}
              className={`tab ${tab === name ? 'is-active' : ''}`}
              onClick={() => setTab(name)}
            >
              {name}
              <span className="tab-count">{counts[name]}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="package" size={26} />
            </span>
            <h2>No {tab.toLowerCase()} bookings</h2>
            <p>
              {tab === 'Upcoming'
                ? 'Book an item and it will show up here with pickup details.'
                : tab === 'Active'
                  ? 'Nothing is out on rent right now. Your next pickup is listed under Upcoming.'
                  : 'Completed rentals and their deposits will appear here.'}
            </p>
            <a className="btn btn--primary" href="#/browse">
              Browse items
            </a>
          </div>
        ) : (
          <div className="booking-list">
            {visible.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <img
                  className="booking-thumb"
                  src={booking.product?.image}
                  alt={booking.product?.name}
                />
                <div className="booking-card-main">
                  <div className="booking-card-top">
                    <div>
                      <span className="product-cat">Booking {booking.id}</span>
                      <h3>{booking.product?.name}</h3>
                    </div>
                    <span
                      className={`status status--${booking.status.toLowerCase()}`}
                    >
                      <span className="status-dot" />
                      {booking.status === 'Active' ? 'Active rental' : booking.status}
                    </span>
                  </div>

                  <div className="booking-facts">
                    <span>
                      <Icon name="calendar" size={15} />
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </span>
                    <span>
                      <Icon name="clock" size={15} />
                      {rentalDays(booking.startDate, booking.endDate)}{' '}
                      {rentalDays(booking.startDate, booking.endDate) === 1
                        ? 'day'
                        : 'days'}
                    </span>
                    <span>
                      <Icon name="pin" size={15} />
                      {booking.pickup || 'Gate 2 pickup hub'}
                    </span>
                  </div>

                  <div className="booking-card-foot">
                    <div className="booking-amount">
                      <strong>{money(booking.total)}</strong>
                      <span>
                        incl. {money(booking.deposit)} deposit ·{' '}
                        {booking.status === 'Completed'
                          ? 'refunded'
                          : 'refundable on return'}
                      </span>
                    </div>
                    <div className="booking-actions">
                      <a
                        className="btn btn--ghost btn--sm"
                        href={`#/product/${booking.productId}`}
                      >
                        View item
                      </a>
                      {booking.status === 'Active' && (
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => completeBooking(booking.id)}
                        >
                          Mark as returned
                        </button>
                      )}
                      {booking.status === 'Upcoming' && (
                        <span className="return-note">
                          <Icon name="calendar" size={14} />
                          Return by {formatDate(booking.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
