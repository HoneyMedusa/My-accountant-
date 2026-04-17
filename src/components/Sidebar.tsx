import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  History, 
  MessageSquare, 
  LogOut,
  Building2,
  X,
  TrendingDown
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { View } from '../types';
import { cn } from '../lib/utils';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  businessName?: string;
  onClose?: () => void;
}

export default function Sidebar({ currentView, setCurrentView, businessName, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'stock', label: 'WEEKLY STOCK', icon: Package },
    { id: 'cashups', label: 'CASH-UPS', icon: Receipt },
    { id: 'expenses', label: 'EXPENSES', icon: TrendingDown },
    { id: 'history', label: 'REPORTS', icon: History },
  ];

  return (
    <div className="w-64 lg:w-60 flex flex-col h-screen py-8 px-6 gap-8 shadow-2xl lg:shadow-none font-sans" style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}>
      <div className="flex items-center justify-between">
        <div className="logo text-2xl font-black tracking-tighter" style={{ color: 'var(--sidebar-text)' }}>
          MY ACCOUNTANT
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-[#A0A0A0] hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 py-3 text-[0.9rem] font-bold transition-all text-left px-4 rounded-lg",
                currentView === item.id 
                  ? "text-white bg-[#0066FF]" 
                  : "text-[#A0A0A0] hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="text-[0.7rem] text-[#555] font-bold uppercase tracking-wider">
          PRO PLAN • ZAR SUBSCRIPTION
        </div>
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 py-2 text-sm font-bold text-red-500 hover:text-red-400 transition-all text-left"
        >
          <LogOut size={18} />
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
