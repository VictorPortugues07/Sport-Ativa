// ===== BUSCA COM DROPDOWN DE RESULTADOS =====

class BuscaDropdown {
  constructor() {
    this.inputBusca = document.querySelector('input[type="search"]');
    this.formBusca = document.querySelector('form[role="search"]');
    this.produtos = [];
    this.dropdownAtivo = false;
    this.indiceSelecionado = -1;

    this.inicializar();
  }

  inicializar() {
    if (!this.inputBusca || !this.formBusca) return;

    // Carregar produtos do localStorage ou fetch
    this.carregarProdutos();

    // Event listeners
    this.inputBusca.addEventListener("input", (e) => this.aoDigitar(e));
    this.inputBusca.addEventListener("keydown", (e) => this.aoTeclar(e));
    this.inputBusca.addEventListener("focus", (e) => this.aoFocar(e));
    this.inputBusca.addEventListener("blur", (e) => this.aoDesfocar(e));

    // Prevenir submit do formulário
    this.formBusca.addEventListener("submit", (e) => {
      e.preventDefault();
      this.selecionarItem();
    });

    // Clique fora fecha dropdown
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".busca-container")) {
        this.fecharDropdown();
      }
    });

    console.log("✅ Busca com dropdown inicializada");
  }

  carregarProdutos() {
    // Tentar pegar do localStorage primeiro
    const produtosLocal = localStorage.getItem("produtosDisponiveis");
    if (produtosLocal) {
      this.produtos = JSON.parse(produtosLocal);
      return;
    }

    // Se não tiver, fazer fetch (ajustado para funcionar em qualquer página)
    const isHomePage = window.location.pathname.includes("paginaInicial.html");
    const jsonPath = isHomePage
      ? "produtos_ficticios.json"
      : "../pagina-inicial/produtos_ficticios.json";

    fetch(jsonPath)
      .then((res) => res.json())
      .then((data) => {
        this.produtos = data;
        localStorage.setItem("produtosDisponiveis", JSON.stringify(data));
      })
      .catch((err) => {
        console.log("Produtos não carregados:", err);
        // Fallback: tentar o outro caminho
        const fallbackPath = isHomePage
          ? "../pagina-inicial/produtos_ficticios.json"
          : "produtos_ficticios.json";
        fetch(fallbackPath)
          .then((res) => res.json())
          .then((data) => {
            this.produtos = data;
            localStorage.setItem("produtosDisponiveis", JSON.stringify(data));
          })
          .catch((err2) => console.log("Fallback também falhou:", err2));
      });
  }

  aoDigitar(e) {
    const termo = e.target.value.trim();

    if (termo.length < 2) {
      this.fecharDropdown();
      return;
    }

    const resultados = this.buscarProdutos(termo);
    this.mostrarDropdown(resultados, termo);
  }

  aoTeclar(e) {
    if (!this.dropdownAtivo) return;

    const itens = document.querySelectorAll(".dropdown-item-busca");

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.indiceSelecionado = Math.min(
          this.indiceSelecionado + 1,
          itens.length - 1
        );
        this.destacarItem();
        break;

      case "ArrowUp":
        e.preventDefault();
        this.indiceSelecionado = Math.max(this.indiceSelecionado - 1, -1);
        this.destacarItem();
        break;

      case "Enter":
        e.preventDefault();
        this.selecionarItem();
        break;

      case "Escape":
        this.fecharDropdown();
        this.inputBusca.blur();
        break;
    }
  }

  aoFocar(e) {
    const termo = e.target.value.trim();
    if (termo.length >= 2) {
      const resultados = this.buscarProdutos(termo);
      this.mostrarDropdown(resultados, termo);
    }
  }

  aoDesfocar(e) {
    // Delay para permitir clique nos itens
    setTimeout(() => {
      this.fecharDropdown();
    }, 200);
  }

  buscarProdutos(termo) {
    if (this.produtos.length === 0) return [];

    const termoLower = termo.toLowerCase();
    const resultados = [];

    // Buscar em diferentes campos com pesos diferentes
    this.produtos.forEach((produto) => {
      let relevancia = 0;
      let match = false;

      // Nome do produto (peso mais alto)
      if (produto.nome.toLowerCase().includes(termoLower)) {
        relevancia += produto.nome.toLowerCase().startsWith(termoLower)
          ? 10
          : 5;
        match = true;
      }

      // Marca (peso médio)
      if (produto.marca.toLowerCase().includes(termoLower)) {
        relevancia += produto.marca.toLowerCase().startsWith(termoLower)
          ? 8
          : 3;
        match = true;
      }

      // Tipo/Categoria (peso baixo)
      if (produto.tipo.toLowerCase().includes(termoLower)) {
        relevancia += 2;
        match = true;
      }

      // Descrição (peso muito baixo)
      if (produto.descricao.toLowerCase().includes(termoLower)) {
        relevancia += 1;
        match = true;
      }

      if (match) {
        resultados.push({
          ...produto,
          relevancia,
        });
      }
    });

    // Ordenar por relevância e limitar resultados
    return resultados.sort((a, b) => b.relevancia - a.relevancia).slice(0, 8);
  }

  mostrarDropdown(resultados, termo) {
    this.fecharDropdown();

    if (resultados.length === 0) {
      this.mostrarSemResultados(termo);
      return;
    }

    const container = this.inputBusca.parentElement;
    container.style.position = "relative";

    const dropdown = document.createElement("div");
    dropdown.className =
      "dropdown-busca position-absolute w-100 bg-white border rounded-bottom shadow-lg";
    dropdown.style.top = "100%";
    dropdown.style.zIndex = "1050";
    dropdown.style.maxHeight = "400px";
    dropdown.style.overflowY = "auto";

    // Header do dropdown
    const header = document.createElement("div");
    header.className = "dropdown-header-busca p-2 border-bottom bg-light";
    header.innerHTML = `
      <small class="text-muted">
        <i class="bi bi-search me-1"></i>
        ${resultados.length} produto(s) encontrado(s)
      </small>
    `;
    dropdown.appendChild(header);

    // Itens dos produtos
    resultados.forEach((produto, index) => {
      const item = this.criarItemDropdown(produto, termo, index);
      dropdown.appendChild(item);
    });

    // Footer com ação
    const footer = document.createElement("div");
    footer.className =
      "dropdown-footer-busca p-2 border-top bg-light text-center";
    footer.innerHTML = `
      <small class="text-muted">
        Pressione <kbd>Enter</kbd> para ver todos os resultados
      </small>
    `;
    dropdown.appendChild(footer);

    container.appendChild(dropdown);
    this.dropdownAtivo = true;
    this.indiceSelecionado = -1;
  }

  criarItemDropdown(produto, termo, index) {
    const item = document.createElement("div");
    item.className =
      "dropdown-item-busca p-3 border-bottom cursor-pointer d-flex align-items-center";
    item.style.cursor = "pointer";
    item.dataset.index = index;
    item.dataset.produtoId = produto.id;

    // Destacar termo no nome
    const nomeDestacado = this.destacarTermo(produto.nome, termo);
    const marcaDestacada = this.destacarTermo(produto.marca, termo);

    item.innerHTML = `
      <div class="produto-thumb me-3">
        <img src="${produto.imagem}" alt="${produto.nome}" 
             style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
      </div>
      <div class="produto-info flex-grow-1">
        <div class="produto-nome fw-semibold">${nomeDestacado}</div>
        <div class="produto-details d-flex justify-content-between align-items-center">
          <small class="text-muted">${marcaDestacada} • ${produto.tamanho} • ${
      produto.cor
    }</small>
          <span class="produto-preco fw-bold text-danger">R$ ${produto.preco
            .toFixed(2)
            .replace(".", ",")}</span>
        </div>
      </div>
      <div class="produto-actions ms-2">
        <i class="bi bi-arrow-return-left text-muted"></i>
      </div>
    `;

    // Event listeners - IMPORTANTE: Clique no produto vai para a página de detalhes
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.navegarParaProduto(produto);
    });

    item.addEventListener("mouseenter", () => {
      this.indiceSelecionado = index;
      this.destacarItem();
    });

    return item;
  }

  destacarTermo(texto, termo) {
    if (!termo) return texto;
    const regex = new RegExp(`(${termo})`, "gi");
    return texto.replace(regex, '<mark class="bg-warning">$1</mark>');
  }

  mostrarSemResultados(termo) {
    const container = this.inputBusca.parentElement;
    container.style.position = "relative";

    const dropdown = document.createElement("div");
    dropdown.className =
      "dropdown-busca position-absolute w-100 bg-white border rounded-bottom shadow-lg";
    dropdown.style.top = "100%";
    dropdown.style.zIndex = "1050";

    dropdown.innerHTML = `
      <div class="p-4 text-center">
        <i class="bi bi-search text-muted fs-1 mb-3"></i>
        <div class="text-muted">
          <div class="mb-2">Nenhum produto encontrado para</div>
          <div class="fw-bold">"${termo}"</div>
          <small class="mt-2 d-block">Tente termos como "nike", "camiseta" ou "azul"</small>
        </div>
      </div>
    `;

    container.appendChild(dropdown);
    this.dropdownAtivo = true;
  }

  destacarItem() {
    // Remover destaque anterior
    document.querySelectorAll(".dropdown-item-busca").forEach((item) => {
      item.classList.remove("active");
      item.style.backgroundColor = "";
    });

    // Destacar item atual
    if (this.indiceSelecionado >= 0) {
      const itemAtivo = document.querySelector(
        `[data-index="${this.indiceSelecionado}"]`
      );
      if (itemAtivo) {
        itemAtivo.classList.add("active");
        itemAtivo.style.backgroundColor = "#f8f9fa";
        itemAtivo.scrollIntoView({ block: "nearest" });
      }
    }
  }

  selecionarItem() {
    if (this.indiceSelecionado >= 0) {
      const itemSelecionado = document.querySelector(
        `[data-index="${this.indiceSelecionado}"]`
      );
      if (itemSelecionado) {
        const produtoId = itemSelecionado.dataset.produtoId;
        const produto = this.produtos.find((p) => p.id == produtoId);
        if (produto) {
          this.navegarParaProduto(produto);
          return;
        }
      }
    }

    // Se não tem item selecionado, fazer busca geral
    const termo = this.inputBusca.value.trim();
    if (termo) {
      this.irParaBusca(termo);
    }
  }

  // NOVA FUNÇÃO: Método dedicado para navegar para a página do produto
  navegarParaProduto(produto) {
    this.fecharDropdown();

    // Determinar o caminho correto baseado na página atual
    const currentPath = window.location.pathname;
    let targetPath;

    if (currentPath.includes("paginaInicial.html")) {
      // Está na página inicial
      targetPath = `../pagina-produto/detalheProduto.html?id=${produto.id}`;
    } else if (currentPath.includes("pagina-produto")) {
      // Já está na pasta de produto
      targetPath = `detalheProduto.html?id=${produto.id}`;
    } else {
      // Está em outra página (login, carrinho, etc.)
      targetPath = `../pagina-produto/detalheProduto.html?id=${produto.id}`;
    }

    console.log(`🔗 Navegando para: ${targetPath}`);
    console.log(`📦 Produto selecionado:`, produto);

    // Navegar para a página do produto
    window.location.href = targetPath;
  }

  selecionarProduto(produto) {
    // Mantido para compatibilidade, mas agora chama o novo método
    this.navegarParaProduto(produto);
  }

  irParaBusca(termo) {
    this.fecharDropdown();

    if (window.location.pathname.includes("paginaInicial.html")) {
      // Já está na página inicial, aplicar busca
      if (typeof aplicarFiltros === "function") {
        termoBusca = termo.toLowerCase();
        aplicarFiltros();
      }
    } else {
      // Ir para página inicial com busca
      window.location.href = `../pagina-inicial/paginaInicial.html?search=${encodeURIComponent(
        termo
      )}`;
    }
  }

  fecharDropdown() {
    const dropdown = document.querySelector(".dropdown-busca");
    if (dropdown) {
      dropdown.remove();
    }
    this.dropdownAtivo = false;
    this.indiceSelecionado = -1;
  }
}

