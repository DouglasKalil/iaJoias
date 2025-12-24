import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔹 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7KDh1ZumSGQDsWIrBepRN0nfmkyDS10M",
  authDomain: "iajoias1.firebaseapp.com",
  projectId: "iajoias1",
  storageBucket: "iajoias1.firebasestorage.app",
  messagingSenderId: "543994883960",
  appId: "1:543994883960:web:69e0b198e81f349504a28d",
  measurementId: "G-T7WM1EZPVY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function showMessage(message, type) {
  const box = document.getElementById("message-box");
  box.textContent = message;
  box.className = type; // 'success' ou 'error'
  box.style.display = "block";

  // Some automaticamente após 3 segundos
  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}

// 🔹 CADASTRO
document.getElementById("btnCadastro").addEventListener("click", async () => {
  const nome = document.getElementById("cadastroNome").value;
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const tipo = document.getElementById("cadastroTipo").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    const uid = userCredential.user.uid;

    // Salva no Firestore
    await setDoc(doc(db, "usuarios", uid), {
      nome: nome,
      email: email,
      tipo: tipo,
    });

    showMessage("Usuário cadastrado com sucesso!", "success");
  } catch (error) {
    showMessage("Erro no cadastro: " + error.message, "error");
  }
});

// 🔹 LOGIN
document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const uid = userCredential.user.uid;

    // Busca dados no Firestore
    const userDoc = await getDoc(doc(db, "usuarios", uid));

    if (userDoc.exists()) {
      const dados = userDoc.data();
      if (dados.tipo === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.replace = "home.html";
      }
    } else {
      showMessage("Usuário não encontrado no banco de dados.", "error");
    }
  } catch (error) {
    showMessage("Erro no login: " + error.message, "error");
  }
});
