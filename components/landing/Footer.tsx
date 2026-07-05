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
    <footer className="bg-[#05070f] border-t-[0.5px] border-[var(--border)] pt-16 pb-8 text-[var(--text-secondary)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-6 border-y-[0.5px] border-[var(--border)] py-10 sm:grid-cols-4">
          <div className="flex flex-col items-center text-center">
            <Users className="h-6 w-6 text-[var(--accent)] mb-2" />
            <div className="text-[22px] font-bold text-[var(--text-primary)]">
              {formatNumber(stats.students, '12K+')}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Students</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <MessageSquare className="h-6 w-6 text-[var(--accent)] mb-2" />
            <div className="text-[22px] font-bold text-[var(--text-primary)]">
              {formatNumber(stats.discussions, '35K+')}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Discussions</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <Building2 className="h-6 w-6 text-[var(--accent)] mb-2" />
            <div className="text-[22px] font-bold text-[var(--text-primary)]">
              {formatNumber(stats.colleges, '150+')}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Colleges</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <Zap className="h-6 w-6 text-[var(--accent)] mb-2 animate-pulse" />
            <div className="text-[22px] font-bold text-[var(--text-primary)]">
              {formatNumber(stats.dailyPosts, '2.8K+')}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Daily Posts</div>
          </div>
        </div>

        {/* Silhouette Image Banner Overlay */}
        <div className="relative w-full overflow-hidden my-8 select-none pointer-events-none">
          <img
            src="/campus-silhouette.png"
            alt="Campus Silhouette"
            className="w-full h-auto object-cover opacity-35"
            style={{ mixBlendMode: 'screen', filter: 'invert(1) brightness(0.6) contrast(1.2)' }}
          />
        </div>

        {/* Bottom Metadata Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t-[0.5px] border-[var(--border)] text-[11px] text-[var(--text-muted)]">
          {/* Left: Taglines */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>Safe Community</span>
            <span className="text-[var(--border-strong)] font-bold">•</span>
            <span>Student First</span>
            <span className="text-[var(--border-strong)] font-bold">•</span>
            <span>Respect & Be Kind</span>
            <span className="text-[var(--border-strong)] font-bold">•</span>
            <span>Learn Together</span>
          </div>

          {/* Center: Copyright */}
          <div>
            © 2026 CampusTalk. All rights reserved.
          </div>

          {/* Right: Legal links */}
          <div className="flex items-center gap-2">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-[var(--text-secondary)]">Privacy Policy</button>
            <span className="text-[var(--border-strong)] font-bold">•</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-[var(--text-secondary)]">Terms of Service</button>
            <span className="text-[var(--border-strong)] font-bold">•</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-[var(--text-secondary)]">Code of Conduct</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
