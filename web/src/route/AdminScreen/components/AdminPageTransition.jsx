import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import './adminPageTransition.css';

const EXIT_MS = 200;

/**
 * Cross-fade / slide between admin nested routes while keeping the previous
 * page visible during the exit phase.
 */
export default function AdminPageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const routeKey = location.pathname;

  const displayedRouteRef = useRef(routeKey);
  const pendingOutletRef = useRef(outlet);
  const [displayOutlet, setDisplayOutlet] = useState(outlet);
  const [phase, setPhase] = useState('in');

  useLayoutEffect(() => {
    if (!outlet) return;

    if (routeKey === displayedRouteRef.current) {
      return;
    }

    pendingOutletRef.current = outlet;
    setPhase((current) => (current === 'out' ? current : 'out'));
  }, [routeKey, outlet]);

  useEffect(() => {
    if (phase !== 'out') return undefined;

    const nextOutlet = pendingOutletRef.current;
    const nextRouteKey = routeKey;

    const timer = setTimeout(() => {
      displayedRouteRef.current = nextRouteKey;
      setDisplayOutlet(nextOutlet);
      setPhase('in');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, EXIT_MS);

    return () => clearTimeout(timer);
  }, [phase, routeKey]);

  return (
    <div className={`admin-page-transition admin-page-transition--${phase}`}>
      {displayOutlet}
    </div>
  );
}
