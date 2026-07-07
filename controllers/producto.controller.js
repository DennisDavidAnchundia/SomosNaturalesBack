// controllers/productos.js
const Producto = require('../models/Producto');
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
        const productos = await Producto.find();
        return res.status(200).json({ // Cambiado a 200
            ok: true,
            productos
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};;

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

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;

    try {
        // 1. Verificar si el producto existe
        let producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        }

        // 2. Preparar el objeto con los cambios
        const cambiosProducto = { nombre, descripcion, precio };

        // 3. Si viene una nueva imagen, procesarla
        if (req.files && req.files.archivo) {
            // Si el producto ya tenía una imagen, borrar la anterior de Cloudinary
            if (producto.imagen) {
                const nombreArr = producto.imagen.split('/');
                const nombreArchivo = nombreArr[nombreArr.length - 1];
                const [publicId] = nombreArchivo.split('.');
                
                // Incluimos la ruta de la carpeta si es necesario
                await cloudinary.uploader.destroy(`restaurante/productos/${publicId}`);
            }

            // Subir la nueva imagen
            const { tempFilePath } = req.files.archivo;
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
                folder: 'restaurante/productos'
            });
            cambiosProducto.imagen = secure_url;
        }

        // 4. Actualizar en la base de datos
        const productoActualizado = await Producto.findByIdAndUpdate(id, cambiosProducto, { new: true });

        res.json({
            ok: true,
            producto: productoActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el producto' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificar si el producto existe
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        }

        // 2. Borrar la imagen de Cloudinary si existía
        if (producto.imagen) {
            const nombreArr = producto.imagen.split('/');
            const nombreArchivo = nombreArr[nombreArr.length - 1];
            const [publicId] = nombreArchivo.split('.');
            
            await cloudinary.uploader.destroy(`restaurante/productos/${publicId}`);
        }

        // 3. Eliminar de la base de datos
        await Producto.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'Producto eliminado correctamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el producto' });
    }
};
module.exports = {
    crearProducto,
    traerProductos,
    obtenerMasVendidos,
    obtenerMejorRating,
    calificarProducto,
    actualizarProducto,
    eliminarProducto
}