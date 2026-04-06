'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Mic2, 
  Library, 
  Share2, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/recorder', icon: Mic2, label: 'Recorder' },
    { href: '/dashboard/library', icon: Library, label: 'Library' },
    { href: '/dashboard/shared', icon: Share2, label: 'Shared' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

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
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-[#0A0F1A] to-[#05080F] border-r border-white/5">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E5C46B] flex items-center justify-center shadow-glow">
              <Sparkles size={20} className="text-[#05080F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Arco</h1>
              <p className="text-xs text-white/40 mt-0.5">AI Music Studio</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#C9A84C]/20 to-transparent border-l-2 border-[#C9A84C] text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-[#C9A84C]' : ''} />
                  <span className="font-medium">{label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-[#C9A84C]" />}
              </Link>
            );
          })}
        </nav>
        
        {/* User Section */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E5C46B] flex items-center justify-center">
              <span className="text-[#05080F] font-bold text-sm">
                {user?.email?.[0].toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-white/40 truncate">Premium Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}