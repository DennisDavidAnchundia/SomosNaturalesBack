const { response } = require("express")
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");



const validarJWT = async (req, res= response, next) =>{

    const token = req.header( 'x-token' );
try {
        const { uid } = jwt.verify(token, process.env.SECRETPRIVATEKEY);

        const usuario = await Usuario.findById(uid);

        if (!usuario) {
            return res.status(401).json({ msg: 'Token no válido - usuario no existe en DB' });
        }

        req.usuario = usuario; 
        
        next();
    } catch (error) {
        console.log("--- ERROR EN VALIDAR JWT ---");
    console.log(error);
        return res.status(401).json({ msg: 'Token no válido' });
    }
}


module.exports= {
    validarJWT

}