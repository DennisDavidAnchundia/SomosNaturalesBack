const { Schema, model } = require('mongoose');

const OrdenSchema = Schema({
    fecha: { 
        type: Date, 
        default: Date.now 
    },
    usuario: { 
        type: Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    productos: [{
        producto: { 
            type: Schema.Types.ObjectId, 
            ref: 'Producto', 
            required: true 
        },
        cantidad: { 
            type: Number, 
            required: true 
        },
        precio: { 
            type: Number, 
            required: true 
        }
    }],
    total: { 
        type: Number, 
        required: true 
    },
    
    datosEnvio: {
        nombreCompleto: { 
            type: String, 
            required: true 
        },
        ciudad: { 
            type: String, 
            required: true 
        },
        direccion1: { 
            type: String, 
            required: true 
        },
        direccion2: { 
            type: String 
        },
        descripcionLugar: { 
            type: String 
        }
    },
    
    metodoPago: { 
        type: String, 
        enum: ['TRANSFERENCIA', 'EFECTIVO'], 
        required: true 
    },

    estado: { 
        type: String, 
enum: ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'PAGADO', 'CANCELADO'],    }
});

module.exports = model('Orden', OrdenSchema);