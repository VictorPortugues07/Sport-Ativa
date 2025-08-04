document.addEventListener("DOMContentLoaded", () => {
  let produtoAtual = null;
  let produtos = [];

  // Elementos da página
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const produtoContent = document.getElementById("produto-content");
  const quantidadeInput = document.getElementById("quantidade");
  const btnDiminuir = document.getElementById("btn-diminuir");
  const btnAumentar = document.getElementById("btn-aumentar");
  const btnAddCarrinho = document.getElementById("btn-add-carrinho");
  const btnComprarAgora = document.getElementById("btn-comprar-agora");

  // Verificar status de login ao carregar
  verificarStatusLogin();

  // Obter ID do produto da URL
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get("id");

  if (!produtoId) {
    mostrarErro();
    return;
  }

  // Carregar dados do produto
  carregarProduto(produtoId);

  // Event listeners
  btnDiminuir.addEventListener("click", () => {
    const atual = parseInt(quantidadeInput.value);
    if (atual > 1) {
      quantidadeInput.value = atual - 1;
    }
  });

  btnAumentar.addEventListener("click", () => {
    const atual = parseInt(quantidadeInput.value);
    if (atual < 10) {
      quantidadeInput.value = atual + 1;
    }
  });

  btnAddCarrinho.addEventListener("click", () => {
    adicionarAoCarrinho();
  });

  btnComprarAgora.addEventListener("click", () => {
    comprarAgora();
  });

  // Zoom da imagem
  document.getElementById("produto-imagem").addEventListener("click", () => {
    const modalImage = document.getElementById("modal-image");
    modalImage.src = document.getElementById("produto-imagem").src;
    modalImage.alt = document.getElementById("produto-imagem").alt;
    new bootstrap.Modal(document.getElementById("imageZoomModal")).show();
  });

  // Logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuarioLogado");
      verificarStatusLogin();
      atualizarContadorCarrinho();
      alert("Logout realizado com sucesso!");
    });
  }

  // Função para carregar produto
  async function carregarProduto(id) {
    try {
      // Tentar carregar do localStorage primeiro
      const produtosStorage = localStorage.getItem("produtosDisponiveis");
      if (produtosStorage) {
        produtos = JSON.parse(produtosStorage);
        const produto = produtos.find((p) => p.id == id);
        if (produto) {
          exibirProduto(produto);
          carregarProdutosRelacionados(produto);
          return;
        }
      }

      // Se não encontrou no localStorage, tentar carregar do JSON
      const response = await fetch("../pagina-inicial/produtos_ficticios.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      produtos = await response.json();
      localStorage.setItem("produtosDisponiveis", JSON.stringify(produtos));

      const produto = produtos.find((p) => p.id == id);
      if (produto) {
        exibirProduto(produto);
        carregarProdutosRelacionados(produto);
      } else {
        mostrarErro();
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      mostrarErro();
    }
  }

  // Função para exibir produto
  function exibirProduto(produto) {
    produtoAtual = produto;

    // Esconder loading e mostrar conteúdo
    loadingState.classList.add("d-none");
    produtoContent.classList.remove("d-none");

    // Atualizar título da página
    document.title = `${produto.nome} - Sport Ativa`;

    // Atualizar breadcrumb
    document.getElementById("breadcrumb-produto").textContent = produto.nome;

    // Preencher dados do produto
    document.getElementById("produto-imagem").src = produto.imagem;
    document.getElementById("produto-imagem").alt = produto.nome;
    document.getElementById("produto-categoria").textContent =
      produto.categoria;
    document.getElementById("produto-nome").textContent = produto.nome;
    document.getElementById("produto-vendas").textContent = produto.vendas;
    document.getElementById("produto-preco").textContent = `R$ ${produto.preco
      .toFixed(2)
      .replace(".", ",")}`;
    document.getElementById("preco-parcelado").textContent = `R$ ${(
      produto.preco / 12
    )
      .toFixed(2)
      .replace(".", ",")}`;
    document.getElementById("produto-descricao").textContent =
      produto.descricao;
    document.getElementById("produto-marca").textContent = produto.marca;
    document.getElementById("produto-tamanho").textContent = produto.tamanho;
    document.getElementById("produto-cor").textContent = produto.cor;
    document.getElementById("produto-genero").textContent = produto.genero;
    document.getElementById("produto-esporte").textContent = produto.esporte;
    document.getElementById("produto-tipo").textContent = produto.tipo;

    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
  }

  // Função para carregar produtos relacionados
  function carregarProdutosRelacionados(produto) {
    const relacionados = produtos
      .filter(
        (p) =>
          p.id !== produto.id &&
          (p.categoria === produto.categoria ||
            p.marca === produto.marca ||
            p.esporte === produto.esporte)
      )
      .slice(0, 4);

    const container = document.getElementById("produtos-relacionados");
    container.innerHTML = "";

    relacionados.forEach((prod) => {
      const col = document.createElement("div");
      col.className = "col-md-3 col-sm-6 mb-3";

      col.innerHTML = `
                <div class="card related-product-card h-100 shadow-sm">
                    <img src="${prod.imagem}" class="card-img-top" alt="${
        prod.nome
      }" loading="lazy">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${prod.nome}</h6>
                        <p class="card-text text-muted small">${prod.marca}</p>
                        <div class="mt-auto">
                            <p class="related-product-price mb-2">R$ ${prod.preco
                              .toFixed(2)
                              .replace(".", ",")}</p>
                            <button class="btn btn-outline-danger btn-sm w-100" onclick="irParaProduto(${
                              prod.id
                            })">
                                Ver produto
                            </button>
                        </div>
                    </div>
                </div>
            `;

      container.appendChild(col);
    });
  }

  // Função para mostrar erro
  function mostrarErro() {
    loadingState.classList.add("d-none");
    errorState.classList.remove("d-none");
  }

  // Função para verificar status de login
  function verificarStatusLogin() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const naoLogado = document.getElementById("nao-logado");
    const logado = document.getElementById("logado");
    const nomeUsuario = document.getElementById("nome-usuario");

    if (usuarioLogado && usuarioLogado.nome) {
      naoLogado.classList.add("d-none");
      logado.classList.remove("d-none");
      nomeUsuario.textContent = usuarioLogado.nome.split(" ")[0];
    } else {
      naoLogado.classList.remove("d-none");
      logado.classList.add("d-none");
    }
  }

  // Função para obter chave do carrinho
  function obterChaveCarrinho() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.cpf) {
      return null;
    }
    return `carrinho_${usuarioLogado.cpf}`;
  }

  // Função para adicionar ao carrinho
  function adicionarAoCarrinho() {
    const carrinhoKey = obterChaveCarrinho();

    if (!carrinhoKey) {
      alert("Você precisa estar logado para adicionar produtos ao carrinho!");
      window.location.href = "../pagina-login/login.html";
      return;
    }

    if (!produtoAtual) return;

    const quantidade = parseInt(quantidadeInput.value);
    let carrinho = JSON.parse(localStorage.getItem(carrinhoKey)) || [];
    const existe = carrinho.find((item) => item.id == produtoAtual.id);

    if (existe) {
      existe.quantidade += quantidade;
    } else {
      carrinho.push({
        id: produtoAtual.id,
        quantidade: quantidade,
      });
    }

    localStorage.setItem(carrinhoKey, JSON.stringify(carrinho));
    atualizarContadorCarrinho();

    // Feedback visual
    const textoOriginal = btnAddCarrinho.innerHTML;
    btnAddCarrinho.innerHTML =
      '<i class="bi bi-check-circle me-2"></i>Adicionado!';
    btnAddCarrinho.classList.remove("btn-danger");
    btnAddCarrinho.classList.add("btn-success");
    btnAddCarrinho.disabled = true;
    btnAddCarrinho.classList.add("btn-add-animation");

    setTimeout(() => {
      btnAddCarrinho.innerHTML = textoOriginal;
      btnAddCarrinho.classList.remove("btn-success", "btn-add-animation");
      btnAddCarrinho.classList.add("btn-danger");
      btnAddCarrinho.disabled = false;
    }, 2000);

    // Mostrar toast de sucesso
    mostrarToast(`${quantidade}x ${produtoAtual.nome} adicionado ao carrinho!`);
  }

  // Função para comprar agora
  function comprarAgora() {
    const carrinhoKey = obterChaveCarrinho();

    if (!carrinhoKey) {
      alert("Você precisa estar logado para realizar uma compra!");
      window.location.href = "../pagina-login/login.html";
      return;
    }

    // Adicionar ao carrinho e redirecionar
    adicionarAoCarrinho();

    setTimeout(() => {
      window.location.href = "../pagina-carrinho/carrinho.html";
    }, 1000);
  }

  // Função para atualizar contador do carrinho
  function atualizarContadorCarrinho() {
    const carrinhoKey = obterChaveCarrinho();
    const contador = document.getElementById("cart-count");

    if (!contador) return;

    if (!carrinhoKey) {
      contador.textContent = "0";
      contador.style.display = "none";
      return;
    }

    const carrinho = JSON.parse(localStorage.getItem(carrinhoKey)) || [];
    const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    contador.textContent = total;
    contador.style.display = total > 0 ? "inline" : "none";
  }

  // Função para mostrar toast
  function mostrarToast(mensagem) {
    // Criar toast container se não existir
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className =
        "toast-container position-fixed top-0 end-0 p-3";
      toastContainer.style.zIndex = "9999";
      document.body.appendChild(toastContainer);
    }

    // Criar toast
    const toastElement = document.createElement("div");
    toastElement.className =
      "toast align-items-center text-white bg-success border-0";
    toastElement.setAttribute("role", "alert");
    toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

    toastContainer.appendChild(toastElement);

    // Mostrar toast
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: 3000,
    });
    toast.show();

    // Remover toast após fechar
    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
  }

  // Função global para navegar para produto (usada pelos produtos relacionados)
  window.irParaProduto = function (id) {
    window.location.href = `detalheProduto.html?id=${id}`;
  };

  // Validação de quantidade
  quantidadeInput.addEventListener("input", () => {
    let valor = parseInt(quantidadeInput.value);
    if (isNaN(valor) || valor < 1) {
      quantidadeInput.value = 1;
    } else if (valor > 10) {
      quantidadeInput.value = 10;
    }
  });

  // Previnir submissão de formulário no input de quantidade
  quantidadeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });
});
