import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - OnTheBell',
  description: 'Administration panel for OnTheBell',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar is deliberately omitted here */}
      {children}
      {/* Footer is also removed for admin pages */}
    </div>
  );
}
