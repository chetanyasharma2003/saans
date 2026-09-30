import { captureMessage } from './errorTracking';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  navigationTiming: PerformanceNavigationTiming;
}

let metrics: Partial<PerformanceMetrics> = {};

export const initPerformanceMonitoring = () => {
  // Measure Core Web Vitals
  if ('web-vital' in window) {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals');

    getCLS((metric) => {
      metrics.cls = metric.value;
      sendMetrics();
    });

    getFID((metric) => {
      metrics.fid = metric.value;
      sendMetrics();
    });

    getFCP((metric) => {
      metrics.fcp = metric.value;
      sendMetrics();
    });

    getLCP((metric) => {
      metrics.lcp = metric.value;
      sendMetrics();
    });

    getTTFB((metric) => {
      metrics.ttfb = metric.value;
      sendMetrics();
    });
  }

  // Navigation Timing
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            metrics.navigationTiming = entry as PerformanceNavigationTiming;
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.error('Performance Observer error:', e);
    }
  }
};

const sendMetrics = () => {
  // Check if all metrics are collected
  if (metrics.fcp && metrics.lcp && metrics.fid && metrics.cls) {
    const message = `Performance Metrics - FCP: ${metrics.fcp?.toFixed(2)}ms, LCP: ${metrics.lcp?.toFixed(2)}ms, FID: ${metrics.fid?.toFixed(2)}ms, CLS: ${metrics.cls?.toFixed(2)}`;
    captureMessage(message, 'info');
  }
};

// API Performance Tracking
interface APICall {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

const apiMetrics: APICall[] = [];
const MAX_METRICS = 100;

export const trackAPIPerformance = (
  url: string,
  method: string,
  duration: number,
  status: number
) => {
  const call: APICall = {
    url,
    method,
    duration,
    status,
    timestamp: Date.now(),
  };

  apiMetrics.push(call);

  // Keep only latest 100 calls
  if (apiMetrics.length > MAX_METRICS) {
    apiMetrics.shift();
  }

  // Log slow API calls (>1s)
  if (duration > 1000) {
    captureMessage(
      `Slow API: ${method} ${url} took ${duration}ms`,
      'warning'
    );
  }
};

export const getMetrics = () => ({
  coreVitals: metrics,
  apiMetrics,
});

// Register Service Worker for offline capability
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};
