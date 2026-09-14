import { useEffect } from 'react';

let lockCount = 0;

/**
 * Hook para bloquear a rolagem do fundo (body scroll lock)
 * quando qualquer Modal, Drawer ou Tela de Perfil for aberta.
 * Define `document.body.style.overflow = 'hidden'` na abertura
 * e restaura `document.body.style.overflow = 'unset'` ao fechar/desmontar.
 */
export function useBodyScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    document.body.style.overflow = 'hidden';

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
