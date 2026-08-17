// ==========================================
// OBTENER TOKEN
// ==========================================

let token = localStorage.getItem('token');


// ==========================================
// OBTENER TOKEN DESDE OAUTH
// ==========================================

const parametros =
    new URLSearchParams(window.location.search);

const tokenOAuth =
    parametros.get('token');


// ==========================================
// GUARDAR TOKEN DE OAUTH
// ==========================================

if (tokenOAuth) {

    token = tokenOAuth;

    localStorage.setItem(
        'token',
        tokenOAuth
    );

    // Limpiar el token de la URL
    window.history.replaceState(
        {},
        document.title,
        '/carrito.html'
    );

}


// ==========================================
// SI NO EXISTE TOKEN
// ==========================================

if (!token) {

    window.location.href =
        '/login.html';

}


// ==========================================
// REFERENCIA AL CARRITO
// ==========================================

const carritoPanel =
    document.querySelector('.carrito');


// ==========================================
// ABRIR CARRITO
// ==========================================

async function mostrarCarrito() {

    // Mostrar el carrito flotante
    if (carritoPanel) {

        carritoPanel.classList.add('active');

    }

    // Actualizar información
    await cargarCarrito();

}


// ==========================================
// CERRAR CARRITO
// ==========================================

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

        const respuesta =
            await fetch(
                '/api/carrito',
                {
                    method: 'GET',

                    headers: {

                        'Authorization':
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'
                    }
                }
            );


        // ==========================================
        // TOKEN INVÁLIDO O EXPIRADO
        // ==========================================

        if (respuesta.status === 401) {

            localStorage.removeItem('token');

            window.location.href =
                '/login.html';

            return;

        }


        const carrito =
            await respuesta.json();


        // ==========================================
        // ERROR DEL SERVIDOR
        // ==========================================

        if (!respuesta.ok) {

            console.error(
                'Error al cargar carrito:',
                carrito
            );

            return;

        }


        // ==========================================
        // MOSTRAR PRODUCTOS
        // ==========================================

        mostrarProductosCarrito(carrito);


        // ==========================================
        // ACTUALIZAR CONTADOR
        // ==========================================

        actualizarContador(carrito);


        // ==========================================
        // ACTUALIZAR TOTAL
        // ==========================================

        actualizarTotales(carrito);


    } catch (error) {

        console.error(
            'Error al conectar con el servidor:',
            error
        );

    }

}


// ==========================================
// MOSTRAR PRODUCTOS DEL CARRITO
// ==========================================

function mostrarProductosCarrito(carrito) {

    const lista =
        document.getElementById(
            'listaCarrito'
        );


    if (!lista) {

        return;

    }


    lista.innerHTML = '';


    // ==========================================
    // CARRITO VACÍO
    // ==========================================

    if (
        !carrito.items ||
        carrito.items.length === 0
    ) {

        lista.innerHTML = `

            <div class="carrito-vacio">

                <div class="empty-icon">
                    🛒
                </div>

                <h3>
                    Tu carrito está vacío
                </h3>

                <p>
                    Agrega algunos videojuegos
                    para comenzar.
                </p>

            </div>

        `;

        return;

    }


    // ==========================================
    // MOSTRAR CADA PRODUCTO
    // ==========================================

    carrito.items.forEach(item => {

        const div =
            document.createElement('div');


        div.className =
            'carrito-item';


        const precio =
            Number(item.precio);


        const cantidad =
            Number(item.cantidad);


        const subtotal =
            precio * cantidad;


        div.innerHTML = `

            <img
                src="${item.imagen}"
                width="80"
                alt="${item.nombre}"
            >

            <div>

                <h3>
                    ${item.nombre}
                </h3>

                <p>
                    Precio:
                    $${precio.toFixed(2)}
                </p>

                <p>
                    Cantidad:
                    ${cantidad}
                </p>

                <p>
                    Subtotal:
                    $${subtotal.toFixed(2)}
                </p>

                <button
                    onclick="eliminarProducto('${item.productId}')">

                    Eliminar

                </button>

            </div>

        `;


        lista.appendChild(div);

    });

}


// ==========================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ==========================================

