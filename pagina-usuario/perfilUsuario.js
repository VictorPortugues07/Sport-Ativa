document.addEventListener('DOMContentLoaded', () => {
  const campos = ['nome', 'nascimento', 'email', 'cep', 'cpf', 'senha'];
  const btnEditar = document.getElementById('btn-editar');
  const btnSalvar = document.getElementById('btn-salvar');

  // Carregar dados do usuário logado
  let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || {};

  // Preenche os campos com dados do usuário logado
  campos.forEach(id => {
    document.getElementById(id).value = usuarioLogado[id] || '';
  });

  btnEditar.addEventListener('click', () => {
    campos.forEach(id => document.getElementById(id).disabled = false);
    btnEditar.classList.add('d-none');
    btnSalvar.classList.remove('d-none');
  });

  document.getElementById('form-cadastro').addEventListener('submit', e => {
    e.preventDefault();

    // Pega valores atualizados
    campos.forEach(id => {
      usuarioLogado[id] = document.getElementById(id).value.trim();
    });

    // Atualiza o usuário logado no localStorage
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

    // Atualiza o usuário na lista 'usuarios'
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.cpf === usuarioLogado.cpf);
    if (index !== -1) {
      usuarios[index] = usuarioLogado; // Atualiza o registro
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    campos.forEach(id => document.getElementById(id).disabled = true);
    btnEditar.classList.remove('d-none');
    btnSalvar.classList.add('d-none');

    alert('Dados atualizados com sucesso!');
  });
});
