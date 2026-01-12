const { response } = require("express");
const Usuario = require("../models/usuario")
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../helpers/generate-JWT");
const jwt = require('jsonwebtoken'); 
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Asegúrate de que el parámetro se llame EXACTAMENTE igual a como lo usas dentro
const googleVerify = async ( id_token = '' ) => { // <--- Aquí debe decir id_token
  const ticket = await client.verifyIdToken({
      idToken: id_token, // <--- Aquí pasas la variable que recibiste arriba
      audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const { name, picture, email } = ticket.getPayload();
  return { nombre: name, img: picture, correo: email };
}

const googleSignIn = async (req, res = response) => {
    // 2. Aquí extraes id_token del body que manda el frontend
    const { id_token } = req.body; 

    try {
        // 3. Pasas esa variable a la función de arriba
        const { nombre, img, correo } = await googleVerify( id_token );

        let usuario = await Usuario.findOne({ correo });

        if ( !usuario ) {
            const data = {
                nombre,
                correo,
                password: ':P', 
                img,
                google: true,
                rol: 'CONSUMER_ROLE'
            };
            usuario = new Usuario( data );
            await usuario.save();
        }

        if ( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        const token = await generateJWT( usuario.id );

        res.json({
            ok: true,
            usuario,
            token
        });
        
    } catch (error) {
        console.log(error); 
        res.status(400).json({
            ok: false,
            msg: 'Token de Google no es válido'
        });
    }
}
const login  = async( req, res = response ) =>{

    const {  correo, password } = req.body;
    try {

    const usuario = await Usuario.findOne( { correo } );
    if( !usuario ){
        return res.status(400).json({

            msg: "EL usuario no existe : Correo"
        });
    }

    if( !usuario.estado ){
        return res.status(400).json({

            msg: "EL usuario no existe : User Disable"
        })
    }
    
    const validPassword = bcrypt.compareSync( password, usuario.password );
    if( !validPassword ){
                return res.status(400).json({

            msg: "Las credenciales ingresadas son incorrectas : Password invalid"
        })
    }



    const token = await generateJWT(usuario.id );
        res.json({
            msg: 'Login exitoso',
            usuario, 
            token
    
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Ocurrio un error, contacte al administrador"
        })
    }


}

const renewToken = async(req, res = response) => {
    
    const usuario = req.usuario;

    const token = jwt.sign({ uid: usuario.id }, process.env.SECRETPRIVATEKEY, {
        expiresIn: '4h'
    });

    res.json({
        ok: true,
        usuario,
        token
    });
}

module.exports = {
    login,
    renewToken, 
    googleSignIn
}
