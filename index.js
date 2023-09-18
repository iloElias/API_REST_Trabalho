// Importe as dependências
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Inicialize o aplicativo Express
const app = express();
app.use(bodyParser.json());

// Dados em memória para produtos (substitua por um banco de dados real posteriormente)
const produtos = [];
const usuarios = [];
const carrinhoDeCompras = [];
const pedidos = [];

// Chave secreta para assinar os tokens JWT
const secretKey = 'v4513hv46h3v41hvkj';

// Simulação de banco de dados de usuários
const users = [];

// Middleware de autenticação com JWT
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Acesso negado. Token não fornecido.');

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).send('Token inválido.');
    req.user = user;
    next();
  });
}

// Endpoint para cadastrar um novo usuário
app.post('/registro', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário já existe
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).send('Usuário já existe.');
  }

  // Cria um novo usuário
  const newUser = { username, password };
  users.push(newUser);

  // Cria e assina um token JWT para o novo usuário
  const token = jwt.sign({ username }, secretKey);
  res.status(201).json({ token });
});

// Endpoint para realizar login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário existe
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(401).send('Credenciais inválidas.');
  }

  // Autentica o usuário
  if (user.password === password) {
    // Cria e assina um token JWT para o usuário autenticado
    const token = jwt.sign({ username }, secretKey);
    res.json({ token });
  } else {
    res.status(401).send('Credenciais inválidas.');
  }
});

// Endpoint para recuperar todos os produtos
app.get('/produtos', authenticateToken, (req, res) => {
    res.json(produtos);
});

// Endpoint para recuperar um produto específico por ID
app.get('/produtos/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        res.status(404).json({ message: 'Produto não encontrado' });
    } else {
        res.json(produto);
    }
});

// Endpoint para criar um novo produto
app.post('/produtos', authenticateToken, (req, res) => {
    const novoProduto = req.body;
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// Endpoint para atualizar um produto existente por ID
app.put('/produtos/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const atualizacaoProduto = req.body;
    const produtoIndex = produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
        res.status(404).json({ message: 'Produto não encontrado' });
    } else {
        produtos[produtoIndex] = { ...produtos[produtoIndex], ...atualizacaoProduto };
        res.json(produtos[produtoIndex]);
    }
});

// Endpoint para remover um produto por ID
app.delete('/produtos/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const produtoIndex = produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
        res.status(404).json({ message: 'Produto não encontrado' });
    } else {
        produtos.splice(produtoIndex, 1);
        res.status(204).send();
    }
});

// Endpoint para recuperar o conteúdo atual do carrinho de compras de um usuário
app.get('/carrinho', authenticateToken, (req, res) => {
    // Verifique se o usuário autenticado está associado a um carrinho de compras
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.usuarioAutenticado.id);
    if (!carrinhoUsuario) {
        return res.json({ message: 'Carrinho de compras vazio' });
    }
    res.json(carrinhoUsuario.produtos);
});

// Endpoint para adicionar um produto ao carrinho de compras
app.post('/carrinho/adicionar', authenticateToken, (req, res) => {
    const { produtoId, quantidade } = req.body;
    const produtoExistente = produtos.find(p => p.id === produtoId);
    if (!produtoExistente) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.usuarioAutenticado.id);
    if (!carrinhoUsuario) {
        // Se não houver um carrinho, crie um novo para o usuário autenticado
        carrinhoDeCompras.push({
            usuarioId: req.usuarioAutenticado.id,
            produtos: [{ produtoId, quantidade }],
        });
    } else {
        // Se já existir um carrinho, adicione o produto ao carrinho existente
        const produtoNoCarrinho = carrinhoUsuario.produtos.find(item => item.produtoId === produtoId);
        if (produtoNoCarrinho) {
            produtoNoCarrinho.quantidade += quantidade;
        } else {
            carrinhoUsuario.produtos.push({ produtoId, quantidade });
        }
    }
    res.status(201).json({ message: 'Produto adicionado ao carrinho com sucesso' });
});


// Endpoint para recuperar a lista de todos os pedidos feitos pelo usuário
app.get('/pedidos', authenticateToken, (req, res) => {
    // Filtra os pedidos do usuário autenticado
    const pedidosUsuario = pedidos.filter(p => p.usuarioId === req.usuarioAutenticado.id);
    res.json(pedidosUsuario);
});

// Endpoint para recuperar os detalhes de um pedido específico com base no ID
app.get('/pedidos/:id', (req, res) => {
    const id = req.params.id;
    const pedido = pedidos.find(p => p.id === Number(id) && p.usuarioId === req.usuarioAutenticado.id);
    if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    res.json(pedido);
});

// Endpoint para criar um novo pedido com base no conteúdo do carrinho de compras
app.post('/pedidos/criar', authenticateToken, (req, res) => {
    // Obtenha o conteúdo do carrinho de compras do usuário autenticado
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.usuarioAutenticado.id);
    if (!carrinhoUsuario || carrinhoUsuario.produtos.length === 0) {
        return res.status(400).json({ message: 'Carrinho de compras vazio. Não é possível criar um pedido.' });
    }
    // Crie um novo pedido
    const novoPedido = {
        id: pedidos.length + 1,
        usuarioId: req.usuarioAutenticado.id,
        produtos: carrinhoUsuario.produtos,
        status: 'processando',
    };
    pedidos.push(novoPedido);
    // Limpe o carrinho de compras do usuário
    carrinhoUsuario.produtos = [];
    res.status(201).json(novoPedido);
});

// Endpoint para atualizar o status de um pedido
app.put('/pedidos/atualizar/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const novoStatus = req.body.status;
    const pedido = pedidos.find(p => p.id === Number(id) && p.usuarioId === req.usuarioAutenticado.id);
    if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    pedido.status = novoStatus;
    res.json(pedido);
});

// Endpoint para cancelar um pedido
app.delete('/pedidos/cancelar/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const pedidoIndex = pedidos.findIndex(p => p.id === Number(id) && p.usuarioId === req.usuarioAutenticado.id);
    if (pedidoIndex === -1) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    // Remova o pedido da lista de pedidos
    pedidos.splice(pedidoIndex, 1);
    res.status(204).send();
});

// Endpoint para deixar uma avaliação para um produto
app.post('/produtos/:id/avaliacao', authenticateToken, (req, res) => {
    const id = req.params.id;
    const { avaliacao } = req.body;
    // Aqui, assumimos que a avaliação é associada ao produto por seu ID
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    // Armazenar
    produto.avaliacao = avaliacao;
    res.status(201).json({ message: 'Avaliação adicionada com sucesso' });
});

// Endpoint para deixar um comentário em um produto
app.post('/produtos/:id/comentario', authenticateToken, (req, res) => {
    const id = req.params.id;
    const { comentario } = req.body;
    // Aqui, assumimos que o comentário é associado ao produto por seu ID
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    // Armazenar o comentário
    produto.comentario = comentario;
    res.status(201).json({ message: 'Comentário adicionado com sucesso' });
});


// Inicie o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});