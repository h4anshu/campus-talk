'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Building2,
  Users,
  Calendar,
  Award,
  FileText,
  ShieldAlert,
  LifeBuoy,
  Mail,
  LogIn,
  UserPlus,
  User,
  Bookmark,
  Bell,
  BookOpen,
  Briefcase,
  TrendingUp,
  PlusCircle,
  Zap
} from 'lucide-react';
import { useContactAdminStore } from '@/store/useContactAdminStore';
import { scrollToId } from '@/lib/scroll';

interface LandingStats {
  students: number | null;
  discussions: number | null;
  colleges: number | null;
  dailyPosts: number | null;
}

export default function Footer() {
  const router = useRouter();
  const { openDialog } = useContactAdminStore();
  const [stats, setStats] = useState<LandingStats>({
    students: null,
    discussions: null,
    colleges: null,
    dailyPosts: null,
  });

  useEffect(() => {
    fetch('/api/landing/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats({
          students: data.students,
          discussions: data.discussions,
          colleges: data.colleges,
          dailyPosts: data.dailyPosts,
        });
      })
      .catch((err) => console.error('Failed to load landing stats:', err));
  }, []);

  const formatNumber = (val: number | null, fallback: string) => {
    if (val === null) return fallback;
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return val + '+';
  };

  const handleNavigation = (target: string) => {
    if (target.startsWith('#')) {
      scrollToId(target.slice(1));
    } else {
      router.push(target);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#0A0E1A] text-[var(--text-secondary)]">
      {/* Content: columns + stats, sits above the silhouette in normal flow */}
      <div className="relative z-[2] max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-[18px] font-semibold tracking-tight">CampusTalk</span>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
              Your campus conversations start here. Ask questions, share knowledge and connect with students across colleges.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">Explore</h4>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleNavigation('#topics-section')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Discussions</span>
              </button>
              <button onClick={() => handleNavigation('#how-it-works')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <HelpCircle className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Questions</span>
              </button>
              <button onClick={() => handleNavigation('#features-section')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Building2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Colleges</span>
              </button>
              <button onClick={() => handleNavigation('#spaces-section')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Clubs</span>
              </button>
              <button onClick={() => handleNavigation('#spaces-section')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Events</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Award className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">Resources</h4>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <FileText className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Community Guidelines</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <ShieldAlert className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Code of Conduct</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <LifeBuoy className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Help Center</span>
              </button>
              <button onClick={() => handleNavigation('#how-it-works')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <HelpCircle className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>FAQ</span>
              </button>
              <button onClick={openDialog} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Contact Us</span>
              </button>
            </div>
          </div>

          {/* Column 4: Account */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">Account</h4>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <LogIn className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Sign In</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <UserPlus className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Create Account</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>My Profile</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Bookmark className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Bookmarks</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Bell className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Notifications</span>
              </button>
            </div>
          </div>

          {/* Column 5: For Students */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">For Students</h4>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <BookOpen className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Study Resources</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Briefcase className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Internships</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <Award className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Scholarships</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Placements</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="flex items-center gap-2 text-[12px] transition-colors hover:text-[var(--text-primary)] text-left">
                <PlusCircle className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Start a Club</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 py-6 border-t-[0.5px] border-[var(--border)]">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold text-[var(--text-primary)] leading-none">
                {formatNumber(stats.students, '12K+')}
              </span>
              <span className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Students</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold text-[var(--text-primary)] leading-none">
                {formatNumber(stats.discussions, '35K+')}
              </span>
              <span className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Discussions</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold text-[var(--text-primary)] leading-none">
                {formatNumber(stats.colleges, '150+')}
              </span>
              <span className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Colleges</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold text-[var(--text-primary)] leading-none">
                {formatNumber(stats.dailyPosts, '2.8K+')}
              </span>
              <span className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Daily Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Silhouette zone: night-sky backdrop + campus illustration + bottom bar */}
      <div className="relative w-full h-[280px] overflow-hidden">
        {/* Night sky gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#080E2A,#060810)]" />

        {/* Campus silhouette */}
        <img
          src="/campus-silhouette.svg"
          alt="Campus Silhouette"
          className="pointer-events-none absolute bottom-0 left-0 h-full w-full select-none object-cover object-bottom"
        />

        {/* Top fade blending content above into the silhouette */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-[60px] bg-[linear-gradient(to_bottom,#0A0E1A,transparent)]" />

        {/* Bottom bar, anchored inside the silhouette zone */}
        <div className="absolute bottom-0 left-0 right-0 z-[3] px-6 sm:px-10 lg:px-20 py-4">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 text-[11px] text-white/85">
            {/* Left: Taglines */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span>Safe Community</span>
              <span className="text-white/40 font-bold">•</span>
              <span>Verified Students Only</span>
              <span className="text-white/40 font-bold">•</span>
              <span>College Exclusive</span>
              <span className="text-white/40 font-bold">•</span>
              <span>Free Forever</span>
            </div>

            {/* Center: Copyright */}
            <div>
              © 2026 CampusTalk. All rights reserved.
            </div>

            {/* Right: Legal links */}
            <div className="flex items-center gap-2">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-white">Privacy Policy</button>
              <span className="text-white/40 font-bold">•</span>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-white">Terms of Service</button>
              <span className="text-white/40 font-bold">•</span>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-white">Code of Conduct</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
