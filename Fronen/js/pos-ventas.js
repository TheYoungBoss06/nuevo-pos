// ==========================
// VERIFICACIÓN DE TOKEN
// ==========================
export function verificarToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/Fronen/pages/login.html';
    return;
  }

  fetch('http://localhost:3000/validate', {
    method: 'GET',
    headers: { 'token': token }
  })
    .then(res => {
      if (!res.ok) throw new Error('Token inválido');
      return res.json();
    })
    .then(data => console.log('Token válido:', data))
    .catch(() => {
      localStorage.removeItem('token');
      window.location.href = '/Fronen/pages/login.html';
    });
}

// ==========================
// FUNCIÓN PRINCIPAL POS
// ==========================
export function cargarPOSVenta() {
  verificarToken();

  const token = localStorage.getItem('token');
  const facturaProductos = document.querySelector('.factura-productos');
  const totalElement = document.getElementById('total');
  const btnVender = document.querySelector('.btn-vender');
  const btnNuevo = document.getElementById('btn-nuevo-venta');
  const clienteInput = document.getElementById('cliente-input');
  // NUEVO: input para el código de descuento
  const descuentoInput = document.getElementById('descuento-input');

  let productos = [];
  let total = 0;
  let clienteNombre = '';
  // NUEVO: variable para el descuento aplicado
  let descuento = 0;

  cargarProductos();
  document.getElementById('filtroNombre')?.addEventListener('input', buscarProductos);

  btnNuevo?.addEventListener('click', () => {
    clienteNombre = clienteInput.value.trim();
    if (clienteNombre) {
      alert('Nombre agregado con éxito: ' + clienteNombre);
      clienteInput.value = '';
    } else {
      alert('Por favor, ingresa el nombre del cliente');
    }
  });

  btnVender?.addEventListener('click', manejarVenta);

  async function cargarProductos() {
    try {
      const respuesta = await fetch('http://127.0.0.1:3000/api/productos');
      const data = await respuesta.json();

      // Verifica cómo está estructurado el JSON
      console.log('Respuesta API:', data.productos);

      // Si los productos están directamente en `data.productos`, usa esa propiedad
      productos = Array.isArray(data) ? data : [];  // Asegura que sea un array
      mostrarProductos(productos);
      console.log('Productos cargados:', productos);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }

  function mostrarProductos(productos) {
    if (!Array.isArray(productos)) {
      console.error('Los productos no son un array válido:', productos);
      return;
    }

    const container = document.getElementById('producto-container');
    container.innerHTML = '';

    productos.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('producto-card');
      const imagenSrc = producto.imagen || 'img/img-no-disponible.png';

      productoDiv.innerHTML = `
        <img class="producto-img" src="${imagenSrc}" alt="${producto.nombre}">
        <div class="producto-nombre"><strong>Nombre:</strong> ${producto.nombre}</div>
        <div class="producto-cantidad"><strong>Cantidad:</strong> ${producto.cantidad}</div>
        <div class="producto-precio"><strong>Precio:</strong> RD$${producto.precio_compra.toFixed(2)}</div>
        <button class="btn-agregar">+</button>
      `;

      productoDiv.querySelector('.btn-agregar').addEventListener('click', () => agregarProductoAFactura(producto));
      container.appendChild(productoDiv);
    });
  }

  function buscarProductos() {
    const filtro = document.getElementById('filtroNombre').value.toLowerCase();
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      p.codigo_local.toLowerCase().includes(filtro)
    );
    mostrarProductos(filtrados);
  }

  function agregarProductoAFactura(producto) {
    const mensaje = facturaProductos.querySelector('p');
    if (mensaje) mensaje.remove();

    let item = facturaProductos.querySelector(`.item-factura[data-id="${producto.id}"]`);
    if (item) {
      const cantidadElement = item.querySelector('.cantidad');
      let cantidad = parseInt(cantidadElement.textContent);
      cantidadElement.textContent = ++cantidad;
    } else {
      item = document.createElement('div');
      item.classList.add('item-factura');
      item.dataset.id = producto.id;

      item.innerHTML = `
        <img src="${producto.imagen || 'img/img-no-disponible.png'}" alt="${producto.nombre}" class="factura-img">
        <div class="info">
          <span class="nombre">${producto.nombre}</span><br>
          <small>Cantidad: <span class="cantidad">1</span></small><br>
          <small>Precio: RD$${producto.precio_compra.toFixed(2)}</small><br>
          <button class="btn-eliminar">Eliminar</button>
        </div>
      `;

      item.querySelector('.btn-eliminar').addEventListener('click', () =>
        eliminarProductoDeFactura(item, producto.precio_compra)
      );

      facturaProductos.appendChild(item);
    }

    total += producto.precio_compra;
    actualizarTotal();
  }

  function eliminarProductoDeFactura(item, precio) {
    const cantidadElement = item.querySelector('.cantidad');
    let cantidad = parseInt(cantidadElement.textContent);

    if (cantidad > 1) {
      cantidadElement.textContent = --cantidad;
    } else {
      item.remove();
    }

    total -= precio;
    actualizarTotal();
  }

  function actualizarTotal() {
    // NUEVO: Aplica el descuento si existe
    let totalConDescuento = total;
    if (descuento > 0) {
      totalConDescuento = total - descuento;
      if (totalConDescuento < 0) totalConDescuento = 0;
    }
    totalElement.textContent = totalConDescuento.toLocaleString('es-DO', {
      style: 'currency',
      currency: 'DOP'
    });
  }

  // NUEVO: Escuchar cambios en el input de descuento
  descuentoInput?.addEventListener('input', () => {
    const codigo = descuentoInput.value.trim().toUpperCase();
    let valido = false;
    if (codigo === 'DESCUENTO100') {
      descuento = 100;
      valido = true;
    } else if (codigo === 'DESCUENTO50') {
      descuento = 50;
      valido = true;
    } else if (codigo === '') {
      descuento = 0;
      valido = true;
    } else {
      descuento = 0;
      valido = false;
    }
    // Cambia el color del input si no es válido
    if (!valido) {
      descuentoInput.classList.add('input-error');
    } else {
      descuentoInput.classList.remove('input-error');
    }
    actualizarTotal();
  });

  function manejarVenta() {
    if (!clienteNombre) return alert("Por favor, ingresa el nombre del cliente.");
    if (total === 0) return alert("No hay productos en la factura.");

    // NUEVO: Aplica el descuento al total de la venta
    const venta = {
      cliente: clienteNombre,
      productos: [],
      total: descuento > 0 ? total - descuento : total,
      descuento: descuento // puedes enviar el descuento aplicado
    };

    document.querySelectorAll('.item-factura').forEach(item => {
      const nombre = item.querySelector('.nombre').textContent;
      const cantidad = parseInt(item.querySelector('.cantidad').textContent);
      const precio = parseFloat(item.querySelectorAll('.info small')[1].textContent.replace('Precio: RD$', '').trim());

      venta.productos.push({
        id: parseInt(item.dataset.id),
        nombre,
        cantidad,
        imagen: item.querySelector('img').src,
        precio
      });
    });

    alert("Venta Exitosa!!");
    console.log('Venta realizada:', venta);

    fetch('http://localhost:3000/api/facturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(venta)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al registrar la venta');
        return res.json();
      })
      .then(data => {
        alert(`Venta registrada correctamente.\nFactura ID: ${data.id || 'N/A'}`);

        venta.productos.forEach(producto => {
          console.log(`Actualizando cantidad de ${producto.id}...`);
          console.log(`Intentando actualizar producto ${producto.id}`, producto);

          console.log('PATCH to:', `http://127.0.0.1:3000/api/productos/${producto.id}`, {
            cantidad: -producto.cantidad,
            token
          });
          fetch(`http://127.0.0.1:3000/api/productos/${producto.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'token': token
            },
            body: JSON.stringify({
              cantidad: -producto.cantidad,
              token: token  // ✅ ahora sí está en el body
            })
          })
          
            .then(res => {
              if (!res.ok) {
                return res.json().then(errorData => {
                  throw new Error(errorData.mensaje || 'Error desconocido');
                });
              }
              return res.json();
            })
            .then(data => {
              console.log(`Producto actualizado: ${producto.nombre}`, data);
            })
            .catch(err => {
              console.error('Error al actualizar producto:', err.message);
              alert(`Error al actualizar el producto ${producto.nombre}: ${err.message}`);
            });
        });
      })
      .catch(err => {
        console.error('Error al registrar la venta:', err);
        alert('Error al registrar la venta.');
      });
      

    // Limpiar la factura
    facturaProductos.innerHTML = '';
    total = 0;
    clienteNombre = '';
    actualizarTotal();
    clienteInput.value = '';
  }
}
