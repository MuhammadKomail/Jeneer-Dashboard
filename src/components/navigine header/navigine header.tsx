import React from 'react';
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';

type Tab = {
  label: string;
};

interface HeaderProps {
  title: string;
  trail?: string[]; // breadcrumbs before title
  tabs?: Tab[];
  activeIndex?: number;
  variant?: 'default' | 'compact';
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  showBell?: boolean;
}

export default function NavigineHeader({ title, trail = [], tabs = [], activeIndex = 0, variant = 'default', userName, userRole, avatarUrl, showBell = false }: HeaderProps) {
  const { t } = useTranslation();
  const pathname = usePathname()?.replace(/^\/+/, '') || '';

  const initials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm w-full">
      <div className="w-full px-6 py-3">
        {variant === 'compact' ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0 flex items-center text-sm text-gray-500 whitespace-nowrap overflow-x-auto">
              {trail.map((item, idx) => (
                <div key={item} className="flex items-center">
                  <span className={idx === trail.length - 1 ? 'text-green-600 font-medium' : ''}>{item}</span>
                  {idx < trail.length - 1 && <span className="mx-2 text-gray-400">›</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {showBell && (
                <button type="button" aria-label="Notifications" className="relative text-gray-500 hover:text-gray-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              )}
              {(userName || avatarUrl) && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-700 text-sm">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={userName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials(userName)}</span>
                    )}
                  </div>
                  <div className="leading-tight">
                    {userName && <div className="text-sm text-gray-900">{userName}</div>}
                    {userRole && <div className="text-xs text-gray-500">{userRole}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              {trail.length > 0 && (
                <div className="text-gray-500 text-sm truncate">
                  {trail.join(' › ')} {trail.length ? '› ' : ''}
                  <span className="text-gray-900">{title}</span>
                </div>
              )}
              <h1 className="text-2xl font-semibold text-gray-900 mt-1 truncate">{title}</h1>
            </div>

            {tabs.length > 0 && (
              <nav className="ml-6 flex-1 flex justify-end overflow-x-auto">
                <ul className="flex items-center gap-2">
                  {tabs.map((tab, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <li key={tab.label}>
                        <button
                          className={
                            `px-3 py-1.5 rounded-md text-sm whitespace-nowrap ` +
                            (isActive
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                          }
                          type="button"
                        >
                          {tab.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  );
}