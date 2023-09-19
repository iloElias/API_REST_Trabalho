const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Inicializacao do aplicativo Express
const app = express();
app.use(bodyParser.json());

// Dados em memória para produtos
const produtos = [];
const carrinhoDeCompras = [];
const pedidos = [];

// Chave secreta para assinar os tokens JWT
const secretKey = 'v4513hv46h3v41hvkj';

// Simulação de banco de dados de usuários
const usuarios = [];

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
  
    // Verifica se o nome de usuário e senha foram fornecidos
    if (!username || !password) {
      return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios.' });
    }
  
    // Verifica se o usuário já existe
    const existingUser = usuarios.find((user) => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }
  
    // Cria um novo usuário
    const newUser = { username, password };
    usuarios.push(newUser);
  
    // Cria e assina um token JWT para o novo usuário
    const token = jwt.sign({ username }, secretKey);
    res.status(201).json({ token });
  });

// Endpoint para realizar login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário existe
  const user = usuarios.find((user) => user.username === username);
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
        res.status(404).json({ mensagem: 'Produto não encontrado' });
    } else {
        res.json(produto);
    }
});

// Endpoint para criar um novo produto
app.post('/produtos', authenticateToken, (req, res) => {
    const novoProduto = req.body;

    // Verifique se todas as informações do produto estão presentes no corpo da solicitação
    if (!novoProduto.nome || !novoProduto.valor || !novoProduto.descricao || !novoProduto.categoria) {
        return res.status(400).json({ mensagem: 'Todos os campos do produto (nome, valor, descricao, categoria) são obrigatórios.' });
    }
    
    // Gere um ID único para o novo produto usando a biblioteca 'uuid'
    const novoProdutoComID = {
        id: uuidv4(), // Gera um ID único
        nome: novoProduto.nome,
        valor: novoProduto.valor,
        descricao: novoProduto.descricao,
        categoria: novoProduto.categoria
    };

    // Verifique se o ID é único
    const idJaExistente = produtos.some((produto) => produto.id === novoProdutoComID.id);
    if (idJaExistente) {
        return res.status(400).json({ mensagem: 'ID de produto já existe.' });
    }

    // Adicione o novo produto à lista de produtos
    produtos.push(novoProdutoComID);

    res.status(201).json({ produto: novoProdutoComID, mensagem: 'Produto cadastrado com sucesso!' });
});

// Endpoint para atualizar um produto existente por ID
app.put('/produtos/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const atualizacaoProduto = req.body;
    const produtoIndex = produtos.findIndex(p => p.id === id);
    
    if (produtoIndex === -1) {
        res.status(404).json({ mensagem: 'Produto não encontrado' });
    } else {
        // Verifique se o corpo da solicitação não está vazio
        if (Object.keys(atualizacaoProduto).length === 0) {
            return res.status(400).json({ mensagem: 'O corpo da solicitação está vazio. Forneça os dados para atualização.' });
        }

        // Atualize apenas as informações fornecidas no corpo da solicitação
        const produtoExistente = produtos[produtoIndex];
        const produtoAtualizado = {
        //realizar a operação de mesclagem entre os dois objetos
            ...produtoExistente,
            ...atualizacaoProduto
        };

        produtos[produtoIndex] = produtoAtualizado;

        res.json({ produto: produtoAtualizado, mensagem: 'Produto atualizado com sucesso!' });
    }
});

// Endpoint para remover um produto por ID
app.delete('/produtos/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const produtoIndex = produtos.findIndex(p => p.id === id);
    if (produtoIndex === -1) {
        res.status(404).json({ mensagem: 'Produto não encontrado' });
    } else {
        const produtoExcluido = produtos.splice(produtoIndex, 1)[0]; // Remova o produto e obtenha-o
        res.status(200).json({ mensagem: `Produto com ID ${id} foi excluído com sucesso.`, produto: produtoExcluido });
    }
});

