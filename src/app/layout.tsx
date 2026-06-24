import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '따랜디 🚲',
  description: '따릉이 랜덤 디펜스 — 랜덤 대여소로 떠나는 서울 자전거 챌린지',
  keywords: ['따릉이', '자전거', '서울', '랜덤', '챌린지', '운동'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4caf6e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="min-h-screen flex flex-col max-w-md mx-auto relative">
        {children}
      </body>
    </html>
  );
}
