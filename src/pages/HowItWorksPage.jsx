import Icon from '../components/Icons';

const STEPS = [
  {
    icon: 'search',
    title: 'Browse nearby listings',
    text: 'Set your locality and search by category. Every item is listed by a verified host within about 1.5 km, so pickup is a walk, not a delivery wait.',
  },
  {
    icon: 'calendar',
    title: 'Choose dates and duration',
    text: 'Pick a start and end date and see the rental charge and refundable deposit before you commit. One day is fine — there is no minimum contract.',
  },
  {
    icon: 'package',
    title: 'Confirm the booking',
    text: 'Confirm and get a booking code instantly. In this prototype the confirmation is simulated, but the flow matches a real checkout.',
  },
  {
    icon: 'refresh',
    title: 'Return and get the deposit back',
    text: 'Return before the due time at the same hub. Your refundable deposit is released within 24 hours and the item goes back into the pool.',
  },
];

const FAQS = [
  {
    q: 'How is the rental price calculated?',
    a: 'Rental price is per day. If you pick up on the 5th and return on the 8th, that is 4 rental days (both dates count). The deposit is added once, regardless of duration, and is fully refundable.',
  },
  {
    q: 'What if the item is damaged?',
    a: 'Normal wear is expected and free. For significant damage, the repair cost is deducted from the security deposit — capped at the deposit amount. This prototype does not process real claims.',
  },
  {
    q: 'Is there a membership or delivery fee?',
    a: 'No. BorrowBox charges only the daily rental and the refundable deposit. Pickup from a neighbourhood hub is always free.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Cancel up to 12 hours before pickup for a full refund of the rental. Later cancellations retain 20% of the rental amount.',
  },
  {
    q: 'How do hosts get verified?',
    a: 'Hosts verify a college ID and a phone number, and each listing is inspected at the pickup hub before it goes live. Ratings from past rentals stay on the listing.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page">
      <div className="container">
        <div className="page-head page-head--center">
          <div>
            <span className="section-kicker">How it works</span>
            <h1>Borrow in four simple steps</h1>
            <p className="page-sub">
              BorrowBox is a hyperlocal library for the things students need
              once, not every day.
            </p>
          </div>
        </div>

        <div className="how-grid">
          {STEPS.map((step, index) => (
            <article className="how-card" key={step.title}>
              <div className="how-card-top">
                <span className="step-number">0{index + 1}</span>
                <span className="category-icon">
                  <Icon name={step.icon} size={20} />
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="split-section">
          <div className="split-copy">
            <span className="section-kicker">Why students borrow</span>
            <h2>A projector costs ₹32,000. Renting it costs ₹120.</h2>
            <p>
              Most hostel rooms have no space and students have no budget for
              single-use purchases. A drill, a suitcase or a projector sits idle
              360 days a year. BorrowBox shares those items across the
              neighbourhood so everyone pays only for the days they use.
            </p>
            <ul className="check-list">
              <li>
                <Icon name="check" size={16} /> Average saving of 78% versus buying
              </li>
              <li>
                <Icon name="check" size={16} /> No storage, servicing or resale
                hassle
              </li>
              <li>
                <Icon name="check" size={16} /> Everything within walking distance
                of campus
              </li>
            </ul>
            <a className="btn btn--primary" href="#/browse">
              Start browsing <Icon name="arrowRight" size={16} />
            </a>
          </div>

          <div className="compare-card">
            <div className="compare-head">
              <span>Example: HD Projector</span>
              <span>4-day movie festival</span>
            </div>
            <div className="compare-row">
              <span>Buy new</span>
              <strong className="is-bad">₹32,000</strong>
            </div>
            <div className="compare-row">
              <span>Rent on BorrowBox (4 days)</span>
              <strong className="is-good">₹480</strong>
            </div>
            <div className="compare-row">
              <span>Refundable deposit</span>
              <strong>₹2,000</strong>
            </div>
            <div className="compare-row compare-row--total">
              <span>You save</span>
              <strong className="is-good">₹31,520</strong>
            </div>
            <p className="compare-note">
              Prices are sample values for this prototype and exclude the
              refundable deposit.
            </p>
          </div>
        </div>

        <div className="faq-section">
          <div className="section-head">
            <div>
              <span className="section-kicker">Good to know</span>
              <h2>Frequently asked questions</h2>
            </div>
          </div>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <details className="faq" key={faq.q}>
                <summary>
                  {faq.q}
                  <span className="faq-icon">
                    <Icon name="arrowRight" size={14} />
                  </span>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="cta-band">
          <div>
            <h2>Ready to rent your first item?</h2>
            <p>
              No membership, no paperwork. Set your dates and pick it up from the
              campus hub.
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
    </div>
  );
}
