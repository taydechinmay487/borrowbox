import { useEffect, useState } from 'react';

export function parseHash(hash) {
  const raw = (hash || '').replace(/^#/, '');
  const [pathname, search = ''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(search));
  return { path: pathname || '/', query };
}

export function navigate(to) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
