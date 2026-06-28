import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RoleProvider } from '@/components/RoleProvider';

export const metadata: Metadata = {
  title: 'ProductStore',
  description: 'Gestión de productos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <RoleProvider>
          <Navbar />
          <main className="flex-1 bg-slate-50">
            {children}
          </main>
          <Footer />
        </RoleProvider>
      </body>
    </html>
  );
}