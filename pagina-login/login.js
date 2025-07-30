document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-login");
  const botaoAlternar = document.getElementById("botao-alternar");
  const tituloFormulario = document.getElementById("titulo-formulario");

  const camposCadastro = ["grupo-nome", "grupo-nascimento", "grupo-email", "grupo-cep"];
  let modoCadastro = false;

  // Alternar entre login e cadastro
  botaoAlternar.addEventListener("click", () => {
    modoCadastro = !modoCadastro;

    tituloFormulario.textContent = modoCadastro ? "Cadastro" : "Login";
    botaoAlternar.textContent = modoCadastro ? "Já tem conta? Fazer login" : "Não tem conta? Cadastre-se";
    document.getElementById("botao-enviar").textContent = modoCadastro ? "Cadastrar" : "Entrar";

    camposCadastro.forEach(id => {
      document.getElementById(id).classList.toggle("d-none", !modoCadastro);
    });

    // Exibe campo de email no cadastro, oculta no login
    document.getElementById("grupo-email").classList.toggle("d-none", !modoCadastro);
  });

  function salvarUsuario(usuario) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const existe = usuarios.some(u => u.cpf === usuario.cpf);
    if (existe) {
      alert("CPF já cadastrado!");
      return;
    }
    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    formulario.reset();
    window.location.href = "../pagina-inicial/paginaInicial.html";

  }

  function validarLogin(cpf, senha) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.cpf === cpf && u.senha === senha);
    if (usuario) {
      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
      window.location.href = "../pagina-inicial/paginaInicial.html";
    } else {
      alert("CPF ou senha inválidos.");
    }
  }


  // Submissão do formulário
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value.trim(),
      nascimento: document.getElementById("nascimento").value,
      email: document.getElementById("email").value.trim(),
      cep: document.getElementById("cep").value.trim(),
      cpf: document.getElementById("cpf").value.trim(),
      senha: document.getElementById("senha").value
    };

    if (modoCadastro) {
      if (!dados.nome || !dados.nascimento || !dados.email || !dados.cep || !dados.cpf || !dados.senha) {
        alert("Preencha todos os campos.");
        return;
      }
      salvarUsuario(dados);
    } else {
      validarLogin(dados.cpf, dados.senha);
    }
  });
});
function aplicarMascaraCPF(cpf) {
  cpf = cpf.replace(/\D/g, ""); // Remove tudo que não é dígito
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return cpf;
}

function aplicarMascaraCEP(cep) {
  cep = cep.replace(/\D/g, "");
  cep = cep.replace(/^(\d{5})(\d)/, "$1-$2");
  return cep;
}

// Aplica máscara conforme o usuário digita
document.getElementById("cpf").addEventListener("input", (e) => {
  e.target.value = aplicarMascaraCPF(e.target.value);
});

document.getElementById("cep").addEventListener("input", (e) => {
  e.target.value = aplicarMascaraCEP(e.target.value);
});

