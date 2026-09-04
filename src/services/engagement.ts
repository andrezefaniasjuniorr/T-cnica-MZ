/**
 * TécnicaMZ Pro - Sistema Unificado de Engajamento, Ranking e Persistência
 * 
 * Implementação completa para Firestore com suporte a offline persistence,
 * transações atômicas e sincronização em tempo real.
 */
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UserBadges {
  excelente: number;
  util: number;
  tecnico: number;
}

export interface EngagementUserData {
  uid?: string;
  userId?: string;
  name?: string;
  points?: number;
  pontos?: number;
  scoreEngajamento?: number;
  likesCount?: number;
  totalLikes?: number;
  stars?: number;
  badges?: UserBadges;
  [key: string]: any;
}

/**
 * 6. CÁLCULO DE ESTRELAS E RANKING (app.js / Firestore)
 * Atualiza no Firestore: stars = Math.min(5, Math.floor(points / 200))
 */
export async function recalculateUserStarsAndRanking(userId: string): Promise<{ stars: number; points: number }> {
  if (!userId || !db) {
    return { stars: 0, points: 0 };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    let points = 0;
    if (userSnap.exists()) {
      const data = userSnap.data();
      points = typeof data.points === 'number'
        ? data.points
        : (typeof data.pontos === 'number' ? data.pontos : (data.scoreEngajamento || 0));
    } else {
      // Fallback para usuarios/
      const usuarioRef = doc(db, 'usuarios', userId);
      const usuarioSnap = await getDoc(usuarioRef);
      if (usuarioSnap.exists()) {
        const uData = usuarioSnap.data();
        points = typeof uData.points === 'number'
          ? uData.points
          : (typeof uData.pontos === 'number' ? uData.pontos : (uData.scoreEngajamento || 0));
      }
    }

    const calculatedStars = Math.min(5, Math.floor(Math.max(0, points) / 200));

    const updatePayload = {
      stars: calculatedStars,
      updatedAt: serverTimestamp()
    };

    // Atualiza permanentemente no Firestore em users e espelhos
    await updateDoc(userRef, updatePayload).catch(() => {});
    await updateDoc(doc(db, 'usuarios', userId), updatePayload).catch(() => {});
    await updateDoc(doc(db, 'technicians', userId), updatePayload).catch(() => {});

    return { stars: calculatedStars, points };
  } catch (err) {
    console.warn('[Engagement] Erro ao recalcular estrelas e ranking:', err);
    return { stars: 0, points: 0 };
  }
}

/**
 * 6. RETORNA QUERY DO RANKING NACIONAL (app.js / Firestore)
 * Query da coleção 'users' ordenada por 'points' em ordem decrescente (limit 50)
 */
export function getNationalRankingQuery(): Query<DocumentData> | null {
  if (!db) return null;
  try {
    return query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(50)
    );
  } catch (err) {
    console.warn('[Engagement] Erro ao criar query de ranking:', err);
    return null;
  }
}

/**
 * 3. MARCAR COMENTÁRIO ÚTIL / PARABENIZAR (+5 PONTOS) (app.js)
 * - Valida se currentUserId === postAuthorId. Se falso, bloqueia a ação.
 * - Executa Transaction no Firestore:
 *   a) Salva no post: solvedCommentId: commentId
 *   b) Adiciona +5 em points e +1 em badges.util no documento do commentAuthorId no Firestore
 * - Executa recalculateUserStarsAndRanking(commentAuthorId)
 */
