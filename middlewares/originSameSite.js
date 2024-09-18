const setCrossOriginResourcePolicy = (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    next();
}

module.exports = setCrossOriginResourcePolicy;