import { useLayoutEffect } from 'react';

export function useScrollReset() {
  useLayoutEffect(() => {
    if (window.location.href.indexOf('#') === -1) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, []);
}
