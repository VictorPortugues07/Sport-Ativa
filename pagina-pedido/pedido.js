document.addEventListener("DOMContentLoaded", () => {
  const listaPedidos = document.getElementById("lista-pedidos");
  const cartCountEl = document.getElementById("cart-count");
  const modalDetalhesPedido = new bootstrap.Modal(
    document.getElementById("modalDetalhesPedido")
  );
  const modalCancelarPedido = new bootstrap.Modal(
    document.getElementById("modalCancelarPedido")
  );

  let pedidoParaCancelar = null;

  // Carregar usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuarioLogado) {
    const nomeUsuario = usuarioLogado.nome?.split(" ")[0] || "Usuário";
    document.getElementById("nome-usuario-nav").textContent = nomeUsuario;
  }

  // Atualizar contador do carrinho
  function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const totalItens = carrinho.reduce(
      (total, item) => total + item.quantidade,
      0
    );
    if (cartCountEl) {
      cartCountEl.textContent = totalItens;
    }
  }

  // Função para gerar data de entrega aleatória (3-10 dias úteis)
  function gerarDataEntrega() {
    const hoje = new Date();
    const diasAleatorios = Math.floor(Math.random() * 8) + 3; // 3 a 10 dias
    let diasUteis = 0;
    let dataEntrega = new Date(hoje);

    while (diasUteis < diasAleatorios) {
      dataEntrega.setDate(dataEntrega.getDate() + 1);
      const diaSemana = dataEntrega.getDay();
      // Se não for sábado (6) nem domingo (0), conta como dia útil
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasUteis++;
      }
    }

    return dataEntrega.toISOString();
  }

  // Função para atualizar status dos pedidos automaticamente
  function atualizarStatusPedidos() {
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    let foiAtualizado = false;

    pedidos.forEach((pedido) => {
      // Se não tem data de entrega, gera uma
      if (!pedido.dataEntrega) {
        pedido.dataEntrega = gerarDataEntrega();
        foiAtualizado = true;
      }

      // Lógica de progressão automática de status
      const agora = new Date();
      const dataPedido = new Date(pedido.data);
      const dataEntrega = new Date(pedido.dataEntrega);
      const horasDesdeCompra = (agora - dataPedido) / (1000 * 60 * 60);

      if (pedido.status === "Pendente" && horasDesdeCompra > 0.1) {
        // 6 minutos depois vira "Confirmado"
        pedido.status = "Confirmado";
        foiAtualizado = true;
      } else if (pedido.status === "Confirmado" && horasDesdeCompra > 0.2) {
        // 12 minutos depois vira "Processando"
        pedido.status = "Processando";
        foiAtualizado = true;
      } else if (pedido.status === "Processando" && horasDesdeCompra > 0.3) {
        // 18 minutos depois vira "Enviado"
        pedido.status = "Enviado";
        foiAtualizado = true;
      } else if (pedido.status === "Enviado" && agora >= dataEntrega) {
        // Se passou da data de entrega, vira "Entregue"
        pedido.status = "Entregue";
        foiAtualizado = true;
      }
    });

    if (foiAtualizado) {
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
    }

    return pedidos;
  }

  // Função para formatar data
  function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Função para formatar data com hora
  function formatarDataHora(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Função para obter classe CSS do status
  function obterClasseStatus(status) {
    const classes = {
      Pendente: "status-pendente",
      Confirmado: "status-confirmado",
      Processando: "status-processando",
      Enviado: "status-enviado",
      Entregue: "status-entregue",
      Cancelado: "status-cancelado",
    };
    return classes[status] || "status-pendente";
  }

  // Função para obter ícone do status
  function obterIconeStatus(status) {
    const icones = {
      Pendente: "bi-clock",
      Confirmado: "bi-check-circle",
      Processando: "bi-gear",
      Enviado: "bi-truck",
      Entregue: "bi-check-circle-fill",
      Cancelado: "bi-x-circle",
    };
    return icones[status] || "bi-clock";
  }

  // Função para obter ícone da forma de pagamento
  function obterIconePagamento(formaPagamento) {
    const icones = {
      cartao: "bi-credit-card",
      pix: "bi-qr-code",
      boleto: "bi-file-earmark-text",
    };
    return icones[formaPagamento] || "bi-credit-card";
  }

  // Função para renderizar pedidos
  function renderizarPedidos() {
    const pedidos = atualizarStatusPedidos();

    if (pedidos.length === 0) {
      listaPedidos.innerHTML = `
        <div class="pedidos-vazio">
          <i class="bi bi-box"></i>
          <h4>Você ainda não fez nenhum pedido</h4>
          <p>Explore nossos produtos e faça seu primeiro pedido!</p>
          <a href="../pagina-inicial/paginaInicial.html" class="btn btn-danger">
            <i class="bi bi-shop me-2"></i>Começar a Comprar
          </a>
        </div>
      `;
      return;
    }

    // Ordenar pedidos por data (mais recente primeiro)
    pedidos.sort((a, b) => new Date(b.data) - new Date(a.data));

    let html = "";
    pedidos.forEach((pedido) => {
      const primeirosItens = pedido.itens.slice(0, 2);
      const itensRestantes = pedido.itens.length - 2;

      html += `
        <div class="pedido-card">
          <div class="pedido-header">
            <div class="row align-items-center">
              <div class="col-md-3 col-6">
                <div class="pedido-numero">Pedido #${pedido.id}</div>
                <div class="pedido-data small text-muted">
                  ${formatarDataHora(pedido.data)}
                </div>
              </div>
              <div class="col-md-3 col-6 text-md-center">
                <span class="status-badge ${obterClasseStatus(pedido.status)}">
                  <i class="bi ${obterIconeStatus(pedido.status)} me-1"></i>
                  ${pedido.status}
                </span>
              </div>
              <div class="col-md-3 col-6 mt-2 mt-md-0">
                <div class="pedido-total">R$ ${pedido.total
                  .toFixed(2)
                  .replace(".", ",")}</div>
                <div class="small text-muted">
                  <i class="pagamento-icone bi ${obterIconePagamento(
                    pedido.pagamento
                  )}"></i>
                  ${
                    pedido.pagamento === "cartao"
                      ? "Cartão"
                      : pedido.pagamento === "pix"
                      ? "PIX"
                      : "Boleto"
                  }
                </div>
              </div>
              <div class="col-md-3 col-6 mt-2 mt-md-0">
                ${
                  pedido.status !== "Cancelado" && pedido.dataEntrega
                    ? `
                  <div class="pedido-entrega small">
                    <i class="bi bi-calendar-check me-1"></i>
                    Entrega: ${formatarData(pedido.dataEntrega)}
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          </div>
          
          <div class="pedido-content">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="itens-resumo">
                  ${primeirosItens
                    .map((item) => `${item.quantidade}x ${item.produto.nome}`)
                    .join(", ")}
                  ${
                    itensRestantes > 0
                      ? ` e mais ${itensRestantes} item${
                          itensRestantes > 1 ? "s" : ""
                        }`
                      : ""
                  }
                </div>
              </div>
              
              <div class="col-md-4 text-md-end mt-2 mt-md-0">
                <div class="d-flex flex-wrap gap-2 justify-content-md-end">
                  <button 
                    class="btn btn-outline-primary btn-sm" 
                    onclick="verDetalhes(${pedido.id})"
                  >
                    <i class="bi bi-eye me-1"></i>Ver Detalhes
                  </button>
                  
                  ${
                    pedido.status === "Pendente" ||
                    pedido.status === "Confirmado"
                      ? `
                    <button 
                      class="btn btn-outline-danger btn-sm" 
                      onclick="confirmarCancelamento(${pedido.id})"
                    >
                      <i class="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                  `
                      : ""
                  }
                  
                  <button 
                    class="btn btn-success btn-sm" 
                    onclick="comprarNovamente(${pedido.id})"
                  >
                    <i class="bi bi-arrow-repeat me-1"></i>Comprar Novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    listaPedidos.innerHTML = html;
  }

  // Função para ver detalhes do pedido
  window.verDetalhes = function (pedidoId) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const pedido = pedidos.find((p) => p.id === pedidoId);

    if (!pedido) return;

    const conteudoModal = document.getElementById("conteudo-modal");

    let itensHtml = "";
    pedido.itens.forEach((item) => {
      itensHtml += `
        <div class="item-modal">
          <div class="row align-items-center">
            <div class="col-2">
              <img src="${item.produto.imagem}" alt="${
        item.produto.nome
      }" class="produto-img-modal">
            </div>
            <div class="col-6">
              <div class="produto-nome-modal">${item.produto.nome}</div>
              <div class="small text-muted">Quantidade: ${item.quantidade}</div>
            </div>
            <div class="col-2 text-center">
              <div class="produto-preco-modal">R$ ${item.produto.preco
                .toFixed(2)
                .replace(".", ",")}</div>
            </div>
            <div class="col-2 text-end">
              <div class="fw-bold">
                R$ ${(item.produto.preco * item.quantidade)
                  .toFixed(2)
                  .replace(".", ",")}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    conteudoModal.innerHTML = `
      <div class="row mb-4">
        <div class="col-md-6">
          <h6 class="text-danger">Informações do Pedido</h6>
          <table class="table table-sm">
            <tr>
              <td><strong>Número:</strong></td>
              <td>#${pedido.id}</td>
            </tr>
            <tr>
              <td><strong>Data:</strong></td>
              <td>${formatarDataHora(pedido.data)}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td>
                <span class="status-badge ${obterClasseStatus(pedido.status)}">
                  <i class="bi ${obterIconeStatus(pedido.status)} me-1"></i>
                  ${pedido.status}
                </span>
              </td>
            </tr>
            ${
              pedido.status !== "Cancelado" && pedido.dataEntrega
                ? `
            <tr>
              <td><strong>Entrega Prevista:</strong></td>
              <td class="text-success fw-bold">${formatarData(
                pedido.dataEntrega
              )}</td>
            </tr>
            `
                : ""
            }
          </table>
        </div>
        
        <div class="col-md-6">
          <h6 class="text-danger">Pagamento</h6>
          <table class="table table-sm">
            <tr>
              <td><strong>Forma:</strong></td>
              <td>
                <i class="pagamento-icone bi ${obterIconePagamento(
                  pedido.pagamento
                )}"></i>
                ${
                  pedido.pagamento === "cartao"
                    ? "Cartão de Crédito/Débito"
                    : pedido.pagamento === "pix"
                    ? "PIX"
                    : "Boleto Bancário"
                }
              </td>
            </tr>
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td>R$ ${pedido.subtotal.toFixed(2).replace(".", ",")}</td>
            </tr>
            <tr>
              <td><strong>Frete:</strong></td>
              <td>R$ ${pedido.frete.toFixed(2).replace(".", ",")}</td>
            </tr>
            <tr class="table-danger">
              <td><strong>Total:</strong></td>
              <td><strong>R$ ${pedido.total
                .toFixed(2)
                .replace(".", ",")}</strong></td>
            </tr>
          </table>
        </div>
      </div>
      
      <h6 class="text-danger mb-3">Itens do Pedido</h6>
      <div class="border rounded">
        ${itensHtml}
      </div>
    `;

    modalDetalhesPedido.show();
  };

  // Função para confirmar cancelamento
  window.confirmarCancelamento = function (pedidoId) {
    pedidoParaCancelar = pedidoId;
    modalCancelarPedido.show();
  };

  // Evento do botão de confirmar cancelamento
  document
    .getElementById("confirmar-cancelamento")
    .addEventListener("click", () => {
      if (pedidoParaCancelar) {
        cancelarPedido(pedidoParaCancelar);
        modalCancelarPedido.hide();
        pedidoParaCancelar = null;
      }
    });

  // Função para cancelar pedido
  function cancelarPedido(pedidoId) {
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const pedidoIndex = pedidos.findIndex((p) => p.id === pedidoId);

    if (pedidoIndex !== -1) {
      pedidos[pedidoIndex].status = "Cancelado";
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
      renderizarPedidos();

      // Mostrar notificação de sucesso
      const alertDiv = document.createElement("div");
      alertDiv.className =
        "alert alert-success alert-dismissible fade show position-fixed";
      alertDiv.style.cssText =
        "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
      alertDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Pedido cancelado com sucesso!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(alertDiv);

      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }
  }

  // Função para comprar novamente
  window.comprarNovamente = function (pedidoId) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const pedido = pedidos.find((p) => p.id === pedidoId);

    if (!pedido) return;

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    // Adicionar todos os itens do pedido ao carrinho
    pedido.itens.forEach((item) => {
      const itemExistente = carrinho.find((c) => c.id === item.id);

      if (itemExistente) {
        itemExistente.quantidade += item.quantidade;
      } else {
        carrinho.push({
          id: item.id,
          quantidade: item.quantidade,
        });
      }
    });

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarContadorCarrinho();

    // Mostrar notificação e redirecionar
    const alertDiv = document.createElement("div");
    alertDiv.className =
      "alert alert-success alert-dismissible fade show position-fixed";
    alertDiv.style.cssText =
      "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    alertDiv.innerHTML = `
      <i class="bi bi-cart-plus me-2"></i>
      Itens adicionados ao carrinho!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      window.location.href = "../pagina-carrinho/carrinho.html";
    }, 1500);
  };

  // Logout
  document.getElementById("btn-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Deseja realmente sair?")) {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "../pagina-login/login.html";
    }
  });

  // Inicializar a página
  atualizarContadorCarrinho();
  renderizarPedidos();

  // Atualizar status dos pedidos a cada 30 segundos
  setInterval(() => {
    renderizarPedidos();
  }, 30000);
});
