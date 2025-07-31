document.addEventListener("DOMContentLoaded", () => {
  const produtos = [
    {
      nome: "Tênis de Corrida",
      descricao: "Conforto ideal para longas distâncias.",
      preco: "R$ 249,90",
      tamanho: "42",
      cor: "Preto",
      imagem: "https://via.placeholder.com/300x300"
    },
    {
      nome: "Camiseta Dry Fit",
      descricao: "Ideal para treinos intensos e absorção de suor.",
      preco: "R$ 79,90",
      tamanho: "M",
      cor: "Azul",
      imagem: "https://via.placeholder.com/300x300"
    },
    {
      nome: "Shorts Esportivo",
      descricao: "Respirável e com tecido leve.",
      preco: "R$ 59,90",
      tamanho: "G",
      cor: "Cinza",
      imagem: "https://via.placeholder.com/300x300"
    },
    {
      nome: "Top Fitness",
      descricao: "Suporte ideal para treinos de alta intensidade.",
      preco: "R$ 69,90",
      tamanho: "P",
      cor: "Rosa",
      imagem: "https://via.placeholder.com/300x300"
    }
  ];

  const container = document.getElementById("container-produtos");

  produtos.forEach(produto => {
    const card = `
      <div class="col">
        <div class="card product-card h-100 shadow-sm">
          <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title">${produto.nome}</h5>
              <p class="card-text text-muted small">${produto.descricao}</p>
              <p class="mb-1"><strong>Tamanho:</strong> ${produto.tamanho}</p>
              <p class="mb-2"><strong>Cor:</strong> ${produto.cor}</p>
            </div>
            <div>
              <p class="price mb-1"><strong>${produto.preco}</strong></p>
              <button class="btn btn-outline-danger w-100">Ver produto</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", card);
  });

  // Exibir nome do usuário
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuarioLogado && usuarioLogado.nome) {
    document.getElementById("nome-usuario").textContent = usuarioLogado.nome.split(" ")[0];
  }
});
