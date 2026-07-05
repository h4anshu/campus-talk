'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PLATFORM_NAME } from '@/lib/constants';

const loginSchema = z.object({ password: z.string().min(1, 'Password is required') });
type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error ?? 'Incorrect password');
        return;
      }
      router.push('/admin/approvals');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-[360px] rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/logo.svg" alt={PLATFORM_NAME} className="h-10 w-auto" />
          <h1 className="text-[16px] font-medium text-[var(--text-primary)]">
            {PLATFORM_NAME} <span className="text-[var(--text-muted)]">Admin</span>
          </h1>
          <p className="text-[12px] text-[var(--text-secondary)]">
            Enter the admin password to continue.
          </p>
        </div>

        <div className="mt-5">
          <input
            type="password"
            autoFocus
            placeholder="Password"
            {...register('password')}
            className="w-full rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2.5 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          {errors.password && (
            <p className="mt-1.5 text-[11px] text-[var(--danger)]">{errors.password.message}</p>
          )}
          {serverError && !errors.password && (
            <p className="mt-1.5 text-[11px] text-[var(--danger)]">{serverError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded bg-[var(--accent-fill)] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Log in
        </button>
      </form>
    </div>
  );
}
