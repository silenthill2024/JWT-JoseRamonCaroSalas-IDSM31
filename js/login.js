const formulario =
    document.getElementById('loginForm');


formulario.addEventListener(
    'submit',
    async (e) => {

        e.preventDefault();


        const email =
            document.getElementById('email').value;

        const password =
            document.getElementById('password').value;


        try {

            const respuesta =
                await fetch(
                    '/api/login',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const datos =
                await respuesta.json();


            if (!respuesta.ok) {

                document.getElementById(
                    'mensaje'
                ).textContent =
                    datos.error;

                return;
            }


            // Guardar JWT

            localStorage.setItem(
                'token',
                datos.token
            );


            // Ir al carrito

            window.location.href =
                '/carrito.html';

        } catch (error) {

            console.error(error);

        }

    }
);


// Login Google

function loginGoogle() {
    window.location.href = '/api/auth/google';
}