const Usuario = require("../models/usuario");
const bcryptjs = require('bcryptjs')




const crearTrabajador = async (req, res) => {
    const { correo, password, nombre, } = req.body;

    const usuario = new Usuario({
        nombre,
        correo,
        password,
        rol: 'WORKER_ROLE'
    });
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);
    await usuario.save();
    res.json({ usuario });
}
const crearConsumidor = async (req, res) => {
    try {
        const { correo, password, nombre, } = req.body;

        const usuario = new Usuario({
            nombre,
            correo,
            password,
            rol: 'CONSUMER_ROLE'
        });
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);
        await usuario.save();
        res.json({ usuario });


    } catch (error) {
        if (error.code === 11000 ) {
           return res.status(400).json({
                msg: 'El correo que ingreso ya esta registrado'
            })
        }
       return res.status(500).json({
        msg: 'Hable con el administrador / Error interno del servidor'
    });
    }

}
module.exports = {
    crearTrabajador, crearConsumidor
}
