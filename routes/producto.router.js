// routes/productos.js
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-JWT');
const { isWorkerRole } = require('../middlewares/isAdminRegister');
const { crearProducto, traerProductos, obtenerMasVendidos, obtenerMejorRating, calificarProducto } = require('../controllers/producto.controller')
const { validarCampos } = require('../middlewares/erros.middlewares');
const { check } = require('express-validator');

const router = Router();

router.post('/crearProducto', [
    validarJWT,
    isWorkerRole,
], crearProducto);
router.get('/traerProducto', [
    validarJWT,
], traerProductos);
router.get('/TraerProductosHomePublic', [
    validarJWT

], traerProductos);
router.get('/masvendidos', obtenerMasVendidos);

router.get('/mejor-calificados', obtenerMejorRating);
router.put('/calificar/:id', [
    validarJWT,
    check('rating', 'El rating es obligatorio y debe ser entre 1 y 5').isFloat({ min: 1, max: 5 }),
    validarCampos
],
    calificarProducto);
module.exports = router;