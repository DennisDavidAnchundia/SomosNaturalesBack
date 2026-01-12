const mongoose = require('mongoose');

const dbConnection = async() =>{
    try {
        
        await mongoose.connect(process.env.MONGOURI);
        console.log('Base de datos Online')
    } catch (error) {
        throw new Error('Error al momento de iniciar la Base de Datos');
    }
}


module.exports={
    dbConnection
}