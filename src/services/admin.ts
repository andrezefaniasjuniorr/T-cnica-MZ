/**
 * TécnicaMZ Pro - Ações de Gestão Administrativa no Firestore (admin.ts / admin.js / app.js)
 * 
 * 1. Tratamento seguro de strings para evitar erro "Cannot read properties of undefined (reading 'charAt')"
 * 2. Ações administrativas no Firestore:
 *    - toggleUserStatus(userId, shouldBan)
 *    - toggleSeloMZ(userId, giveSelo)
 *    - renderAdminUserList(usersList)
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getInitial } from '../utils/stringUtils';

export { getInitial };

export interface AdminUserItem {
  id?: string;
  uid?: string;
  name?: string;
  displayName?: string;
  email?: string;
  role?: string;
  tipoConta?: string;
  status?: string;
  statusConta?: string;
  hasSeloMZ?: boolean;
  temSeloMZ?: boolean;
  statusSelo?: string;
  [key: string]: any;
}

/**
 * 1. Renderiza lista de gestão de usuários em HTML (compatível com views dinâmicas e legadas)
 * Aplica getInitial e fallbacks seguros para evitar crashes em campos nulos ou indefinidos
 */
export function renderAdminUserList(usersList: AdminUserItem[]): string {
  if (!Array.isArray(usersList)) return '';

  return usersList.map(user => {
    const userId = user.id || user.uid || '';
    const userName = user.name || user.displayName || 'Usuário Sem Nome';
    const userEmail = user.email || 'Sem email';
    const userRole = user.role || user.tipoConta || 'cliente';
    const isBanned = user.status === 'banned' || user.status === 'blocked' || user.statusConta === 'bloqueada';
    const hasSelo = user.hasSeloMZ === true || user.temSeloMZ === true || user.statusSelo === 'aprovado';

    return `
      <div class="admin-user-card" data-id="${userId}">
        <div class="user-avatar-circle">${getInitial(userName)}</div>
        <div class="user-info">
          <h4>${userName}</h4>
          <p>${userEmail} • <span class="badge">${String(userRole).toUpperCase()}</span></p>
        </div>
        <div class="admin-actions">
          <button onclick="toggleUserStatus('${userId}', ${!isBanned})">
            ${isBanned ? 'Desbanir' : 'Bloquear/Banir'}
          </button>
          <button onclick="toggleSeloMZ('${userId}', ${!hasSelo})">
            ${hasSelo ? 'Remover Selo' : 'Conceder Selo'}
          </button>
        </div>
      </div>
    `.trim();
  }).join('\n');
}

/**
 * 2. Bloquear / Banir Usuário no Firestore
 * @param userId ID do documento do usuário
 * @param shouldBan true para banir/bloquear, false para reativar
 */
export async function toggleUserStatus(userId: string, shouldBan: boolean): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.warn('[toggleUserStatus] ID do usuário não fornecido.');
    return { success: false, error: 'ID do usuário não fornecido.' };
  }

  try {
    const nowIso = new Date().toISOString();
    const statusValue = shouldBan ? 'banned' : 'active';
    const statusContaValue = shouldBan ? 'bloqueada' : 'ativa';

    if (db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: statusValue,
        statusConta: statusContaValue,
        updatedAt: nowIso
      });

      // Espelha nas coleções auxiliares se existirem
      try {
        await updateDoc(doc(db, 'usuarios', userId), {
          status: statusValue,
          statusConta: statusContaValue,
          updatedAt: nowIso
        });
      } catch {}

      try {
        await updateDoc(doc(db, 'technicians', userId), {
          status: statusValue,
          statusConta: statusContaValue,
          updatedAt: nowIso
        });
      } catch {}

      try {
        await updateDoc(doc(db, 'companies', userId), {
          status: statusValue,
          statusConta: statusContaValue,
          updatedAt: nowIso
        });
      } catch {}
    }

    const message = shouldBan ? 'Usuário bloqueado com sucesso!' : 'Usuário desbloqueado!';
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao alterar status:', err);
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert('Erro ao alterar status do usuário: ' + (err.message || err));
    }
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * 2. Adicionar / Remover Selo MZ no Firestore
 * @param userId ID do documento do usuário
 * @param giveSelo true para conceder o selo MZ, false para remover
 */
export async function toggleSeloMZ(userId: string, giveSelo: boolean): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.warn('[toggleSeloMZ] ID do usuário não fornecido.');
    return { success: false, error: 'ID do usuário não fornecido.' };
  }

  try {
    const nowIso = new Date().toISOString();
    const seloGrantedAt = giveSelo ? nowIso : null;
    const statusSelo = giveSelo ? 'aprovado' : 'rejeitado';

    if (db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        hasSeloMZ: giveSelo,
        temSeloMZ: giveSelo,
        isVerified: giveSelo,
        statusSelo,
        seloGrantedAt,
        updatedAt: nowIso
      });

      // Espelha nas coleções auxiliares
      try {
        await updateDoc(doc(db, 'usuarios', userId), {
          hasSeloMZ: giveSelo,
          temSeloMZ: giveSelo,
          isVerified: giveSelo,
          statusSelo,
          seloGrantedAt,
          updatedAt: nowIso
        });
      } catch {}

      try {
        await updateDoc(doc(db, 'technicians', userId), {
          hasSeloMZ: giveSelo,
          temSeloMZ: giveSelo,
          isVerified: giveSelo,
          statusSelo,
          seloGrantedAt,
          updatedAt: nowIso
        });
      } catch {}

      try {
        await updateDoc(doc(db, 'companies', userId), {
          hasSeloMZ: giveSelo,
          temSeloMZ: giveSelo,
          isVerified: giveSelo,
          statusSelo,
          seloGrantedAt,
          updatedAt: nowIso
        });
      } catch {}
    }

    const message = giveSelo ? 'Selo MZ concedido!' : 'Selo MZ removido!';
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao alterar Selo MZ:', err);
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert('Erro ao alterar Selo MZ: ' + (err.message || err));
    }
    return { success: false, error: err.message || String(err) };
  }
}

// Expõe globalmente no window para compatibilidade com onclick inline no HTML
if (typeof window !== 'undefined') {
  (window as any).getInitial = getInitial;
  (window as any).renderAdminUserList = renderAdminUserList;
  (window as any).toggleUserStatus = toggleUserStatus;
  (window as any).toggleSeloMZ = toggleSeloMZ;
}
