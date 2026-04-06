'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Music, 
  Mic, 
  Share2, 
  Save, 
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/recorder', icon: Mic, label: 'Recorder' },
    { href: '/dashboard/library', icon: Save, label: 'Library' },
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
  
  if (loading) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1a] border-r border-[#C9A84C]/20 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
      </aside>
    );
  }
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1a] border-r border-[#C9A84C]/20">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-[#C9A84C]/20">
          <h1 className="text-2xl font-bold text-[#C9A84C]">Arco</h1>
          <p className="text-xs text-[#EEF2FF]/60 mt-1">AI Music Platform</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === href
                  ? 'bg-[#C9A84C] text-[#05080F]'
                  : 'text-[#EEF2FF]/70 hover:bg-[#C9A84C]/10 hover:text-[#EEF2FF]'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-[#C9A84C]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <span className="text-[#C9A84C] text-sm">
                {user?.email?.[0].toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-[#EEF2FF]">{user?.email}</p>
              <p className="text-xs text-[#EEF2FF]/40">User</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}