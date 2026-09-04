import React, { useState } from 'react';
import { getInitial } from '../../utils/stringUtils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  role?: string;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'U',
  role,
  className = '',
  fallbackClassName = '',
  alt = '',
  size = 'md'
}) => {
  const [hasError, setHasError] = useState(false);

  const initial = getInitial(name);

  const isCompany = role === 'company' || role === 'empresa';
  const isTechnician = role === 'technician' || role === 'tecnico';
  const isAdmin = role === 'admin' || role === 'super_admin';

  let gradient = 'from-blue-600 to-indigo-700';
  if (isCompany) {
    gradient = 'from-purple-600 to-slate-900';
  } else if (isAdmin) {
    gradient = 'from-blue-700 to-slate-950';
  } else if (isTechnician) {
    gradient = 'from-blue-600 to-indigo-800';
  }

  let sizeClasses = 'w-10 h-10 text-sm';
  if (size === 'sm') sizeClasses = 'w-8 h-8 text-xs';
  if (size === 'md') sizeClasses = 'w-10 h-10 text-sm';
  if (size === 'lg') sizeClasses = 'w-14 h-14 text-base';
  if (size === 'xl') sizeClasses = 'w-20 h-20 text-2xl';
  if (size === '2xl') sizeClasses = 'w-28 h-28 text-3xl sm:text-4xl';
  if (size === 'custom') sizeClasses = 'w-full h-full text-inherit';

  if (src && !hasError && src.trim().length > 0) {
    return (
      <img
        src={src}
        alt={alt || name}
        onError={() => setHasError(true)}
        className={`object-cover shrink-0 ${size !== 'custom' ? sizeClasses : ''} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center font-black text-white bg-linear-to-br ${gradient} select-none uppercase tracking-wide shadow-xs ${size !== 'custom' ? sizeClasses : ''} ${className} ${fallbackClassName}`}
      title={name}
    >
      {initial}
    </div>
  );
};
