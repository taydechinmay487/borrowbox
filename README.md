# BorrowBox

**Rent What You Need, When You Need It.**

BorrowBox is a hyperlocal rental platform prototype for college students and
hostel/PG residents. Instead of buying a projector, drill or suitcase for one
use, students rent it from a verified host within walking distance of campus.

> This is an academic startup prototype. All data is mock data, bookings are
> simulated, and no payment gateway, delivery service, GPS tracking or backend
> database is connected.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## What's included

- **Home** — hero search, location selector, category grid, popular and
  recommended items, how-it-works strip.
- **Browse Items** — live search, six category filters, availability toggle,
  and sorting by price or rating.
- **Product details** — image, description, condition, rating, host, per-day
  price, refundable deposit, duration selector and date pickers with a live
  price estimate.
- **Booking / checkout** — rental dates, renter details, rental charges,
  refundable deposit, total estimated amount, and a simulated confirmation with
  a booking code.
- **My Bookings** — upcoming, active and completed rentals with status, return
  dates, totals and a "mark as returned" action.
- **Login / Sign up** — mock authentication held in `localStorage`.
- **How It Works** — four-step flow, buy-vs-rent comparison and FAQs.

State (session, bookings, location) persists in `localStorage`; three sample
bookings are seeded on first load so the bookings screen is populated.

## Stack

React 19 + Vite. No backend, no external services.

## Sample catalogue

Electronics, Study & College Essentials, Sports Equipment, Tools & Equipment,
Travel Accessories and Event & Party Supplies — including the HD Projector
(₹120/day), Tripod Stand (₹50/day), Scientific Calculator (₹30/day), Power
Drill (₹100/day), Sports Kit (₹80/day) and Travel Suitcase (₹90/day).
