require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const SocketController = require('./controllers/SocketController');
const userAuthRouter = require('./routers/userAuthRouter');
const userPerfilRouter = require('./routers/userPerfilRouter');
const bodyParser = require('body-parser');
const connectDB = require('./database/mongoConnect');
const PORT = process.env.PORT;
const path = require('path');
const setCrossOriginResourcePolicy = require('./middlewares/originSameSite');

// Política de cors permitida para qualquer DNS e métodos HTTP do Socket.io
const io = require('socket.io')(http, {
    cors: {
        origin: '*', // Permitir todas as origens
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Torna a instância do io global
global.io = io;

// Configura o EJS como motor de visualização
app.set('view engine', 'ejs');

// Configura o diretório onde estão as views (arquivos EJS)
app.set('views', path.join(__dirname, 'view'));

// Conectar ao mongoDB
connectDB();

// Para processar json
app.use(bodyParser.json());

// Permitir arquivos apenas da mesma origem
app.use(setCrossOriginResourcePolicy);

// Para processar dados de um formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Política de cors permitida para qualquer DNS e métodos HTTP para o express
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Configura pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Abre conexão WebSocket
io.on('connection', SocketController.users);

// Configura rotas de usuário para registro, login e verificação
app.use('/user', userAuthRouter);

// Configura a rota para enviar imagem de perfil
app.use('/image', userPerfilRouter);

// Rota para renderizar a página inicial
app.get('*', (req, res) => {
    res.render('index');
});

// Abre o servidor na porta determinada
http.listen(PORT, (err) => {
    if (err) {
        console.error('Erro ao inciar servidor => ', err);
        process.exit(1);
    } else {
        console.log('Servidor iniciou na porta => ', PORT);
    }
});