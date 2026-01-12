const { request, response } = require("express");



const isAdminRole =  ( req= request, res= response, next ) =>{
    if( !req.usuario ){
        return res.status(500).json({
            msg: 'Se quiere verificar el rol sin validar el token primero'
        })
    }

    const { rol, correo } = req.usuario;

    if( rol !== 'ADMIN_ROLE' ){
        return res.status( 401 ).json({
            msg: `${correo} no es administrador - No puede hacer esto`
        })
    }

    next();

}

const isWorkerRole = (req, res = response, next) => {
    if (!req.usuario) {
        return res.status(500).json({
            msg: 'Se quiere verificar el rol sin validar el token primero'
        });
    }

    const { rol, nombre } = req.usuario;

    // Permitimos que tanto ADMIN como WORKER puedan gestionar productos
    if (rol !== 'ADMIN_ROLE' && rol !== 'WORKER_ROLE') {
        return res.status(401).json({
            msg: `${nombre} no tiene permisos de trabajador o administrador - No puede hacer esto`
        });
    }

    next();
}

// Función que recibe los roles permitidos (ej: 'ADMIN_ROLE', 'WORKER_ROLE')
const tieneRole = ( ...roles ) => {
    return (req, res = response, next) => {
        
        // 1. Verificar que ya validamos el token antes
        if ( !req.usuario ) {
            return res.status(500).json({
                msg: 'Se quiere verificar el rol sin validar el token primero'
            });
        }

        // 2. Verificar si el rol del usuario está en la lista permitida
        if ( !roles.includes( req.usuario.rol ) ) {
            return res.status(401).json({
                msg: `El servicio requiere uno de estos roles: ${ roles }`
            });
        }

        next();
    }
}
module.exports = {
    isAdminRole,
    isWorkerRole,
    tieneRole
}