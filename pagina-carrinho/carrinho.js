document.addEventListener("DOMContentLoaded", () => {
  const listaCarrinho = document.getElementById("tabela-carrinho");
  const subtotalEl = document.getElementById("subtotal");
  const freteEl = document.getElementById("frete");
  const totalEl = document.getElementById("total");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const cartCountEl = document.getElementById("cart-count");

  // Elementos de pagamento
  const radioPagamento = document.querySelectorAll('input[name="pagamento"]');
  const camposCartao = document.getElementById("campos-cartao");

  // Carregar usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuarioLogado) {
    const nomeUsuario = usuarioLogado.nome?.split(" ")[0] || "Usuário";
    document.getElementById("nome-usuario-nav").textContent = nomeUsuario;
  }

  // Carregar carrinho do localStorage
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  // Produtos exemplo (normalmente viria de uma API)
  let produtos = [];

  fetch("../pagina-inicial/produtos_ficticios.json")
    // ou o caminho correto da sua API ou JSON
    .then((res) => res.json())
    .then((data) => {
      produtos = data;
      // Agora que os produtos estão carregados, você pode renderizar ou ativar os botões de "adicionar ao carrinho"
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
      //  renderizarProdutos(produtosFiltrados);
      atualizarContadorCarrinho();

      // ✅ SALVA OS PRODUTOS NO LOCALSTORAGE PARA O CARRINHO USAR
      localStorage.setItem("produtosDisponiveis", JSON.stringify(produtos));
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos:", error);
      produtos = [];
      produtosFiltrados = [...produtos];
      // renderizarProdutos(produtosFiltrados);
      atualizarContadorCarrinho();

      // ✅ Fallback também salvo
      localStorage.setItem(
        "produtosDisponiveis",
        JSON.stringify(produtosFallback)
      );
    });

  // Função para obter produto por ID
  function obterProduto(id) {
    const produtos =
      JSON.parse(localStorage.getItem("produtosDisponiveis")) || [];
    return produtos.find((p) => p.id == id);
  }

  // Função para atualizar contador do carrinho
  function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce(
      (total, item) => total + item.quantidade,
      0
    );
    cartCountEl.textContent = totalItens;
  }

  // Função para renderizar carrinho
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

  // Função para calcular totais
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

  // Função para alterar quantidade
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

  // Função para definir quantidade específica
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

  // Função para remover item
  window.removerItem = function (id) {
    if (confirm("Deseja remover este item do carrinho?")) {
      carrinho = carrinho.filter((item) => item.id !== id);
      salvarCarrinho();
      renderizarCarrinho();
      calcularTotais();
      atualizarContadorCarrinho();
    }
  };

  // Função para salvar carrinho
  function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }

  // Gerenciar formas de pagamento
  radioPagamento.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "cartao") {
        camposCartao.classList.remove("d-none");
      } else {
        camposCartao.classList.add("d-none");
      }
    });
  });

  // Aplicar máscaras nos campos do cartão
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
  // Finalizar compra
  btnFinalizar.addEventListener("click", () => {
    const formaPagamento = document.querySelector(
      'input[name="pagamento"]:checked'
    ).value;

    // Validar campos do cartão se necessário
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

    // Criar pedido
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
    };

    // Salvar pedido no localStorage (ou enviar para backend, se aplicável)
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    // Limpar carrinho
    carrinho = [];
    salvarCarrinho();
    renderizarCarrinho();
    calcularTotais();
    atualizarContadorCarrinho();

    // Redirecionar ou mostrar confirmação
    alert("Compra finalizada com sucesso!");
    window.location.href = "../pagina-usuario/perfilUsuario.html"; // redireciona para a página de pedidos
  });

  // Inicializar a página ao carregar
  renderizarCarrinho();
  calcularTotais();
  atualizarContadorCarrinho();
});
