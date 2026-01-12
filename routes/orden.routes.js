const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/erros.middlewares');
const { validarJWT } = require('../middlewares/validar-JWT');
const {  tieneRole, isAdminRole } = require('../middlewares/isAdminRegister');

const { 
    crearOrden, 
    obtenerPedidosPanel, 
    actualizarEstadoOrden,
    obtenerMisOrdenes,
    obtenerTodasLasOrdenes,
    obtenerAnalisisTienda
} = require('../controllers/orden.controller');

const router = Router();

router.post('/', [
    validarJWT,
    check('productos', 'Los productos son obligatorios').isArray({ min: 1 }),
    check('total', 'El total es obligatorio').isNumeric(),
    validarCampos
], crearOrden);
router.get('/mis-pedidos', [validarJWT], obtenerMisOrdenes);

router.get('/panel', [
    validarJWT,
    tieneRole('ADMIN_ROLE', 'WORKER_ROLE'),
    validarCampos
], obtenerPedidosPanel);

router.get('/todas', [validarJWT],  obtenerTodasLasOrdenes);
router.put('/:id', [validarJWT], actualizarEstadoOrden);
router.get('/dashboard', [
    validarJWT,      
    isAdminRole,     
    validarCampos
], obtenerAnalisisTienda);
module.exports = router;