/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-page':     'var(--bg-page)',
        'bg-surface':  'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-panel':    'var(--bg-panel)',
        'accent':      'var(--accent)',
        'accent-fill': 'var(--accent-fill)',
        'accent-dim':  'var(--accent-dim)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        'success':  'var(--success)',
        'warning':  'var(--warning)',
        'danger':   'var(--danger)',
      },
      borderColor: {
        DEFAULT:  'var(--border)',
        'med':    'var(--border-med)',
        'strong': 'var(--border-strong)',
        'accent': 'var(--accent-border)',
        'success':'var(--success-border)',
        'warning':'var(--warning-border)',
        'danger': 'var(--danger-border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        'card': '12px',
      },
      fontSize: {
        'caption': '11px',
        'meta':    '12px',
        'body':    '13px',
        'card-title': '14px',
        'section': '16px',
        'heading': '20px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
