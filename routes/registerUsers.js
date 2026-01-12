

const { Router } = require('express');
const { crearTrabajador, crearConsumidor } = require('../controllers/registerUsers');
const { validarJWT } = require('../middlewares/validar-JWT');
const { isAdminRole } = require('../middlewares/isAdminRegister');

const router = Router();

router.post('/registerWorker', [
    validarJWT,     
    isAdminRole,     
], crearTrabajador);
router.post('/registerConsumer', [ 

], crearConsumidor);

module.exports = router;