// controllers/productos.js
const Producto = require('../models/producto');
const cloudinary = require('cloudinary').v2;
cloudinary.config();

const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio } = req.body;

    try {
        let urlImagen = '';

        if (req.files && req.files.archivo) {
            const { tempFilePath } = req.files.archivo;
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
                folder: 'restaurante/productos'
            });
            urlImagen = secure_url;
        }

        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            precio,
            imagen: urlImagen
        });

        await nuevoProducto.save();

        res.status(201).json({
            ok: true,
            producto: nuevoProducto
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al crear el producto' });
    }
};
const traerProductos = async (req, res) => {

    try {
       const productos = await Producto.find()
        res.status(201).json({
            ok: true,
            productos
        });

    } catch (error) {
        console.log(error);
    }
};

const obtenerMasVendidos = async (req, res) => {
    try {
        const productos = await Producto.find()
            .sort({ ventasTotales: -1 })
            .limit(6);

        res.json({ ok: true, productos });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener más vendidos' });
    }
};

const obtenerMejorRating = async (req, res) => {
    try {
        const productos = await Producto.find()
            .sort({ ratingPromedio: -1 })
            .limit(6);

        res.json({ ok: true, productos });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener mejores calificados' });
    }
};

const calificarProducto = async (req, res) => {
    const { id } = req.params; 
    const { rating } = req.body;
    const usuarioId = req.usuario._id; 
    try {
        const producto = await Producto.findById(id);

        const yaVoto = producto.usuariosQueCalificaron.some(uid => uid.toString() === usuarioId.toString());
  if (yaVoto) {
    return res.status(400).json({ 
        ok: false, 
        msg: 'Ya has calificado este producto' 
    });
}

        const nuevoNumRevisiones = producto.numRevisiones + 1;
        const nuevoRatingPromedio = ((producto.ratingPromedio * producto.numRevisiones) + rating) / nuevoNumRevisiones;

        const productoActualizado = await Producto.findByIdAndUpdate(
            id, 
            { 
                ratingPromedio: nuevoRatingPromedio.toFixed(1),
                numRevisiones: nuevoNumRevisiones,
                $push: { usuariosQueCalificaron: usuarioId } 
            }, 
            { new: true }
        );

        res.json({ ok: true, producto: productoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al calificar' });
    }
};
module.exports = {
    crearProducto,
    traerProductos,
    obtenerMasVendidos,
    obtenerMejorRating, 
    calificarProducto
}