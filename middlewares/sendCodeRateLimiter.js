const ratelimit = require('express-rate-limit');

// Middleware para garantir que clientes não solicitem mais de um código de altorização a cada 15 minutos
const sendCodeRateLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1, // Limite de 1 solicitação por 15 minutos
    message: {
        'Error': 'Muitas solicitações de código foram feitas a partir deste IP, tente novamente mais tarde!'
    },
    standardHeaders: true, // Retorna informações de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desativa os headers `X-RateLimit-*`
});

module.exports = sendCodeRateLimiter;