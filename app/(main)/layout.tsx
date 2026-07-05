import Navbar from '@/components/layout/Navbar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import CreatePostDialog from '@/components/post/CreatePostDialog';
import ContactAdminDialog from '@/components/shared/ContactAdminDialog';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    }).catch((err) => console.error('Failed to update user activity on page load:', err));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)]">
      <Navbar />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="min-w-0 flex-1 pb-14 lg:pb-0">{children}</main>
        <RightSidebar />
      </div>
      <MobileBottomNav />
      <CreatePostDialog />
      <ContactAdminDialog />
    </div>
  );
}
