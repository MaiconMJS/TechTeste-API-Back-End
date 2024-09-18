const validator = require('validator');
const User = require('../model/userModel');
const transporterEmail = require('../util/nodeMailerRegister');
const bcrypt = require('bcrypt');
const SECRET_KEY = process.env.SECRET_KEY;
const sendEmailRecovery = require('../util/sendEmailRecovery');
const jwt = require('jsonwebtoken');
const moment = require('moment');

class UserAuthController {
    static async register(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
            const password = req.body.password ? req.body.password.trim() : '';

            if (!email) {
                return res.status(400).json({ 'Error': 'E-mail obrigatório!' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ 'Error': 'E-mail inválido!' });
            }
            if (!password) {
                return res.status(400).json({ 'Error': 'Digite uma senha!' });
            }
            if (password.length < 4) {
                return res.status(400).json({ 'Error': 'Senha deve conter 4 ou mais caracteres!' });
            }
            // Verifica se o E-mail já existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(401).json({ 'Error': 'E-mail já cadastrado!' });
            }
            // Gera um código de 6 dígitos para autenticação do cliente
            const codeRandom = Math.floor(100000 + Math.random() * 900000).toString();

            // Envia E-mail para um novo cliente
            const sendEmail = await transporterEmail(codeRandom, email);

