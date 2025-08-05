document.addEventListener("DOMContentLoaded", () => {
  const listaCarrinho = document.getElementById("tabela-carrinho");
  const subtotalEl = document.getElementById("subtotal");
  const freteEl = document.getElementById("frete");
  const totalEl = document.getElementById("total");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const cartCountEl = document.getElementById("cart-count");

  const radioPagamento = document.querySelectorAll('input[name="pagamento"]');
  const camposCartao = document.getElementById("campos-cartao");

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "../pagina-login/login.html";
    return;
  }

  const nomeUsuario = usuarioLogado.nome?.split(" ")[0] || "Usuário";
  document.getElementById("nome-usuario-nav").textContent = nomeUsuario;

  const carrinhoKey = `carrinho_${usuarioLogado.cpf}`;
  const pedidosKey = `pedidos_${usuarioLogado.cpf}`;

  let carrinho = JSON.parse(localStorage.getItem(carrinhoKey)) || [];

  let produtos = [];

  fetch("../pagina-inicial/produtos_ficticios.json")
    .then((res) => res.json())
    .then((data) => {
      produtos = data;
      renderizarCarrinho();
      calcularTotais();
    })
    .catch((err) => {
      console.error("Erro ao carregar produtos:", err);
    });

  fetch("../pagina-inicial/produtos_ficticios.json")
    .then((res) => res.json())
    .then((data) => {
      produtos = data;
      produtosFiltrados = [...produtos];
      atualizarContadorCarrinho();

      localStorage.setItem("produtosDisponiveis", JSON.stringify(produtos));
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos:", error);
      produtos = [];
      produtosFiltrados = [...produtos];
      atualizarContadorCarrinho();

      localStorage.setItem(
        "produtosDisponiveis",
        JSON.stringify(produtosFallback)
      );
    });

  function obterProduto(id) {
    const produtos =
      JSON.parse(localStorage.getItem("produtosDisponiveis")) || [];
    return produtos.find((p) => p.id == id);
  }

  function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce(
      (total, item) => total + item.quantidade,
      0
    );
    cartCountEl.textContent = totalItens;
  }

  function renderizarCarrinho() {
    if (carrinho.length === 0) {
      listaCarrinho.innerHTML = `
        <div class="carrinho-vazio">
          <i class="bi bi-cart-x"></i>
          <h4>Seu carrinho está vazio</h4>
          <p>Adicione produtos para continuar suas compras</p>
          <a href="../pagina-inicial/paginaInicial.html" class="btn btn-danger">
            <i class="bi bi-arrow-left me-2"></i>Continuar Comprando
          </a>
        </div>
      `;
      btnFinalizar.disabled = true;
      return;
    }

    let html = "";
    carrinho.forEach((item) => {
      const produto = obterProduto(item.id);
      if (!produto) return;

      html += `
        <div class="item-carrinho" data-id="${item.id}">
          <div class="row align-items-center">
            <div class="col-md-2 col-3 text-center">
              <img src="${produto.imagem}" alt="${
        produto.nome
      }" class="produto-img">
            </div>
            <div class="col-md-4 col-9">
              <h6 class="produto-nome">${produto.nome}</h6>
              <div class="produto-preco">R$ ${produto.preco
                .toFixed(2)
                .replace(".", ",")}</div>
            </div>
            <div class="col-md-3 col-6 mt-2 mt-md-0">
              <div class="d-flex align-items-center justify-content-center gap-2">
                <button class="btn-quantidade" onclick="alterarQuantidade(${
                  item.id
                }, -1)">
                  <i class="bi bi-dash"></i>
                </button>
                <input type="number" class="input-quantidade" value="${
                  item.quantidade
                }" min="1" 
                       onchange="definirQuantidade(${item.id}, this.value)">
                <button class="btn-quantidade" onclick="alterarQuantidade(${
                  item.id
                }, 1)">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>
            <div class="col-md-2 col-4 text-center mt-2 mt-md-0">
              <div class="fw-bold text-danger">
                R$ ${(produto.preco * item.quantidade)
                  .toFixed(2)
                  .replace(".", ",")}
              </div>
            </div>
            <div class="col-md-1 col-2 text-center mt-2 mt-md-0">
              <button class="btn-remover" onclick="removerItem(${
                item.id
              })" title="Remover item">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    listaCarrinho.innerHTML = html;
    btnFinalizar.disabled = false;
  }

  function calcularTotais() {
    const subtotal = carrinho.reduce((total, item) => {
      const produto = obterProduto(item.id);
      return produto ? total + produto.preco * item.quantidade : total;
    }, 0);

    const frete = subtotal > 0 ? 15.0 : 0;
    const total = subtotal + frete;

    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
    freteEl.textContent =
      subtotal >= 200 ? "Grátis" : `R$ ${frete.toFixed(2).replace(".", ",")}`;
    totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  }

  window.alterarQuantidade = function (id, delta) {
    const item = carrinho.find((item) => item.id === id);
    if (item) {
      item.quantidade += delta;
      if (item.quantidade <= 0) {
        removerItem(id);
        return;
      }
      salvarCarrinho();
      renderizarCarrinho();
      calcularTotais();
      atualizarContadorCarrinho();
    }
  };

  window.definirQuantidade = function (id, quantidade) {
    const item = carrinho.find((item) => item.id === id);
    if (item) {
      item.quantidade = Math.max(1, parseInt(quantidade) || 1);
      salvarCarrinho();
      renderizarCarrinho();
      calcularTotais();
      atualizarContadorCarrinho();
    }
  };

  window.removerItem = function (id) {
    if (confirm("Deseja remover este item do carrinho?")) {
      carrinho = carrinho.filter((item) => item.id !== id);
      salvarCarrinho();
      renderizarCarrinho();
      calcularTotais();
      atualizarContadorCarrinho();
    }
  };

  function salvarCarrinho() {
    localStorage.setItem(carrinhoKey, JSON.stringify(carrinho));
  }

  radioPagamento.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "cartao") {
        camposCartao.classList.remove("d-none");
      } else {
        camposCartao.classList.add("d-none");
      }
    });
  });

  const numeroCartao = document.getElementById("numero-cartao");
  const validade = document.getElementById("validade");
  const cvv = document.getElementById("cvv");

  numeroCartao.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    e.target.value = value;
  });

  validade.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
  });

  cvv.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
  });

  btnFinalizar.addEventListener("click", () => {
    const formaPagamento = document.querySelector(
      'input[name="pagamento"]:checked'
    ).value;

    if (formaPagamento === "cartao") {
      const numero = numeroCartao.value.replace(/\s/g, "");
      const val = validade.value;
      const cvvVal = cvv.value;
      const nome = document.getElementById("nome-cartao").value;

      if (!numero || numero.length < 16 || !val || !cvvVal || !nome) {
        alert("Por favor, preencha todos os campos do cartão.");
        return;
      }
    }

    const subtotal = carrinho.reduce((total, item) => {
      const produto = obterProduto(item.id);
      return produto ? total + produto.preco * item.quantidade : total;
    }, 0);

    const frete = subtotal >= 200 ? 0 : 15.0;
    const total = subtotal + frete;

    const pedido = {
      id: Date.now(),
      data: new Date().toISOString(),
      itens: carrinho.map((item) => ({
        ...item,
        produto: obterProduto(item.id),
      })),
      subtotal,
      frete,
      total,
      pagamento: formaPagamento,
      status: "Pendente",
      usuarioCpf: usuarioLogado.cpf,
    };

    let pedidos = JSON.parse(localStorage.getItem(pedidosKey)) || [];
    pedidos.push(pedido);
    localStorage.setItem(pedidosKey, JSON.stringify(pedidos));

    carrinho = [];
    salvarCarrinho();
    renderizarCarrinho();
    calcularTotais();
    atualizarContadorCarrinho();

    alert("Compra finalizada com sucesso!");
    window.location.href = "../pagina-pedido/pedido.html";
  });

  // Logout
  document.getElementById("btn-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Deseja realmente sair?")) {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "../pagina-login/login.html";
    }
  });

  renderizarCarrinho();
  calcularTotais();
  atualizarContadorCarrinho();
});
