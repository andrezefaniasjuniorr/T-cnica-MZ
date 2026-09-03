import React from 'react';

export interface UserRank {
  title: string;
  badge: string;
  minPoints: number;
  maxPoints: number;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowClass: string;
}

/**
 * Retorna a patente do usuário de acordo com o total de pontos acumulados:
 * - 0 a 100 pts: "Técnico Iniciante" 🛠️
 * - 101 a 500 pts: "Técnico Prático" ⚡
 * - 501 a 1500 pts: "Especialista de Bancada" 🔬
 * - 1501+ pts: "Mestre da Tecnologia" 👑
 */
export function getUserRank(points: number = 0): UserRank {
  const pts = Math.max(0, typeof points === 'number' && !isNaN(points) ? points : 0);

  if (pts <= 100) {
    return {
      title: 'Técnico Iniciante',
      badge: '🛠️',
      minPoints: 0,
      maxPoints: 100,
      colorName: 'slate',
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-200',
      badgeBorder: 'border-slate-200 dark:border-slate-700',
      glowClass: 'shadow-2xs'
    };
  }

  if (pts <= 500) {
    return {
      title: 'Técnico Prático',
      badge: '⚡',
      minPoints: 101,
      maxPoints: 500,
      colorName: 'amber',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeBorder: 'border-amber-300 dark:border-amber-800',
      glowClass: 'shadow-amber-500/10'
    };
  }

  if (pts <= 1500) {
    return {
      title: 'Especialista de Bancada',
      badge: '🔬',
      minPoints: 501,
      maxPoints: 1500,
      colorName: 'blue',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
      badgeText: 'text-blue-800 dark:text-blue-300',
      badgeBorder: 'border-blue-300 dark:border-blue-800',
      glowClass: 'shadow-blue-500/10'
    };
  }

  return {
    title: 'Mestre da Tecnologia',
    badge: '👑',
    minPoints: 1501,
    maxPoints: Infinity,
    colorName: 'purple',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-800 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
    glowClass: 'shadow-purple-500/20'
  };
}

interface UserRankBadgeProps {
  points?: number;
  showPoints?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const UserRankBadge: React.FC<UserRankBadgeProps> = ({
  points = 0,
  showPoints = false,
  size = 'xs',
  className = ''
}) => {
  const rank = getUserRank(points);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-black rounded-full border whitespace-nowrap transition-transform hover:scale-105 ${rank.badgeBg} ${rank.badgeText} ${rank.badgeBorder} ${sizeClasses[size]} ${rank.glowClass} ${className}`}
      title={`Patente: ${rank.title} (${points} pts acumulados)`}
    >
      <span className="shrink-0">{rank.badge}</span>
      <span>{rank.title}</span>
      {showPoints && (
        <span className="opacity-75 font-mono ml-0.5 text-[9px]">({points} pts)</span>
      )}
    </span>
  );
};
