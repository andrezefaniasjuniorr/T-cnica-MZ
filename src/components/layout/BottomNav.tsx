import React, { useEffect } from 'react';
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
  const { currentUser, isClient, isTechnician, isAdmin } = useAuth();

  const roleStr = String(currentUser?.role || '');
  const tipoStr = String(currentUser?.tipoConta || (currentUser as any)?.tipo || (currentUser as any)?.userType || '');

  const isClientUser = Boolean(
    isClient ||
    roleStr === 'cliente' ||
    roleStr === 'client' ||
    tipoStr === 'cliente'
  );

  const isTechnicianUser = Boolean(
    !isClientUser && (
      isTechnician ||
      roleStr === 'technician' ||
      roleStr === 'tecnico' ||
      tipoStr === 'tecnico' ||
      isAdmin
    )
  );

  useEffect(() => {
    const role = isClientUser ? 'cliente' : (currentUser?.role || (isTechnicianUser ? 'tecnico' : 'cliente'));
    if (typeof (window as any).applyRoleBasedUI === 'function') {
      (window as any).applyRoleBasedUI(role);
    } else {
      const btnMais = document.querySelector('[data-nav="mais"]') || document.getElementById('btnMais');
      if (btnMais) {
        (btnMais as HTMLElement).style.display = isClientUser ? 'none' : 'flex';
      }
    }
  }, [currentUser?.role, isClientUser, isTechnicianUser]);

  // Navigation specifically structured by role with the "Mais" option at the end
  const clientNavItems = [
    { id: 'community', label: 'Mural', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos', icon: Wrench },
    { id: 'market', label: 'Mercado', icon: ShoppingBag },
    { id: 'client', label: 'Perfil', icon: User }
  ];

  const technicianNavItems = [
    { id: 'community', label: 'Mural', icon: Users },
    { id: 'technicians_directory', label: 'Técnicos', icon: Briefcase },
    { id: 'sara', label: 'Sara IA', icon: Sparkles, isSara: true },
    { id: 'tools', label: 'Ferramentas', icon: Wrench, elementId: 'btn-nav-ferramentas' }
  ];

  // REQUISITO ESTRITO: Se o usuário for Cliente ou não for Técnico, NUNCA renderizar Sara IA na barra inferior
  const baseNavItems = (isClientUser || !isTechnicianUser)
    ? clientNavItems.filter(item => !(item as any).isSara && item.id !== 'sara')
    : technicianNavItems;

  const handleTabClick = (tabId: string) => {
    soundFX.playClick();
    onNavigateTab(tabId);
  };

  const handleSaraClick = () => {
    if (isClientUser || !isTechnicianUser) return;
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
    <nav className="fixed bottom-0 left-0 right-0 w-full h-16 z-40 bg-white border-t border-slate-200/90 py-1 px-2 md:hidden shadow-lg shadow-slate-900/5 flex items-center">
      <div className="flex items-center justify-around w-full">
        {baseNavItems.map(item => {
          const Icon = item.icon;
          const isSaraItem = (item as any).isSara;
          const isActive = isSaraItem ? false : activeTab === item.id;

          if (isSaraItem) {
            if (isClientUser || !isTechnicianUser) return null;
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
              id={(item as any).elementId || (item.id === 'tools' ? 'btn-nav-ferramentas' : undefined)}
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
          id="btnMais"
          data-nav="mais"
          onClick={handleMoreClick}
          style={{ display: isClient ? 'none' : 'flex' }}
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