export async function markCommentAsUseful(
  postId: string,
  postAuthorId: string,
  commentId: string,
  commentAuthorId: string,
  currentUserId: string
): Promise<{ success: boolean; error?: string; solvedCommentId?: string; pointsAdded?: number }> {
  // 1. Validação estrita de autoria
  if (!currentUserId || currentUserId !== postAuthorId) {
    const errorMsg = 'Ação bloqueada: Apenas o autor da publicação pode marcar um comentário como útil ou resolvido.';
    console.warn('[Engagement]', errorMsg);
    return { success: false, error: errorMsg };
  }

  if (!postId || !commentId || !commentAuthorId || !db) {
    return { success: false, error: 'Parâmetros inválidos para marcar comentário útil.' };
  }

  try {
    const postRef = doc(db, 'mural_posts', postId);
    const commentUserRef = doc(db, 'users', commentAuthorId);

    // 2. Executa Transaction no Firestore
    await runTransaction(db, async (transaction) => {
      // Ler o post
      const postDoc = await transaction.get(postRef);
      // Ler os dados do autor do comentário
      const userDoc = await transaction.get(commentUserRef);

      const currentPoints = userDoc.exists()
        ? (userDoc.data().points ?? userDoc.data().pontos ?? 0)
        : 0;
      const currentBadges = userDoc.exists() && userDoc.data().badges
        ? userDoc.data().badges
        : { excelente: 0, util: 0, tecnico: 0 };

      const newPoints = currentPoints + 5;
      const newBadges: UserBadges = {
        excelente: Number(currentBadges.excelente || 0),
        util: Number(currentBadges.util || 0) + 1,
        tecnico: Number(currentBadges.tecnico || 0)
      };

      // a) Salva no post: solvedCommentId: commentId
      if (postDoc.exists()) {
        transaction.update(postRef, {
          solvedCommentId: commentId,
          comentarioSolucaoId: commentId,
          solucaoAceita: true,
          updatedAt: serverTimestamp()
        });
      }

      // b) Adiciona +5 em points e +1 em badges.util no documento do commentAuthorId
      if (userDoc.exists()) {
        transaction.update(commentUserRef, {
          points: newPoints,
          pontos: newPoints,
          scoreEngajamento: newPoints,
          badges: newBadges,
          updatedAt: serverTimestamp()
        });
      } else {
        // Se ainda não existir documento em users, cria com os dados
        transaction.set(commentUserRef, {
          points: newPoints,
          pontos: newPoints,
          likesCount: 0,
          stars: Math.min(5, Math.floor(newPoints / 200)),
          badges: newBadges,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    });

    // Atualiza coleções espelho secundárias se existirem
    updateDoc(doc(db, 'usuarios', commentAuthorId), {
      points: increment(5),
      pontos: increment(5),
      'badges.util': increment(1),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    updateDoc(doc(db, 'technicians', commentAuthorId), {
      points: increment(5),
      pontos: increment(5),
      'badges.util': increment(1),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    // Atualiza subcoleções de comentários se houver
    updateDoc(doc(db, 'mural_posts', postId, 'comentarios', commentId), {
      isUseful: true,
      solucaoAceita: true,
      updatedAt: serverTimestamp()
    }).catch(() => {});

    // 3. Executa recalculateUserStarsAndRanking(commentAuthorId)
    await recalculateUserStarsAndRanking(commentAuthorId);

    return {
      success: true,
      solvedCommentId: commentId,
      pointsAdded: 5
    };
  } catch (err: any) {
    console.error('[Engagement] Erro na transação de comentário útil:', err);
    return { success: false, error: err?.message || 'Erro ao processar comentário útil.' };
  }
}

/**
 * 4. CORAÇÕES/LIKES UNIFICADOS (STORIES, MURAL, MERCADO) (app.js)
 * - Atualiza no Firestore: adiciona/remove +1 em likesCount e +1 em points no perfil de targetAuthorId
 * - Executa recalculateUserStarsAndRanking(targetAuthorId)
 */
export async function giveHeartOrLike(
  targetAuthorId: string,
  isLiking: boolean = true
): Promise<{ success: boolean; likesCount: number; points: number; error?: string }> {
  if (!targetAuthorId || !db) {
    return { success: false, likesCount: 0, points: 0, error: 'Identificador do autor inválido.' };
  }

  try {
    const userRef = doc(db, 'users', targetAuthorId);

    // Executa via transação para consistência atômica e não permitir valores negativos
    const result = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);

      let currentLikes = 0;
      let currentPoints = 0;
      let currentBadges: UserBadges = { excelente: 0, util: 0, tecnico: 0 };

      if (userSnap.exists()) {
        const data = userSnap.data();
        currentLikes = typeof data.likesCount === 'number'
          ? data.likesCount
          : (typeof data.totalLikes === 'number' ? data.totalLikes : 0);
        currentPoints = typeof data.points === 'number'
          ? data.points
          : (typeof data.pontos === 'number' ? data.pontos : 0);
        if (data.badges) {
          currentBadges = { ...currentBadges, ...data.badges };
        }
      }

      const diff = isLiking ? 1 : -1;
      const newLikes = Math.max(0, currentLikes + diff);
      const newPoints = Math.max(0, currentPoints + diff);

      const updateData = {
        likesCount: newLikes,
        totalLikes: newLikes,
        points: newPoints,
        pontos: newPoints,
        scoreEngajamento: newPoints,
        updatedAt: serverTimestamp()
      };

      if (userSnap.exists()) {
        transaction.update(userRef, updateData);
      } else {
        transaction.set(userRef, {
          ...updateData,
          badges: currentBadges,
          stars: Math.min(5, Math.floor(newPoints / 200))
        }, { merge: true });
      }

      return { likesCount: newLikes, points: newPoints };
    });

    // Atualiza espelhos
    const delta = isLiking ? 1 : -1;
    updateDoc(doc(db, 'usuarios', targetAuthorId), {
      likesCount: increment(delta),
      totalLikes: increment(delta),
      points: increment(delta),
      pontos: increment(delta),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    updateDoc(doc(db, 'technicians', targetAuthorId), {
      likesCount: increment(delta),
      totalLikes: increment(delta),
      points: increment(delta),
      pontos: increment(delta),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    // Recalcular estrelas e ranking
    await recalculateUserStarsAndRanking(targetAuthorId);

    return {
      success: true,
      likesCount: result.likesCount,
      points: result.points
    };
  } catch (err: any) {
    console.warn('[Engagement] Erro ao computar like/coração:', err);
    return { success: false, likesCount: 0, points: 0, error: err?.message };
  }
}

/**
 * 5. REAÇÕES DE BADGES NOS POSTS (app.js)
 * - Salva no Firestore: incrementa badges[reactionType] (+1) e points (+2) no perfil de postAuthorId
 * - Executa recalculateUserStarsAndRanking(postAuthorId)
 */
export async function reactToPost(
  postAuthorId: string,
  reactionType: 'excelente' | 'util' | 'tecnico' | string
): Promise<{ success: boolean; reactionType: string; pointsAdded: number; error?: string }> {
  if (!postAuthorId || !db) {
    return { success: false, reactionType, pointsAdded: 0, error: 'Identificador do autor inválido.' };
  }

  // Normalização do tipo de badge
  const validTypes = ['excelente', 'util', 'tecnico'];
  const normalizedType = (reactionType || '').toLowerCase().trim();
  const safeReaction = validTypes.includes(normalizedType) ? normalizedType : 'util';

  try {
    const userRef = doc(db, 'users', postAuthorId);

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);

      let currentPoints = 0;
      let currentBadges: UserBadges = { excelente: 0, util: 0, tecnico: 0 };

      if (userSnap.exists()) {
        const data = userSnap.data();
        currentPoints = typeof data.points === 'number'
          ? data.points
          : (typeof data.pontos === 'number' ? data.pontos : 0);
        if (data.badges) {
          currentBadges = {
            excelente: Number(data.badges.excelente || 0),
            util: Number(data.badges.util || 0),
            tecnico: Number(data.badges.tecnico || 0)
          };
        }
      }

      const newPoints = currentPoints + 2;
      const updatedBadges: UserBadges = {
        ...currentBadges,
        [safeReaction]: (currentBadges[safeReaction as keyof UserBadges] || 0) + 1
      };

      const updateData = {
        points: newPoints,
        pontos: newPoints,
        scoreEngajamento: newPoints,
        badges: updatedBadges,
        updatedAt: serverTimestamp()
      };

      if (userSnap.exists()) {
        transaction.update(userRef, updateData);
      } else {
        transaction.set(userRef, {
          ...updateData,
          likesCount: 0,
          stars: Math.min(5, Math.floor(newPoints / 200))
        }, { merge: true });
      }
    });

    // Espelha nas outras coleções
    updateDoc(doc(db, 'usuarios', postAuthorId), {
      points: increment(2),
      pontos: increment(2),
      [`badges.${safeReaction}`]: increment(1),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    updateDoc(doc(db, 'technicians', postAuthorId), {
      points: increment(2),
      pontos: increment(2),
      [`badges.${safeReaction}`]: increment(1),
      updatedAt: serverTimestamp()
    }).catch(() => {});

    // Recalcular estrelas e ranking
    await recalculateUserStarsAndRanking(postAuthorId);

    return {
      success: true,
      reactionType: safeReaction,
      pointsAdded: 2
    };
  } catch (err: any) {
    console.warn('[Engagement] Erro ao reagir com badge no post:', err);
    return { success: false, reactionType: safeReaction, pointsAdded: 0, error: err?.message };
  }
}

/**
 * 7. INTERFACE DO PERFIL DO TÉCNICO (UI Component)
 * Retorna HTML compacto que exibe persistentemente:
 * - Estrelas: '⭐'.repeat(userData.stars || 0) + ' (X/5)'
 * - Acumuladores: 🏆 Points, ❤️ Likes, 🔥 Excelente, 💡 Útil, 🛠️ Técnico
 */
export function renderProfileEngagement(userData: EngagementUserData | null | undefined): string {
  if (!userData) return '';

  const starsCount = Math.max(0, Math.min(5, Number(userData.stars ?? Math.floor(((userData.points ?? userData.pontos ?? 0) / 200)))));
  const points = Number(userData.points ?? userData.pontos ?? userData.scoreEngajamento ?? 0);
  const likes = Number(userData.likesCount ?? userData.totalLikes ?? 0);
  const badges: UserBadges = {
    excelente: Number(userData.badges?.excelente ?? 0),
    util: Number(userData.badges?.util ?? 0),
    tecnico: Number(userData.badges?.tecnico ?? 0)
  };

  const starsString = '⭐'.repeat(starsCount) + ` (${starsCount}/5)`;

  return `
<div class="profile-engagement-card bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 text-slate-800 shadow-2xs font-sans">
  <div class="engagement-stars flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
    <div class="flex items-center gap-1">
      <span class="text-sm tracking-tight select-none">${starsString}</span>
    </div>
    <span class="text-[10px] uppercase font-black text-slate-500 tracking-wider">Reputação Verificada</span>
  </div>
  <div class="engagement-accumulators flex flex-wrap items-center gap-1.5 text-xs">
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg font-bold text-[11px]" title="Pontuação total acumulada">
      <span>🏆</span> <strong>${points}</strong> pts
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-rose-100/70 border border-rose-300 text-rose-900 rounded-lg font-bold text-[11px]" title="Curtidas e corações recebidos">
      <span>❤️</span> <strong>${likes}</strong> likes
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-orange-100/70 border border-orange-300 text-orange-900 rounded-lg font-semibold text-[11px]" title="Reações Excelente">
      <span>🔥</span> <strong>${badges.excelente}</strong> Excelente
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100/70 border border-yellow-300 text-yellow-900 rounded-lg font-semibold text-[11px]" title="Comentários e dicas úteis">
      <span>💡</span> <strong>${badges.util}</strong> Útil
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100/70 border border-blue-300 text-blue-900 rounded-lg font-semibold text-[11px]" title="Reconhecimento Técnico">
      <span>🛠️</span> <strong>${badges.tecnico}</strong> Técnico
    </span>
  </div>
</div>
`.trim();
}

// Vincular ao escopo global (window) para compatibilidade nativa com app.js e scripts de página
if (typeof window !== 'undefined') {
  (window as any).TecnicaProEngagement = {
    markCommentAsUseful,
    giveHeartOrLike,
    reactToPost,
    recalculateUserStarsAndRanking,
    getNationalRankingQuery,
    renderProfileEngagement
  };
  (window as any).markCommentAsUseful = markCommentAsUseful;
  (window as any).giveHeartOrLike = giveHeartOrLike;
  (window as any).reactToPost = reactToPost;
  (window as any).recalculateUserStarsAndRanking = recalculateUserStarsAndRanking;
  (window as any).getNationalRankingQuery = getNationalRankingQuery;
  (window as any).renderProfileEngagement = renderProfileEngagement;
}
