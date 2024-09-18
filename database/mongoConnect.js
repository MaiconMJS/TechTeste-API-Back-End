const mongoose = require('mongoose');
const MONGO_CONNECT = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_CONNECT);
        console.log('MongoDB conectado => OK');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB => ERRO => ', err);
        process.exit(1);
    }
};

module.exports = connectDB;