function actualizarContador(carrito) {

    const contador =
        document.getElementById(
            'contadorCarrito'
        );


    if (!contador) {

        return;

    }


    let cantidadTotal = 0;


    if (carrito.items) {

        carrito.items.forEach(item => {

            cantidadTotal +=
                Number(item.cantidad);

        });

    }


    contador.textContent =
        cantidadTotal;

}


// ==========================================
// ACTUALIZAR SUBTOTAL Y TOTAL
// ==========================================

function actualizarTotales(carrito) {

    const total =
        Number(carrito.total || 0);


    const totalElement =
        document.getElementById(
            'total'
        );


    const subtotalElement =
        document.getElementById(
            'subtotal'
        );


    if (totalElement) {

        totalElement.textContent =
            total.toFixed(2);

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            total.toFixed(2);

    }

}


// ==========================================
// AGREGAR PRODUCTO
// ==========================================

async function agregarProducto(
    productId
) {

    try {

        // ==========================================
        // VALIDAR PRODUCT ID
        // ==========================================

        if (!productId) {

            alert(
                'No se encontró el ID del producto.'
            );

            return;

        }


        const respuesta =
            await fetch(
                '/api/carrito/add',
                {

                    method: 'POST',

                    headers: {

                        'Authorization':
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'

                    },

                    body: JSON.stringify({

                        productId:
                            productId,

                        cantidad: 1

                    })

                }
            );


        const datos =
            await respuesta.json();


        // ==========================================
        // ERROR
        // ==========================================

        if (!respuesta.ok) {

            alert(
                datos.error ||
                'No se pudo agregar el producto.'
            );

            return;

        }


        // ==========================================
        // ACTUALIZAR CARRITO
        // ==========================================

        await cargarCarrito();


        // ==========================================
        // MOSTRAR CARRITO
        // ==========================================

        if (carritoPanel) {

            carritoPanel.classList.add(
                'active'
            );

        }


    } catch (error) {

        console.error(
            'Error al agregar producto:',
            error
        );

        alert(
            'No se pudo conectar con el servidor.'
        );

    }

}


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function eliminarProducto(
    productId
) {

    try {

        if (!productId) {

            return;

        }


        const respuesta =
            await fetch(
                `/api/carrito/remove/${productId}`,
                {

                    method: 'DELETE',

                    headers: {

                        'Authorization':
                            `Bearer ${token}`, 

                        'Content-Type':
                            'application/json'

                    }

                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                datos.error ||
                'No se pudo eliminar el producto.'
            );

            return;

        }


        // Actualizar carrito
        await cargarCarrito();


    } catch (error) {

        console.error(
            'Error al eliminar producto:',
            error
        );

    }

}


// ==========================================
// VACIAR CARRITO
// ==========================================

async function vaciarCarrito() {

    try {

        const respuesta =
            await fetch(
                '/api/carrito/clear',
                {

                    method: 'DELETE',

                    headers: {

                        'Authorization':
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'

                    }

                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                datos.error ||
                'No se pudo vaciar el carrito.'
            );

            return;

        }


        // Actualizar carrito
        await cargarCarrito();


    } catch (error) {

        console.error(
            'Error al vaciar carrito:',
            error
        );

    }

}


// ==========================================
// FINALIZAR COMPRA
// ==========================================

function finalizarCompra() {

    alert(
        'Compra finalizada correctamente'
    );

}


// ==========================================
// CERRAR SESIÓN
// ==========================================

function cerrarSesion() {

    localStorage.removeItem(
        'token'
    );


    window.location.href =
        '/login.html';

}


// ==========================================
// BUSCADOR DE PRODUCTOS
// ==========================================

function buscarProductos() {

    const buscador =
        document.getElementById(
            'buscador'
        );


    if (!buscador) {

        return;

    }


    const texto =
        buscador.value
            .toLowerCase()
            .trim();


    const productos =
        document.querySelectorAll(
            '.producto'
        );


    productos.forEach(producto => {

        const nombre =
            producto
                .querySelector('h2')
                ?.textContent
                .toLowerCase() || '';


        const categoria =
            producto
                .querySelector('.categoria')
                ?.textContent
                .toLowerCase() || '';


        if (
            nombre.includes(texto) ||
            categoria.includes(texto)
        ) {

            producto.style.display =
                '';

        } else {

            producto.style.display =
                'none';

        }

    });

}


