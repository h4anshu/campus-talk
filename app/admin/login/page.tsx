'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import { MOCK_ADMIN_PASSWORD } from '@/lib/mock/admin';
import { useAdminSessionStore } from '@/store/useAdminSessionStore';
import { Input } from '@/components/ui/input';

const adminLoginSchema = z.object({
  password: z
    .string()
    .min(1, 'Enter the admin password')
    .refine((v) => v === MOCK_ADMIN_PASSWORD, { message: 'Incorrect password' }),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminSessionStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = () => {
    login();
    router.push('/admin/approvals');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-page)] px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(29,78,216,0.12)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[380px] rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[var(--accent-fill)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <h1 className="mt-4 text-[20px] font-medium text-[var(--text-primary)]">Admin Access</h1>
          <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
            Restricted to CampusVoice administrators
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6">
          <label htmlFor="password" className="mb-1.5 block text-[12px] text-[var(--text-secondary)]">
            Admin password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border-[var(--border-med)] bg-[var(--bg-panel)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent)] focus-visible:ring-0"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1.5 text-[11px] text-[var(--danger)]">{errors.password.message}</p>
          )}

          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-fill)] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Lock className="h-4 w-4" />
            Submit
          </button>
        </form>
      </motion.div>

      <Link
        href="/landing"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[13px] text-[var(--accent)]"
      >
        ← Back to CampusVoice
      </Link>
    </div>
  );
}
