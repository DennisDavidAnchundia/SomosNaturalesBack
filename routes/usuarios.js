
const { Router } = require('express');
const { check } = require('express-validator')
const { todosUsuariosGet,
        actualizarUsuario,
        borrarUsuario,
        usuariosPost,
        usuariosDelete,
        obtenerEstadisticasUsuarios
                         } = require('../controllers/usuarios');
const { validarCampos } = require('../middlewares/erros.middlewares');
const rolValid = require('../helpers/role-validator');
const existeCorreo = require('../helpers/email-exits');
const exiteIdDeUsuario = require('../helpers/id-exits');
const { validarJWT } = require('../middlewares/validar-JWT');
const { isAdminRole } = require('../middlewares/isAdminRegister');
const router = Router();


router.get('/', todosUsuariosGet );

router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], actualizarUsuario);

router.delete('/:id', [
    validarJWT,
    isAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], borrarUsuario);
router.post('/crearUsuario', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe ser minimo de 6 caracteres').isLength({ min: 6 }),
    check('correo', 'El correo ingresado no es valido').isEmail(),
    check('correo').custom( existeCorreo ),
    check('rol').custom( rolValid ),
    validarCampos
] ,usuariosPost );

router.delete('/', usuariosDelete );
router.get('/stats/conteo', [
    validarJWT,
    isAdminRole,
    validarCampos
], obtenerEstadisticasUsuarios);





module.exports = router;