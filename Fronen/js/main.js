const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/pages/login.html';
} else {
  fetch('http://localhost:3000/validate', {
    method: 'GET',
    headers: { 'token': token }
  })
    .then(res => {
      if (!res.ok) throw new Error('Token inválido');
      return res.json();
    })
    .then(data => {
      console.log('Token válido:', data);
      iniciarDashboard();
    })
    .catch(() => {
      localStorage.removeItem('token');
      window.location.href = '/pages/login.html';
    });
}

// Función para inicializar el dashboard
function iniciarDashboard() {
  // Si no hay hash en la URL, establecer #estadisticas por defecto
  if (!window.location.hash) {
    window.location.hash = '#estadisticas';
  }

  manejarNavegacion(); // carga inicial
  window.addEventListener('hashchange', manejarNavegacion); // escucha navegación

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/pages/login.html';
    });
  }
}

// Navegación por hash
function manejarNavegacion() {
  const hash = window.location.hash;
  const main = document.getElementById('main-content');

  if (!main) return;

  if (hash === '#pos-venta') {
    main.innerHTML = `
    <!-- Encabezado -->
          <header class="header2">
        <h1>Dashboard
        </h1>
        
        <div class="header-right">
        
          <i class='bx bx-bell'></i>
          <i class='bx bx-user-circle'></i>
        </div>
 
      </header>

    <!-- Contenido principal -->
    <div class="container">
      <!-- Panel izquierdo: Productos -->
      <section class="panel-izquierdo">
        <div class="busqueda-productos">
          <input type="text" id="filtroNombre" placeholder="Buscar productos..." oninput="buscarProductos()" />
          <button class="btn-nuevo-venta">Buscar</button>
        </div>

        <div id="producto-container" class="grid-productos">
          <!-- Aquí se insertarán las tarjetas -->
        </div>
      </section>

      <!-- Panel derecho: Factura -->
      <div class="contenedor"></div>
      <aside class="panel-derecho">
        <h2>Factura de venta</h2>

        <div class="factura-opciones">
          <input type="text" placeholder="Cliente: Consumidor final" id="cliente-input" />
          <button class="btn-nuevo-venta-user" id="btn-nuevo-venta">Agregar cliente nuevo</button>
        </div>

        <div class="factura-productos">
          <p>Aquí verás los productos que elijas en tu próxima venta</p>
        </div>

        <div class="factura-footer">
          <button class="btn-vender">Vender</button>
          <div class='total'>Total: RD$<span id="total">0.00</span></div>
          <input id="descuento-input" class="input" placeholder="Descuento">
        </div>
      </aside>
    </div>
    `;

    // Importar y ejecutar POS Venta
    import('./pos-ventas.js').then(modulo => {
      modulo.cargarPOSVenta();
    });
  }

  else if (hash === '#estadisticas') {
    main.innerHTML = `
      <header class="header2">
        <h1>Dashboard</h1>
        <div class="header-right">
          <i class='bx bx-bell'></i>
          <i class='bx bx-user-circle'></i>
        </div>
      </header>

      <section class="header1">
        <h1>Estadísticas</h1>
        <div class="metrics">
          <div class="metric">
            <h2>Productos Vendidos</h2>
            <p id="productos-vendidos">Cargando...</p>
          </div>
          <div class="metric">
            <h2>Categoría Más Vendida</h2>
            <p id="categoria-vendida">Cargando...</p>
          </div>
          <div class="metric">
            <h2>Ingreso Total</h2>
            <p id="ingreso-total">Cargando...</p>
          </div>
        </div>
      </section>

      <div class="grafico-container">
        <canvas id="graficoVentas" width="1000" height="200"></canvas>
      </div>
      <h2>Facturas</h2>
      <div id="facturas-container" class="facturas-grid"></div> <!-- Aquí aparecerán las facturas -->
    `;

    // Importar y ejecutar estadísticas y facturas
    import('./estadistica.js').then(modulo => {
      modulo.obtenerDatos();       // carga estadísticas
      modulo.cargarFacturas();     // carga las facturas también
    });
  }
}
