'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Mail } from 'lucide-react';
import { COLLEGE_EMAIL_DOMAIN, PLATFORM_NAME } from '@/lib/constants';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Enter your college email')
    .email('Enter a valid email address')
    .refine((v) => v.toLowerCase().endsWith(COLLEGE_EMAIL_DOMAIN), {
      message: `Only ${COLLEGE_EMAIL_DOMAIN} emails are allowed`,
    }),
});

type LoginForm = z.infer<typeof loginSchema>;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.34a7.2 7.2 0 010-4.68V6.57H1.3a12 12 0 000 10.86l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.57l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = () => {
    setSent(true);
    router.push('/home');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-page)] px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(29,78,216,0.12)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[400px] rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[var(--accent-fill)]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="mt-4 text-[20px] font-medium text-[var(--text-primary)]">
            Welcome to {PLATFORM_NAME}
          </h1>
          <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
            Sign in with your SITM College account
          </p>
        </div>

        <button
          onClick={() => router.push('/home')}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded border-[0.5px] border-[var(--border-med)] bg-transparent py-2.5 text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel)]"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-[11px] text-[var(--text-muted)]">OR</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="email" className="mb-1.5 block text-[12px] text-[var(--text-secondary)]">
            College email
          </label>
          <Input
            id="email"
            type="email"
            placeholder={`you${COLLEGE_EMAIL_DOMAIN}`}
            className="border-[var(--border-med)] bg-[var(--bg-panel)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent)] focus-visible:ring-0"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1.5 text-[11px] text-[var(--danger)]">{errors.email.message}</p>
          )}
          {sent && !errors.email && (
            <p className="mt-1.5 text-[11px] text-[var(--success)]">
              Magic link sent — redirecting...
            </p>
          )}

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-fill)] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Mail className="h-4 w-4" />
            Send magic link
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-[var(--text-muted)]">
          Verified students only · No outsiders
        </p>
      </motion.div>

      <Link
        href="/landing"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[13px] text-[var(--accent)]"
      >
        ← Back to landing
      </Link>
    </div>
  );
}