            // Verifica se o E-mail foi enviado com sucesso para prosseguir
            if (!sendEmail) {
                return res.status(500).json({ 'Error': `Erro ao enviar E-mail para ${email}, tente registrar-se novamente!` });
            }
            // Cria um novo cliente
            const newUser = new User({ email, password, codeVerify: codeRandom, perfil: '/image/Logo.jpg' });
            // Salva o cliente no banco de dados
            await newUser.save();
            // Responde para o cliente
            res.status(200).json({ 'Success': 'Usuário registrado com sucesso!' });
        } catch (err) {
            // Responde ao cliente e imprimi o erro no terminal do servidor
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
            console.error(err);
        }
    };

    static async verify(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
            const code = req.body.code ? req.body.code.trim() : '';

            if (!email) {
                return res.status(400).json({ 'Error': ' Digite seu E-mail!' });
            }
            if (!code) {
                return res.status(400).json({ 'Error': 'Digite o código de seis dígitos enviada por E-mail!' });
            }
            // Busca cliente no banco de dados
            const buscarUserVerify = await User.findOne({ email });
            if (!buscarUserVerify) {
                return res.status(404).json({ 'Error': 'Usuário não encontrado, verifique se digitou o E-mail corretamente!' });
            }
            // Verifica se o cliente já foi verificado
            if (buscarUserVerify.verify) {
                return res.status(401).json({ 'Error': 'Usuário já verificado!' });
            }
            // Verifica se o código de verificação está correto
            if (buscarUserVerify.codeVerify != code) {
                return res.status(401).json({ 'Error': 'Código de verificação incorreto!' });
            }
            // Salva no banco de dados a alteração
            buscarUserVerify.verify = true;
            buscarUserVerify.codeVerify = '';
            await buscarUserVerify.save();
            // Responde para o cliente
            res.status(200).json({ 'Success': 'Sua conta foi validada!' });
        } catch (err) {
            // Responde para o cliente e imprime o erro no terminal do servidor
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
            console.error(err);
        }
    };

    static async login(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
            const password = req.body.password ? req.body.password.trim() : '';

            if (!email) {
                return res.status(400).json({ 'Error': 'Digite seu E-mail!' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ 'Error': 'E-mail inválido!' });
            }
            if (!password) {
                return res.status(400).json({ 'Error': 'Digite sua senha!' });
            }
            // Busca no banco de dados o E-mail
            const buscarUserLogin = await User.findOne({ email });

            if (!buscarUserLogin) {
                return res.status(404).json({ 'Error': 'E-mail ou senha incorreta!' });
            }
            // Verifica se o cliente já foi verificado
            if (!buscarUserLogin.verify) {
                return res.status(401).json({ 'Error': 'Sua conta ainda não foi verificada, use o código enviado para seu E-mail!' });
            }
            // Compara a senha fornecida pelo cliente com a senha em hash do banco de dados
            const isMatch = await bcrypt.compare(password, buscarUserLogin.password);
            if (!isMatch) {
                return res.status(401).json({ 'Error': 'E-mail ou senha incorreta!' });
            }
            // Gera um token válido por 1 hora com E-mail e ID criptografados 
            const token = jwt.sign({ userId: buscarUserLogin._id, email: buscarUserLogin.email, perfil: buscarUserLogin.perfil }, SECRET_KEY, { expiresIn: '1h' });
            // Envia o token válido para o cliente ID email e perfil
            res.status(200).json({ 'token': token, 'userId': buscarUserLogin._id, 'email': buscarUserLogin.email, 'perfil': buscarUserLogin.perfil });
        } catch (err) {
            // Envia uma resposta para o cliente e imprimi o erro no terminal do servidor
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
            console.error(err);
        }
    };

    static async sendCode(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim().toLowerCase() : '';

            if (!email) {
                return res.status(400).json({ 'Error': 'Digite seu E-mail!' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ 'Error': 'E-mail inválido!' });
            }

            // Busca cliente para salvar o código de autorização
            const buscarUserSendCode = await User.findOne({ email });

            // Verifica se o cliente existe no sistema
            if (!buscarUserSendCode) {
                return res.status(404).json({ 'Error': 'Usuário não está cadastrado no sistema!' });
            }
            // Gera um código de autorização para modificar a senha
            const gerarCodeRecovery = Math.floor(100000 + Math.random() * 900000).toString();

            // Envia um código para o cliente modificar sua senha
            const enviarEmail = await sendEmailRecovery(gerarCodeRecovery, email);

            // Envia uma resposta para o cliente se houver um erro no envio do E-mail
            if (!enviarEmail) {
                return res.status(500).json({ 'Error': `Erro ao anviar E-mail para ${email}, tente novamente!` });
            }
            
            // Salva o código de autorização no banco de dados
            buscarUserSendCode.codeRecovery = {
                code: gerarCodeRecovery,
                createData: new Date()
            }
            await buscarUserSendCode.save();
            // Envia resposta ao cliente
            res.status(200).json({ 'Success': 'Um código de autorização para modificar sua senha foi entregue em seu E-mail!' });
        } catch (err) {
            // Envia resposta ao cliente e imprimi o erro no terminal do servidor
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
            console.error(err);
        }
    };

    static async passwordUpdate(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
            const password = req.body.password ? req.body.password.trim() : '';
            const code = req.body.code ? req.body.code.trim() : '';

            if (!email) {
                return res.status(400).json({ 'Error': 'Digite seu E-mail!' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ 'Error': 'E-mail inválido!' });
            }
            if (!password) {
                return res.status(400).json({ 'Error': 'Defina sua nova senha!' });
            }
            if (password.length < 4) {
                return res.status(400).json({ 'Error': 'Senha deve conter no mínimo 4 caracteres!' });
            }
            if (!code) {
                return res.status(400).json({ 'Error': 'Digite seu código de autorização!' });
            }
            // Busca cliente no banco de dados para atualizar a senha
            const buscarUserPasswordUpdate = await User.findOne({ email });
            // Verifica se o cliente existe no sistema
            if (!buscarUserPasswordUpdate) {
                return res.status(404).json({ 'Error': 'Usuário não cadastrado no sistema!' });
            }
            // Usa o mement para capturar a data e hora do envio do E-mail de recuperação
            const currentTime = moment();
            const codeTime = moment(buscarUserPasswordUpdate.codeRecovery.createData);
            
            // Verifica se o código é válido
            if (currentTime.diff(codeTime, 'minutes') >= 10) {
                buscarUserPasswordUpdate.codeRecovery = {};
                await buscarUserPasswordUpdate.save();
                return res.status(401).json({'Error': 'Código de autorização expirado, por favor solicite um novo!'})
            }
            // Verifica se o code passado e igual ao enviado para o E-mail
            if (buscarUserPasswordUpdate.codeRecovery.code != code) {
                return res.status(401).json({ 'Error': 'Código de autorização incorreto!' });
            }
            // Salva as alterações no banco de dados
            buscarUserPasswordUpdate.password = password;
            buscarUserPasswordUpdate.codeRecovery = {};
            await buscarUserPasswordUpdate.save();
            res.status(200).json({ 'Success': 'Sua senha foi alterada com sucesso!' });
        } catch (err) {
            // Envia uma resposta ao cliente e imprimi o erro no terminal do servidor
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
            console.error(err);
        }
    };
    // Esse método serve apenas para verificar se o token do usuário ainda é válido quando ele abre o app
    static async token(req, res) {
        try {
            const token = req.body.token ? req.body.token.trim() : '';
            if (!token) {
                return res.status(400).json({ 'Error': 'Nada foi passado!' });
            }
            res.status(200).json({ 'Success': 'ok' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
        }
    };

    static async reenviarCode(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim() : '';
            if (!email) {
                return res.status(400).json({ 'Error': 'Digite seu E-mail para receber o código novamente!' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ 'Error': 'E-mail inválido!' });
            }
            const buscarUserReenviarCode = await User.findOne({ email });
            if (!buscarUserReenviarCode) {
                return res.status(404).json({ 'Error': 'E-mail não está registrado no sistema!' });
            }
            const sendCodeReenviar = await transporterEmail(buscarUserReenviarCode.codeVerify, email);
            if (!sendCodeReenviar) {
                return res.status(400).json({ 'Error': 'Erro ao reenviar E-mail, tente novamente!' });
            }
            res.status(200).json({ 'Success': `O código de confirmação foi reenviado para: ${email}` });
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = UserAuthController;