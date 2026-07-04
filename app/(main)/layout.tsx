import Navbar from '@/components/layout/Navbar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import CreatePostDialog from '@/components/post/CreatePostDialog';
import ContactAdminDialog from '@/components/shared/ContactAdminDialog';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)]">
      <Navbar />
      <Breadcrumb />
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
