export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const definedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );

  try {
    window.gtag('event', name, definedParams);
  } catch {
    // Analytics must never interrupt the user's action.
  }
}

export function installBusinessEventTracking() {
  if (typeof document === 'undefined') return () => {};

  const handleClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;

    const destination = new URL(anchor.href, window.location.href);
    const language = document.documentElement.lang || 'unknown';

    if (destination.hostname === 'play.pvzge.com') {
      trackEvent('play_game_open', { site_locale: language });
      return;
    }

    const almanacMatch = destination.pathname.match(/^\/(?:en\/)?almanac\/(plants|zombies)\/[^/]+\.html$/);
    if (!almanacMatch || destination.origin !== window.location.origin) return;

    const sourcePath = window.location.pathname;
    const source = sourcePath.includes('/daily-level')
      ? 'daily_level'
      : sourcePath.includes('/almanac/')
        ? 'almanac'
        : sourcePath.includes('/tools/')
          ? 'tool'
          : 'site';

    trackEvent('almanac_navigation', {
      entity_type: almanacMatch[1] === 'plants' ? 'plant' : 'zombie',
      navigation_source: source,
      site_locale: language
    });
  };

  document.addEventListener('click', handleClick, { capture: true });
  return () => document.removeEventListener('click', handleClick, { capture: true });
}
