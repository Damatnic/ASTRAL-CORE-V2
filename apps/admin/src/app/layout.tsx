import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import './globals.css';
import { AdminProvider } from '../providers/AdminProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ASTRAL CORE Admin Dashboard',
  description: 'Crisis Intervention Administration Panel',
  robots: 'noindex, nofollow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}