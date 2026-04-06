'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Mic2, Library, Share2, Settings, LogOut, Music } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Crimson+Pro:ital,wght@0,300;0,400&family=DM+Mono:wght@300;400&display=swap');
    .sidebar {
      position: fixed; left: 0; top: 0; height: 100vh;
      background: #05080F; border-right: 1px solid #C9A84C18;
      display: flex; flex-direction: column; z-index: 40;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }
    .sidebar.expanded { width: 288px; }
    .sidebar.collapsed { width: 64px; }
    .sidebar-top {
      padding: 28px 12px 24px;
      border-bottom: 1px solid #C9A84C12;
      display: flex; flex-direction: column; align-items: center;
      transition: padding 0.3s;
    }
    .sidebar.expanded .sidebar-top { padding: 36px 32px 28px; align-items: flex-start; }
    .sidebar-logo-mark {
      width: 40px; height: 40px; border: 1px solid #C9A84C;
      display: flex; align-items: center; justify-content: center;
      position: relative; cursor: pointer; flex-shrink: 0;
      transition: background 0.2s;
    }
    .sidebar-logo-mark:hover { background: #C9A84C12; }
    .sidebar-logo-mark::before {
      content: ''; position: absolute; inset: 4px; border: 1px solid #C9A84C33;
    }
    .sidebar-text {
      overflow: hidden;
      transition: opacity 0.2s, max-height 0.3s;
    }
    .sidebar.expanded .sidebar-text { opacity: 1; max-height: 60px; margin-top: 20px; }
    .sidebar.collapsed .sidebar-text { opacity: 0; max-height: 0; margin-top: 0; pointer-events: none; }
    .sidebar-wordmark {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px; font-weight: 900; letter-spacing: 0.1em;
      text-transform: uppercase; color: #EEF2FF; display: block; margin-bottom: 4px;
      white-space: nowrap;
    }
    .sidebar-tagline {
      font-family: 'DM Mono', monospace; font-size: 9px;
      letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; opacity: 0.6;
      white-space: nowrap;
    }
    .sidebar-nav {
      flex: 1; padding: 28px 12px; display: flex; flex-direction: column; gap: 4px;
      overflow-y: auto; overflow-x: hidden;
      transition: padding 0.3s;
    }
    .sidebar.expanded .sidebar-nav { padding: 28px 24px; }
    .nav-section-label {
      font-family: 'DM Mono', monospace; font-size: 8px;
      letter-spacing: 0.35em; text-transform: uppercase;
      color: #EEF2FF22; padding: 0 8px; margin-bottom: 8px; margin-top: 8px;
      white-space: nowrap; overflow: hidden;
      transition: opacity 0.2s;
    }
    .sidebar.collapsed .nav-section-label { opacity: 0; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 12px; text-decoration: none;
      font-family: 'DM Mono', monospace; font-size: 10px;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: #EEF2FF44; position: relative;
      transition: color 0.2s, background 0.2s, padding 0.3s;
      border: 1px solid transparent; white-space: nowrap;
      justify-content: flex-start;
    }
    .sidebar.collapsed .nav-item { padding: 11px; justify-content: center; }
    .nav-item:hover { color: #EEF2FF99; background: #C9A84C08; border-color: #C9A84C12; }
    .nav-item.active { color: #C9A84C; background: #C9A84C0A; border-color: #C9A84C20; }
    .nav-item.active::before {
      content: ''; position: absolute; left: -1px; top: 0; bottom: 0;
      width: 2px; background: #C9A84C;
    }
    .nav-item-icon { opacity: 0.7; flex-shrink: 0; }
    .nav-item.active .nav-item-icon { opacity: 1; }
    .nav-item-label {
      overflow: hidden; transition: opacity 0.2s, max-width 0.3s;
    }
    .sidebar.expanded .nav-item-label { opacity: 1; max-width: 200px; }
    .sidebar.collapsed .nav-item-label { opacity: 0; max-width: 0; }
    .sidebar-bottom {
      padding: 16px 12px; border-top: 1px solid #C9A84C12;
      transition: padding 0.3s;
    }
    .sidebar.expanded .sidebar-bottom { padding: 24px; }
    .user-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; margin-bottom: 8px;
      border: 1px solid #C9A84C12; background: #C9A84C06;
      overflow: hidden;
      transition: padding 0.3s, justify-content 0.3s;
    }
    .sidebar.collapsed .user-row { justify-content: center; padding: 8px; }
    .user-avatar {
      width: 32px; height: 32px; border: 1px solid #C9A84C44;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      font-family: 'Playfair Display', serif; font-size: 14px;
      font-weight: 700; color: #C9A84C;
    }
    .user-info {
      flex: 1; min-width: 0;
      overflow: hidden; transition: opacity 0.2s, max-width 0.3s;
    }
    .sidebar.expanded .user-info { opacity: 1; max-width: 200px; }
    .sidebar.collapsed .user-info { opacity: 0; max-width: 0; }
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
      transition: color 0.2s, background 0.2s, justify-content 0.3s;
      white-space: nowrap; overflow: hidden;
      justify-content: flex-start;
    }
    .sidebar.collapsed .logout-btn { justify-content: center; }
    .logout-btn:hover { color: #ff6666; background: #ff444408; }
    .logout-label {
      overflow: hidden; transition: opacity 0.2s, max-width 0.3s;
    }
    .sidebar.expanded .logout-label { opacity: 1; max-width: 200px; }
    .sidebar.collapsed .logout-label { opacity: 0; max-width: 0; }
    .sidebar-line {
      position: absolute; right: 0; top: 20%; bottom: 20%;
      width: 1px; background: linear-gradient(180deg, transparent, #C9A84C15, transparent);
      pointer-events: none;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-line" />

        <div className="sidebar-top">
          <div className="sidebar-logo-mark" onClick={() => setCollapsed(!collapsed)}>
            <Music size={16} color="#C9A84C" />
          </div>
          <div className="sidebar-text">
            <span className="sidebar-wordmark">Arco</span>
            <span className="sidebar-tagline">Music Studio</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={14} className="nav-item-icon" />
                <span className="nav-item-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
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
            <span className="logout-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
