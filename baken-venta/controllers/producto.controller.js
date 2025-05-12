const fs = require('fs');
const path = require('path');
const archivo = path.join(__dirname, '../db/productos.js'); // Asegúrate que la ruta sea correcta
const { productosExistentes } = require('../db/productos'); // importa la base simulada

function actualizarCantidad(id, cantidad) {
  const producto = productosExistentes.find(p => p.id === id);
  if (producto) {
    if (producto.cantidad + cantidad < 0) {
      return false; // No permitir que quede en negativo
    }

    producto.cantidad += cantidad;

    const productos = productosExistentes.map(producto => ({
      ...producto,
      precio_venta: producto.precio_compra + (producto.precio_compra * producto.porciento_beneficio / 100),
      precio_venta_con_impuesto:
        producto.precio_compra +
        (producto.precio_compra * producto.porciento_beneficio / 100) +
        (producto.precio_compra * producto.id_impuestos / 100)
    }));

    const nuevoContenido = `const productosExistentes = ${JSON.stringify(productos, null, 2)};\n\nmodule.exports = { productosExistentes };`;
    fs.writeFileSync(archivo, nuevoContenido, 'utf8');

    return producto;
  }
  return false;
}

module.exports = {
  actualizarCantidad
};