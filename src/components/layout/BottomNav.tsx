import React from 'react';
import {
  Users,
  ShoppingBag,
  Sliders,
  Sparkles,
  Wrench,
  Menu
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSaraAi: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenSaraAi
}) => {
  const navItems = [
    { id: 'community', label: 'Feed', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos MZ', icon: Wrench },
    { id: 'sara', label: 'Sara IA', icon: Sparkles, isSara: true },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'tools', label: 'Ferramentas', icon: Sliders }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-1 md:hidden shadow-lg shadow-slate-900/5 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.isSara ? false : activeTab === item.id;

          if (item.isSara) {
            return (
              <button
                key={item.id}
                onClick={onOpenSaraAi}
                className="flex flex-col items-center justify-center p-1 focus:outline-none group active:scale-95 transition-transform"
                title="Assistente Sara IA"
              >
                <div className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/35 ring-4 ring-white group-active:scale-95 transition-transform">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-blue-600 mt-0.5">Sara IA</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigateTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 min-w-[52px] active:scale-95 ${
                isActive
                  ? 'text-blue-600 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.5]' : 'text-slate-500'}`} />
              <span className="text-[10px] mt-0.5 font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
