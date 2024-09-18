const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware de segurança para rotas protegidas
const authMiddleWare = (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user.userId;
        next();
    } catch (err) {
        // Resposta para o cliente caso não seja autorizado
        res.status(401).json({ 'Error': 'Token inválido ou não informado!, você precisa estar logado para enviar uma imagem de perfil.' });
        // Imprimi o erro no terminal do servidor
        console.error(err);
    }
}

module.exports = authMiddleWare;