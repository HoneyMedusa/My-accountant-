/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import CashUps from './components/CashUps';
import Expenses from './components/Expenses';
import History from './components/History';
import ThemeToggle from './components/ThemeToggle';
import { View, UserProfile } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
        setLoading(false);
      });
      return () => unsubProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userId={user.uid} />;
      case 'stock':
        return <StockManagement userId={user.uid} />;
      case 'cashups':
        return <CashUps userId={user.uid} />;
      case 'expenses':
        return <Expenses userId={user.uid} />;
      case 'history':
        return <History userId={user.uid} />;
      default:
        return <Dashboard userId={user.uid} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9]">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Always, Mobile Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }} 
          businessName={profile?.businessName}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header 
          className="lg:hidden flex items-center justify-between p-4 sticky top-0 z-30 shadow-md"
          style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-extrabold tracking-tighter text-lg uppercase">My Accountant</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-[0.65rem] font-black text-[#0066FF] uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
              {profile?.businessName?.substring(0, 10)}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
