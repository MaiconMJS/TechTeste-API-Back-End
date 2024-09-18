const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    codeVerify: { type: String, required: false },
    codeRecovery: {
        code: { type: String },
        createData: { type: Date }
    },
    verify: { type: Boolean, default: false },
    perfil: { type: String, required: false }
});

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        console.error('Erro a criptografar a senha => ', err);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;