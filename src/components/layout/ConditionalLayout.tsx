'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Routes that should not have navbar and footer
  const isAdminRoute = pathname.startsWith('/admin');
  const isCreateAdminRoute = pathname.startsWith('/create-admin');
  const isTestAdminRoute = pathname.startsWith('/test-admin');

  const shouldHideNavbar = isAdminRoute || isCreateAdminRoute || isTestAdminRoute;

  if (shouldHideNavbar) {
    // Admin routes and related pages don't get navbar and footer
    return <>{children}</>;
  }

  // Regular routes get navbar and footer
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
