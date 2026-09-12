import { auth, db, isFirebaseConfigured } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentReference,
  DocumentSnapshot,
  SetOptions
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Resiliently fetch a Firestore document.
 * If the client is offline or establishing connection, retries before returning null gracefully
 * without throwing noisy unhandled console.error exceptions.
 */
export async function safeGetDoc(
  docRef: DocumentReference,
  maxRetries = 2,
  delayMs = 400
): Promise<DocumentSnapshot | null> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const snap = await getDoc(docRef);
      return snap;
    } catch (err: any) {
      const isOffline =
        err?.code === 'unavailable' ||
        err?.message?.includes('offline') ||
        err?.message?.includes('client is offline');

      if (isOffline && i < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
        continue;
      }

      if (isOffline) {
        console.warn(`[Firestore SafeGet] Offline temporário ao buscar ${docRef.path}:`, err?.message);
        return null;
      }

      console.warn(`[Firestore SafeGet] Aviso ao buscar ${docRef.path}:`, err?.message || err);
      return null;
    }
  }
  return null;
}

/**
 * Resiliently write to a Firestore document with merge: true by default.
 */
export async function safeSetDoc(
  docRef: DocumentReference,
  data: any,
  options: SetOptions = { merge: true }
): Promise<boolean> {
  try {
    await setDoc(docRef, data, options);
    return true;
  } catch (err: any) {
    const isOffline =
      err?.code === 'unavailable' ||
      err?.message?.includes('offline') ||
      err?.message?.includes('client is offline');
    if (isOffline) {
      console.warn(`[Firestore SafeSet] Gravação offline em ${docRef.path}, armazenada localmente para sincronização.`);
    } else {
      console.warn(`[Firestore SafeSet] Aviso ao gravar em ${docRef.path}:`, err?.message || err);
    }
    return false;
  }
}

/**
 * Utilitário resiliente para onSnapshot que garante tratamento de erro obrigatório,
 * previne vazamentos de memória e absorve com segurança oscilações de rede.
 */
export function safeOnSnapshot<T = any>(
  targetRef: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const unsub = onSnapshot(
      targetRef,
      (snap: any) => {
        try {
          onNext(snap);
        } catch (callbackErr) {
          console.warn('Erro na execução do callback do ouvinte:', callbackErr);
        }
      },
      (err: any) => {
        console.warn('Erro Firestore ignorado:', err);
        if (onError) {
          try {
            onError(err);
          } catch {
            // no-op
          }
        }
      }
    );

    return () => {
      try {
        if (typeof unsub === 'function') {
          unsub();
        }
      } catch (unsubErr) {
        console.warn('Erro Firestore ignorado:', unsubErr);
      }
    };
  } catch (initErr) {
    console.warn('Erro Firestore ignorado:', initErr);
    return () => {};
  }
}

