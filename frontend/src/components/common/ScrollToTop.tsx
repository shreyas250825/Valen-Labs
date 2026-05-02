import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure the browser doesn't restore prior scroll positions between SPA navigations.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // If a hash exists (e.g. "#contact"), some browsers will try to scroll to it.
    // Clear it on route navigations so every page opens from the top.
    if (location.hash) {
      window.history.replaceState(null, '', location.pathname + location.search);
    }

    // Run after React paints the next route to avoid layout/focus pushing the scroll down.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [location.pathname, location.search]);

  return null;
};

export default ScrollToTop;
