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

  function converterParaInputDate(data) {
    if (!data) return "";

    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return data;
    }

    if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = data.split("/");
      return `${ano}-${mes}-${dia}`;
    }

    return data;
  }

  function converterParaFormatoBR(data) {
    if (!data) return "";

    if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return data;
    }

    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    return data;
  }

  console.log("Dados do usuário:", usuarioOriginal);
  console.log("Data de nascimento original:", usuarioOriginal.nascimento);

  campos.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      let valor = usuarioOriginal[id] || "";

      if (id === "nascimento") {
        valor = converterParaInputDate(valor);
        console.log("Data convertida para input date:", valor);
      }

      el.value = valor;
      console.log(`Campo ${id} preenchido com:`, el.value);
    }
  });

  const nomeUsuario = usuarioOriginal.nome?.split(" ")[0] || "Usuário";
  const nomeNavEl = document.getElementById("nome-usuario-nav");
  const nomeSidebarEl = document.getElementById("nome-usuario-sidebar");

  if (nomeNavEl) nomeNavEl.textContent = nomeUsuario;
  if (nomeSidebarEl) nomeSidebarEl.textContent = nomeUsuario;

  btnEditar.addEventListener("click", () => {
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
    btnEditar.classList.add("d-none");
    botoesEdicao.classList.remove("d-none");
    document.getElementById("campo-confirmar-senha").classList.remove("d-none");
  });

  btnCancelar.addEventListener("click", () => {
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        let valor = usuarioOriginal[id] || "";

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    const novosDados = {};
    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        let valor = el.value.trim();

        if (id === "nascimento" && valor) {
          valor = converterParaFormatoBR(valor);
          console.log("Data sendo salva:", valor);
        }

        novosDados[id] = valor;
      }
    });

    console.log("Dados sendo salvos:", novosDados);

    localStorage.setItem("usuarioLogado", JSON.stringify(novosDados));

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex((u) => u.cpf === usuarioOriginal.cpf);
    if (index !== -1) {
      usuarios[index] = novosDados;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });

    document.getElementById("campo-confirmar-senha").classList.add("d-none");
    document.getElementById("confirmar-senha").value = "";
    btnEditar.classList.remove("d-none");
    botoesEdicao.classList.add("d-none");

    alert("Dados atualizados com sucesso!");
    usuarioOriginal = novosDados;
  });

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
