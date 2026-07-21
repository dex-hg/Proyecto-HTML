document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("#form-inicio-sesion");
    const mensaje = document.querySelector("#mensaje-sesion");
    const resultado = new URLSearchParams(window.location.search).get("resultado");

    const mensajes = {
        exito: {
            tipo: "exito",
            texto: "✅ Inicio de sesión exitoso. Bienvenido de vuelta a Chaufa D Ming.",
        },
        campos_incompletos: {
            tipo: "error",
            texto: "Completa el correo electrónico y la contraseña.",
        },
        correo_invalido: {
            tipo: "error",
            texto: "Ingresa un correo electrónico válido.",
        },
        credenciales_invalidas: {
            tipo: "error",
            texto: "El correo electrónico o la contraseña son incorrectos.",
        },
        error_servidor: {
            tipo: "error",
            texto: "No se pudo iniciar sesión. Verifica que MySQL esté iniciado e inténtalo nuevamente.",
        },
    };

    if (!mensaje || !resultado || !mensajes[resultado]) {
        return;
    }

    const contenido = mensajes[resultado];
    mensaje.textContent = contenido.texto;
    mensaje.classList.add(`mensaje-${contenido.tipo}`);
    mensaje.hidden = false;

    if (resultado === "exito" && formulario) {
        formulario.reset();
    }

    window.history.replaceState({}, document.title, window.location.pathname);
});
