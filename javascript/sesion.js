(() => {
    const scriptActual = document.currentScript;

    if (!scriptActual?.src) {
        return;
    }

    const urlEstadoSesion = new URL("../php/estado_sesion.php", scriptActual.src);
    const urlCerrarSesion = new URL("../php/cerrar_sesion.php", scriptActual.src);

    const ocultarEnlaceInicioSesion = (enlace) => {
        enlace.hidden = true;

        const separadorAnterior = enlace.previousElementSibling;
        if (separadorAnterior?.classList.contains("separador")) {
            separadorAnterior.hidden = true;
        }
    };

    const crearControlUsuario = (nombreCompleto) => {
        const contenedor = document.createElement("div");
        contenedor.className = "sesion-usuario";

        const botonUsuario = document.createElement("button");
        botonUsuario.type = "button";
        botonUsuario.className = "boton-usuario";
        botonUsuario.textContent = `👤 ${nombreCompleto}`;
        botonUsuario.setAttribute("aria-expanded", "false");
        botonUsuario.setAttribute("aria-haspopup", "true");

        const menu = document.createElement("div");
        menu.className = "menu-usuario";
        menu.hidden = true;

        const botonCerrarSesion = document.createElement("button");
        botonCerrarSesion.type = "button";
        botonCerrarSesion.className = "boton-cerrar-sesion";
        botonCerrarSesion.textContent = "Cerrar sesión";

        const mensaje = document.createElement("p");
        mensaje.className = "mensaje-cierre-sesion";
        mensaje.setAttribute("role", "status");
        mensaje.setAttribute("aria-live", "polite");
        mensaje.hidden = true;

        const cerrarMenu = () => {
            menu.hidden = true;
            botonUsuario.setAttribute("aria-expanded", "false");
        };

        botonUsuario.addEventListener("click", () => {
            const abrir = menu.hidden;
            menu.hidden = !abrir;
            botonUsuario.setAttribute("aria-expanded", String(abrir));
        });

        botonCerrarSesion.addEventListener("click", async () => {
            botonCerrarSesion.disabled = true;
            botonCerrarSesion.textContent = "Cerrando...";
            mensaje.hidden = true;

            try {
                const respuesta = await fetch(urlCerrarSesion, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!respuesta.ok) {
                    throw new Error(`Respuesta HTTP ${respuesta.status}`);
                }

                window.location.reload();
            } catch (error) {
                console.warn("No se pudo cerrar la sesión.", error);
                botonCerrarSesion.disabled = false;
                botonCerrarSesion.textContent = "Cerrar sesión";
                mensaje.textContent = "No se pudo cerrar la sesión. Inténtalo nuevamente.";
                mensaje.hidden = false;
            }
        });

        document.addEventListener("click", (evento) => {
            if (!contenedor.contains(evento.target)) {
                cerrarMenu();
            }
        });

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !menu.hidden) {
                cerrarMenu();
                botonUsuario.focus();
            }
        });

        menu.append(botonCerrarSesion, mensaje);
        contenedor.append(botonUsuario, menu);
        return contenedor;
    };

    document.addEventListener("DOMContentLoaded", async () => {
        const enlaceInicioSesion = document.querySelector(
            '.nav-menu a[href$="inicioSesion.html"]'
        );
        const enlaceCarrito = document.querySelector(
            '.nav-menu a[href$="carrito.html"]'
        );

        if (!enlaceInicioSesion || !enlaceCarrito) {
            return;
        }

        try {
            const respuesta = await fetch(urlEstadoSesion, {
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!respuesta.ok) {
                throw new Error(`Respuesta HTTP ${respuesta.status}`);
            }

            const estado = await respuesta.json();
            const nombreCompleto = [estado.nombres, estado.apellidos]
                .filter((valor) => typeof valor === "string" && valor.trim() !== "")
                .map((valor) => valor.trim())
                .join(" ");

            if (!estado.autenticado || nombreCompleto === "") {
                return;
            }

            ocultarEnlaceInicioSesion(enlaceInicioSesion);

            const controlUsuario = crearControlUsuario(nombreCompleto);
            const separadorUsuario = document.createElement("span");
            separadorUsuario.className = "separador separador-usuario";
            separadorUsuario.textContent = "|";

            enlaceCarrito.before(controlUsuario, separadorUsuario);
        } catch (error) {
            console.warn("No se pudo consultar la sesión actual.", error);
        }
    });
})();
