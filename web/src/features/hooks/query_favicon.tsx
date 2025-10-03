import { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function useQueryFavicon() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    const faviconLink = document.querySelector('link[rel~=\'icon\']') as HTMLLinkElement | null;
    if (!faviconLink) return;

    const originalHref = '/favicon.ico';
    const loadingHref = '/favicon-spinner.svg';

    faviconLink.href = isFetching > 0 || isMutating > 0 ? loadingHref : originalHref;
  }, [isFetching, isMutating]);
}
