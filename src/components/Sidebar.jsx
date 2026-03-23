import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Send,
  Blocks,
  Hammer,
  Palette,
  Search,
  Globe,
  Smartphone,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Languages,
} from 'lucide-react';

/**
 * Navigation items configuration.
 * Each entry maps a route path to its icon, translation key, and optional badge.
 */
const navItems = [
  { path: '/', icon: LayoutDashboard, key: 'dashboard' },
  { path: '/exchange', icon: ArrowLeftRight, key: 'exchange' },
  { path: '/transactions', icon: Send, key: 'transactions' },
  { path: '/explorer', icon: Blocks, key: 'explorer' },
  { path: '/mining', icon: Hammer, key: 'mining' },
  { path: '/nft', icon: Palette, key: 'nft' },
  { path: '/forensics', icon: Search, key: 'forensics' },
  { path: '/portal', icon: Globe, key: 'portal' },
  { path: '/mobile-wallet', icon: Smartphone, key: 'mobileWallet' },
];

/**
 * Sidebar navigation component with collapsible state and i18n language toggle.
 * @param {Object} props
 * @param {boolean} props.collapsed - Whether the sidebar is in collapsed state
 * @param {Function} props.onToggle - Callback to toggle collapsed state
 */
export default function Sidebar({ collapsed, onToggle }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  /** Toggles between English and Hebrew, updating document direction. */
  function toggleLanguage() {
    const next = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  }

  return (
    <aside
      className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen bg-slate-900 border-${isRTL ? 'l' : 'r'} border-slate-800 flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber to-emerald flex items-center justify-center shrink-0">
          <Blocks className="w-5 h-5 text-slate-950" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-white whitespace-nowrap">{t('app.title')}</h1>
            <p className="text-[10px] text-slate-500 whitespace-nowrap">{t('app.subtitle')}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ path, icon: Icon, key }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                    isActive
                      ? 'bg-cyber/10 text-cyber'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{t(`nav.${key}`)}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Controls */}
      <div className="border-t border-slate-800 p-2 space-y-1">
        {/* Wallet quick-access */}
        <NavLink
          to="/wallet"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive ? 'bg-emerald/10 text-emerald' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <Wallet className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">{t('nav.wallet')}</span>}
        </NavLink>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors w-full"
          title={i18n.language === 'en' ? 'עברית' : 'English'}
        >
          <Languages className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap">
              {i18n.language === 'en' ? 'עברית' : 'English'}
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px] shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
              <span className="text-xs whitespace-nowrap">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
