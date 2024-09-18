const Message = require("../model/messageModel");
const User = require("../model/userModel");
const Notification = require('../model/notification');

class SocketController {

    // Lista de clientes ativos
    static activeUsers = {};

    static users(socket) {

        // Monitora a conexão de um cliente
        console.log(socket.id + ' => Conectou!');

        // Monitora a desconexão de um cliente
        socket.on('disconnect', () => {
            console.log(socket.id + ' => Desconectou!');
            

            let disconnectedUserId = null;
            for (const [userId, socketId] of Object.entries(SocketController.activeUsers)) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    delete SocketController.activeUsers[userId];
                    break;
                }
            }
            if (disconnectedUserId) {
                // Envia o ID do usuário que se desconectou para todos os clientes menos quem se desconectou 
                // para mudar o estado do ponto no front - end de verde para vermelho
                socket.broadcast.emit('user_offline', disconnectedUserId);
                // Atualiza a lista de usuários online após a desconexão
                SocketController.broadcastOnlineUsers();
            }
        });
        
        // Evento para associar o WebSocket ID ao user ID do banco de dados
        socket.on('associate_user', async (userId) => { 
            if (userId != '') {
                SocketController.activeUsers[userId] = socket.id;
                // Armazena o userId no socket
                socket.userId = userId;
                console.log(`Usuário ID: ${userId} Associado ao socket ID: ${socket.id}`);

                // Envia o ID para todos menos o usuário que se conectou para mudar o estado do ponto de conexão no no front-end para verde
                socket.broadcast.emit('online_user', userId);

                // Verificar se o usuário tem notificação pendentes (IDs dos remetentes)
                const notifications = await Notification.find({ toUserId: userId });
                if (notifications.length > 0) {
                    // Envia os IDs dos remetentes para o usuário que acabou de se conectar
                    const senderIds = notifications.map(notification => notification.fromUserId);
                    socket.emit('notification_from_users', senderIds);

                    // Após enviar as notificações, remove elas da tabela de notificações
                    await Notification.deleteMany({ toUserId: userId });
                    console.log(`Notificações removidas para o usuário ID: ${userId}`);
                }
            }
            // Atualiza a lista de usuários conectados para todos
            await SocketController.broadcastOnlineUsers();
        });

        // Recebe o ID do destinatário e a mensagem a ser enviada para o mesmo
        socket.on('send_message', async ({ toUserId, message }) => {
            // ID do remetente
            const fromUserId = socket.userId;
            // Verificar se o destinatário está online
            const targetSocketId = SocketController.activeUsers[toUserId];
            if (targetSocketId) {
                // Emite a mensagem para o destinatário com os dados de quem enviou
                const fromUser = await User.findOne({ _id: fromUserId });
                const fromUserEmail = fromUser.email;
                const fromUserPerfil = fromUser.perfil;
                socket.to(targetSocketId).emit('receive_message', {
                    // Envia o ID, MENSAGEM, E-MAIL, PERFIL do remetente
                    fromUserId, 
                    message,
                    fromUserEmail,
                    fromUserPerfil,
                    timestamp: new Date()
                });
                console.log(`Mensagem de ${socket.userId} para ${toUserId}: ${message}`);
            } else {
                console.log(`Usuário com ID ${toUserId} não está online.`);
                // Busca no banco de dados o usuário offline
                const toUser = await User.findOne({ _id: toUserId });
                // Obtem o E-mail do usuário offline
                const toUserEmail = toUser.email;
                // Obtem o perfil do usuário
                const toUserPerfil = toUser.perfil;
                // Salva o id para notificar o usuário para nova mensagens
                const notification = new Notification({
                    toUserId,
                    fromUserId
                });
                await notification.save();
                console.log(`Notificação salva para o usuário ID ${toUserId}`);
                socket.emit('offline_user', {
                    // Enviar uma mensagem notificando que o cliente está offline
                    toUserEmail,
                    toUserPerfil
                });
            }
            // Salva a mensagem no bando de dados
            try {
                const newMessage = new Message({
                    fromUserId,
                    toUserId,
                    message
                });
                await newMessage.save();
                console.log('Mensagem salva no banco de dados.');
            } catch (err) {
                console.log('Erro ao salvar mensagem no banco de dados');
                console.error(err);
            }
        });
        socket.on('get_messages', async ({ toUserId }, callback) => {
            const fromUserId = socket.userId;
            try {
                // Busca mensagens entre o remetente e o destinatário
                const messages = await Message.find({
                    $or: [
                        { fromUserId, toUserId },
                        { fromUserId: toUserId, toUserId: fromUserId }
                    ]
                }).sort({ timestamp: 1 }); // Ordena as mensagens por data
                // Envia as mensagens ao cliente
                callback(messages);
            } catch (err) {
                console.log('Erro ao buscar mensagens');
                console.error(err);
                callback([]);
            }
        });
    };

    // Responsável por enviar a lista de clientes conectados
    static async broadcastOnlineUsers() {
        try {
            // Busca todos os IDs dos clientes conectados
            const onlineUserIds = Object.keys(SocketController.activeUsers);
            // Busca no banco de dados os emails e perfis dos usuários online
            const onlineUsers = await User.find({ _id: { $in: onlineUserIds } }, 'email perfil');
            // Envia a lista de usuários online para todos os sockets conectados
            for (const socketId of Object.values(SocketController.activeUsers)) {
                const socketInstance = global.io.sockets.sockets.get(socketId);
                if (socketInstance) {
                    socketInstance.emit('list_online', JSON.stringify(onlineUsers));
                }
            }
        } catch (err) {
            console.error(err);
            console.log('Erro ao enviar lista de usuáros online');
        }
    }
}

module.exports = SocketController; 