// Endpoint para recuperar o conteúdo atual do carrinho de compras de um usuário
app.get('/carrinho', authenticateToken, (req, res) => {
    // Verifique se o usuário autenticado está associado a um carrinho de compras
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.user.username);
    if (!carrinhoUsuario) {
        return res.json({ mensagem: 'Carrinho de compras vazio' });
    }
    res.json(carrinhoUsuario.produtos);
});

// Endpoint para adicionar um produto ao carrinho de compras
app.post('/carrinho/adicionar', authenticateToken, (req, res) => {
    const { produtoId, quantidade } = req.body;
    const produtoExistente = produtos.find(p => p.id === produtoId);
    if (!produtoExistente) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.user.username);
    if (!carrinhoUsuario) {
        // Se não houver um carrinho, crie um novo para o usuário autenticado
        carrinhoDeCompras.push({
            usuarioId: req.user.username,
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
    res.status(201).json({ mensagem: 'Produto adicionado ao carrinho com sucesso' });
});

// Endpoint para atualizar a quantidade de um produto no carrinho de compras
app.put('/carrinho/atualizar/:id', authenticateToken, (req, res) => {
    const produtoId = req.params.id;
    const { quantidade } = req.body;
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.user.username);

    if (!carrinhoUsuario) {
        return res.status(404).json({ mensagem: 'Carrinho de compras vazio' });
    }

    const produtoNoCarrinho = carrinhoUsuario.produtos.find(item => item.produtoId === produtoId);
    if (!produtoNoCarrinho) {
        return res.status(404).json({ mensagem: 'Produto não encontrado no carrinho' });
    }

    // Atualizar a quantidade do produto no carrinho
    produtoNoCarrinho.quantidade = quantidade;

    res.json({ mensagem: 'Quantidade do produto no carrinho atualizada com sucesso' });
});


// Endpoint para remover um produto do carrinho de compras.
app.delete('/carrinho/remover/:id', authenticateToken, (req, res) => {
    const produtoId = req.params.id;
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.user.username);

    if (!carrinhoUsuario) {
        return res.status(404).json({ mensagem: 'Carrinho de compras vazio' });
    }

    const produtoIndex = carrinhoUsuario.produtos.findIndex(item => item.produtoId === produtoId);
    if (produtoIndex === -1) {
        return res.status(404).json({ mensagem: 'Produto não encontrado no carrinho' });
    }

    // Remover o produto do carrinho
    carrinhoUsuario.produtos.splice(produtoIndex, 1);

    res.json({ mensagem: 'Produto removido do carrinho com sucesso' });
});


// Endpoint para recuperar a lista de todos os pedidos feitos pelo usuário
app.get('/pedidos', authenticateToken, (req, res) => {
    // Filtra os pedidos feitos pelo usuário autenticado
    const pedidosUsuario = pedidos.filter(pedido => pedido.usuarioId === req.user.username);
    res.json(pedidosUsuario);
});

// Endpoint para recuperar os detalhes de um pedido específico com base no ID
app.get('/pedidos/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const pedido = pedidos.find(p => p.id === id && p.usuarioId === req.user.username);
    if (!pedido) {
        return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }
    res.json(pedido);
});

// Endpoint para criar um novo pedido com base no conteúdo do carrinho de compras
app.post('/pedidos/criar', authenticateToken, (req, res) => {
    // Verificar se o carrinho de compras do usuário autenticado existe
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.user.username);
    if (!carrinhoUsuario || carrinhoUsuario.produtos.length === 0) {
        return res.status(400).json({ mensagem: 'Carrinho de compras vazio. Não é possível criar um pedido.' });
    }

    // Criar um novo pedido com base no conteúdo do carrinho de compras
    const novoPedido = {
        id: uuidv4(), // Gera um ID único para o pedido
        usuarioId: req.user.username,
        produtos: [...carrinhoUsuario.produtos], // Copia os produtos do carrinho
        status: 'Em processamento', // Status inicial do pedido
        dataCriacao: new Date().toISOString(), // Data de criação do pedido
    };

    // Adicionar o novo pedido à lista de pedidos
    pedidos.push(novoPedido);

    // Limpar o carrinho de compras do usuário
    carrinhoUsuario.produtos = [];

    res.status(201).json({ pedido: novoPedido, mensagem: 'Pedido criado com sucesso!' });
});

