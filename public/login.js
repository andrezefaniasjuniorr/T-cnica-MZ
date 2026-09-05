/**
 * TécnicaMZ Pro - Login Protection & Route Guard (login.js / auth.js)
 * Fluxo completo de CADASTRO e LOGIN com redirecionamento e persistência estrita por tipo de conta.
 */

// 2. AJUSTE NO LOGIN (login.js / auth.js)
async function fazerLogin(email, senha) {
  try {
    const auth = window.auth;
    const db = window.db;
    if (!auth) {
      throw new Error("Módulo de autenticação do Firebase não inicializado.");
    }

    const { signInWithEmailAndPassword } = window.firebaseAuth || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'));
    const { doc, getDoc } = window.firebaseFirestore || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));

    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Busca o perfil gravado no Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // REDIRECIONAMENTO DE LOGIN BASEADO NO TIPO:
      if (userData.tipo === "empresa" || userData.role === "empresa" || userData.role === "company") {
        window.location.replace("painel-empresa.html");
      } else if (userData.tipo === "tecnico" || userData.role === "tecnico" || userData.role === "technician") {
        window.location.replace("painel-tecnico.html");
      } else if (userData.tipo === "cliente" || userData.role === "cliente" || userData.role === "client") {
        window.location.replace("painel-cliente.html");
      } else {
        alert("Tipo de conta inválido ou não cadastrado.");
      }
    } else {
      alert("Perfil de usuário não encontrado no sistema.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Falha ao efetuar login: " + error.message);
  }
}
window.fazerLogin = fazerLogin;

// 3. MANUTENÇÃO DE SESSÃO AUTOMÁTICA (onAuthStateChanged)
(function initAuthWatcher() {
  function startSessionWatcher() {
    const auth = window.auth;
    if (!auth) return;

    auth.onAuthStateChanged(async (user) => {
      // Ignora se estiver no processo de criação de conta
      if (window.isCreatingAccount || window.isRegistering) return;

      if (user) {
        try {
          const firestore = window.firebaseFirestore || (await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'));
          const { doc, getDoc } = firestore;
          const dbInstance = window.db;
          if (!dbInstance) return;

          const userDoc = await getDoc(doc(dbInstance, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Se estiver na tela de login/cadastro ou na raiz, direciona para o painel correto
            const paginaAtual = window.location.pathname;
            if (paginaAtual.includes('login') || paginaAtual.includes('cadastro') || paginaAtual === '/' || paginaAtual.includes('index')) {
              if (userData.tipo === "empresa" || userData.role === "empresa" || userData.role === "company") {
                window.location.replace("painel-empresa.html");
              } else if (userData.tipo === "tecnico" || userData.role === "tecnico" || userData.role === "technician") {
                window.location.replace("painel-tecnico.html");
              } else if (userData.tipo === "cliente" || userData.role === "cliente" || userData.role === "client") {
                window.location.replace("painel-cliente.html");
              }
            }
          }
        } catch (err) {
          console.warn('[login.js] Verificação de sessão:', err);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSessionWatcher);
  } else {
    startSessionWatcher();
  }
})();
