function carregarCarrinho() {
  let carrinho = JSON.parse(localStorage.getItem("cart")) || [];
  const cartList = document.getElementById("cart-list");
  const cartTotal = document.getElementById("cart-total");

  cartList.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    total += item.preco;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.imagem}" width="50">
      <span>${item.nome}</span>
      <span>R$ ${item.preco.toFixed(2)}</span>
      <button class="remove-btn" onclick="removerItem(${index})">❌</button>
    `;
    cartList.appendChild(div);
  });

  cartTotal.innerText = `Total: R$ ${total.toFixed(2)}`;
}

function removerItem(index) {
  let carrinho = JSON.parse(localStorage.getItem("cart")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(carrinho));
  carregarCarrinho();
}

// Abre o modal ao clicar no botão
document.getElementById("checkout-btn").addEventListener("click", () => {
  let carrinho = JSON.parse(localStorage.getItem("cart")) || [];
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  document.getElementById("checkoutModal").style.display = "flex"; // 👈 só abre no clique
});

// Fecha o modal
function fecharModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

// Fecha ao clicar fora do conteúdo
window.addEventListener("click", function(event) {
  const modal = document.getElementById("checkoutModal");
  if (event.target === modal) {
    fecharModal();
  }
});


// Mostrar endereço se for entrega
document.getElementById("deliveryOption").addEventListener("change", function() {
  if (this.value === "entrega") {
    document.getElementById("addressField").style.display = "block";
  } else {
    document.getElementById("addressField").style.display = "none";
  }
});

function sendOrder() {
  let carrinho = JSON.parse(localStorage.getItem("cart")) || [];

  let deliveryOption = document.getElementById("deliveryOption").value;
  let address = document.getElementById("deliveryAddress").value;
  let paymentOption = document.getElementById("paymentOption").value;

  let mensagem = "🛒 Olá, gostaria de finalizar o pedido:\n\n";

  carrinho.forEach(item => {
    mensagem += `${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
  });

  let total = carrinho.reduce((acc, item) => acc + item.preco, 0);
  mensagem += `\n💰 Total: R$ ${total.toFixed(2)}\n\n`;

  mensagem += `📌 Opção: ${deliveryOption}\n`;
  if (deliveryOption === "entrega") {
    mensagem += `📍 Endereço: ${address}\n`;
  }
  mensagem += `💳 Pagamento: ${paymentOption}\n`;

  let url = `https://wa.me/5591985749728?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
  fecharModal();
}

carregarCarrinho();
