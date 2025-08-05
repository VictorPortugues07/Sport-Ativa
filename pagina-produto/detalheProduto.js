class DetalheProduto {
  constructor() {
    this.produto = null;
    this.produtos = [];
    this.produtoId = null;
    this.inicializar();
  }

  inicializar() {
    this.produtoId = this.obterIdDaURL();

    if (!this.produtoId) {
      this.mostrarErro();
      return;
    }

    this.carregarProdutos();

    this.configurarEventListeners();

    console.log(`Iniciando página de produto com ID: ${this.produtoId}`);
  }

  obterIdDaURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async carregarProdutos() {
    try {
      const produtosLocal = localStorage.getItem("produtosDisponiveis");

      if (produtosLocal) {
        this.produtos = JSON.parse(produtosLocal);
        this.processarProduto();
      } else {
        const response = await fetch(
          "../pagina-inicial/produtos_ficticios.json"
        );
        if (!response.ok) {
          throw new Error("Falha ao carregar produtos");
        }

        const data = await response.json();
        this.produtos = data;

        localStorage.setItem("produtosDisponiveis", JSON.stringify(data));

        this.processarProduto();
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      this.mostrarErro();
    }
  }

  processarProduto() {
    this.produto = this.produtos.find((p) => p.id == this.produtoId);

    if (!this.produto) {
      this.mostrarErro();
      return;
    }

    this.mostrarDetalhes();

    this.carregarProdutosRelacionados();

    this.ocultarLoading();
  }

  mostrarDetalhes() {
    const produto = this.produto;

    document.title = `${produto.nome} - Sport Ativa`;

    document.getElementById("breadcrumb-produto").textContent = produto.nome;

    const imagemElement = document.getElementById("produto-imagem");
    imagemElement.src = produto.imagem;
    imagemElement.alt = produto.nome;

    document.getElementById("produto-categoria").textContent =
      produto.categoria;
    document.getElementById("produto-nome").textContent = produto.nome;
    document.getElementById("produto-vendas").textContent = produto.vendas;

    const precoFormatado = `R$ ${produto.preco.toFixed(2).replace(".", ",")}`;
    document.getElementById("produto-preco").textContent = precoFormatado;

    const precoParcelado = `R$ ${(produto.preco / 12)
      .toFixed(2)
      .replace(".", ",")}`;
    document.getElementById("preco-parcelado").textContent = precoParcelado;

    document.getElementById("produto-descricao").textContent =
      produto.descricao;

    document.getElementById("produto-marca").textContent = produto.marca;
    document.getElementById("produto-tamanho").textContent = produto.tamanho;
    document.getElementById("produto-cor").textContent = produto.cor;
    document.getElementById("produto-genero").textContent = produto.genero;
    document.getElementById("produto-esporte").textContent = produto.esporte;
    document.getElementById("produto-tipo").textContent = produto.tipo;

    console.log("Detalhes do produto carregados:", produto);
  }

  carregarProdutosRelacionados() {
    const produto = this.produto;

    const relacionados = this.produtos
      .filter(
        (p) =>
          p.id !== produto.id &&
          (p.marca === produto.marca ||
            p.categoria === produto.categoria ||
            p.esporte === produto.esporte)
      )
      .slice(0, 4);

    const container = document.getElementById("produtos-relacionados");
    container.innerHTML = "";

    relacionados.forEach((produtoRel) => {
      const produtoCard = this.criarCardProduto(produtoRel);
      container.appendChild(produtoCard);
    });

    console.log(`${relacionados.length} produtos relacionados carregados`);
  }

  criarCardProduto(produto) {
    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6 mb-3";

    col.innerHTML = `
      <div class="card h-100 product-card" style="cursor: pointer;" onclick="window.location.href='detalheProduto.html?id=${
        produto.id
      }'">
        <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title text-danger">${produto.nome}</h6>
          <p class="card-text small text-muted flex-grow-1">${
            produto.marca
          } • ${produto.tamanho} • ${produto.cor}</p>
          <div class="price-section mt-auto">
            <span class="price text-danger fw-bold">R$ ${produto.preco
              .toFixed(2)
              .replace(".", ",")}</span>
          </div>
        </div>
      </div>
    `;

    return col;
  }

  configurarEventListeners() {
    // Quantidade
    const btnDiminuir = document.getElementById("btn-diminuir");
    const btnAumentar = document.getElementById("btn-aumentar");
    const inputQuantidade = document.getElementById("quantidade");

    btnDiminuir.addEventListener("click", () => {
      const atual = parseInt(inputQuantidade.value);
      if (atual > 1) {
        inputQuantidade.value = atual - 1;
      }
    });

    btnAumentar.addEventListener("click", () => {
      const atual = parseInt(inputQuantidade.value);
      const maximo = parseInt(inputQuantidade.max) || 10;
      if (atual < maximo) {
        inputQuantidade.value = atual + 1;
      }
    });

    document
      .getElementById("btn-add-carrinho")
      .addEventListener("click", () => {
        this.adicionarAoCarrinho();
      });

    document
      .getElementById("btn-comprar-agora")
      .addEventListener("click", () => {
        this.comprarAgora();
      });

    const imagemProduto = document.getElementById("produto-imagem");
    imagemProduto.addEventListener("click", () => {
      this.abrirZoomImagem();
    });

    document.getElementById("produto-imagem").addEventListener("click", () => {
      const modalImage = document.getElementById("modal-image");
      modalImage.src = this.produto.imagem;
      modalImage.alt = this.produto.nome;

      const modal = new bootstrap.Modal(
        document.getElementById("imageZoomModal")
      );
      modal.show();
    });
  }

  adicionarAoCarrinho() {
    if (!this.produto) return;

    const quantidade = parseInt(document.getElementById("quantidade").value);

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const itemExistente = carrinho.find((item) => item.id === this.produto.id);

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      carrinho.push({
        ...this.produto,
        quantidade: quantidade,
      });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    this.atualizarContadorCarrinho();

    this.mostrarFeedbackCarrinho(quantidade);

    console.log(
      `Produto adicionado ao carrinho: ${this.produto.nome} (${quantidade}x)`
    );
  }

  comprarAgora() {
    this.adicionarAoCarrinho();

    window.location.href = "../pagina-carrinho/carrinho.html";
  }

  atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const totalItens = carrinho.reduce(
      (total, item) => total + item.quantidade,
      0
    );

    const contador = document.getElementById("cart-count");
    if (contador) {
      contador.textContent = totalItens;
    }
  }

  mostrarFeedbackCarrinho(quantidade) {
    const btn = document.getElementById("btn-add-carrinho");
    const textoOriginal = btn.innerHTML;

    btn.innerHTML = `<i class="bi bi-check-circle me-2"></i>Adicionado! (${quantidade})`;
    btn.classList.add("btn-success");
    btn.classList.remove("btn-danger");
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = textoOriginal;
      btn.classList.remove("btn-success");
      btn.classList.add("btn-danger");
      btn.disabled = false;
    }, 2000);
  }

  abrirZoomImagem() {
    const modal = new bootstrap.Modal(
      document.getElementById("imageZoomModal")
    );
    const modalImage = document.getElementById("modal-image");
    modalImage.src = this.produto.imagem;
    modalImage.alt = this.produto.nome;
    modal.show();
  }

  mostrarErro() {
    document.getElementById("loading-state").classList.add("d-none");
    document.getElementById("error-state").classList.remove("d-none");
    document.getElementById("produto-content").classList.add("d-none");
  }

  ocultarLoading() {
    document.getElementById("loading-state").classList.add("d-none");
    document.getElementById("error-state").classList.add("d-none");
    document.getElementById("produto-content").classList.remove("d-none");
  }
}

class SistemaAutenticacao {
  constructor() {
    this.usuarioLogado = null;
    this.verificarLogin();
  }

  verificarLogin() {
    const dadosUsuario = localStorage.getItem("usuarioLogado");
    if (dadosUsuario) {
      this.usuarioLogado = JSON.parse(dadosUsuario);
      this.atualizarInterfaceLogado();
    }

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  atualizarInterfaceLogado() {
    if (this.usuarioLogado) {
      document.getElementById("nao-logado").classList.add("d-none");
      document.getElementById("logado").classList.remove("d-none");
      document.getElementById("nome-usuario").textContent =
        this.usuarioLogado.nome;
    }
  }

  logout() {
    localStorage.removeItem("usuarioLogado");
    this.usuarioLogado = null;
    window.location.reload();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DetalheProduto();

  new SistemaAutenticacao();

  atualizarContadorCarrinhoInicial();
});

function atualizarContadorCarrinhoInicial() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const totalItens = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const contador = document.getElementById("cart-count");
  if (contador) {
    contador.textContent = totalItens;
  }
}
