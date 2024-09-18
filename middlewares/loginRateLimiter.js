const ratelimit = require('express-rate-limit');

// Middleware para proteger cliente de BRUTE-FORCE
const loginRateLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // Limite de 30 solicitação por 15 minutos
    message: {
        'Error': 'Muitas solicitações foram feitas a partir deste IP, tente novamente mais tarde!'
    },
    standardHeaders: true, // Retorna informações de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desativa os headers `X-RateLimit-*`
});

module.exports = loginRateLimiter;