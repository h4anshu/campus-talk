import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions — enough for a small forum
  debug: false,
  enabled: process.env.NODE_ENV === 'production',
});
