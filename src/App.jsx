import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useRoute } from './lib/router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ProductPage from './pages/ProductPage';
import BookingPage from './pages/BookingPage';
import BookingsPage from './pages/BookingsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import Icon from './components/Icons';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      <Icon name="check" size={16} />
      {toast.message}
    </div>
  );
}

function Routes() {
  const { path } = useRoute();
  const segments = path.split('/').filter(Boolean);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  if (segments.length === 0) return <HomePage />;

  switch (segments[0]) {
    case 'browse':
      return <BrowsePage />;
    case 'product':
      return <ProductPage id={segments[1]} />;
    case 'book':
      return <BookingPage id={segments[1]} />;
    case 'bookings':
      return <BookingsPage />;
    case 'how-it-works':
      return <HowItWorksPage />;
    case 'login':
    case 'signup':
      return <AuthPage />;
    default:
      return (
        <div className="page container">
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="box" size={26} />
            </span>
            <h2>Page not found</h2>
            <p>The page you were looking for does not exist in this prototype.</p>
            <a className="btn btn--primary" href="#/">
              Back home
            </a>
          </div>
        </div>
      );
  }
}

export default function App() {
  return (
    <AppProvider>
      <Navbar />
      <main>
        <Routes />
      </main>
      <Footer />
      <Toast />
    </AppProvider>
  );
}
