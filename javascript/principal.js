
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".btn-carta")?.addEventListener("click", () => {
        window.location.href = "Carta.html";
    });

    const carrusel = document.querySelector(".carrusel");
    const pista = carrusel?.querySelector(".carrusel-imagenes");
    const diapositivas = pista ? Array.from(pista.querySelectorAll("img")) : [];

    if (!carrusel || !pista || diapositivas.length < 2) {
        return;
    }

    carrusel.setAttribute("role", "region");
    carrusel.setAttribute("aria-roledescription", "carrusel");
    carrusel.setAttribute("aria-label", "Promociones de Chaufa D Ming");
    carrusel.tabIndex = 0;

    const botonAnterior = document.createElement("button");
    botonAnterior.type = "button";
    botonAnterior.className = "carrusel-control carrusel-anterior";
    botonAnterior.setAttribute("aria-label", "Mostrar promoción anterior");
    botonAnterior.textContent = "‹";

    const botonSiguiente = document.createElement("button");
    botonSiguiente.type = "button";
    botonSiguiente.className = "carrusel-control carrusel-siguiente";
    botonSiguiente.setAttribute("aria-label", "Mostrar promoción siguiente");
    botonSiguiente.textContent = "›";

    const indicadores = document.createElement("div");
    indicadores.className = "carrusel-indicadores";
    indicadores.setAttribute("aria-label", "Seleccionar promoción");

    const puntos = diapositivas.map((diapositiva, indice) => {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.setAttribute("aria-label", `Mostrar promoción ${indice + 1}`);
        punto.addEventListener("click", () => mostrarDiapositiva(indice, true));
        indicadores.appendChild(punto);
        return punto;
    });

    carrusel.append(botonAnterior, botonSiguiente, indicadores);

    let indiceActual = 0;
    let intervalo;
    let toqueInicial = 0;
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function mostrarDiapositiva(indice, reiniciar = false) {
        indiceActual = (indice + diapositivas.length) % diapositivas.length;
        pista.style.transform = `translateX(-${indiceActual * 100}%)`;

        diapositivas.forEach((diapositiva, posicion) => {
            diapositiva.setAttribute("aria-hidden", String(posicion !== indiceActual));
        });

        puntos.forEach((punto, posicion) => {
            const activo = posicion === indiceActual;
            punto.classList.toggle("activo", activo);
            punto.setAttribute("aria-current", activo ? "true" : "false");
        });

        if (reiniciar) {
            iniciarReproduccion();
        }
    }

    function detenerReproduccion() {
        window.clearInterval(intervalo);
    }

    function iniciarReproduccion() {
        detenerReproduccion();
        if (!reducirMovimiento && !document.hidden) {
            intervalo = window.setInterval(() => {
                mostrarDiapositiva(indiceActual + 1);
            }, 5000);
        }
    }

    botonAnterior.addEventListener("click", () => mostrarDiapositiva(indiceActual - 1, true));
    botonSiguiente.addEventListener("click", () => mostrarDiapositiva(indiceActual + 1, true));

    carrusel.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft") {
            mostrarDiapositiva(indiceActual - 1, true);
        }
        if (evento.key === "ArrowRight") {
            mostrarDiapositiva(indiceActual + 1, true);
        }
    });

    carrusel.addEventListener("mouseenter", detenerReproduccion);
    carrusel.addEventListener("mouseleave", iniciarReproduccion);
    carrusel.addEventListener("focusin", detenerReproduccion);
    carrusel.addEventListener("focusout", (evento) => {
        if (!carrusel.contains(evento.relatedTarget)) {
            iniciarReproduccion();
        }
    });

    carrusel.addEventListener("touchstart", (evento) => {
        toqueInicial = evento.changedTouches[0].clientX;
        detenerReproduccion();
    }, { passive: true });

    carrusel.addEventListener("touchend", (evento) => {
        const desplazamiento = evento.changedTouches[0].clientX - toqueInicial;
        if (Math.abs(desplazamiento) > 50) {
            mostrarDiapositiva(indiceActual + (desplazamiento < 0 ? 1 : -1));
        }
        iniciarReproduccion();
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            detenerReproduccion();
        } else {
            iniciarReproduccion();
        }
    });

    mostrarDiapositiva(0);
    iniciarReproduccion();
});
