const express = require('express');
const router = express.Router();
const { productosExistentes } = require('../controllers/producto.controller');  // Asegúrate de que aquí está importado correctamente

// Ruta para obtener un producto por su ID
router.get('/api/productos/:id', (req, res) => {
  const id = parseInt(req.params.id);  // Obtener el ID desde la URL
  const producto = productosExistentes.find(p => p.id === id);  // Buscar el producto por ID

  if (!producto) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  res.json(producto);  // Devolver el producto encontrado
});

module.exports = router;
