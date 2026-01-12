const Usuario = require('../models/usuario');



const exiteIdDeUsuario =  async( id ) =>{

        const existeId = await Usuario.findById( id );
        if( !existeId ){

            throw new Error(`El id: ${ id } no existe.`)
        };
}

module.exports= exiteIdDeUsuario;