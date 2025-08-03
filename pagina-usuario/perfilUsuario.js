document.addEventListener("DOMContentLoaded", () => {
  const campos = [
    "nome",
    "nascimento",
    "email",
    "telefone",
    "cep",
    "endereco",
    "numero",
    "complemento",
    "bairro",
    "cidade",
    "cpf",
    "senha",
  ];

  const btnEditar = document.getElementById("btn-editar");
  const btnCancelar = document.getElementById("btn-cancelar");
  const botoesEdicao = document.getElementById("botoes-edicao");
  const form = document.getElementById("form-cadastro");

  let usuarioOriginal = JSON.parse(localStorage.getItem("usuarioLogado")) || {};

  // Função para converter data DD/MM/AAAA para AAAA-MM-DD (formato do input date)
  function converterParaInputDate(data) {
    if (!data) return "";

    // Se já está no formato YYYY-MM-DD, retorna como está
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return data;
    }

    // Se está no formato DD/MM/AAAA, converte para YYYY-MM-DD
    if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = data.split("/");
      return `${ano}-${mes}-${dia}`;
    }

    return data;
  }

  // Função para converter data AAAA-MM-DD para DD/MM/AAAA (para exibição/armazenamento)
  function converterParaFormatoBR(data) {
    if (!data) return "";

    // Se já está no formato DD/MM/AAAA, retorna como está
    if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return data;
    }

    // Se está no formato YYYY-MM-DD, converte para DD/MM/AAAA
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    return data;
  }

  // Debug: vamos ver o que tem no localStorage
  console.log("Dados do usuário:", usuarioOriginal);
  console.log("Data de nascimento original:", usuarioOriginal.nascimento);

  // Preenche campos com os dados
  campos.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      let valor = usuarioOriginal[id] || "";

      // Tratamento especial para o campo de data
      if (id === "nascimento") {
        valor = converterParaInputDate(valor);
        console.log("Data convertida para input date:", valor);
      }

      el.value = valor;
      console.log(`Campo ${id} preenchido com:`, el.value);
    }
  });

  // Exibe nome do usuário na nav e sidebar
  const nomeUsuario = usuarioOriginal.nome?.split(" ")[0] || "Usuário";
  const nomeNavEl = document.getElementById("nome-usuario-nav");
  const nomeSidebarEl = document.getElementById("nome-usuario-sidebar");

  if (nomeNavEl) nomeNavEl.textContent = nomeUsuario;
  if (nomeSidebarEl) nomeSidebarEl.textContent = nomeUsuario;

  // Editar: habilita campos e exibe botões
  btnEditar.addEventListener("click", () => {
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
    btnEditar.classList.add("d-none");
    botoesEdicao.classList.remove("d-none");
    document.getElementById("campo-confirmar-senha").classList.remove("d-none");
  });

  // Cancelar edição: restaura valores e desabilita campos
  btnCancelar.addEventListener("click", () => {
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        let valor = usuarioOriginal[id] || "";

        // Tratamento especial para data
        if (id === "nascimento") {
          valor = converterParaInputDate(valor);
        }

        el.value = valor;
        el.disabled = true;
      }
    });
    document.getElementById("campo-confirmar-senha").classList.add("d-none");
    document.getElementById("confirmar-senha").value = "";
    btnEditar.classList.remove("d-none");
    botoesEdicao.classList.add("d-none");
  });

  // Submissão do formulário
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Confirma senha
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    // Atualiza dados do objeto
    const novosDados = {};
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        let valor = el.value.trim();

        // Para a data, vamos armazenar no formato DD/MM/AAAA
        if (id === "nascimento" && valor) {
          valor = converterParaFormatoBR(valor);
          console.log("Data sendo salva:", valor);
        }

        novosDados[id] = valor;
      }
    });

    console.log("Dados sendo salvos:", novosDados);

    // Atualiza localStorage: usuarioLogado
    localStorage.setItem("usuarioLogado", JSON.stringify(novosDados));

    // Atualiza usuário na lista 'usuarios'
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex((u) => u.cpf === usuarioOriginal.cpf);
    if (index !== -1) {
      usuarios[index] = novosDados;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    // Atualiza campos novamente
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });

    document.getElementById("campo-confirmar-senha").classList.add("d-none");
    document.getElementById("confirmar-senha").value = "";
    btnEditar.classList.remove("d-none");
    botoesEdicao.classList.add("d-none");

    alert("Dados atualizados com sucesso!");
    usuarioOriginal = novosDados; // Atualiza o estado original
  });

  // 🧩 Aplica máscaras com IMask.js - APENAS para campos de texto
  if (window.IMask) {
    setTimeout(() => {
      const cpfEl = document.getElementById("cpf");
      const telefoneEl = document.getElementById("telefone");
      const cepEl = document.getElementById("cep");

      if (cpfEl) {
        const maskCPF = IMask(cpfEl, {
          mask: "000.000.000-00",
        });
      }

      if (telefoneEl) {
        const maskTelefone = IMask(telefoneEl, {
          mask: "(00) 00000-0000",
        });
      }

      if (cepEl) {
        const maskCEP = IMask(cepEl, {
          mask: "00000-000",
        });
      }

      // NÃO aplicamos máscara no campo de data porque é type="date"
      console.log("Máscaras aplicadas (exceto data)");
    }, 100);
  }
});

document.getElementById("btn-logout").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("usuarioLogado");
  window.location.href = "../pagina-login/login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  function atualizarContadorCarrinho() {
    const contador = document.getElementById("cart-count");
    if (contador) {
      const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
      const totalItens = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
      );
      contador.textContent = totalItens;
    }
  }

  atualizarContadorCarrinho();
});
