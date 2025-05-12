require('dotenv').config(); // Para cargar las variables del archivo .env
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const facturaRoutes = require('../routes/factura.routes');
const { productosExistentes, productos } = require('../db/productos'); // importa solo los datos
const { actualizarCantidad } = require('../controllers/producto.controller'); // importa la función correctamente
const facturas = require('../db/facturas.json');
const registerRoutes = require('../routes/register.routes'); // Importar las rutas correctamente

const { estadisticasLista } = require('../db/estadisticas');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000; // Puerto por defecto 3000
        this.httpServer = createServer(this.app); // Servidor HTTP
        this.corsOptions = {
            origin: '*',  // Permite todos los orígenes, si necesitas restringir puedes poner un dominio específico
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],  // Métodos permitidos
            allowedHeaders: ['Content-Type', 'Authorization', 'token'],  // Cabeceras permitidas
            credentials: true  // Permitir el uso de cookies si es necesario
        };

        // Middleware para parsear JSON (Express ya lo incluye)
        this.app.use(express.json());  // Esto es lo más importante

        // Configuración de middlewares y rutas
        this.middlewares();
        this.routes();
    }

    // Método para configurar middlewares
    middlewares() {
        // Servir archivos estáticos desde la carpeta 'public'
        this.app.use(express.static('public'));

        // Aplicar configuración CORS
        this.app.use(cors(this.corsOptions));

        // Manejar pre-flight requests
        this.app.options('*', cors(this.corsOptions));  // Para permitir preflight requests
    }

    // Método para configurar rutas
    routes() {
        // Ruta para autenticación (login)
        this.app.use('/login', require('../routes/auth.routes')); // Asegúrate de tener este archivo

        // Ruta para validar el JWT
        this.app.use('/validate', require('../routes/validate.routes')); // Asegúrate de tener este archivo

        // Ruta para obtener productos (api/productos)
        this.app.get('/api/productos', (req, res) => {
            res.json(productosExistentes);
        });

        this.app.get('/api/facturas', (req, res) => {
            res.json(facturas);
        });

        // Ruta para obtener estadísticas (api/estadisticas)
        this.app.get('/api/estadisticas', (req, res) => {
            res.json(estadisticasLista);
        });

        // Ruta para actualizar un producto
        this.app.patch('/api/productos/:id', (req, res) => {
            const id = parseInt(req.params.id);
            const cantidad = req.body.cantidad; // La cantidad que quieres agregar o restar

            if (typeof cantidad !== 'number') {
                return res.status(400).json({ mensaje: 'Cantidad inválida' });
            }

            const actualizado = actualizarCantidad(id, cantidad);

            if (!actualizado) {
                return res.status(404).json({ mensaje: 'Producto no encontrado' });
            }

            res.json({ mensaje: 'Producto actualizado correctamente', producto: actualizado });
        });

        
        this.app.get('/api/productos/:id', (req, res) => {
            const id = parseInt(req.params.id);
            const cantidad = req.body.cantidad; // La cantidad que quieres agregar o restar

            if (typeof cantidad !== 'number') {
                return res.status(400).json({ mensaje: 'Cantidad inválida' });
            }

            const actualizado = actualizarCantidad(id, cantidad);

            if (!actualizado) {
                return res.status(404).json({ mensaje: 'Producto no encontrado' });
            }

            res.json({ mensaje: 'Producto actualizado correctamente', producto: actualizado });
        });

        // Ruta para la API de facturas
        this.app.use('/api', facturaRoutes); // Asegúrate de que esta ruta esté bien definida en el archivo factura.routes.js

        // Ruta para el registro
        this.app.use('/api/register', registerRoutes);
    }

    
    // Método para iniciar el servidor
    listen() {
        this.httpServer.listen(this.port, () => {
            console.log(`El servidor está corriendo en el puerto ${this.port}`);
        });
    }
}

// Exporta la clase para usarla en otras partes de la aplicación
module.exports = Server;
