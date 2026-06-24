'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',        label: '홈',   icon: '🏠' },
  { href: '/mission', label: '미션', icon: '🎲' },
  { href: '/map',     label: '지도', icon: '🗺️' },
  { href: '/badges',  label: '기록', icon: '🏅' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-green-100 z-50 safe-area-bottom">
      <ul className="flex items-center justify-around py-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'text-[#4caf6e]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={`text-xl transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {icon}
                </span>
                <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                  {label}
                </span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-[#4caf6e] mt-0.5" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
