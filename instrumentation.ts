// Required by @sentry/nextjs 10.x: sentry.server.config.ts and
// sentry.edge.config.ts are no longer auto-detected by convention — the SDK
// now requires Sentry.init to run from inside this instrumentation hook's
// register() function, or it silently never initializes on those runtimes.
// (Confirmed via the build's own deprecation warning.) The config files
// themselves are untouched; this just invokes them at the right time.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
