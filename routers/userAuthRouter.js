const express = require('express');
const UserAuthController = require('../controllers/UserAuthController');
const router = express.Router();
const multer = require('multer');
const sendCodeRateLimiter = require('../middlewares/sendCodeRateLimiter');
const loginRateLimiter = require('../middlewares/loginRateLimiter');
const authMiddleWare = require('../middlewares/authMiddleWare');
const upload = multer({ dest: 'public/image' });

router.post('/register', upload.none(), UserAuthController.register);
router.post('/verify', upload.none(), UserAuthController.verify);
router.post('/login', loginRateLimiter, upload.none(), UserAuthController.login);
router.post('/send-code', sendCodeRateLimiter, upload.none(), UserAuthController.sendCode);
router.post('/password-update', upload.none(), UserAuthController.passwordUpdate);
router.post('/token', authMiddleWare, upload.none(), UserAuthController.token);
router.post('/reenviar-code', upload.none(), UserAuthController.reenviarCode);

module.exports = router;