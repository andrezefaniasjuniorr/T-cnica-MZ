import { useEffect, useRef } from 'react';

export interface ModalHistoryEntry {
  id: string;
  name: string;
  onClose: () => void;
}

// Pilha global em memória para gerenciar os modais abertos na aplicação
const modalStack: ModalHistoryEntry[] = [];
let isPopstateHandling = false;
let isManualBackPopping = false;
let isListenerInitialized = false;

/**
 * Fecha o modal ativo no topo da pilha (chamado pelo popstate do dispositivo)
 */
export function fecharModalAtivo(): boolean {
  if (modalStack.length === 0) return false;
  isPopstateHandling = true;
  const topModal = modalStack.pop();

  if (topModal && typeof topModal.onClose === 'function') {
    try {
      topModal.onClose();
    } catch (err) {
      console.error('[ModalHistory] Erro ao fechar modal no popstate:', err);
    }
  }
  isPopstateHandling = false;
  return true;
}

/**
 * Registra um modal na pilha e insere um estado na History API do navegador.
 * Formato padrão: window.history.pushState({ activeModal: 'NOME_DO_MODAL' }, '');
 * Retorna uma função de limpeza (cleanup).
 */
export function pushModalHistory(name: string, onClose: () => void): () => void {
  const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const entry: ModalHistoryEntry = { id, name, onClose };

  modalStack.push(entry);

  if (typeof window !== 'undefined' && window.history) {
    try {
      window.history.pushState({ activeModal: name, modalId: id }, '');
    } catch (err) {
      console.warn('[ModalHistory] pushState error:', err);
    }
  }

  // Retorna função para desmontar com segurança se fechado via UI
  return () => {
    const index = modalStack.findIndex(m => m.id === id);
    if (index !== -1) {
      modalStack.splice(index, 1);

      // Se foi fechado pelo usuário via clique (X ou botão) e NÃO por popstate,
      // sincronizamos o histórico do navegador chamando history.back()
      if (!isPopstateHandling && !isManualBackPopping && typeof window !== 'undefined' && window.history) {
        try {
          isManualBackPopping = true;
          window.history.back();
          setTimeout(() => {
            isManualBackPopping = false;
          }, 120);
        } catch {}
      }
    }
  };
}

/**
 * Inicializador da escuta ativa ao evento 'popstate'.
 * Intercepta o botão voltar do dispositivo para fechar apenas o modal ativo.
 */
export function setupModalHistoryListener(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (isListenerInitialized) return () => {};

  const handlePopState = (event: PopStateEvent) => {
    if (isManualBackPopping) {
      // Foi acionado pelo nosso próprio history.back() programático ao fechar via botão (X)
      return;
    }

    if (modalStack.length > 0) {
      // Modal aberto detectado: previne ação padrão e fecha APENAS o modal visível
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
      fecharModalAtivo();
    }
  };

  window.addEventListener('popstate', handlePopState, { capture: true });
  isListenerInitialized = true;

  return () => {
    window.removeEventListener('popstate', handlePopState, { capture: true });
    isListenerInitialized = false;
  };
}

// Auto-inicializa o listener no ambiente do navegador
if (typeof window !== 'undefined') {
  setupModalHistoryListener();
}

/**
 * Retorna true se houver algum modal ativo na pilha
 */
export function hasActiveModals(): boolean {
  return modalStack.length > 0;
}

/**
 * Hook React para registrar automaticamente um modal na pilha de histórico.
 * Quando o modal abre (isOpen = true), insere o estado no histórico.
 * Ao pressionar o botão voltar do celular ou gesto físico, fecha o modal chamando onClose.
 */
export function useModalHistory(isOpen: boolean, modalName: string, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const cleanup = pushModalHistory(modalName, () => {
      onCloseRef.current();
    });

    return () => {
      cleanup();
    };
  }, [isOpen, modalName]);
}

