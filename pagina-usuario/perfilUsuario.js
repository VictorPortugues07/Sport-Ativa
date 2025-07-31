document.addEventListener('DOMContentLoaded', () => {
  const campos = [
    'nome', 'nascimento', 'email', 'telefone',
    'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade',
    'cpf', 'senha'
  ];

  const btnEditar = document.getElementById('btn-editar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const botoesEdicao = document.getElementById('botoes-edicao');
  const form = document.getElementById('form-cadastro');

  let usuarioOriginal = JSON.parse(localStorage.getItem('usuarioLogado')) || {};

  // Preenche campos com os dados
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = usuarioOriginal[id] || '';
  });

  // Exibe nome do usuário na nav e sidebar
  const nomeUsuario = usuarioOriginal.nome?.split(' ')[0] || 'Usuário';
  document.getElementById('nome-usuario-nav').textContent = nomeUsuario;
  document.getElementById('nome-usuario-sidebar').textContent = nomeUsuario;

  // Editar: habilita campos e exibe botões
  btnEditar.addEventListener('click', () => {
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
    btnEditar.classList.add('d-none');
    botoesEdicao.classList.remove('d-none');
    document.getElementById('campo-confirmar-senha').classList.remove('d-none');
  });

  // Cancelar edição: restaura valores e desabilita campos
  btnCancelar.addEventListener('click', () => {
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = usuarioOriginal[id] || '';
        el.disabled = true;
      }
    });
    document.getElementById('campo-confirmar-senha').classList.add('d-none');
    document.getElementById('confirmar-senha').value = '';
    btnEditar.classList.remove('d-none');
    botoesEdicao.classList.add('d-none');
  });

  // Submissão do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Confirma senha
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    // Atualiza dados do objeto
    const novosDados = {};
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (el) novosDados[id] = el.value.trim();
    });

    // Atualiza localStorage: usuarioLogado
    localStorage.setItem('usuarioLogado', JSON.stringify(novosDados));

    // Atualiza usuário na lista 'usuarios'
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.cpf === usuarioOriginal.cpf);
    if (index !== -1) {
      usuarios[index] = novosDados;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    // Atualiza campos novamente
    campos.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });

    document.getElementById('campo-confirmar-senha').classList.add('d-none');
    document.getElementById('confirmar-senha').value = '';
    btnEditar.classList.remove('d-none');
    botoesEdicao.classList.add('d-none');

    alert('Dados atualizados com sucesso!');
    usuarioOriginal = novosDados; // Atualiza o estado original
  });

  // 🧩 Aplica máscaras com IMask.js
  if (window.IMask) {
    const maskCPF = IMask(document.getElementById('cpf'), {
      mask: '000.000.000-00'
    });

    const maskTelefone = IMask(document.getElementById('telefone'), {
      mask: '(00) 00000-0000'
    });

    const maskCEP = IMask(document.getElementById('cep'), {
      mask: '00000-000'
    });

    const maskNascimento = IMask(document.getElementById('nascimento'), {
      mask: Date,
      pattern: 'd/`m/`Y',
      lazy: false,
      format: function (date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
      parse: function (str) {
        const [day, month, year] = str.split('/');
        return new Date(`${year}-${month}-${day}`);
      },
      blocks: {
        d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2 },
        m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2 },
        Y: { mask: IMask.MaskedRange, from: 1900, to: 2099, maxLength: 4 }
      }
    });
  }
});
document.getElementById('btn-logout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('usuarioLogado'); // Remove o login atual
  window.location.href = '../pagina-login/login.html'; // Redireciona para a tela de login (ajuste o caminho conforme sua estrutura de pastas)
});

