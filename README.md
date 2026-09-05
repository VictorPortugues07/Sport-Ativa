# 🏃 Sport Ativa

Loja virtual (e-commerce) de artigos esportivos, com catálogo de produtos, busca, filtros, carrinho, checkout,
histórico de pedidos e perfil de usuário. Projeto front-end puro, com os dados simulados em um arquivo JSON e a
sessão/carrinho de compras persistidos no `localStorage` do navegador.

## ✨ Funcionalidades

- **Catálogo de produtos**: listagem com cards de produtos (nome, marca, preço, imagem), carregados a partir de
  um arquivo JSON de produtos fictícios.
- **Filtros**: por marca, tamanho, gênero, categoria de produto, esporte, cor e faixa de preço, além de opções
  de ordenação (relevância, menor/maior preço, mais vendidos).
- **Busca universal**: campo de busca no topo com dropdown de sugestões em tempo real, navegável pelo teclado.
- **Página de detalhes do produto**: exibição individual com descrição e opção de adicionar ao carrinho.
- **Cadastro e login**: formulário único que alterna entre login e cadastro, com máscaras de input (CPF,
  telefone e CEP) e preenchimento de endereço.
- **Carrinho de compras**: adição/remoção de itens, cálculo de subtotal, frete e total, com seleção de forma de
  pagamento (Cartão, PIX ou Boleto Bancário).
- **Meus Pedidos**: histórico de pedidos do usuário, com detalhes e opção de cancelamento.
- **Perfil do usuário**: visualização e edição dos dados cadastrados.

## 🗂️ Estrutura do projeto

```
Sport-Ativa/
├── index.html                      # Página inicial (catálogo, filtros, busca)
├── pagina-inicial/
│   ├── cardsProdutos.js            # Renderização, filtros e ordenação dos produtos
│   ├── buscaUniversal.js           # Lógica da busca com dropdown de sugestões
│   ├── produtos_ficticios.json     # Base de dados simulada dos produtos
│   └── paginaInicial.css
├── pagina-login/
│   ├── login.html / login.js       # Login e cadastro de usuário (com máscaras de input)
│   └── login.css
├── pagina-produto/
│   ├── detalheProduto.html / .js   # Página de detalhes de um produto específico
│   └── detalheProduto.css
├── pagina-carrinho/
│   ├── carrinho.html / carrinho.js # Carrinho de compras e finalização da compra
│   └── carrinho.css
├── pagina-pedido/
│   ├── pedido.html / pedido.js     # Histórico e detalhes dos pedidos do usuário
│   └── pedido.css
└── pagina-usuario/
    ├── perfilUsuario.html / .js    # Perfil do usuário (visualização/edição de dados)
    └── perfilUsuario.css
```

## 🛠️ Tecnologias utilizadas

- **HTML5**, **CSS3**, **JavaScript (Vanilla)**
- **[Bootstrap 5](https://getbootstrap.com/)** — layout responsivo e componentes (accordion, modais, dropdowns)
- **Bootstrap Icons** — ícones da interface
- **IMask** — máscaras de input para CPF, telefone e CEP no formulário de cadastro
- **localStorage** — persistência de usuário logado, carrinho e pedidos por usuário (chaveados pelo CPF)

## 🚀 Como executar o projeto

Por ser um projeto front-end estático, não há necessidade de instalar dependências ou configurar servidor:

1. Clone o repositório:
   ```bash
   git clone https://github.com/VictorPortugues07/Sport-Ativa.git
   cd Sport-Ativa
   ```
2. Abra o arquivo `index.html` diretamente no navegador, ou sirva a pasta com uma extensão como o
   *Live Server* do VS Code (recomendado, já que as páginas usam `fetch` para carregar o JSON de produtos).

## 📖 Fluxo de uso

1. Na página inicial, o usuário navega pelo catálogo, filtra e pesquisa produtos.
2. Ao clicar em um produto, acessa a página de detalhes e pode adicioná-lo ao carrinho.
3. Para finalizar a compra, é necessário estar logado — caso contrário, é redirecionado à tela de login/cadastro.
4. No carrinho, escolhe a forma de pagamento e finaliza o pedido.
5. O pedido passa a aparecer em "Meus Pedidos", onde pode ser consultado ou cancelado.
6. O ícone de usuário dá acesso ao perfil, com os dados cadastrados.

## ⚠️ Observações

- Este é um projeto **front-end de demonstração**: não há back-end nem banco de dados reais — todos os dados
  (produtos, usuários, carrinho e pedidos) são simulados via JSON e `localStorage`, sendo perdidos caso o cache
  do navegador seja limpo.
- As formas de pagamento (Cartão, PIX, Boleto) são apenas ilustrativas, sem integração com gateways reais.

## 👤 Autor

Desenvolvido por [Victor Portugues](https://github.com/VictorPortugues07).
