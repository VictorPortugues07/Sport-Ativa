document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container-produtos");
  const filtroCheckboxes = document.querySelectorAll(
    ".accordion-body input[type='checkbox']"
  );
  const filtroPrecos = document.querySelectorAll(".btn-group .btn");
  const ordenarSelect = document.querySelector("select");
  const menuLinks = document.querySelectorAll(".menu-link");
  const btnAddCartClass = "btn-outline-danger";

  let produtos = [];
  let produtosFiltrados = [];

  verificarStatusLogin();

  fetch("produtos_ficticios.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      produtos = data;
      produtosFiltrados = [...produtos];
      renderizarProdutos(produtosFiltrados);
      atualizarContadorCarrinho();

      localStorage.setItem("produtosDisponiveis", JSON.stringify(produtos));

      const menuTodos = Array.from(
        document.querySelectorAll(".menu-link")
      ).find((el) => el.textContent.trim().toLowerCase() === "todos");

      if (menuTodos) {
        menuLinks.forEach((l) => l.classList.remove("active"));
        menuTodos.classList.add("active");
        aplicarFiltros();
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos do JSON:", error);
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <h4>Erro ao carregar produtos</h4>
            <p>Não foi possível carregar o arquivo produtos_ficticios.json</p>
            <p class="small">Verifique se o arquivo existe e está no caminho correto.</p>
          </div>
        </div>
      `;
    });

  filtroCheckboxes.forEach((cb) =>
    cb.addEventListener("change", aplicarFiltros)
  );

  filtroPrecos.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      filtroPrecos.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      aplicarFiltros();
    })
  );

  ordenarSelect.addEventListener("change", aplicarOrdenacao);

  menuLinks.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      menuLinks.forEach((l) => l.classList.remove("active"));
      e.target.classList.add("active");
      aplicarFiltros();
    })
  );

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

  function verificarStatusLogin() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const areaUsuario = document.getElementById("area-usuario");
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

  function obterChaveCarrinho() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado || !usuarioLogado.cpf) {
      return null;
    }
    return `carrinho_${usuarioLogado.cpf}`;
  }

  function aplicarFiltros() {
    if (produtos.length === 0) {
      console.log("Produtos ainda não foram carregados");
      return;
    }

    const filtros = {
      marca: obterFiltrosPorCategoria("Marca"),
      tamanho: obterFiltrosPorCategoria("Tamanho"),
      genero: obterFiltrosPorCategoria("Genero"),
      produto: obterFiltrosPorCategoria("Produtos"),
      preco: obterFiltroPreco(),
      esporte: obterFiltrosPorCategoria("Esportes"),
      cor: obterFiltrosPorCategoria("Cor"),
      categoria: obterCategoriaAtiva(),
    };

    console.log("Filtros aplicados:", filtros);

    produtosFiltrados = produtos.filter((prod) => {
      const passaMarca =
        filtros.marca.length === 0 || filtros.marca.includes(prod.marca);
      const passaTamanho =
        filtros.tamanho.length === 0 || filtros.tamanho.includes(prod.tamanho);
      const passaGenero =
        filtros.genero.length === 0 || filtros.genero.includes(prod.genero);
      const passaProduto =
        filtros.produto.length === 0 || filtros.produto.includes(prod.tipo);
      const passaEsporte =
        filtros.esporte.length === 0 || filtros.esporte.includes(prod.esporte);
      const passaCor =
        filtros.cor.length === 0 || filtros.cor.includes(prod.cor);
      const passaCategoria =
        filtros.categoria.length === 0 || prod.categoria === filtros.categoria;

      let passaPreco = true;
      if (filtros.preco.length > 0 && !filtros.preco.includes("Todos")) {
        const faixaProduto = getFaixaDePreco(prod.preco);
        passaPreco = filtros.preco.includes(faixaProduto);
      }

      return (
        passaMarca &&
        passaTamanho &&
        passaGenero &&
        passaProduto &&
        passaEsporte &&
        passaCor &&
        passaCategoria &&
        passaPreco
      );
    });

    console.log(
      `Produtos encontrados: ${produtosFiltrados.length} de ${produtos.length} total`
    );

    aplicarOrdenacao();
  }

  function aplicarOrdenacao() {
    const criterio = ordenarSelect.value;
    if (criterio === "Menor preço") {
      produtosFiltrados.sort((a, b) => a.preco - b.preco);
    } else if (criterio === "Maior preço") {
      produtosFiltrados.sort((a, b) => b.preco - a.preco);
    } else if (criterio === "Mais vendidos") {
      produtosFiltrados.sort((a, b) => b.vendas - a.vendas);
    } else {
      produtosFiltrados.sort(
        (a, b) => (b.relevancia || b.vendas) - (a.relevancia || a.vendas)
      );
    }
    renderizarProdutos(produtosFiltrados);
  }

  function obterFiltrosPorCategoria(categoria) {
    const collapse = document.querySelector(`#collapse${categoria}`);
    if (!collapse) return [];
    const checks = collapse.querySelectorAll("input[type='checkbox']");
    return Array.from(checks)
      .filter((chk) => chk.checked)
      .map((chk) => chk.nextSibling.textContent.trim());
  }

  function obterFiltroPreco() {
    const ativo = document.querySelector(".btn-group .btn.active");
    if (!ativo) return [];
    const valor = ativo.getAttribute("data-preco") || ativo.textContent.trim();
    return [valor];
  }

  function obterCategoriaAtiva() {
    const ativo = document.querySelector(".menu-link.active");
    if (!ativo) return "";
    const categoria = ativo.textContent.trim();

    return categoria.toLowerCase() === "todos" ? "" : categoria;
  }

  function getFaixaDePreco(preco) {
    const precoNum = parseFloat(preco);
    if (precoNum <= 100) return "Até R$ 100";
    if (precoNum <= 200) return "R$ 100 - R$ 200";
    if (precoNum <= 300) return "R$ 200 - R$ 300";
    if (precoNum > 300) return "Acima de R$ 300";
    return "Outros";
  }

  function renderizarProdutos(lista) {
    container.innerHTML = "";

    if (lista.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <i class="bi bi-search fs-1 text-muted mb-3"></i>
            <p class='text-muted fs-5'>Nenhum produto encontrado.</p>
            <p class='text-muted'>Tente ajustar os filtros ou buscar por outros termos.</p>
          </div>
        </div>
      `;
      return;
    }

    lista.forEach((prod) => {
      const col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
  <div class="card product-card h-100 shadow-sm">
    <!-- Imagem clicável para ir aos detalhes -->
    <img src="${prod.imagem}" class="card-img-top" alt="${prod.nome}" 
         loading="lazy" style="cursor: pointer;" onclick="irParaDetalhes(${
           prod.id
         })">
    <div class="card-body d-flex flex-column justify-content-between">
      <div>
        <!-- Título clicável para ir aos detalhes -->
        <h5 class="card-title" style="cursor: pointer;" onclick="irParaDetalhes(${
          prod.id
        })">${prod.nome}</h5>
        <p class="card-text text-muted small">${prod.descricao}</p>
        <div class="product-info">
          <p class="mb-1"><strong>Tamanho:</strong> ${prod.tamanho}</p>
          <p class="mb-1"><strong>Cor:</strong> ${prod.cor}</p>
          <p class="mb-2"><strong>Marca:</strong> ${prod.marca}</p>
        </div>
      </div>
      <div>
        <p class="price mb-2"><strong>R$ ${prod.preco
          .toFixed(2)
          .replace(".", ",")}</strong></p>
        <div class="d-grid gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="irParaDetalhes(${
            prod.id
          })">
            <i class="bi bi-eye me-1"></i>Ver detalhes
          </button>
          <button class="btn ${btnAddCartClass} w-100" data-id="${prod.id}">
            <i class="bi bi-cart-plus me-1"></i>Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  </div>
`;
      container.appendChild(col);
    });

    document
      .querySelectorAll(`.btn.${btnAddCartClass.replace(" ", ".")}`)
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          adicionarAoCarrinho(id);
        });
      });
  }

  function adicionarAoCarrinho(id) {
    const carrinhoKey = obterChaveCarrinho();

    if (!carrinhoKey) {
      alert("Você precisa estar logado para adicionar produtos ao carrinho!");
      window.location.href = "../pagina-login/login.html";
      return;
    }

    const produto = produtos.find((p) => p.id == id);
    if (!produto) return;

    let carrinho = JSON.parse(localStorage.getItem(carrinhoKey)) || [];
    const existe = carrinho.find((item) => item.id == id);

    if (existe) {
      existe.quantidade += 1;
    } else {
      carrinho.push({ id: parseInt(id), quantidade: 1 });
    }

    localStorage.setItem(carrinhoKey, JSON.stringify(carrinho));
    atualizarContadorCarrinho();

    const btn = document.querySelector(`button[data-id="${id}"]`);
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Adicionado!';
    btn.classList.remove("btn-outline-danger");
    btn.classList.add("btn-success");
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = textoOriginal;
      btn.classList.remove("btn-success");
      btn.classList.add("btn-outline-danger");
      btn.disabled = false;
    }, 1500);
  }

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
});
function irParaDetalhes(produtoId) {
  window.location.href = `../pagina-produto/detalheProduto.html?id=${produtoId}`;
}
