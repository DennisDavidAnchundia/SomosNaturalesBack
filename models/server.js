const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { dbConnection } = require('../database/dbConnection');
const { crearAdminInicial } = require('../helpers/setup-admin');
class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.usuariosPath = '/api/usuarios';
        this.registerWorkerPath = '/api/register';
        this.prodcutosPath = '/api/producto';
        this.ordenPath = '/api/orden';
        this.authPath = '/api/auth';


        // Base de Datos
        this.conectarDataBase();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

    }

    async conectarDataBase() {
        await dbConnection();
        await crearAdminInicial();
    }
    middlewares() {

        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
// 1. CORS 
    this.app.use(cors()); 

    // 2. Cabecera especial para Google
    this.app.use((req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        next();
    });
        // Lectura y parseo del body
        this.app.use(express.json());

        // Directorio Público
        this.app.use(express.static('public'));

    }

    routes() {
        this.app.use(this.authPath, require('../routes/auth'));
        this.app.use(this.registerWorkerPath, require('../routes/registerUsers'));
        this.app.use(this.usuariosPath, require('../routes/usuarios'));
        this.app.use(this.prodcutosPath, require('../routes/producto.router'));
        this.app.use(this.ordenPath, require('../routes/orden.routes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }

}




module.exports = Server;
