const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario'); 
const crearAdminInicial = async () => {
    try {
        const existeAdmin = await Usuario.findOne({ rol: 'ADMIN_ROLE' });

        if (existeAdmin) {
            console.log('✅ Verificación de Admin: El sistema ya cuenta con un administrador.');
            return;
        }

        const salt = bcryptjs.genSaltSync();
        const admin = new Usuario({
            nombre: 'Administrador Inicial',
            correo: 'admin@correo.com', 
            password: bcryptjs.hashSync('Admin123456', salt),
            rol: 'ADMIN_ROLE',
            estado: true
        });

        await admin.save();

        console.log('🚀 Sistema: Base de datos vacía. Se ha creado el administrador inicial con éxito.');
        console.log('📧 Correo: admin@correo.com');
        console.log('🔑 Password: Admin123456');
        

    } catch (error) {
        console.error('❌ Error al crear el admin inicial:', error);
    }
};

module.exports = {
    crearAdminInicial
};