const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY = 24 * 60 * 60 * 1000;

export function money(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function parseDate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDaysISO(iso, days) {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function formatDate(iso) {
  const date = parseDate(iso);
  if (!date) return '—';
  const year = date.getFullYear() === new Date().getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}${year}`;
}

export function formatLongDate(iso) {
  const date = parseDate(iso);
  if (!date) return '—';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function rentalDays(start, end) {
  const from = parseDate(start);
  const to = parseDate(end);
  if (!from || !to) return 1;
  const diff = Math.round((to - from) / DAY);
  return Math.max(1, diff + 1);
}

export function bookingStatus(booking) {
  if (booking.status) return booking.status;
  const today = todayISO();
  if (booking.startDate > today) return 'Upcoming';
  if (booking.endDate < today) return 'Completed';
  return 'Active';
}

export function makeBookingId() {
  return `BB-${Math.floor(1000 + Math.random() * 9000)}`;
}
