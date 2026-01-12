const { response, request } = require('express');
const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');

const todosUsuariosGet = async (req = request, res = response) => {

  
    const { rol } = req.query;
    let filtro = {};

    if (rol) {
        filtro.rol = rol.toUpperCase();
    }


    const [ usuarios, total ] = await Promise.all([
        Usuario.find(filtro),
        Usuario.countDocuments(filtro)
    ])
    res.json({
        usuarios, total
    });
}

const usuariosPost = async (req, res = response) => {



    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });



    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);


    await usuario.save();
    res.json({
        msg: 'post API - usuariosPost',
        usuario
    });
}

const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { _id, password, correo, ...resto } = req.body;

    try {
        if (password && password.length >= 6) {
            const salt = bcryptjs.genSaltSync();
            resto.password = bcryptjs.hashSync(password, salt);
        }

      
        if (correo) {
            resto.correo = correo;
        }

        const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }

        res.json({ ok: true, usuario });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar' });
    }
};

const usuariosDelete = (req, res = response) => {
    res.json({
        msg: 'delete API - usuariosDelete'
    });
}

const obtenerEstadisticasUsuarios = async (req, res) => {
    try {
        const [totalWorkers, ultimoWorker] = await Promise.all([
            Usuario.countDocuments({ rol: 'WORKER_ROLE', estado: true }),
            Usuario.findOne({ rol: 'WORKER_ROLE' }).sort({ _id: -1 }).select('nombre correo')
        ]);

        const [totalConsumers, ultimoConsumer] = await Promise.all([
            Usuario.countDocuments({ rol: 'CONSUMER_ROLE', estado: true }),
            Usuario.findOne({ rol: 'CONSUMER_ROLE' }).sort({ _id: -1 }).select('nombre correo')
        ]);

        res.json({
            ok: true,
            workers: {
                total: totalWorkers,
                ultimo: ultimoWorker ? ultimoWorker.nombre : 'Ninguno'
            },
            consumers: {
                total: totalConsumers,
                ultimo: ultimoConsumer ? ultimoConsumer.nombre : 'Ninguno'
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener estadísticas' });
    }
};
const borrarUsuario = async (req, res) => {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });
    res.json({ ok: true, usuario });
};

module.exports = {
    todosUsuariosGet,
    usuariosPost,
    actualizarUsuario,
    usuariosDelete,
    obtenerEstadisticasUsuarios,
    borrarUsuario
}