// Endpoint para atualizar o status de um pedido
app.put('/pedidos/atualizar/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const novoStatus = req.body.status;

    // Verificar se o pedido existe e pertence ao usuário autenticado
    const pedido = pedidos.find(p => p.id === id && p.usuarioId === req.user.username);
    if (!pedido) {
        return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }

    // Atualizar o status do pedido
    pedido.status = novoStatus;

    res.json({ pedido, mensagem: 'Status do pedido atualizado com sucesso!' });
});

// Endpoint para cancelar um pedido
app.delete('/pedidos/cancelar/:id', authenticateToken, (req, res) => {
    const id = req.params.id;

    // Verificar se o pedido existe e pertence ao usuário autenticado
    const pedidoIndex = pedidos.findIndex(p => p.id === id && p.usuarioId === req.user.username);
    if (pedidoIndex === -1) {
        return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }

    // Remover o pedido da lista de pedidos
    const pedidoCancelado = pedidos.splice(pedidoIndex, 1)[0];

    res.status(200).json({ mensagem: `Pedido com ID ${id} foi cancelado com sucesso.`, pedido: pedidoCancelado });
});


// Endpoint para deixar uma avaliação para um produto
app.post('/produtos/:id/avaliacao', authenticateToken, (req, res) => {
    const id = req.params.id;
    const { nota } = req.body;

    // Verificar se o produto existe
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    // Verificar se a nota é válida
    if (nota < 1 || nota > 5) {
        return res.status(400).json({ mensagem: 'A nota deve estar entre 1 e 5' });
    }

    // Criar a avaliação
    const novaAvaliacao = {
        usuarioId: req.user.username,
        nota
    };

    // Adicionar a avaliação ao produto
    if (!produto.avaliacoes) {
        produto.avaliacoes = [novaAvaliacao];
    } else {
        produto.avaliacoes.push(novaAvaliacao);
    }

    res.status(201).json({ mensagem: 'Avaliação adicionada com sucesso' });
});

// Endpoint para recuperar as avaliações de um produto específico.
app.get('/produtos/:id/avaliacoes', (req, res) => {
    const id = req.params.id;
    const produto = produtos.find(p => p.id === id);

    if (!produto || !produto.avaliacoes) {
        return res.status(404).json({ mensagem: 'Produto não encontrado ou sem avaliações' });
    }

    res.json(produto.avaliacoes);
});

// Endpoint para deixar um comentário em um produto específico.
app.post('/produtos/:id/comentario', authenticateToken, (req, res) => {
    const id = req.params.id;
    const { comentario } = req.body;

    // Verificar se o produto existe
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    // Criar o comentário
    const novoComentario = {
        usuarioId: req.user.username,
        comentario,
    };

    // Adicionar o comentário ao produto
    if (!produto.comentarios) {
        produto.comentarios = [novoComentario];
    } else {
        produto.comentarios.push(novoComentario);
    }

    res.status(201).json({ mensagem: 'Comentário adicionado com sucesso' });
});

// Endpoint para recuperar os comentários de um produto específico.
app.get('/produtos/:id/comentarios', (req, res) => {
    const id = req.params.id;
    const produto = produtos.find(p => p.id === id);

    if (!produto || !produto.comentarios) {
        return res.status(404).json({ mensagem: 'Produto não encontrado ou sem comentários' });
    }

    res.json(produto.comentarios);
});


// Inicie o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});