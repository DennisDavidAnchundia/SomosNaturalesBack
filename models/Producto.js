const { Schema, model } = require('mongoose');

const ProductoSchema = Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    precio: { type: Number, default: 0 },
    imagen: { type: String },
    disponibilidad: { type: Boolean, default: true },
    ventasTotales: { type: Number, default: 0 },
    ratingPromedio: { type: Number, default: 0 },
    numRevisiones: { type: Number, default: 0 }, 
    usuariosQueCalificaron: [{
        
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
}]
});

module.exports = model('Producto', ProductoSchema);