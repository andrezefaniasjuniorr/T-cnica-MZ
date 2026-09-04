/**
 * Utilitários para tratamento seguro de strings e renderização
 * Previne: "Cannot read properties of undefined (reading 'charAt')"
 */

/**
 * Função utilitária para capturar inicial de forma segura
 * @param str String de entrada (nome, role, etc)
 * @returns Primeira letra em maiúscula ou '?' se nulo/inválido
 */
export function getInitial(str?: string | null): string {
  if (!str || typeof str !== 'string') return '?';
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

// Expõe globalmente no window para compatibilidade com scripts inline e legado
if (typeof window !== 'undefined') {
  (window as any).getInitial = getInitial;
}
