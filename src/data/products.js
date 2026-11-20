import projectorImg from '../assets/hd-projector.jpg';
import tripodImg from '../assets/tripod-stand.jpg';
import calculatorImg from '../assets/scientific-calculator.jpg';
import drillImg from '../assets/power-drill.jpg';
import sportsKitImg from '../assets/sports-kit.jpg';
import suitcaseImg from '../assets/travel-suitcase.jpg';
import speakerImg from '../assets/party-speaker.jpg';
import tabletImg from '../assets/drawing-tablet.jpg';
import lampImg from '../assets/study-lamp.jpg';
import badmintonImg from '../assets/badminton-set.jpg';
import { addDaysISO, todayISO } from '../lib/utils';

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'laptop',
    blurb: 'Projectors, audio & gadgets',
  },
  {
    id: 'study',
    name: 'Study & College Essentials',
    icon: 'book',
    blurb: 'Calculators, lamps & tablets',
  },
  {
    id: 'sports',
    name: 'Sports Equipment',
    icon: 'trophy',
    blurb: 'Kits for the weekend game',
  },
  {
    id: 'tools',
    name: 'Tools & Equipment',
    icon: 'tool',
    blurb: 'Drills & repair gear',
  },
  {
    id: 'travel',
    name: 'Travel Accessories',
    icon: 'plane',
    blurb: 'Suitcases & trip gear',
  },
  {
    id: 'events',
    name: 'Event & Party Supplies',
    icon: 'sparkles',
    blurb: 'Speakers, lights & more',
  },
];

export const categoryById = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category])
);

export const LOCATIONS = [
  'Koramangala, Bengaluru',
  'Powai, Mumbai',
  'Sector 62, Noida',
  'Viman Nagar, Pune',
  'Adyar, Chennai',
];

