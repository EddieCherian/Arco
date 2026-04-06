'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Mic2, Library, Share2, Settings, LogOut, Music, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Studio' },
    { href: '/dashboard/recorder', icon: Mic2, label: 'Recorder' },
    { href: '/dashboard/library', icon: Library, label: 'Library' },
    { href: '/dashboard/shared', icon: Share2, label: 'Shared' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400&display=swap');

    .logo-btn {
      position: fixed; top: 24px; left: 24px; z-index: 60;
      width: 40px; height: 40px; border: 1px solid #C9A84C;
      background: #05080F; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s;
    }
    .logo-btn::before {
      content: ''; position: absolute; inset: 4px; border: 1px solid #C9A84C33;
    }
    .logo-btn:hover { background: #C9A84C12; }

    .overlay {
      position: fixed; inset: 0; z-index: 50;
      background: #05080Fcc; backdrop-filter: blur(4px);
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s;
    }
    .overlay.open { opacity: 1; pointer-events: all; }

    .drawer {
      position: fixed; left: 0; top: 0; height: 100vh; width: 280px;
      background: #05080F; border-right: 1px solid #C9A84C18;
      display: flex; flex-direction: column; z-index: 55;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .drawer.open { transform: translateX(0); }

    .drawer-top {
      padding: 28px 28px 24px;
      border-bottom: 1px solid #C9A84C12;
      display: flex; align-items: center; justify-content: space-between;
    }
    .drawer-logo {
      display: flex; align-items: center; gap: 14px;
    }
    .drawer-logo-mark {
      width: 36px; height: 36px; border: 1px solid #C9A84C;
      display: flex; align-items: center; justify-content: center; position: relative;
      flex-shrink: 0;
    }
    .drawer-logo-mark::before {
      content: ''; position: absolute; inset: 3px; border: 1px solid #C9A84C33;
    }
    .drawer-wordmark {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px; font-weight: 900; letter-spacing: 0.1em;
      text-transform: uppercase; color: #EEF2FF;
    }
    .close-btn {
      width: 32px; height: 32px; border: 1px solid #C9A84C18;
      background: transparent; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #EEF2FF33; transition: color 0.2s, border-color 0.2s;
    }
    .close-btn:hover { color: #EEF2FF99; border-color: #C9A84C44; }

    .drawer-nav {
      flex: 1; padding: 24px 20px; display: flex; flex-direction: column; gap: 4px;
      overflow-y: auto;
    }
    .nav-section-label {
      font-family: 'DM Mono', monospace; font-size: 8px;
      letter-spacing: 0.35em; text-transform: uppercase;
      color: #EEF2FF22; padding: 0 8px; margin-bottom: 8px; margin-top: 4px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 12px; text-decoration: none;
      font-family: 'DM Mono', monospace; font-size: 10px;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: #EEF2FF44; position: relative;
      transition: color 0.2s, background 0.2s;
      border: 1px solid transparent;
    }
    .nav-item:hover { color: #EEF2FF99; background: #C9A84C08; border-color: #C9A84C12; }
    .nav-item.active { color: #C9A84C; background: #C9A84C0A; border-color: #C9A84C20; }
    .nav-item.active::before {
      content: ''; position: absolute; left: -1px; top: 0; bottom: 0;
      width: 2px; background: #C9A84C;
    }
    .nav-item-icon { opacity: 0.7; flex-shrink: 0; }
    .nav-item.active .nav-item-icon { opacity: 1; }

    .drawer-bottom {
      padding: 20px; border-top: 1px solid #C9A84C12;
    }
    .user-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; margin-bottom: 8px;
      border: 1px solid #C9A84C12; background: #C9A84C06;
    }
    .user-avatar {
      width: 32px; height: 32px; border: 1px solid #C9A84C44;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-family: 'Playfair Display', serif; font-size: 14px;
      font-weight: 700; color: #C9A84C;
    }
    .user-info { flex: 1; min-width: 0; }
    .user-name {
      font-family: 'DM Mono', monospace; font-size: 10px;
      letter-spacing: 0.1em; color: #EEF2FF99;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      display: block; margin-bottom: 2px;
    }
    .user-role {
      font-family: 'DM Mono', monospace; font-size: 8px;
      letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; opacity: 0.5;
    }
    .logout-btn {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 10px 12px; background: transparent; border: none; cursor: pointer;
      font-family: 'DM Mono', monospace; font-size: 9px;
      letter-spacing: 0.2em; text-transform: uppercase; color: #EEF2FF22;
      transition: color 0.2s, background 0.2s;
    }
    .logout-btn:hover { color: #ff6666; background: #ff444408; }
  `;

  return (
    <>
      <style>{css}</style>

      {/* Always visible logo button */}
      <button className="logo-btn" onClick={() => setOpen(true)}>
        <Music size={16} color="#C9A84C" />
      </button>

      {/* Backdrop */}
      <div className={`overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-top">
          <div className="drawer-logo">
            <div className="drawer-logo-mark">
              <Music size={14} color="#C9A84C" />
            </div>
            <span className="drawer-wordmark">Arco</span>
          </div>
          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={14} />
          </button>
        </div>

        <nav className="drawer-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={14} className="nav-item-icon" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="drawer-bottom">
          <div className="user-row">
            <div className="user-avatar">
              {user?.email?.[0].toUpperCase() || '?'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.email?.split('@')[0]}</span>
              <span className="user-role">Member</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
