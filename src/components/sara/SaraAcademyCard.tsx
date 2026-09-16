import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { AcademyArea, AcademyLocalData } from '../../types/academy';
import {
  detectUserArea,
  loadAcademyLocalData,
  computeCourseProgress,
  getMasteryLevelInfo
} from '../../services/saraAcademyService';
import { SaraAcademyModal } from './SaraAcademyModal';

interface SaraAcademyCardProps {
  currentUser: any;
  onAskSara: (promptText: string, contextSummary?: string) => void;
  className?: string;
}

export const SaraAcademyCard: React.FC<SaraAcademyCardProps> = ({
  currentUser,
  onAskSara,
  className = ''
}) => {
  const userId = currentUser?.uid || 'guest';
  const userArea: AcademyArea = useMemo(() => detectUserArea(currentUser), [currentUser]);

  // Carrega os dados locais do técnico (sara_course_local_data)
  const [academyData, setAcademyData] = useState<AcademyLocalData>(() =>
    loadAcademyLocalData(userId, userArea)
  );

  // Estado do Banner Retrátil: expandido por padrão (máx. 70px) ou recolhido para fita mínima (~28px)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('sara_academy_banner_collapsed') === 'true';
    }
    return false;
  });

  // Estado do Modal de Tela Inteira (Abre ao clicar em CONTINUAR CURSO)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Recalcula dados quando o usuário ou área mudar
  useEffect(() => {
    const loaded = loadAcademyLocalData(userId, userArea);
    setAcademyData(loaded);
  }, [userId, userArea]);

  // Alterna recolher / expandir banner
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sara_academy_banner_collapsed', String(next));
      }
      return next;
    });
  };

  // Computa o progresso do curso de A a Z
  const courseProgress = useMemo(
    () => computeCourseProgress(userArea, academyData),
    [userArea, academyData]
  );

  // Nível de Maestria
  const mastery = useMemo(
    () => getMasteryLevelInfo(academyData.xp),
    [academyData.xp]
  );

  return (
    <>
      {/* =================================================================== */}
      {/* BANNER COMPACTO RETRÁTIL NO TOPO DO CHAT (MÁX. 70px DE ALTURA)     */}
      {/* Paleta Oficial: #0A0F1D, #111827, #1E293B, #3B82F6, #10B981, #F59E0B */}
      {/* =================================================================== */}
      <div
        id="sara_academy_compact_banner"
        className={`w-full bg-[#0A0F1D] border-b border-[#1E293B] text-slate-100 transition-all duration-200 select-none ${className}`}
      >
        {isCollapsed ? (
          /* Estado Recolhido: Fita mínima de ~28px */
          <div className="h-7 px-3 flex items-center justify-between text-[11px] bg-[#111827]/90 text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-white truncate">Academia Técnica:</span>
              <span className="text-[#10B981] font-semibold truncate">
                Módulo {courseProgress.currentModuleIndex} de {courseProgress.totalModules} • {courseProgress.overallPercent}%
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2 py-0.5 rounded bg-[#3B82F6] hover:bg-blue-600 text-white font-black text-[10px] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>

              <button
                type="button"
                onClick={toggleCollapse}
                className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Expandir barra"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Estado Expandido: Banner Compacto Retrátil (≤ 70px) */
          <div className="max-h-[70px] px-3 sm:px-4 py-2 bg-gradient-to-r from-[#0A0F1D] via-[#111827] to-[#0A0F1D] flex items-center justify-between gap-2 sm:gap-3">
            {/* Lado Esquerdo: Ícone + Título + Progresso */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                    Minha Academia Técnica
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-[#3B82F6] border border-blue-500/30 uppercase tracking-wider hidden sm:inline">
                    {userArea === 'eletrotecnica' ? 'Padrão IEC' : 'Padrão EN/ISO'}
                  </span>
                </div>

                {/* Progresso Geral */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#94A3B8] font-semibold truncate">
                    Módulo {courseProgress.currentModuleIndex} de {courseProgress.totalModules} •{' '}
                    <span className="text-[#10B981] font-bold">{courseProgress.overallPercent}% Concluído</span>
                  </span>

                  {/* Mini barra verde esmeralda */}
                  <div className="w-14 sm:w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/60 shrink-0">
                    <div
                      className="bg-[#10B981] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${courseProgress.overallPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Direito: Streak + XP + Botão [CONTINUAR CURSO] + Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Streak Diário */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${
                  academyData.streak > 0
                    ? 'bg-amber-500/15 text-[#F59E0B] border border-amber-500/25'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
                title={`${academyData.streak} dias seguidos`}
              >
                <Flame className={`w-3.5 h-3.5 ${academyData.streak > 0 ? 'text-[#F59E0B] fill-amber-500' : 'text-slate-500'}`} />
                <span className="text-[11px]">{academyData.streak}d</span>
              </div>

              {/* XP Acumulado */}
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 text-slate-200 border border-[#1E293B] text-xs font-black">
                <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[11px]">{academyData.xp} XP</span>
              </div>

              {/* Botão Destaque: [CONTINUAR CURSO] */}
              <button
                type="button"
                id="btn_continue_sara_course"
                onClick={() => setIsModalOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 active:scale-95 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="tracking-wide">CONTINUAR CURSO</span>
              </button>

              {/* Botão Recolher/Expandir */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Recolher barra para liberar espaço no chat"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL / GAVETA DE TELA INTEIRA (3 ABAS: ÍNDICE, AULA, TESTE)        */}
      {/* =================================================================== */}
      <SaraAcademyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        userArea={userArea}
        academyData={academyData}
        onUpdateAcademyData={(newData) => setAcademyData(newData)}
        onAskSara={onAskSara}
      />
    </>
  );
};
