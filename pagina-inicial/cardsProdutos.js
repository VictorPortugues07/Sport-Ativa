
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container-produtos");
    const filtroCheckboxes = document.querySelectorAll(".accordion-body input[type='checkbox']");
    const filtroPrecos = document.querySelectorAll(".btn-group .btn");
    const ordenarSelect = document.querySelector("select");
    const menuLinks = document.querySelectorAll(".menu-link");
    const btnAddCartClass = "btn-outline-danger";

    let produtos = [];
    let produtosFiltrados = [];

    // Carregar produtos do JSON e renderizar
    fetch("produtos_ficticios.json")
        .then(res => res.json())
        .then(data => {
            produtos = data;
            produtosFiltrados = [...produtos];
            renderizarProdutos(produtosFiltrados);
        });

    // Adiciona eventos aos filtros
    filtroCheckboxes.forEach(cb => cb.addEventListener("change", aplicarFiltros));
    filtroPrecos.forEach(btn => btn.addEventListener("click", () => {
        filtroPrecos.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        aplicarFiltros();
    }));
    ordenarSelect.addEventListener("change", aplicarOrdenacao);
    menuLinks.forEach(link => link.addEventListener("click", (e) => {
        e.preventDefault();
        menuLinks.forEach(l => l.classList.remove("active"));
        e.target.classList.add("active");
        aplicarFiltros();
    }));

    function aplicarFiltros() {
        const filtros = {
            marca: obterFiltrosPorCategoria("Marca"),
            tamanho: obterFiltrosPorCategoria("Tamanho"),
            genero: obterFiltrosPorCategoria("Gênero"),
            produto: obterFiltrosPorCategoria("Produtos"),
            preco: obterFiltroPreco(),
            esporte: obterFiltrosPorCategoria("Esportes"),
            cor: obterFiltrosPorCategoria("Cor"),
            categoria: obterCategoriaAtiva()
        };

        produtosFiltrados = produtos.filter(prod => {
            return (
                (filtros.marca.length === 0 || filtros.marca.includes(prod.marca)) &&
                (filtros.tamanho.length === 0 || filtros.tamanho.includes(prod.tamanho)) &&
                (filtros.genero.length === 0 || filtros.genero.includes(prod.genero)) &&
                (filtros.produto.length === 0 || filtros.produto.includes(prod.tipo)) &&
                (filtros.esporte.length === 0 || filtros.esporte.includes(prod.esporte)) &&
                (filtros.cor.length === 0 || filtros.cor.includes(prod.cor)) &&
                (filtros.categoria.length === 0 || prod.categoria === filtros.categoria) &&
                (filtros.preco.length === 0 || filtros.preco.includes(getFaixaDePreco(prod.preco)))
            );
        });

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
            produtosFiltrados.sort((a, b) => b.relevancia - a.relevancia);
        }
        renderizarProdutos(produtosFiltrados);
    }

    function obterFiltrosPorCategoria(categoria) {
        const collapse = document.querySelector(`#collapse${categoria}`);
        if (!collapse) return [];
        const checks = collapse.querySelectorAll("input[type='checkbox']");
        return Array.from(checks)
            .filter(chk => chk.checked)
            .map(chk => chk.nextSibling.textContent.trim());
    }

    function obterFiltroPreco() {
        const ativo = document.querySelector(".btn-group .btn.active");
        if (!ativo) return [];
        return [ativo.textContent.trim()];
    }

    function obterCategoriaAtiva() {
        const ativo = document.querySelector(".menu-link.active");
        if (!ativo) return "";
        return ativo.textContent.trim();
    }

    function getFaixaDePreco(preco) {
        if (preco <= 100) return "Até R$ 100";
        if (preco <= 200) return "R$ 100 - R$ 200";
        if (preco <= 300) return "R$ 200 - R$ 300";
        return "Acima de R$ 300";
    }

    function renderizarProdutos(lista) {
        container.innerHTML = "";
        if (lista.length === 0) {
            container.innerHTML = "<p class='text-muted'>Nenhum produto encontrado.</p>";
            return;
        }

        lista.forEach(prod => {
            const col = document.createElement("div");
            col.className = "col";

            col.innerHTML = `
                <div class="card product-card h-100 shadow-sm">
                    <img src="${prod.imagem}" class="card-img-top" alt="Produto">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">${prod.nome}</h5>
                            <p class="card-text text-muted small">${prod.descricao}</p>
                            <p class="mb-1"><strong>Tamanho:</strong> ${prod.tamanho}</p>
                            <p class="mb-2"><strong>Cor:</strong> ${prod.cor}</p>
                        </div>
                        <div>
                            <p class="price mb-1"><strong>R$ ${prod.preco.toFixed(2).replace('.', ',')}</strong></p>
                            <button class="btn ${btnAddCartClass} w-100" data-id="${prod.id}">Adicionar ao carrinho</button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll(".btn." + btnAddCartClass).forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                adicionarAoCarrinho(id);
            });
        });
    }

    function adicionarAoCarrinho(id) {
        const produto = produtos.find(p => p.id == id);
        if (!produto) return;

        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        const existe = carrinho.find(item => item.id == id);
        if (existe) {
            existe.quantidade += 1;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        alert("Produto adicionado ao carrinho!");
    }
});
