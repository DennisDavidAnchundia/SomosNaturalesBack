const { response } = require('express');
const Orden = require('../models/orden');
const Producto = require('../models/Producto');

const crearOrden = async (req, res = response) => {
    const { productos, total, datosEnvio, metodoPago } = req.body;

    try {
        const data = {
            usuario: req.usuario._id,
            productos,
            total,
            datosEnvio,
            metodoPago,
            estado: 'PENDIENTE'
        };

        const orden = new Orden(data);
        await orden.save();

        
        for (const item of productos) {
            await Producto.findByIdAndUpdate(
                item.producto, 
                { $inc: { ventasTotales: item.cantidad } } 
            );
        }

        res.status(201).json({
            ok: true,
            msg: 'Orden creada exitosamente y stock/ventas actualizados',
            orden
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

const obtenerPedidosPanel = async (req, res = response) => {
    try {
        const ordenes = await Orden.find({ 
            estado: { $in: ['PENDIENTE', 'EN_PREPARACION', 'LISTO'] } 
        })
        .populate('usuario', 'nombre') 
        .populate('productos.producto', 'nombre imagen') 
        .sort({ fecha: 1 }); 

        res.json({
            ok: true,
            ordenes
        });
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener pedidos' });
    }
};

const actualizarEstadoOrden = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const orden = await Orden.findByIdAndUpdate(
            id, 
            { estado }, 
            { new: true }
        ).populate('usuario', 'nombre');

        if (!orden) {
            return res.status(404).json({ ok: false, msg: 'Orden no encontrada' });
        }

        if (estado === 'ENTREGADO') {
            const promesasVentas = orden.productos.map(item => {
                return Producto.findByIdAndUpdate(item.producto, {
                    $inc: { ventasTotales: item.cantidad } 
                });
            });

            await Promise.all(promesasVentas);
        }
        // ------------------------------

        res.json({
            ok: true,
            orden
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el estado' });
    }
};

const obtenerTodasLasOrdenes = async (req, res) => {
    try {
        const ordenes = await Orden.find()
            .sort({ fecha: -1 })
            .populate('usuario', 'nombre email')
            .populate('productos.producto', 'nombre');

        res.json({ ok: true, ordenes });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener las órdenes' });
    }
};

const obtenerMisOrdenes = async (req, res) => {
    const uid = req.usuario._id;

    try {
        const ordenes = await Orden.find({ usuario: uid })
                                   .sort({ fecha: -1 })
                                   .populate('productos.producto', 'nombre imagen usuariosQueCalificaron'); // <--- AÑADE ESTO AQUÍ

        res.json({
            ok: true,
            ordenes
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener pedidos' });
    }
};


const obtenerAnalisisTienda = async (req, res) => {
    try {
        const inicioHoy = new Date();
        inicioHoy.setHours(0, 0, 0, 0);

        const finHoy = new Date();
        finHoy.setHours(23, 59, 59, 999);

        const ventasHoy = await Orden.aggregate([
            { 
                $match: { 
                    fecha: { $gte: inicioHoy, $lte: finHoy }, 
                    estado: { $ne: 'CANCELADO' } 
                } 
            },
            { $unwind: "$productos" },
            { 
                $group: { 
                    _id: null, 
                    totalDinero: { $sum: "$total" },
                   
                } 
            }
        ]);

        const totalDineroHoy = await Orden.find({
            fecha: { $gte: inicioHoy, $lte: finHoy },
            estado: { $ne: 'CANCELADO' }
        }).select('total');

        const sumaDinero = totalDineroHoy.reduce((acc, orden) => acc + orden.total, 0);

        const productosVendidos = await Orden.aggregate([
            { $match: { fecha: { $gte: inicioHoy, $lte: finHoy }, estado: { $ne: 'CANCELADO' } } },
            { $unwind: "$productos" },
            { $group: { _id: null, cantidad: { $sum: "$productos.cantidad" } } }
        ]);

        const productosTop = await Orden.aggregate([
            { $match: { estado: { $ne: 'CANCELADO' } } },
            { $unwind: "$productos" },
            { $group: { _id: "$productos.producto", totalVendido: { $sum: "$productos.cantidad" } } },
            { $sort: { totalVendido: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'detalles' } }
        ]);

        res.json({
            ok: true,
            resumenHoy: { 
                totalDinero: sumaDinero, 
                cantidadProductos: productosVendidos[0]?.cantidad || 0 
            },
            topProductos: productosTop
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al generar análisis' });
    }
};
module.exports = {
    crearOrden,
    obtenerPedidosPanel,
    actualizarEstadoOrden,
    obtenerMisOrdenes,
    obtenerTodasLasOrdenes,
    obtenerAnalisisTienda
};