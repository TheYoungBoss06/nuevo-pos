const apiUrl = "http://127.0.0.1:3000/api/estadisticas"; 
let graficoVentas = null;

// Obtener estadísticas
export async function obtenerDatos() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const datos = Array.isArray(data) ? data[0] : data;

    const productosVendidos = datos.productos_vendidos;
    const categoriaVendida = datos.categoria_mas_vendida;
    const ingresosTotales = datos.ingreso_total;

    // Mostrar datos en el HTML
    requestAnimationFrame(() => {
      document.getElementById("productos-vendidos").textContent = productosVendidos;
      document.getElementById("categoria-vendida").textContent = categoriaVendida;
      document.getElementById("ingreso-total").textContent = formatCurrency(ingresosTotales);

      renderGrafico(productosVendidos, ingresosTotales);
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    document.getElementById("productos-vendidos").textContent = "Error al cargar datos";
    document.getElementById("categoria-vendida").textContent = "Error al cargar datos";
    document.getElementById("ingreso-total").textContent = "Error al cargar datos";
  }
}

// Función para formatear el ingreso total con comas
function formatCurrency(amount) {
  return `$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Gráfico de barras
function renderGrafico(productosVendidos, ingresosTotales) {
  const ctx = document.getElementById('graficoVentas').getContext('2d');

  if (graficoVentas) {
    // Si el gráfico ya existe, actualiza los datos
    graficoVentas.data.datasets[0].data = [productosVendidos, ingresosTotales];
    graficoVentas.update();
  } else {
    // Crear el gráfico solo si no existe
    graficoVentas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Productos Vendidos', 'Ingreso Total'],
        datasets: [{
          data: [productosVendidos, ingresosTotales],
          backgroundColor: ['#ffcc00', '#1a2bee'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        }
      }
    });
  }
}

export function cargarFacturas() {
  fetch('http://127.0.0.1:3000/api/facturas')
    .then(res => res.json())
    .then(data => mostrarFacturas(data))
    .catch(error => {
      console.error('Error al cargar las facturas:', error);
    });
}

function mostrarFacturas(facturas) {
  let ingresoTotal = 0;  // Variable para almacenar el ingreso total
  let productosVendidos = {};  // Objeto para contar productos vendidos

  const container = document.getElementById('facturas-container');
  container.innerHTML = ''; // Limpiar el contenedor antes de agregar las facturas

  facturas.forEach((factura, index) => {
    const card = document.createElement('div');
    card.classList.add('factura-card');

    let productosHTML = '';
    factura.productos.forEach(producto => {
      productosHTML += `
        <div class="producto">
          <div class="producto-contenedor">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div>
              <div><strong>${producto.nombre}</strong></div>
              <div>Cantidad: ${producto.cantidad}</div>
              <div>Precio: RD$${producto.precio.toFixed(2)}</div>
            </div>
          </div>
        </div>
      `;


      // Asegurarse de que los valores sean números
      if (!isNaN(producto.precio) && !isNaN(producto.cantidad)) {
        ingresoTotal += producto.precio * producto.cantidad;  // Sumar el ingreso total

        // Contar productos vendidos
        if (!productosVendidos[producto.nombre]) {
          productosVendidos[producto.nombre] = 0;
        }
        productosVendidos[producto.nombre] += producto.cantidad;
      } else {
        console.error('Datos inválidos:', producto);
      }
    });

    const fechaOriginal = factura.fecha;
    const fecha = new Date(fechaOriginal);
    const formatoFecha = fecha.toLocaleDateString("es-DO");

    const wrapper = document.createElement('div');
    wrapper.classList.add('factura-wrapper');

    const infoFacturaDiv = document.createElement('div');
    infoFacturaDiv.classList.add('info-factura');
    infoFacturaDiv.innerHTML = `
      <div><strong>Factura #${index + 1}</strong></div>
      <div><strong>Cliente:</strong> ${factura.cliente}</div>
      <div><strong>Fecha de factura:</strong> ${formatoFecha}</div>
    `;

    card.innerHTML = `
      ${productosHTML}
    `;

    const accionesDiv = document.createElement('div');
    accionesDiv.classList.add('factura-acciones');

    const totalDiv = document.createElement('div');
    totalDiv.classList.add('precio-fijo');
    totalDiv.innerHTML = `<strong>Total:</strong> RD$${ingresoTotal.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn-eliminar');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => {
      const confirmar = confirm("¿Estás seguro de que deseas eliminar esta factura?");
      if (confirmar) {
        wrapper.remove();
      }
    });

    accionesDiv.appendChild(totalDiv);
    accionesDiv.appendChild(btnEliminar);

    wrapper.appendChild(infoFacturaDiv);
    wrapper.appendChild(card);
    wrapper.appendChild(accionesDiv);

    container.appendChild(wrapper);
  });

  // Actualizar el ingreso total y los productos más vendidos
  console.log(`Ingreso total calculado: RD$${ingresoTotal.toFixed(2)}`);
  document.getElementById('ingreso-total').textContent = formatCurrency(ingresoTotal);

  // Mostrar productos más vendidos
  const productosArray = Object.entries(productosVendidos);  // Convertir el objeto a un array
  let cantidadTotal = 0;  // Variable para acumular la cantidad total de productos vendidos
  
  productosArray.forEach(([producto, cantidad]) => {
    cantidadTotal += cantidad;  // Sumar la cantidad de cada producto
  });
  
  // Mostrar solo el total de productos vendidos
  document.getElementById('productos-vendidos').textContent = ` ${cantidadTotal}`;
}
