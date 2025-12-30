import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for Google Analytics 4 integration
 * Handles dynamic script loading and automatic page view tracking
 */
export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Skip initialization in non-production environments
    if (import.meta.env?.MODE !== 'production') {
      console.log('[GA4] Skipping initialization in development mode');
      return;
    }

    const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID;

    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.warn('[GA4] Measurement ID not configured');
      return;
    }

    // Initialize gtag.js if not already done
    if (!window.dataLayer) {
      // Load gtag.js script dynamically
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head?.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false // We'll handle page views manually for better control
      });

      console.log('[GA4] Analytics initialized');
    }

    // Send page_view event on initial load and route changes
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location?.pathname + location?.search,
        page_title: document.title
      });
    }
  }, [location]);
}