// ==========================================
// CONFIGURACIÓN DE API Y TOKEN
// ==========================================
const API_URL = '/api/carrito';

let token = localStorage.getItem('token');

// Obtener token desde OAuth si viene en la URL
const parametros = new URLSearchParams(window.location.search);
const tokenOAuth = parametros.get('token');

if (tokenOAuth) {
    token = tokenOAuth;
    localStorage.setItem('token', tokenOAuth);
    // Limpiar el token de la URL sin recargar
    window.history.replaceState({}, document.title, '/carrito.html');
}

// Validar existencia del token
if (!token) {
    window.location.href = '/login.html';
}

// ==========================================
// REFERENCIAS Y EVENTOS INICIALES
// ==========================================
const carritoPanel = document.querySelector('.carrito');

document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
});

// ==========================================
// ABRIR Y CERRAR PANEL
// ==========================================
async function mostrarCarrito() {
    if (carritoPanel) {
        carritoPanel.classList.add('active');
    }
    await cargarCarrito();
}

function cerrarCarrito() {
    if (carritoPanel) {
        carritoPanel.classList.remove('active');
    }
}

// ==========================================
// CARGAR CARRITO DESDE EL SERVIDOR
// ==========================================
async function cargarCarrito() {
    try {
        const respuesta = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Token inválido o expirado
        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        const carrito = await respuesta.json();

        if (!respuesta.ok) {
            console.error('Error al cargar carrito:', carrito);
            return;
        }

        mostrarProductosCarrito(carrito);
        actualizarContador(carrito);
        actualizarTotales(carrito);

    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
    }
}

// ==========================================
// MOSTRAR PRODUCTOS EN LA INTERFAZ
// ==========================================
function mostrarProductosCarrito(carrito) {
    const lista = document.getElementById('listaCarrito');
    if (!lista) return;

    lista.innerHTML = '';

    if (!carrito.items || carrito.items.length === 0) {
        lista.innerHTML = `
            <div class="carrito-vacio">
                <div class="empty-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega algunos videojuegos para comenzar.</p>
            </div>
        `;
        return;
    }

    carrito.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'carrito-item';

        const precio = Number(item.precio || 0);
        const cantidad = Number(item.cantidad || 0);
        const subtotal = precio * cantidad;

        // Soporta varias estructuras de ID que pueda enviar el servidor
        const idProducto = item.productId || item.producto?._id || item._id;

        div.innerHTML = `
            <img src="${item.imagen || '/images/default.jpg'}" width="80" alt="${item.nombre}">
            <div>
                <h3>${item.nombre}</h3>
                <p>Precio: $${precio.toFixed(2)}</p>
                <p>Cantidad: ${cantidad}</p>
                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                <button onclick="eliminarProducto('${idProducto}')">Eliminar</button>
            </div>
        `;

        lista.appendChild(div);
    });
}

// ==========================================
// ACTUALIZAR CONTADOR Y TOTALES
// ==========================================
function actualizarContador(carrito) {
    const contador = document.getElementById('contadorCarrito');
    if (!contador) return;

    let cantidadTotal = 0;
    if (carrito.items) {
        carrito.items.forEach(item => {
            cantidadTotal += Number(item.cantidad || 0);
        });
    }

    contador.textContent = cantidadTotal;
}

function actualizarTotales(carrito) {
    const total = Number(carrito.total || 0);
    const totalElement = document.getElementById('total');
    const subtotalElement = document.getElementById('subtotal');

    if (totalElement) totalElement.textContent = total.toFixed(2);
    if (subtotalElement) subtotalElement.textContent = total.toFixed(2);
}

// ==========================================
// AGREGAR PRODUCTO
// ==========================================
async function agregarProducto(productId) {
    try {
        if (!productId) {
            alert('No se encontró el ID del producto.');
            return;
        }

        const respuesta = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                cantidad: 1
            })
        });

        const texto = await respuesta.text();
        let datos;

        try {
            datos = JSON.parse(texto);
        } catch {
            datos = { error: texto };
        }

        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            alert('La sesión expiró. Inicia sesión nuevamente.');
            window.location.href = '/login.html';
            return;
        }

        if (!respuesta.ok) {
            alert(datos.error || 'No se pudo agregar el producto.');
            return;
        }

        await cargarCarrito();

        if (carritoPanel) {
            carritoPanel.classList.add('active');
        }

    } catch (error) {
        console.error('Error al agregar producto:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

// ==========================================
// ELIMINAR PRODUCTO INDIVIDUAL
// ==========================================
async function eliminarProducto(productId) {
    try {
        if (!productId) return;

        const respuesta = await fetch(`${API_URL}/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.error || 'No se pudo eliminar el producto.');
            return;
        }

        await cargarCarrito();

    } catch (error) {
        console.error('Error al eliminar producto:', error);
    }
}

// ==========================================
// VACIAR CARRITO COMPLETO
// ==========================================
async function vaciarCarrito() {
    try {
        const respuesta = await fetch(`${API_URL}/clear`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.error || 'No se pudo vaciar el carrito.');
            return;
        }

        await cargarCarrito();

    } catch (error) {
        console.error('Error al vaciar carrito:', error);
    }
}

// ==========================================
// UTILIDADES (COMPRA, SESIÓN, BUSCADOR)
// ==========================================
function finalizarCompra() {
    alert('Compra finalizada correctamente');
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function buscarProductos() {
    const buscador = document.getElementById('buscador');
    if (!buscador) return;

    const texto = buscador.value.toLowerCase().trim();
    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        const nombre = producto.querySelector('h2')?.textContent.toLowerCase() || '';
        const categoria = producto.querySelector('.categoria')?.textContent.toLowerCase() || '';

        if (nombre.includes(texto) || categoria.includes(texto)) {
            producto.style.display = '';
        } else {
            producto.style.display = 'none';
        }
    });
}