// ===== ESTILOS CSS (Adicionar ao CSS) =====
const estilosDropdown = `
<style>
.dropdown-busca {
  border-top: none !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

.dropdown-item-busca:hover {
  background-color: #ffffffff !important;
}

.dropdown-item-busca.active {
  background-color: #dbc6c6ff !important;
}

.dropdown-item-busca:last-child {
  border-bottom: none !important;
}

.produto-thumb img {
  border: 1px solid #040404ff;
}

mark.bg-warning {
  background-color: #b72424ff !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

kbd {
  background-color: #ebecedff;
  border: 1px solid #efefefff;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 0.8em;
}

.dropdown-busca::-webkit-scrollbar {
  width: 6px;
}

.dropdown-busca::-webkit-scrollbar-track {
  background: #fdf9f9ff;
}

.dropdown-busca::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.dropdown-busca::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.busca-container {
  position: relative;
}

.form-control:focus + .dropdown-busca {
  border-color: #dc3545;
}
</style>
`;

// Adicionar estilos ao head se ainda não existirem
if (!document.querySelector("#busca-dropdown-styles")) {
  const styleElement = document.createElement("style");
  styleElement.id = "busca-dropdown-styles";
  styleElement.innerHTML = estilosDropdown.replace(/<\/?style>/g, "");
  document.head.appendChild(styleElement);
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  // Adicionar classe container ao elemento pai da busca
  const inputBusca = document.querySelector('input[type="search"]');
  if (inputBusca && inputBusca.parentElement) {
    inputBusca.parentElement.classList.add("busca-container");
  }

  // Inicializar busca dropdown
  new BuscaDropdown();
});
