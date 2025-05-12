const fs = require('fs');
const path = require('path');
const { estadisticasLista } = require('../data/estadisticas'); // Ajusta la ruta

this.app.post('/api/facturas', (req, res) => {
    const venta = req.body;

    // Calcular productos vendidos y total de ingreso
    let productosVendidos = 0;
    let ingresoTotal = venta.total;

    venta.productos.forEach(prod => {
        productosVendidos += prod.cantidad;
    });

    // Actualizar el objeto en memoria
    estadisticasLista[0].productos_vendidos += productosVendidos;
    estadisticasLista[0].ingreso_total += ingresoTotal;

    // Sobrescribir archivo estadisticas.js
    const nuevoContenido = `
const estadisticasLista = [
  {
    productos_vendidos: ${estadisticasLista[0].productos_vendidos},
    categoria_mas_vendida: "${estadisticasLista[0].categoria_mas_vendida}",
    ingreso_total: ${estadisticasLista[0].ingreso_total}
  }
];

module.exports = { estadisticasLista };
`;

    const rutaEstadisticas = path.join(__dirname, '../routes/estadisticas.js'); // Ajusta si es necesario
    fs.writeFileSync(rutaEstadisticas, nuevoContenido.trim());

    // Devolver respuesta al cliente
    res.status(201).json({ mensaje: 'Venta registrada y estadísticas actualizadas' });
});
