const { Router } = require('express');
const { check } = require('express-validator');
const { login, renewToken, googleSignIn } = require('../controllers/auth');
const { validarCampos,  } = require('../middlewares/erros.middlewares');
const { validarJWT } = require('../middlewares/validar-JWT');


const router = Router();


router.post('/login', [
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'El password es obligatorio').not().isEmpty(),
    validarCampos

] , login );
router.post('/google', [
    check('id_token', 'El id_token es necesario').not().isEmpty(),
    validarCampos
], googleSignIn );
router.get('/renew', validarJWT, renewToken );
module.exports = router;