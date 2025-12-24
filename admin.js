import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs,getDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7XDh1ZumSGQDsWIrBepRN0nfmkDyS10M",
  authDomain: "iajoias1.firebaseapp.com",
  projectId: "iajoias1",
  storageBucket: "iajoias1.firebasestorage.app",
  messagingSenderId: "543994883960",
  appId: "1:543994883960:web:69e0b198e81f349504a28d",
  measurementId: "G-T7WM1EZPVY"
};

// 🔌 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 🎯 Lógica do envio do formulário
// Referências a elementos do DOM
const productListAdmin = document.getElementById("productListAdmin");
const form = document.getElementById("productForm");
const preview = document.getElementById("preview");
const inputImagem = document.getElementById("imagem");
const productIdInput = document.getElementById("productId");
const cancelEditBtn = document.getElementById("cancelEdit");

// Função para listar produtos no painel admin
async function carregarProdutos(categoriaSelecionada = "") {
  productListAdmin.innerHTML = "Carregando produtos...";

  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    productListAdmin.innerHTML = ""; // limpa lista antes de renderizar

    querySnapshot.forEach(docSnap => {
      const produto = docSnap.data();
          // 🔹 Filtro por categoria
      if (categoriaSelecionada && produto.categoria !== categoriaSelecionada) {
        return; // pula este produto
      }
      const id = docSnap.id;

      // Cria o card/container do produto
      const card = document.createElement("div");
      card.classList.add("admin-product-card");

      // Conteúdo do card com nome, preço, categoria e imagem
      card.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}" style="max-width:100px;">
        <div>
          <strong>${produto.nome}</strong><br>
          R$ ${typeof produto.preco === "number" ? produto.preco.toFixed(2) : "0.00"}<br>
          Categoria: ${produto.categoria}
        </div>
        <div>
          <button data-id="${id}" class="edit-btn">Editar</button>
          <button data-id="${id}" data-img="${produto.imagem}" class="delete-btn">Deletar</button>
        </div>
      `;

      productListAdmin.appendChild(card);
    });

    // Após renderizar, adiciona eventos nos botões
    ativarBotoes();
  } catch (error) {
    productListAdmin.innerHTML = "Erro ao carregar produtos.";
    console.error(error);
  }
}

// Função que adiciona eventos aos botões de editar e deletar
function ativarBotoes() {
  // Botões de editar
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      editarProduto(id);
    });
  });

  // Botões de deletar
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const imagemUrl = btn.getAttribute("data-img");
      deletarProduto(id, imagemUrl);
    });
  });
}

// Função para carregar dados do produto no formulário para edição
async function editarProduto(id) {
  try {
    const docRef = doc(db, "produtos", id);
    const docSnap = await getDoc(docRef); // CORREÇÃO: getDoc para um documento único

    if (!docSnap.exists()) {
      alert("Produto não encontrado");
      return;
    }

    const data = docSnap.data();

    // Preenche o formulário com dados do produto
    productIdInput.value = id;
    form.nome.value = data.nome;
    form.preco.value = data.preco;
    form.categoria.value = data.categoria;
    preview.src = data.imagem;
    preview.style.display = "block";

    // Mostra botão cancelar edição
    cancelEditBtn.style.display = "inline-block";

  } catch (error) {
    console.error("Erro ao carregar produto para edição:", error);
    alert("Erro ao carregar produto para edição");
  }
}

// Função para deletar produto e imagem no Storage
async function deletarProduto(id, imagemUrl) {
  if (!confirm("Tem certeza que deseja deletar este produto?")) return;

  try {
    // Deleta o documento no Firestore
    await deleteDoc(doc(db, "produtos", id));

    // Deleta a imagem do Storage
    if (imagemUrl) {
      const path = extrairPathStorage(imagemUrl);
      if (path) {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
      }
    }

    alert("Produto deletado com sucesso!");
    carregarProdutos(); // Atualiza a lista após deletar
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    alert("Erro ao deletar produto");
  }
}

// Evento submit do formulário para criar ou atualizar produto
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = productIdInput.value; // Se vazio, é criação; senão edição
  const nome = form.nome.value.trim();
if (!nome) {
  alert("Por favor, preencha o nome do produto.");
  return;
}

const preco = parseFloat(form.preco.value);
if (isNaN(preco) || preco <= 0) {
  alert("Por favor, insira um preço válido e maior que zero.");
  return;
}

const categoria = form.categoria.value;
if (!categoria) {
  alert("Por favor, selecione uma categoria.");
  return;
}

const imagemFile = inputImagem.files[0]; // pode ser undefined se não trocar

  try {
    let imageUrl = preview.src; // padrão, a imagem atual exibida no preview

    // Se for um arquivo novo (imagem trocada no input), fazer upload
    if (imagemFile) {
      // Upload nova imagem
      const imageRef = ref(storage, `produtos/${Date.now()}-${imagemFile.name}`);
      await uploadBytes(imageRef, imagemFile);
      imageUrl = await getDownloadURL(imageRef);

      // Se estiver editando, deletar a imagem antiga (se diferente da nova)
      if (id && preview.src && preview.src !== imageUrl) {
        const oldImagePath = extrairPathStorage(preview.src);
        if (oldImagePath) {
          await deleteObject(ref(storage, oldImagePath));
        }
      }
    }

    if (!id) {
      // Criar novo produto
      await addDoc(collection(db, "produtos"), {
        nome,
        preco,
        categoria,
        imagem: imageUrl,
        criadoEm: new Date()
      });
      alert("Produto criado com sucesso!");
    } else {
      // Atualizar produto existente
      const docRef = doc(db, "produtos", id);
      await updateDoc(docRef, {
        nome,
        preco,
        categoria,
        imagem: imageUrl,
        atualizadoEm: new Date()
      });
      alert("Produto atualizado com sucesso!");
    }

    // Limpar formulário e preview
    form.reset();
    preview.src = "";
    preview.style.display = "none";
    productIdInput.value = "";
    cancelEditBtn.style.display = "none";

    // Atualizar lista de produtos
    carregarProdutos();

  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    alert("Erro ao salvar produto.");
  }
});

// Função para cancelar a edição e resetar o formulário
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  preview.src = "";
  preview.style.display = "none";
  productIdInput.value = "";
  cancelEditBtn.style.display = "none";
});

// Função para mostrar prévia da imagem quando o usuário seleciona uma nova
inputImagem.addEventListener("change", () => {
  const file = inputImagem.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
});

// Função para extrair o path correto da URL do Firebase Storage para deletar o arquivo
function extrairPathStorage(url) {
  try {
    // Exemplo de URL do Firebase Storage:
    // https://firebasestorage.googleapis.com/v0/b/seu-bucket.appspot.com/o/produtos%2F123456-nome.jpg?alt=media&token=...
    // Queremos extrair "produtos/123456-nome.jpg"

    const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
    if (!url.startsWith(baseUrl)) return null;

    const parts = url.split("/o/");
    if (parts.length < 2) return null;

    const pathAndParams = parts[1].split("?");
    const encodedPath = pathAndParams[0];
    const path = decodeURIComponent(encodedPath);

    return path; // retorna o caminho correto para usar no ref(storage, path)
  } catch {
    return null;
  }
}

// Inicializa a lista ao carregar o script
document.getElementById("filtroCategoriaAdmin").addEventListener("change", (e) => {
  carregarProdutos(e.target.value);
});

carregarProdutos();