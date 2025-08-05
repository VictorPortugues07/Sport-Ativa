document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-login");
  const botaoAlternar = document.getElementById("botao-alternar");
  const tituloFormulario = document.getElementById("titulo-formulario");
  const botaoEnviar = document.getElementById("botao-enviar");
  const textoBotao = document.getElementById("texto-botao");
  const loadingSpinner = document.querySelector(".loading-spinner");

  const secoesCadastro = ["secao-pessoal", "secao-contato", "secao-endereco"];
  const camposObrigatoriosCadastro = [
    "nome",
    "nascimento",
    "email",
    "cep",
    "endereco",
    "numero",
    "bairro",
    "cidade",
  ];
  let modoCadastro = false;

  const maskCPF = IMask(document.getElementById("cpf"), {
    mask: "000.000.000-00",
  });

  const maskTelefone = IMask(document.getElementById("telefone"), {
    mask: "(00) 00000-0000",
  });

  const maskCEP = IMask(document.getElementById("cep"), {
    mask: "00000-000",
  });

  botaoAlternar.addEventListener("click", () => {
    modoCadastro = !modoCadastro;

    tituloFormulario.textContent = modoCadastro ? "Cadastro" : "Login";
    botaoAlternar.textContent = modoCadastro
      ? "Já tem conta? Fazer login"
      : "Não tem conta? Cadastre-se";
    textoBotao.textContent = modoCadastro ? "Cadastrar" : "Entrar";

    secoesCadastro.forEach((id) => {
      document.getElementById(id).classList.toggle("d-none", !modoCadastro);
    });

    document
      .getElementById("grupo-confirmar-senha")
      .classList.toggle("d-none", !modoCadastro);

    camposObrigatoriosCadastro.forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) {
        campo.required = modoCadastro;
      }
    });

    formulario.reset();

    maskCPF.value = "";
    maskTelefone.value = "";
    maskCEP.value = "";

    document.querySelectorAll(".form-control").forEach((campo) => {
      campo.classList.remove("is-valid", "is-invalid");
    });
  });

  document.getElementById("cep").addEventListener("blur", async (e) => {
    const cep = e.target.value.replace(/\D/g, "");

    if (cep.length === 8) {
      try {
        const enderecoField = document.getElementById("endereco");
        const bairroField = document.getElementById("bairro");
        const cidadeField = document.getElementById("cidade");

        enderecoField.placeholder = "Buscando...";
        bairroField.placeholder = "Buscando...";
        cidadeField.placeholder = "Buscando...";

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          enderecoField.value = data.logradouro || "";
          bairroField.value = data.bairro || "";
          cidadeField.value = data.localidade || "";

          e.target.classList.add("is-valid");
          e.target.classList.remove("is-invalid");

          if (data.logradouro) {
            document.getElementById("numero").focus();
          }
        } else {
          e.target.classList.add("is-invalid");
          e.target.classList.remove("is-valid");
          showToast(
            "CEP não encontrado. Verifique e tente novamente.",
            "warning"
          );
        }

        enderecoField.placeholder = "Rua, Avenida...";
        bairroField.placeholder = "Nome do bairro";
        cidadeField.placeholder = "Nome da cidade";
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        e.target.classList.add("is-invalid");
        e.target.classList.remove("is-valid");
        showToast("Erro ao buscar CEP. Verifique sua conexão.", "error");

        document.getElementById("endereco").placeholder = "Rua, Avenida...";
        document.getElementById("bairro").placeholder = "Nome do bairro";
        document.getElementById("cidade").placeholder = "Nome da cidade";
      }
    }
  });

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha(senha) {
    return senha.length >= 6;
  }

  function validarTelefone(telefone) {
    const tel = telefone.replace(/\D/g, "");
    return tel.length === 10 || tel.length === 11;
  }

  function showToast(message, type = "info") {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    const bgColor =
      type === "error" ? "#dc3545" : type === "warning" ? "#ffc107" : "#28a745";
    const textColor = type === "warning" ? "#000" : "#fff";

    toast.style.cssText = `
      background-color: ${bgColor};
      color: ${textColor};
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      font-size: 0.9rem;
      font-weight: 500;
    `;

    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  function salvarUsuario(usuario) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const existe = usuarios.some((u) => u.cpf === usuario.cpf);

    if (existe) {
      showToast(
        "CPF já cadastrado! Tente fazer login ou use outro CPF.",
        "error"
      );
      return false;
    }

    const emailExiste = usuarios.some((u) => u.email === usuario.email);
    if (emailExiste) {
      showToast("E-mail já cadastrado! Use outro e-mail.", "error");
      return false;
    }

    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    showToast(
      "Cadastro realizado com sucesso! Bem-vindo à Sport Ativa!",
      "success"
    );

    setTimeout(() => {
      window.location.href = "../pagina-inicial/paginaInicial.html";
    }, 2000);

    return true;
  }

  function validarLogin(cpf, senha) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find((u) => u.cpf === cpf && u.senha === senha);

    if (usuario) {
      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
      showToast(
        `Bem-vindo de volta, ${usuario.nome.split(" ")[0]}!`,
        "success"
      );

      setTimeout(() => {
        window.location.href = "../pagina-inicial/paginaInicial.html";
      }, 1500);
    } else {
      showToast(
        "CPF ou senha inválidos. Verifique seus dados e tente novamente.",
        "error"
      );
    }
  }

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    loadingSpinner.style.display = "inline-block";
    botaoEnviar.disabled = true;

    setTimeout(() => {
      const dados = {
        nome: document.getElementById("nome").value.trim(),
        nascimento: document.getElementById("nascimento").value,
        email: document.getElementById("email").value.trim().toLowerCase(),
        telefone: document.getElementById("telefone").value.trim(),
        cep: document.getElementById("cep").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        numero: document.getElementById("numero").value.trim(),
        complemento: document.getElementById("complemento").value.trim(),
        bairro: document.getElementById("bairro").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        senha: document.getElementById("senha").value,
      };

      if (modoCadastro) {
        const camposVazios = camposObrigatoriosCadastro.filter(
          (campo) => !dados[campo]
        );
        if (camposVazios.length > 0 || !dados.cpf || !dados.senha) {
          showToast("Preencha todos os campos obrigatórios.", "warning");
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        if (!validarCPF(dados.cpf)) {
          showToast("CPF inválido. Verifique e tente novamente.", "error");
          document.getElementById("cpf").focus();
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        if (!validarEmail(dados.email)) {
          showToast("E-mail inválido. Verifique e tente novamente.", "error");
          document.getElementById("email").focus();
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        if (dados.telefone && !validarTelefone(dados.telefone)) {
          showToast("Telefone inválido. Verifique e tente novamente.", "error");
          document.getElementById("telefone").focus();
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        if (!validarSenha(dados.senha)) {
          showToast("A senha deve ter pelo menos 6 caracteres.", "error");
          document.getElementById("senha").focus();
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        const confirmarSenha = document.getElementById("confirmar-senha").value;
        if (dados.senha !== confirmarSenha) {
          showToast(
            "As senhas não coincidem. Verifique e tente novamente.",
            "error"
          );
          document.getElementById("confirmar-senha").focus();
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        const hoje = new Date();
        const nascimento = new Date(dados.nascimento);
        const idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNascimento = nascimento.getMonth();

        if (
          mesAtual < mesNascimento ||
          (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
        ) {
          idade--;
        }

        if (idade < 13) {
          showToast(
            "Você deve ter pelo menos 13 anos para se cadastrar.",
            "error"
          );
          document.getElementById("nascimento").focus();
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        salvarUsuario(dados);
      } else {
        if (!dados.cpf || !dados.senha) {
          showToast("Preencha CPF e senha.", "warning");
          loadingSpinner.style.display = "none";
          botaoEnviar.disabled = false;
          return;
        }

        validarLogin(dados.cpf, dados.senha);
      }

      loadingSpinner.style.display = "none";
      botaoEnviar.disabled = false;
    }, 1200);
  });

  document.getElementById("cpf").addEventListener("blur", (e) => {
    const cpf = e.target.value.trim();
    if (cpf) {
      if (validarCPF(cpf)) {
        e.target.classList.add("is-valid");
        e.target.classList.remove("is-invalid");
      } else {
        e.target.classList.add("is-invalid");
        e.target.classList.remove("is-valid");
      }
    } else {
      e.target.classList.remove("is-valid", "is-invalid");
    }
  });

  document.getElementById("email").addEventListener("blur", (e) => {
    const email = e.target.value.trim();
    if (email) {
      if (validarEmail(email)) {
        e.target.classList.add("is-valid");
        e.target.classList.remove("is-invalid");
      } else {
        e.target.classList.add("is-invalid");
        e.target.classList.remove("is-valid");
      }
    } else {
      e.target.classList.remove("is-valid", "is-invalid");
    }
  });

  document.getElementById("telefone").addEventListener("blur", (e) => {
    const telefone = e.target.value.trim();
    if (telefone) {
      if (validarTelefone(telefone)) {
        e.target.classList.add("is-valid");
        e.target.classList.remove("is-invalid");
      } else {
        e.target.classList.add("is-invalid");
        e.target.classList.remove("is-valid");
      }
    } else {
      e.target.classList.remove("is-valid", "is-invalid");
    }
  });

  document.getElementById("senha").addEventListener("input", (e) => {
    const senha = e.target.value;
    if (senha) {
      if (validarSenha(senha)) {
        e.target.classList.add("is-valid");
        e.target.classList.remove("is-invalid");
      } else {
        e.target.classList.add("is-invalid");
        e.target.classList.remove("is-valid");
      }
    } else {
      e.target.classList.remove("is-valid", "is-invalid");
    }

    const confirmarSenha = document.getElementById("confirmar-senha").value;
    if (confirmarSenha) {
      const confirmarField = document.getElementById("confirmar-senha");
      if (senha === confirmarSenha) {
        confirmarField.classList.add("is-valid");
        confirmarField.classList.remove("is-invalid");
      } else {
        confirmarField.classList.add("is-invalid");
        confirmarField.classList.remove("is-valid");
      }
    }
  });

  document.getElementById("confirmar-senha").addEventListener("input", (e) => {
    const senha = document.getElementById("senha").value;
    const confirmarSenha = e.target.value;

    if (confirmarSenha) {
      if (senha === confirmarSenha) {
        e.target.classList.add("is-valid");
        e.target.classList.remove("is-invalid");
      } else {
        e.target.classList.add("is-invalid");
        e.target.classList.remove("is-valid");
      }
    } else {
      e.target.classList.remove("is-valid", "is-invalid");
    }
  });

  camposObrigatoriosCadastro.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener("blur", (e) => {
        if (modoCadastro && e.target.required) {
          const valor = e.target.value.trim();
          if (valor) {
            e.target.classList.add("is-valid");
            e.target.classList.remove("is-invalid");
          } else {
            e.target.classList.add("is-invalid");
            e.target.classList.remove("is-valid");
          }
        }
      });
    }
  });

  document.querySelectorAll("input").forEach((input, index, inputs) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextInput = inputs[index + 1];
        if (nextInput && !nextInput.closest(".d-none")) {
          nextInput.focus();
        } else {
          formulario.dispatchEvent(new Event("submit"));
        }
      }
    });
  });

  document.querySelectorAll(".form-control").forEach((input) => {
    input.addEventListener("focus", (e) => {
      e.target.style.transform = "scale(1.02)";
      e.target.style.transition = "transform 0.2s ease";
    });

    input.addEventListener("blur", (e) => {
      e.target.style.transform = "scale(1)";
    });
  });
});
