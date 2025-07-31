document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container-produtos");
    const filtroCheckboxes = document.querySelectorAll(".accordion-body input[type='checkbox']");
    const filtroPrecos = document.querySelectorAll(".btn-group .btn");
    const ordenarSelect = document.querySelector("select");
    const menuLinks = document.querySelectorAll(".menu-link");
    const btnAddCartClass = "btn-outline-danger";

    let produtos = [];
    let produtosFiltrados = [];

    // Verificar se usuário está logado e atualizar interface
    verificarStatusLogin();

    // Carregar produtos do JSON e renderizar
    fetch("produtos_ficticios.json")
        .then(res => res.json())
        .then(data => {
            produtos = data;
            produtosFiltrados = [...produtos];
            renderizarProdutos(produtosFiltrados);
            atualizarContadorCarrinho();
        })
        .catch(error => {
            console.error("Erro ao carregar produtos:", error);
            // Usar produtos de fallback caso o JSON não carregue
            produtos = produtosFallback;
            produtosFiltrados = [...produtos];
            renderizarProdutos(produtosFiltrados);
        });

    // Adiciona eventos aos filtros
    filtroCheckboxes.forEach(cb => cb.addEventListener("change", aplicarFiltros));
    
    filtroPrecos.forEach(btn => btn.addEventListener("click", (e) => {
        e.preventDefault();
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

    // Logout
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuarioLogado");
            verificarStatusLogin();
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
            // Usuário logado
            naoLogado.classList.add("d-none");
            logado.classList.remove("d-none");
            nomeUsuario.textContent = usuarioLogado.nome.split(" ")[0];
        } else {
            // Usuário não logado
            naoLogado.classList.remove("d-none");
            logado.classList.add("d-none");
        }
    }

    function aplicarFiltros() {
        const filtros = {
            marca: obterFiltrosPorCategoria("Marca"),
            tamanho: obterFiltrosPorCategoria("Tamanho"),
            genero: obterFiltrosPorCategoria("Genero"),
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
                (filtros.preco.length === 0 || filtros.preco.includes("Todos") || filtros.preco.includes(getFaixaDePreco(prod.preco)))
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
            produtosFiltrados.sort((a, b) => (b.relevancia || b.vendas) - (a.relevancia || a.vendas));
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
        const valor = ativo.getAttribute("data-preco") || ativo.textContent.trim();
        return [valor];
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
        if(preco > 300) return "Acima de R$ 300";
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

        lista.forEach(prod => {
            const col = document.createElement("div");
            col.className = "col";

            col.innerHTML = `
                <div class="card product-card h-100 shadow-sm">
                    <img src="${prod.imagem}" class="card-img-top" alt="${prod.nome}" loading="lazy">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">${prod.nome}</h5>
                            <p class="card-text text-muted small">${prod.descricao}</p>
                            <div class="product-info">
                                <p class="mb-1"><strong>Tamanho:</strong> ${prod.tamanho}</p>
                                <p class="mb-1"><strong>Cor:</strong> ${prod.cor}</p>
                                <p class="mb-2"><strong>Marca:</strong> ${prod.marca}</p>
                            </div>
                        </div>
                        <div>
                            <p class="price mb-2"><strong>R$ ${prod.preco.toFixed(2).replace('.', ',')}</strong></p>
                            <button class="btn ${btnAddCartClass} w-100" data-id="${prod.id}">
                                <i class="bi bi-cart-plus me-1"></i>Adicionar ao carrinho
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll(`.btn.${btnAddCartClass.replace(' ', '.')}`).forEach(btn => {
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
        atualizarContadorCarrinho();
        
        // Feedback visual melhorado
        const btn = document.querySelector(`button[data-id="${id}"]`);
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Adicionado!';
        btn.classList.remove('btn-outline-danger');
        btn.classList.add('btn-success');
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-danger');
            btn.disabled = false;
        }, 1500);
    }

    function atualizarContadorCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        const contador = document.getElementById("cart-count");
        if (contador) {
            contador.textContent = total;
            contador.style.display = total > 0 ? 'inline' : 'none';
        }
    }

    // Produtos de fallback caso o JSON não carregue
    const produtosFallback = [
        {
            id: 1,
            nome: "Tênis de Corrida",
            descricao: "Conforto ideal para longas distâncias.",
            preco: 249.90,
            tamanho: "42",
            cor: "Preto",
            marca: "Nike",
            tipo: "Tênis",
            categoria: "Corrida",
            genero: "Masculino",
            vendas: 150,
            imagem: "https://via.placeholder.com/300x300?text=Tênis+Corrida"
        },
        {
            id: 2,
            nome: "Camiseta Dry Fit",
            descricao: "Ideal para treinos intensos e absorção de suor.",
            preco: 79.90,
            tamanho: "M",
            cor: "Azul",
            marca: "Adidas",
            tipo: "Camisetas",
            categoria: "Corrida",
            genero: "Masculino",
            vendas: 200,
            imagem: "https://via.placeholder.com/300x300?text=Camiseta+Dry+Fit"
        },
        {
            id: 3,
            nome: "Shorts Esportivo",
            descricao: "Respirável e com tecido leve.",
            preco: 59.90,
            tamanho: "G",
            cor: "Cinza",
            marca: "Puma",
            tipo: "Shorts",
            categoria: "Corrida",
            genero: "Masculino",
            vendas: 120,
            imagem: "https://via.placeholder.com/300x300?text=Shorts+Esportivo"
        },
        {
            id: 4,
            nome: "Top Fitness",
            descricao: "Suporte ideal para treinos de alta intensidade.",
            preco: 69.90,
            tamanho: "P",
            cor: "Rosa",
            marca: "Nike",
            tipo: "Top",
            categoria: "Corrida",
            genero: "Feminino",
            vendas: 180,
            imagem: "https://via.placeholder.com/300x300?text=Top+Fitness"
        }
    ];
});