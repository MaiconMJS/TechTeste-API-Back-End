const nodemailer = require('nodemailer');
const path = require('path');

const ADM_EMAIL = process.env.ADM_EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;

const transporterEmail = (code, emailCliente) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: true,
            auth: {
                user: ADM_EMAIL,
                pass: EMAIL_PASSWORD
            }
        });

        const logoPath = path.join(__dirname, '..', 'public', 'image', 'Logo.jpg');
        const logoCid = 'logo123'; // Identificador único para a imagem

        const mailOptions = {
            from: ADM_EMAIL,
            to: emailCliente,
            subject: 'Código de Autorização',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="cid:${logoCid}" alt="Logo" style="width: 80%; height: auto; max-width: 700px;"/>
                    </div>
                    <h1 style="text-align: center; color: #4CAF50;">Redefinição de Senha no TechTeste</h1>
                    <p style="text-align: center; font-size: 16px;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para prosseguir com a alteração:
                    </p>
                    <div style="text-align: center; margin: 20px auto; font-size: 24px; font-weight: bold; color: #000;">
                        ${code}
                    </div>
                    <p style="text-align: center; font-size: 18px; color: #FF0000; font-weight: bold;">
                        Atenção: Este código expira em 10 minutos!
                    </p>
                    <p style="text-align: center; font-size: 14px; color: #777;">
                        Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.
                    </p>
                    <div style="text-align: center; font-size: 14px; color: #777; margin-top: 40px;">
                        © 2024 TechTeste. Todos os direitos reservados.
                    </div>
                </div>`,
            attachments: [{
                filename: 'Logo.jpg',
                path: logoPath,
                cid: logoCid // Content ID referenciado no HTML acima
            }]
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error('Erro ao enviar e-mail: ', err);
                reject(false);
            } else {
                console.log('E-mail enviado: ', info.response);
                resolve(true);
            }
        });
    });
}

module.exports = transporterEmail;