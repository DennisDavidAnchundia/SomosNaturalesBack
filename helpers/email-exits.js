const Usuario = require('../models/usuario');



const existeCorreo =  async( correo ) =>{

        const emailExiste = await Usuario.findOne({ correo })
        if( emailExiste ){

            throw new Error(`El ${ correo } ya esta registrado`)
        };
}

module.exports= existeCorreo;