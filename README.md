# Documentação da API

## Descrição Geral

Esta API foi desenvolvida com Node.js, Express e MongoDB, oferecendo funcionalidades para gerenciamento de usuários, envio de e-mails, upload de imagens de perfil, comunicação em tempo real via WebSocket e notificação de mensagens offline.

### Principais Funcionalidades

- Registro, verificação e login de usuários.
- Envio de e-mails para verificação e recuperação de senha.
- Upload de imagens de perfil de usuários.
- Mensagens em tempo real entre usuários autenticados via WebSocket.
- Notificações para usuários offline sobre mensagens recebidas.
- Implementação de CORS e proteção contra ataques de força bruta.

---

## Endpoints da API

### Autenticação de Usuário

- **Registrar Usuário**: Endpoint para cadastrar um novo usuário com e-mail e senha, enviando um código de verificação para o e-mail.
- **Verificar Conta**: Endpoint para validar a conta de um usuário usando o código enviado por e-mail.
- **Login de Usuário**: Endpoint para autenticação de usuários com e-mail e senha, retornando um token JWT.
- **Enviar Código de Recuperação**: Endpoint para enviar um código de recuperação de senha para o e-mail do usuário.
- **Atualizar Senha**: Endpoint para redefinir a senha de um usuário após a verificação do código de recuperação.
- **Reenviar Código de Verificação**: Endpoint para reenviar o código de verificação de conta para o e-mail do usuário.

### Upload de Imagem de Perfil

- **Upload de Imagem de Perfil**: Endpoint para fazer o upload da imagem de perfil de um usuário autenticado.

---

## Funcionalidades de WebSocket

### Eventos WebSocket

- **Associar Usuário ao Socket**: Evento que associa o ID do usuário ao WebSocket, permitindo identificar o usuário conectado.
- **Enviar Mensagem**: Evento para enviar uma mensagem de um usuário para outro.
- **Receber Mensagem**: Evento emitido quando um usuário recebe uma mensagem de outro.
- **Obter Histórico de Mensagens**: Evento que retorna o histórico de mensagens entre dois usuários.
- **Notificação de Mensagens**: Evento enviado ao usuário quando ele se conecta e possui notificações pendentes.

---

## Banco de Dados

### Estruturas de Dados

- **Usuário**: Contém informações como e-mail, senha, status de verificação, e imagem de perfil.
- **Mensagens**: Armazena as mensagens enviadas entre usuários, contendo remetente, destinatário, mensagem e timestamp.
- **Notificações**: Registra notificações para usuários offline, que serão enviadas quando se conectarem novamente.

---

## Configurações

### Variáveis de Ambiente

- **Porta do Servidor**: Define a porta em que o servidor será iniciado.
- **Conexão com MongoDB**: URL de conexão ao banco de dados MongoDB.
- **Email de Administração**: E-mail usado para envio de mensagens de verificação e recuperação.
- **Chave JWT**: Chave secreta utilizada para gerar tokens de autenticação JWT.

---

## Middleware

### Autenticação JWT

Valida o token JWT nas rotas protegidas para garantir que o usuário esteja autenticado.

### Rate Limiter

Protege a API contra ataques de força bruta, limitando a quantidade de tentativas de login ou requisições de código de recuperação por IP em um determinado período.

### CORS

Permite o controle sobre quais origens podem acessar os recursos da API.

---

## Conclusão

A API oferece uma solução completa para autenticação de usuários e comunicação em tempo real, com uma arquitetura robusta e segura, proteção contra ataques, envio de notificações e suporte ao envio de e-mails para verificação e recuperação de conta. Ideal para sistemas que necessitam de interação em tempo real entre usuários, como plataformas de mensagens ou redes sociais.
