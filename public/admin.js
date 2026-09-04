/**
 * TécnicaMZ Pro - Módulo Administrativo (admin.js)
 * Gestão de Usuários, Moderação de Contas e Atribuição do Selo MZ
 */

// 1. Função utilitária para capturar inicial com segurança
function getInitial(str) {
  if (!str || typeof str !== 'string') return '?';
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}
window.getInitial = getInitial;

// 1. Ao renderizar a lista de gestão de usuários:
function renderAdminUserList(usersList) {
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
    `;
  }).join('');
}
window.renderAdminUserList = renderAdminUserList;

// 2. Bloquear / Banir Usuário
async function toggleUserStatus(userId, shouldBan) {
  if (!userId) {
    console.warn('[toggleUserStatus] userId ausente');
    return;
  }

  // Se o serviço TS já estiver registrado globalmente:
  if (window.TecnicaProAdmin && typeof window.TecnicaProAdmin.toggleUserStatus === 'function') {
    return window.TecnicaProAdmin.toggleUserStatus(userId, shouldBan);
  }

  try {
    const firestore = window.firebaseFirestore;
    const dbInstance = window.db;

    if (firestore && dbInstance) {
      const { doc, updateDoc } = firestore;
      const userRef = doc(dbInstance, 'users', userId);
      await updateDoc(userRef, {
        status: shouldBan ? 'banned' : 'active',
        statusConta: shouldBan ? 'bloqueada' : 'ativa',
        updatedAt: new Date().toISOString()
      });
      // Atualizações de espelho opcionais
      updateDoc(doc(dbInstance, 'usuarios', userId), {
        status: shouldBan ? 'banned' : 'active',
        statusConta: shouldBan ? 'bloqueada' : 'ativa',
        updatedAt: new Date().toISOString()
      }).catch(() => {});
      updateDoc(doc(dbInstance, 'technicians', userId), {
        status: shouldBan ? 'banned' : 'active',
        statusConta: shouldBan ? 'bloqueada' : 'ativa',
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    } else {
      // Import dinâmico da CDN se não encontrado
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      if (window.db) {
        const userRef = doc(window.db, 'users', userId);
        await updateDoc(userRef, {
          status: shouldBan ? 'banned' : 'active',
          statusConta: shouldBan ? 'bloqueada' : 'ativa',
          updatedAt: new Date().toISOString()
        });
      }
    }
    alert(shouldBan ? 'Usuário bloqueado com sucesso!' : 'Usuário desbloqueado!');
  } catch (err) {
    console.error('Erro ao alterar status:', err);
    alert('Erro ao alterar status: ' + (err.message || err));
  }
}
window.toggleUserStatus = toggleUserStatus;

// 2. Adicionar / Remover Selo MZ
async function toggleSeloMZ(userId, giveSelo) {
  if (!userId) {
    console.warn('[toggleSeloMZ] userId ausente');
    return;
  }

  // Se o serviço TS já estiver registrado globalmente:
  if (window.TecnicaProAdmin && typeof window.TecnicaProAdmin.toggleSeloMZ === 'function') {
    return window.TecnicaProAdmin.toggleSeloMZ(userId, giveSelo);
  }

  try {
    const firestore = window.firebaseFirestore;
    const dbInstance = window.db;

    if (firestore && dbInstance) {
      const { doc, updateDoc } = firestore;
      const userRef = doc(dbInstance, 'users', userId);
      await updateDoc(userRef, {
        hasSeloMZ: giveSelo,
        temSeloMZ: giveSelo,
        isVerified: giveSelo,
        statusSelo: giveSelo ? 'aprovado' : 'rejeitado',
        seloGrantedAt: giveSelo ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });
      // Atualizações de espelho opcionais
      updateDoc(doc(dbInstance, 'usuarios', userId), {
        hasSeloMZ: giveSelo,
        temSeloMZ: giveSelo,
        isVerified: giveSelo,
        statusSelo: giveSelo ? 'aprovado' : 'rejeitado',
        seloGrantedAt: giveSelo ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
      updateDoc(doc(dbInstance, 'technicians', userId), {
        hasSeloMZ: giveSelo,
        temSeloMZ: giveSelo,
        isVerified: giveSelo,
        statusSelo: giveSelo ? 'aprovado' : 'rejeitado',
        seloGrantedAt: giveSelo ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      }).catch(() => {});
    } else {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      if (window.db) {
        const userRef = doc(window.db, 'users', userId);
        await updateDoc(userRef, {
          hasSeloMZ: giveSelo,
          temSeloMZ: giveSelo,
          isVerified: giveSelo,
          statusSelo: giveSelo ? 'aprovado' : 'rejeitado',
          seloGrantedAt: giveSelo ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        });
      }
    }
    alert(giveSelo ? 'Selo MZ concedido!' : 'Selo MZ removido!');
  } catch (err) {
    console.error('Erro ao alterar Selo MZ:', err);
    alert('Erro ao alterar Selo MZ: ' + (err.message || err));
  }
}
window.toggleSeloMZ = toggleSeloMZ;
