document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("#form-registro");
    const mensaje = document.querySelector("#mensaje-registro");
    const fechaNacimiento = document.querySelector("#fecha_nacimiento");

    if (fechaNacimiento) {
        const hoyLocal = new Date();
        hoyLocal.setMinutes(hoyLocal.getMinutes() - hoyLocal.getTimezoneOffset());
        fechaNacimiento.max = hoyLocal.toISOString().split("T")[0];
    }

    const resultado = new URLSearchParams(window.location.search).get("resultado");

    const mensajes = {
        exito: {
            tipo: "exito",
            texto: "✅ Registro exitoso. Tu cuenta fue guardada correctamente.",
        },
        campos_incompletos: {
            tipo: "error",
            texto: "Completa todos los campos obligatorios.",
        },
        campos_extensos: {
            tipo: "error",
            texto: "Uno o más campos superan los 255 caracteres permitidos.",
        },
        correo_invalido: {
            tipo: "error",
            texto: "Ingresa un correo electrónico válido.",
        },
        password_invalido: {
            tipo: "error",
            texto: "La contraseña debe tener entre 8 y 72 caracteres.",
        },
        fecha_invalida: {
            tipo: "error",
            texto: "Ingresa una fecha de nacimiento válida que no sea futura.",
        },
        terminos_requeridos: {
            tipo: "error",
            texto: "Debes aceptar los Términos y Condiciones.",
        },
        correo_registrado: {
            tipo: "error",
            texto: "Ese correo electrónico ya está registrado.",
        },
        error_servidor: {
            tipo: "error",
            texto: "No se pudo completar el registro. Verifica que MySQL esté iniciado e inténtalo nuevamente.",
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
