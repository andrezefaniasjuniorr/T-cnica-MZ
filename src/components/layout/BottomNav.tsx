import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { soundFX } from '../../utils/audio';
import {
  Users,
  ShoppingBag,
  Sliders,
  Sparkles,
  Wrench,
  User,
  LayoutGrid,
  Briefcase
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSaraAi: () => void;
  onOpenMobileMenu?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenSaraAi,
  onOpenMobileMenu
}) => {
  const { isClient, isTechnician } = useAuth();

  // Navigation specifically structured by role with the "Mais" option at the end
  const clientNavItems = [
    { id: 'community', label: 'Mural', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos', icon: Wrench },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'client', label: 'Perfil', icon: User }
  ];

  const technicianNavItems = [
    { id: 'community', label: 'Mural', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos', icon: Wrench },
    { id: 'sara', label: 'Sara IA', icon: Sparkles, isSara: true },
    { id: 'tools', label: 'Ferramentas', icon: Sliders }
  ];

  const baseNavItems = isClient ? clientNavItems : technicianNavItems;

  const handleTabClick = (tabId: string) => {
    soundFX.playClick();
    onNavigateTab(tabId);
  };

  const handleSaraClick = () => {
    soundFX.playClick();
    onOpenSaraAi();
  };

  const handleMoreClick = () => {
    soundFX.playModalOpen();
    if (onOpenMobileMenu) {
      onOpenMobileMenu();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 md:hidden shadow-lg shadow-slate-900/5 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {baseNavItems.map(item => {
          const Icon = item.icon;
          const isSaraItem = (item as any).isSara;
          const isActive = isSaraItem ? false : activeTab === item.id;

          if (isSaraItem) {
            return (
              <button
                key={item.id}
                onClick={handleSaraClick}
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
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[54px] active:scale-95 ${
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

        {/* Botão "Mais" Exclusivo Mobile (@media max-width: 768px) */}
        <button
          onClick={handleMoreClick}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[54px] active:scale-95 text-slate-600 hover:text-blue-600 group"
          title="Mais opções do sistema"
          aria-label="Mais opções"
        >
          <div className="relative">
            <LayoutGrid className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight whitespace-nowrap">Mais</span>
        </button>
      </div>
    </nav>
  );
};
