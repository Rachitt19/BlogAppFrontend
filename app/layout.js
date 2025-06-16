import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StorySphere - Share Your Stories',
  description: 'Where stories come alive and communities connect through shared experiences',
  keywords: 'blog, stories, community, sharing, technology, culture, music',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}