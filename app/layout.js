import './globals.css';
import { Inter } from 'next/font/google';

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
        {children}
      </body>
    </html>
  );
}
