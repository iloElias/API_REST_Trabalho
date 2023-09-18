// Importe as dependências
const express = require('express');
const bodyParser = require('body-parser');

// Inicialize o aplicativo Express
const app = express();
app.use(bodyParser.json());

// Dados em memória para produtos (substitua por um banco de dados real posteriormente)
const produtos = [];
const usuarios = [];
const carrinhoDeCompras = [];
const pedidos = [];

class Usuario {
    constructor(id, nome, email, senha) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }
}

// Função para verificar a autenticidade do usuário
function autenticarUsuario(email, senha) {
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    return usuario;
}

// Middleware de autenticação
function autenticacaoMiddleware(req, res, next) {
    const { email, senha } = req.body;
    const usuarioAutenticado = autenticarUsuario(email, senha);
    if (!usuarioAutenticado) {
        return res.status(401).json({ message: 'Autenticação falhou' });
    }
    req.usuarioAutenticado = usuarioAutenticado;
    next();
}

// Endpoint para cadastrar um novo usuário
app.post('/usuarios/novo', (req, res) => {
    const { nome, email, senha } = req.body;
    // Verifique se o email já está em uso (você pode melhorar isso com um banco de dados)
    const emailExistente = usuarios.find(u => u.email === email);
    if (emailExistente) {
        return res.status(400).json({ message: 'Email já está em uso' });
    }
    const novoUsuario = new Usuario(usuarios.length + 1, nome, email, senha);
    usuarios.push(novoUsuario);
    res.status(201).json(novoUsuario);
});

// Endpoint para exibir todos os usuários cadastrados (somente para fins de depuração)
app.get('/usuarios', (req, res) => {
    res.json(usuarios);
});

// Middleware de autenticação para os próximos endpoints
app.use(autenticacaoMiddleware);

// Endpoint para exibir um usuário específico
app.get('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    const usuario = usuarios.find(u => u.id === Number(id));
    if (!usuario) {
        res.status(404).json({ message: 'Usuário não encontrado' });
    } else {
        res.json(usuario);
    }
});

// Endpoint para recuperar todos os produtos
app.get('/produtos', (req, res) => {
    res.json(produtos);
});

// Endpoint para recuperar um produto específico por ID
app.get('/produtos/:id', (req, res) => {
    const id = req.params.id;
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        res.status(404).json({ message: 'Produto não encontrado' });
    } else {
        res.json(produto);
    }
});

// Endpoint para criar um novo produto
app.post('/produtos', (req, res) => {
    const novoProduto = req.body;
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// Endpoint para atualizar um produto existente por ID
app.put('/produtos/:id', (req, res) => {
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
app.delete('/produtos/:id', (req, res) => {
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
app.get('/carrinho', (req, res) => {
    // Verifique se o usuário autenticado está associado a um carrinho de compras
    const carrinhoUsuario = carrinhoDeCompras.find(c => c.usuarioId === req.usuarioAutenticado.id);
    if (!carrinhoUsuario) {
        return res.json({ message: 'Carrinho de compras vazio' });
    }
    res.json(carrinhoUsuario.produtos);
});

// Endpoint para adicionar um produto ao carrinho de compras
app.post('/carrinho/adicionar', (req, res) => {
    const { produtoId, quantidade } = req.body;
    // Verifique se o produto existe (você deve implementar a lógica para isso)
    // e se o usuário autenticado tem um carrinho de compras
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

// ... Definição dos modelos de carrinho de compras, pedidos, produtos, usuários e endpoints anteriores ...

// Endpoint para recuperar a lista de todos os pedidos feitos pelo usuário
app.get('/pedidos', (req, res) => {
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
app.post('/pedidos/criar', (req, res) => {
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
        status: 'processando', // Você pode definir um status padrão aqui
    };
    pedidos.push(novoPedido);
    // Limpe o carrinho de compras do usuário
    carrinhoUsuario.produtos = [];
    res.status(201).json(novoPedido);
});

// Endpoint para atualizar o status de um pedido
app.put('/pedidos/atualizar/:id', (req, res) => {
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
app.delete('/pedidos/cancelar/:id', (req, res) => {
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
app.post('/produtos/:id/avaliacao', (req, res) => {
    const id = req.params.id;
    const { avaliacao } = req.body;
    // Você deve implementar a lógica para associar a avaliação ao produto correspondente
    // Isso pode envolver adicionar a avaliação ao objeto do produto ou armazená-la separadamente
    // Aqui, assumimos que a avaliação é associada ao produto por seu ID
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    // Armazene a avaliação (você pode adicionar lógica para evitar avaliações duplicadas)
    produto.avaliacao = avaliacao;
    res.status(201).json({ message: 'Avaliação adicionada com sucesso' });
});

// Endpoint para deixar um comentário em um produto
app.post('/produtos/:id/comentario', (req, res) => {
    const id = req.params.id;
    const { comentario } = req.body;
    // Você deve implementar a lógica para associar o comentário ao produto correspondente
    // Isso pode envolver adicionar o comentário ao objeto do produto ou armazená-lo separadamente
    // Aqui, assumimos que o comentário é associado ao produto por seu ID
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    // Armazene o comentário (você pode adicionar lógica para evitar comentários duplicados)
    produto.comentario = comentario;
    res.status(201).json({ message: 'Comentário adicionado com sucesso' });
});


// Inicie o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});