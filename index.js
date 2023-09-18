// Importe as dependências
const express = require('express');
const bodyParser = require('body-parser');

// Inicialize o aplicativo Express
const app = express();
app.use(bodyParser.json());

// Dados em memória para produtos (substitua por um banco de dados real posteriormente)
const produtos = [];

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

// Inicie o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});