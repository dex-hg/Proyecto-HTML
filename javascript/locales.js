
document.addEventListener("DOMContentLoaded", () => {
    const tarjetas = document.querySelectorAll(".local-card[data-horarios]");
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

    const obtenerHoraLima = () => {
        const partes = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Lima",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date());
        const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
        const indiceDia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valores.weekday);

        return {
            dia: indiceDia,
            minutos: Number(valores.hour) * 60 + Number(valores.minute)
        };
    };

    const convertirMinutos = (hora) => {
        const [horas, minutos] = hora.split(":").map(Number);
        return horas * 60 + minutos;
    };

    const formatearHora = (hora) => {
        const [horas, minutos] = hora.split(":").map(Number);
        const periodo = horas >= 12 ? "p. m." : "a. m.";
        const horaDoce = horas % 12 || 12;
        return `${horaDoce}:${String(minutos).padStart(2, "0")} ${periodo}`;
    };

    const leerHorarios = (valor) => {
        const horarios = new Map();
        valor.split(";").forEach((registro) => {
            const [dia, intervalo] = registro.split("=");
            const [apertura, cierre] = intervalo?.split("-") ?? [];

            if (dia !== undefined && apertura && cierre) {
                horarios.set(Number(dia), { apertura, cierre });
            }
        });
        return horarios;
    };

    const proximaApertura = (horarios, diaActual, minutosActuales) => {
        const horarioHoy = horarios.get(diaActual);
        if (horarioHoy && minutosActuales < convertirMinutos(horarioHoy.apertura)) {
            return { distancia: 0, dia: diaActual, hora: horarioHoy.apertura };
        }

        for (let distancia = 1; distancia <= 7; distancia += 1) {
            const dia = (diaActual + distancia) % 7;
            const horario = horarios.get(dia);
            if (horario) {
                return { distancia, dia, hora: horario.apertura };
            }
        }

        return null;
    };

    const actualizarEstados = () => {
        const ahora = obtenerHoraLima();

        tarjetas.forEach((tarjeta) => {
            const horarios = leerHorarios(tarjeta.dataset.horarios);
            const horarioHoy = horarios.get(ahora.dia);
            const estado = tarjeta.querySelector(".estado-local");

            if (!estado) {
                return;
            }

            const estaAbierto = horarioHoy
                && ahora.minutos >= convertirMinutos(horarioHoy.apertura)
                && ahora.minutos < convertirMinutos(horarioHoy.cierre);

            estado.classList.toggle("abierto", Boolean(estaAbierto));
            estado.classList.toggle("cerrado", !estaAbierto);

            if (estaAbierto) {
                estado.textContent = `● Abierto ahora · Cierra a las ${formatearHora(horarioHoy.cierre)}`;
                return;
            }

            const siguiente = proximaApertura(horarios, ahora.dia, ahora.minutos);
            if (!siguiente) {
                estado.textContent = "● Cerrado ahora";
                return;
            }

            const referenciaDia = siguiente.distancia === 0
                ? "hoy"
                : siguiente.distancia === 1
                    ? "mañana"
                    : `el ${dias[siguiente.dia]}`;
            estado.textContent = `● Cerrado ahora · Abre ${referenciaDia} a las ${formatearHora(siguiente.hora)}`;
        });
    };

    actualizarEstados();
    window.setInterval(actualizarEstados, 60000);
});
