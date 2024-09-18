const express = require('express');
const router = express.Router();
const multer = require('multer');
const UserPerfilIMGController = require('../controllers/UserPerfilIMGController');
const authMiddleWare = require('../middlewares/authMiddleWare');
const upload = multer({ dest: 'public/image' });

router.post('/perfil', authMiddleWare, upload.single('perfil'), UserPerfilIMGController.perfilIMG);

module.exports = router;