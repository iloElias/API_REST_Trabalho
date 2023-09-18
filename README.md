# API de Compra e Venda de Produtos

Esta é uma API RESTful construída em Node.js para um sistema de compra e venda de produtos. A API permite que os usuários visualizem produtos, adicionem produtos ao carrinho de compras, criem pedidos, avaliem produtos e deixem comentários.

## Funcionalidades

- Visualização de lista de produtos.
- Detalhes de um produto específico por ID.
- Adição, atualização e remoção de produtos.
- Gerenciamento de carrinho de compras.
- Criação e atualização de pedidos.
- Cancelamento de pedidos.
- Avaliações e comentários de produtos.
- Autenticação de usuários.
- Busca de usuários por nome.

## Instruções de Uso

1. **Configuração**

   - Certifique-se de ter o Node.js instalado em sua máquina.
   - Clone este repositório e execute `npm install` para instalar as dependências.

2. **Execução**

   - Inicie o servidor executando `npm start`.
   - O servidor estará disponível em `http://localhost:3000` por padrão.

3. **Endpoints**

   Consulte a documentação dos endpoints na [seção de endpoints](#endpoints) abaixo para detalhes sobre como usar a API.

4. **Autenticação**

   - Os endpoints que requerem autenticação utilizam um sistema simples de usuário/senha em memória.
   - Use o endpoint `/usuarios/novo` para criar um novo usuário.
   - Faça login usando as credenciais criadas para acessar endpoints autenticados.

## Endpoints

Aqui estão os principais endpoints da API:

- `GET /produtos`: Recupere a lista de todos os produtos disponíveis para venda.
- `GET /produtos/{id}`: Recupere os detalhes de um produto específico com base no ID.
- `POST /produtos`: Crie um novo produto para venda.
- `PUT /produtos/{id}`: Atualize os detalhes de um produto existente com base no ID.
- `DELETE /produtos/{id}`: Remova um produto da lista com base no ID.

- `GET /carrinho`: Recupere o conteúdo atual do carrinho de compras de um usuário.
- `POST /carrinho/adicionar`: Adicione um produto ao carrinho de compras.
- `PUT /carrinho/atualizar/{id}`: Atualize a quantidade de um produto no carrinho.
- `DELETE /carrinho/remover/{id}`: Remova um produto do carrinho de compras.

- `GET /pedidos`: Recupere a lista de todos os pedidos feitos pelo usuário.
- `GET /pedidos/{id}`: Recupere os detalhes de um pedido específico com base no ID.
- `POST /pedidos/criar`: Crie um novo pedido com base no conteúdo do carrinho de compras.
- `PUT /pedidos/atualizar/{id}`: Atualize o status de um pedido.
- `DELETE /pedidos/cancelar/{id}`: Cancelar um pedido.

- `POST /produtos/{id}/avaliacao`: Deixe uma avaliação para um produto.
- `GET /produtos/{id}/avaliacoes`: Recupere as avaliações de um produto específico.
- `POST /produtos/{id}/comentario`: Deixe um comentário em um produto.

- `POST /usuarios/novo`: Cadastrar um novo usuário.
- `GET /usuarios`: Exibir todos os usuários cadastrados.
- `GET /usuarios/id`: Exibir um usuário específico por ID.
- `GET /usuarios/buscar`: Buscar um usuário pelo nome.

## Autores

Marcelo Tizo,
Kayky Delas,
Murilo Elias,
Tiago VIP,
Gabrielzinho Quebrandinho????,