export const PRODUCTS = [
  {
    id: 'hd-projector',
    name: 'HD Projector',
    categories: ['electronics', 'events'],
    price: 120,
    deposit: 2000,
    rating: 4.8,
    reviews: 64,
    condition: 'Excellent',
    stock: 3,
    available: true,
    distance: '0.4 km',
    owner: { name: 'Rahul Mehta', since: '2024', verified: true },
    image: projectorImg,
    tagline: 'Movie nights, demos and game days on any blank wall.',
    description:
      'Turn any hostel wall into a movie screen. This compact 1080p projector is bright enough for dark-room movie nights, project presentations and console gaming. It comes with a remote, HDMI cable and carry case, and the lens is cleaned and checked after every rental.',
    features: [
      'Full HD 1080p, 3000 lumens',
      'HDMI, USB & wireless screen mirroring',
      'Built-in 5W speaker with 3.5mm out',
      'Carry case, remote & HDMI cable included',
    ],
    popular: true,
  },
  {
    id: 'tripod-stand',
    name: 'Tripod Stand',
    categories: ['electronics'],
    price: 50,
    deposit: 400,
    rating: 4.6,
    reviews: 38,
    condition: 'Like new',
    stock: 5,
    available: true,
    distance: '0.6 km',
    owner: { name: 'Sneha Kulkarni', since: '2025', verified: true },
    image: tripodImg,
    tagline: 'Steady shots for reels, group photos and demos.',
    description:
      'A sturdy aluminium tripod that lifts your phone or camera to eye level for reels, group photos and project demos. The height adjusts from 45 cm to 160 cm with a smooth pan-tilt head and quick-release plate.',
    features: [
      'Height adjustable from 45–160 cm',
      'Pan-tilt head with quick-release plate',
      'Phone clamp & carry bag included',
      'Supports cameras up to 2.5 kg',
    ],
    popular: false,
  },
  {
    id: 'drawing-tablet',
    name: 'Digital Drawing Tablet',
    categories: ['electronics', 'study'],
    price: 70,
    deposit: 900,
    rating: 4.7,
    reviews: 21,
    condition: 'Excellent',
    stock: 0,
    available: false,
    availableFrom: addDaysISO(todayISO(), 3),
    distance: '1.1 km',
    owner: { name: 'Aditya Rao', since: '2024', verified: true },
    image: tabletImg,
    tagline: 'Digital art and note-taking without the price tag.',
    description:
      'Practise digital art, take notes in class or edit photos without buying a tablet. The pressure-sensitive stylus and USB-C connection work with all major drawing software on Windows, macOS, Linux and Android.',
    features: [
      '8192 pressure levels',
      'USB-C plug and play',
      'Works with Photoshop, Krita & Illustrator',
      'Spare nibs and drawing glove included',
    ],
    popular: false,
  },
  {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    categories: ['study'],
    price: 30,
    deposit: 300,
    rating: 4.9,
    reviews: 112,
    condition: 'Like new',
    stock: 8,
    available: true,
    distance: '0.2 km',
    owner: { name: 'Priya Nair', since: '2024', verified: true },
    image: calculatorImg,
    tagline: 'Exam-approved, with fresh batteries every time.',
    description:
      'Approved for exams and lab work. A 417-function scientific calculator with a natural textbook display, fraction support and a slide-on hard cover. Fresh batteries are fitted before every handover.',
    features: [
      '417 functions, natural display',
      'Exam-approved model',
      'Slide-on protective hard cover',
      'Fresh AAA batteries included',
    ],
    popular: true,
  },
  {
    id: 'study-lamp',
    name: 'LED Study Lamp',
    categories: ['study'],
    price: 25,
    deposit: 250,
    rating: 4.5,
    reviews: 47,
    condition: 'Good',
    stock: 6,
    available: true,
    distance: '0.3 km',
    owner: { name: 'Karan Shah', since: '2025', verified: true },
    image: lampImg,
    tagline: 'Flicker-free light for late-night revision.',
    description:
      'A flicker-free LED desk lamp with three brightness levels and a flexible neck for late-night revision. It runs off USB, so it works from a laptop or a power bank when the hostel socket is taken.',
    features: [
      'Three brightness levels',
      'Flicker-free eye-care LED',
      'USB powered, cable included',
      'Flexible neck with clamp base',
    ],
    popular: false,
  },
  {
    id: 'sports-kit',
    name: 'Sports Kit',
    categories: ['sports'],
    price: 80,
    deposit: 500,
    rating: 4.7,
    reviews: 56,
    condition: 'Good',
    stock: 4,
    available: true,
    distance: '0.8 km',
    owner: { name: 'Vikram Singh', since: '2024', verified: true },
    image: sportsKitImg,
    tagline: 'Cricket and badminton in one carry bag.',
    description:
      'Everything you need for an evening on the ground: cricket bat, ball, stumps, badminton rackets and shuttlecocks in one carry bag. Ideal for hostel tournaments and weekend matches.',
    features: [
      'Cricket bat, ball & stumps',
      'Two badminton rackets + three shuttlecocks',
      'Carry bag with shoulder strap',
      'Grips sanitised after every rental',
    ],
    popular: true,
  },
  {
    id: 'badminton-set',
    name: 'Badminton Racket Set',
    categories: ['sports'],
    price: 40,
    deposit: 350,
    rating: 4.6,
    reviews: 33,
    condition: 'Excellent',
    stock: 4,
    available: true,
    distance: '0.7 km',
    owner: { name: 'Vikram Singh', since: '2024', verified: true },
    image: badmintonImg,
    tagline: 'Two lightweight rackets, ready for a quick game.',
    description:
      'Two lightweight graphite rackets and three feather shuttlecocks — perfect for a quick game between lectures. Rackets are re-gripped and checked for string tension before pickup.',
    features: [
      'Two graphite rackets (85 g)',
      'Three feather shuttlecocks',
      'Fresh over-grips fitted',
      'Carry cover included',
    ],
    popular: false,
  },
  {
    id: 'power-drill',
    name: 'Power Drill',
    categories: ['tools'],
    price: 100,
    deposit: 800,
    rating: 4.8,
    reviews: 29,
    condition: 'Excellent',
    stock: 2,
    available: true,
    distance: '1.3 km',
    owner: { name: 'Imran Sheikh', since: '2024', verified: true },
    image: drillImg,
    tagline: 'Shelves, curtain rods and DIY projects sorted.',
    description:
      'A cordless 12V drill for wall shelves, curtain rods and that DIY project you keep postponing. Comes with a charged battery, charger and a 12-piece bit set so you can start the moment you pick it up.',
    features: [
      '12V cordless with two batteries',
      '12-piece drill & screwdriver bits',
      'Variable speed with reverse',
      'Charger and hard case included',
    ],
    popular: true,
  },
  {
    id: 'travel-suitcase',
    name: 'Travel Suitcase',
    categories: ['travel'],
    price: 90,
    deposit: 1000,
    rating: 4.7,
    reviews: 41,
    condition: 'Like new',
    stock: 3,
    available: true,
    distance: '0.5 km',
    owner: { name: 'Ananya Iyer', since: '2025', verified: true },
    image: suitcaseImg,
    tagline: 'Cabin-size hard shell for weekend trips home.',
    description:
      'A cabin-size hard-shell suitcase that fits airline carry-on limits. Four spinner wheels, a built-in combination lock and a scratch-resistant finish make it an easy pick for weekend trips and home visits.',
    features: [
      'Cabin size: 55 × 35 × 22 cm',
      'Four spinner wheels & telescopic handle',
      'Built-in combination lock',
      'Weighs just 3.2 kg empty',
    ],
    popular: true,
  },
  {
    id: 'party-speaker',
    name: 'Party Speaker & Lights',
    categories: ['events', 'electronics'],
    price: 150,
    deposit: 1500,
    rating: 4.6,
    reviews: 18,
    condition: 'Excellent',
    stock: 1,
    available: true,
    distance: '1.0 km',
    owner: { name: 'Neha Gupta', since: '2024', verified: true },
    image: speakerImg,
    tagline: 'Loud sound and synced lights for the common room.',
    description:
      'A loud, room-filling Bluetooth speaker with a synced RGB light bar. The battery lasts around eight hours — enough for a hostel common-room party, a birthday or a farewell.',
    features: [
      '40W Bluetooth speaker',
      'Synced RGB light bar',
      'Eight-hour battery, USB-C charging',
      'Wireless microphone included',
    ],
    popular: false,
  },
];

export const productById = Object.fromEntries(
  PRODUCTS.map((product) => [product.id, product])
);

export function categoryCount(categoryId) {
  return PRODUCTS.filter((product) => product.categories.includes(categoryId))
    .length;
}
