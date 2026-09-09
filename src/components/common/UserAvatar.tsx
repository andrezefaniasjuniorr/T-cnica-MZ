import React, { useState } from 'react';

interface UserAvatarProps {
  name?: string | null;
  photoURL?: string | null;
  src?: string | null;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  textSize?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Utilizador',
  photoURL,
  src,
  size = 'md',
  className = '',
  textSize
}) => {
  const [imageError, setImageError] = useState(false);
  const effectivePhoto = photoURL || src;

  // Paleta de gradientes elegante e profissional para a inicial do nome
  const getGradientByName = (str: string) => {
    const charCode = str.charCodeAt(0) || 0;
    const gradients = [
      'from-blue-600 to-indigo-700 text-white',
      'from-slate-800 to-slate-950 text-white',
      'from-emerald-600 to-teal-700 text-white',
      'from-amber-500 to-orange-600 text-white',
      'from-indigo-600 to-violet-700 text-white',
      'from-cyan-600 to-blue-700 text-white'
    ];
    return gradients[charCode % gradients.length];
  };

  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  // Dimensões do container por tamanho
  const sizeClasses: Record<string, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl sm:w-18 sm:h-18 sm:text-2xl',
    '2xl': 'w-20 h-20 text-2xl sm:w-24 sm:h-24 sm:text-3xl',
    custom: ''
  };

  // Valida se a URL é uma foto personalizada real enviada pelo usuário
  // Ignora links genéricos de placeholders externos do Unsplash para nunca exibir avatares fakes
  const isGenericPlaceholder = (url: string) => {
    return url.includes('images.unsplash.com/photo-1507003211169') || 
           url.includes('images.unsplash.com/photo-1534528741775') ||
           url.includes('pravatar.cc');
  };

  const hasValidPhoto = Boolean(
    effectivePhoto &&
    typeof effectivePhoto === 'string' &&
    effectivePhoto.trim().length > 0 &&
    !isGenericPlaceholder(effectivePhoto) &&
    !imageError
  );

  const containerClasses = `rounded-full flex items-center justify-center font-black select-none shrink-0 overflow-hidden shadow-2xs ${
    size !== 'custom' ? sizeClasses[size] || sizeClasses.md : ''
  } ${className}`;

  if (hasValidPhoto && effectivePhoto) {
    return (
      <div className={`${containerClasses} bg-slate-100 border border-slate-200`}>
        <img
          src={effectivePhoto}
          alt={name || 'Avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const gradient = getGradientByName(name || 'U');

  return (
    <div
      className={`${containerClasses} bg-gradient-to-br ${gradient} border border-white/20`}
      title={name || 'Usuário'}
    >
      <span className={textSize || ''}>{initial}</span>
    </div>
  );
};
