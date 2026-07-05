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

        {/* Metrics & Silhouette Overlay Container */}
        <div className="relative border-y-[0.5px] border-[var(--border)] min-h-[360px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-between pt-12 pb-6 overflow-hidden mt-8 select-none">
          {/* Background Silhouette */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-end justify-center">
            <img
              src="/campus-silhouette.png"
              alt="Campus Silhouette Background"
              className="w-full h-auto object-cover opacity-85 select-none pointer-events-none"
            />
          </div>

          {/* Stats items on top of background */}
          <div className="relative z-10 w-full grid grid-cols-2 gap-8 sm:grid-cols-4 md:absolute md:top-8 md:left-0 md:right-0 px-6 md:px-12">
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-[var(--text-primary)] leading-none">
                  {formatNumber(stats.students, '12K+')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">Students</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-[var(--text-primary)] leading-none">
                  {formatNumber(stats.discussions, '35K+')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">Discussions</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-[var(--text-primary)] leading-none">
                  {formatNumber(stats.colleges, '150+')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">Colleges</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e1330]/90 backdrop-blur-sm border border-[rgba(77,142,245,0.15)] text-[#4D8EF5] shrink-0">
                <Zap className="h-6 w-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-[var(--text-primary)] leading-none">
                  {formatNumber(stats.dailyPosts, '2.8K+')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">Daily Posts</span>
              </div>
            </div>
          </div>

          {/* Bottom Metadata Bar inside the silhouette base */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t-[0.5px] border-[rgba(255,255,255,0.06)] text-[11px] text-[var(--text-muted)] relative z-10">
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
      </div>
    </footer>
  );
}
