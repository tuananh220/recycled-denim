'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/account', label: 'Dashboard', icon: '🏠' },
  { href: '/account/profile', label: 'Profile', icon: '👤' },
  { href: '/account/addresses', label: 'Addresses', icon: '📍' },
  { href: '/account/security', label: 'Security', icon: '🔒' },
  { href: '/account/settings', label: 'Settings', icon: '⚙️' },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Account</h1>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>

          {/* Desktop logout button */}
          <button
            onClick={handleLogout}
            className="hidden md:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className={`md:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <nav className="space-y-2 bg-white rounded-lg p-4 md:bg-transparent md:p-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 md:hidden"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
