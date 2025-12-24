// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7KDh1ZumSGQDsWIrBepRN0nfmkyDS10M",
  authDomain: "iajoias1.firebaseapp.com",
  projectId: "iajoias1",
  storageBucket: "iajoias1.firebasestorage.app",
  messagingSenderId: "543994883960",
  appId: "1:543994883960:web:69e0b198e81f349504a28d",
  measurementId: "G-T7WM1E7ZPV"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Função para carregar os produtos do Firestore
async function carregarProdutos() {
  const querySnapshot = await getDocs(collection(db, "produtos"));
  const productList = document.getElementById("product-list");
  productList.innerHTML = ""; // limpa produtos antigos

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-category", data.categoria);

    card.innerHTML = `
      <img src="${data.imagem}" alt="${data.nome}">
      <h2>${data.nome}</h2>
      <p>R$ ${data.preco}</p>
      <button class="add-to-cart">Adicionar ao Carrinho</button>
    `;

    // --- ADIÇÃO: evento para carrinho ---
    card.querySelector(".add-to-cart").addEventListener("click", () => {
      adicionarAoCarrinho(data.nome, data.preco, data.imagem);

});

    productList.appendChild(card);
  });

  aplicarFiltro(); // chamada após produtos já inseridos
}

// Ativar filtros após carregar os produtos do Firebase
function aplicarFiltro() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      products.forEach(product => {
        const productCategory = product.getAttribute('data-category');

        if (category === 'todos' || category === productCategory) {
          product.style.display = 'block';
        } else {
          product.style.display = 'none';
        }
      });
    });
  });
}

// Função para salvar produtos no carrinho (localStorage)
function adicionarAoCarrinho(nome, preco, imagem) {
  let carrinho = JSON.parse(localStorage.getItem("cart")) || [];

  carrinho.push({
    nome: nome,
    preco: preco,
    imagem: imagem
  });

  localStorage.setItem("cart", JSON.stringify(carrinho));
  alert("Produto adicionado ao carrinho!");
}



// Chama a função ao carregar a página
carregarProdutos();
