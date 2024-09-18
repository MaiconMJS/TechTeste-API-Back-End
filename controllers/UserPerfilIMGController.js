const path = require('path');
const fs = require('fs');
const User = require('../model/userModel');

class UserPerfilIMGController {
    static async perfilIMG(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 'Error': 'Nenhuma imagem foi passada!' });
            }
            // Aqui tenho o ID do cliente capturado pelo Middleware
            const userId = req.user;
            
            // Buscar no banco de dados o cliente pelo ID
            const buscarUser = await User.findOne({ _id: userId });

            // Se o cliente não existir remova o arquivo temporário que foi salvo por multer
            if (!buscarUser) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ 'Error': 'Usuário inexistente!' });
            }

            // Busca no bando de dados a imagem com ID, se existir uma imagem com o mesmo ID ela é removida
            if (buscarUser.perfil && path.basename(buscarUser.perfil) !== 'Logo.jpg') {
                const oldImagePath = path.join(__dirname, '..', 'public', buscarUser.perfil);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            // Obtendo a extenão da imagem
            const extension = path.extname(req.file.originalname);

            // Criando o novo nome do arquivo usando o ID do cliente
            const newFilename = `${userId}${extension}`;
            const newImagePath = path.join(__dirname, '..', 'public', 'image', newFilename);
            
            // Movendo o arquivo para o caminho final, usando um novo nome
            fs.renameSync(req.file.path, newImagePath);

            // Salvando o caminho da imagem no campo perfil do cliente
            buscarUser.perfil = `/image/${newFilename}`;
            await buscarUser.save();

            // Enviando resposta para o cliente
            res.status(200).json({ 'perfil': buscarUser.perfil });
        } catch (err) {
            // Enviando resposta para o cliente
            res.status(500).json({ 'Error': 'Erro interno no servidor!' });
            // Mensagem de erro no terminal do servidor
            console.error(err);
        }
    }
}

module.exports = UserPerfilIMGController;