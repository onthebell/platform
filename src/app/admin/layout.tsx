import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/firebase/auth';
import { ThemeProvider } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-white">
              {/* Navbar is deliberately omitted here */}
              <main className="flex-1">{children}</main>
              {/* Footer is also removed for admin pages */}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
