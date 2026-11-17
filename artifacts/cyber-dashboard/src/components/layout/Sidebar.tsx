import React from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, LayoutDashboard, Monitor, BellRing, LineChart, BrainCircuit, FileText, Settings, UserCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Devices', href: '/devices', icon: Monitor },
    { name: 'Alerts', href: '/alerts', icon: BellRing },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Detection', href: '/detection', icon: BrainCircuit },
    { name: 'Logs', href: '/logs', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <div className="flex flex-col h-screen w-64 border-r border-primary/10 bg-[#0B1220]/95 backdrop-blur-xl flex-shrink-0 z-20 relative">
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center h-20 px-6 border-b border-primary/10 relative z-10">
        <div className="relative flex items-center justify-center w-10 h-10 mr-3">
          <div className="absolute inset-0 bg-primary/20 rounded-xl blur"></div>
          <Shield className="w-7 h-7 text-primary relative z-10" />
        </div>
        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          CyberVault
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative overflow-hidden",
              isActive 
                ? "text-white bg-primary/15 border border-primary/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
            )}>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              )}
              <item.icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-primary/10 relative z-10">
        <div className="flex items-center p-3 rounded-xl bg-[#111827] border border-primary/10 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-[#0B1220] rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>}
            </div>
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Analyst'}</p>
            <p className="text-xs text-primary truncate font-mono">{user?.role || 'Security Team'}</p>
          </div>
          <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};