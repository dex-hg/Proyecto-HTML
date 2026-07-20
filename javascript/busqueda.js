
document.addEventListener("DOMContentLoaded", () => {
    const campoBusqueda = document.querySelector(".buscador");

    if (!campoBusqueda) {
        return;
    }

    const normalizarTexto = (texto) => texto
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const platos = Array.from(document.querySelectorAll(".plato-item"));
    campoBusqueda.type = "search";
    campoBusqueda.setAttribute("aria-label", "Buscar platos");

    if (platos.length === 0) {
        campoBusqueda.placeholder = "🔍 Busca un plato y presiona Enter...";
        campoBusqueda.addEventListener("keydown", (evento) => {
            if (evento.key !== "Enter") {
                return;
            }

            evento.preventDefault();
            const termino = campoBusqueda.value.trim();
            const destino = termino
                ? `Carta.html?buscar=${encodeURIComponent(termino)}`
                : "Carta.html";

            window.location.href = destino;
        });
        return;
    }

    campoBusqueda.placeholder = "🔍 Filtra los platos de la carta...";

    const contenedor = document.querySelector(".contenedor");
    const titulo = contenedor?.querySelector("h1");
    const mensajeResultado = document.createElement("p");
    mensajeResultado.className = "mensaje-busqueda";
    mensajeResultado.setAttribute("role", "status");
    mensajeResultado.setAttribute("aria-live", "polite");

    if (titulo) {
        titulo.insertAdjacentElement("afterend", mensajeResultado);
    }

    const secciones = Array.from(document.querySelectorAll(".categoria-section"));

    const filtrarPlatos = (valor) => {
        const termino = normalizarTexto(valor);
        let coincidencias = 0;

        platos.forEach((plato) => {
            const tituloPlato = plato.querySelector(".plato-info h3")?.textContent ?? "";
            const tituloNormalizado = normalizarTexto(tituloPlato);
            const coincide = termino === "" || tituloNormalizado.includes(termino);
            plato.hidden = !coincide;

            if (coincide) {
                coincidencias += 1;
            }
        });

        secciones.forEach((seccion) => {
            const contieneCoincidencias = Array.from(
                seccion.querySelectorAll(".plato-item")
            ).some((plato) => !plato.hidden);

            seccion.hidden = termino !== "" && !contieneCoincidencias;
        });

        if (termino === "") {
            mensajeResultado.textContent = "";
            mensajeResultado.hidden = true;
            return;
        }

        mensajeResultado.hidden = false;
        mensajeResultado.textContent = coincidencias === 0
            ? `No encontramos platos para “${valor.trim()}”.`
            : `${coincidencias} ${coincidencias === 1 ? "plato encontrado" : "platos encontrados"}.`;
    };

    campoBusqueda.addEventListener("input", () => {
        filtrarPlatos(campoBusqueda.value);
    });

    campoBusqueda.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            campoBusqueda.value = "";
            filtrarPlatos("");
        }
    });

    const terminoInicial = new URLSearchParams(window.location.search).get("buscar");
    if (terminoInicial) {
        campoBusqueda.value = terminoInicial;
        filtrarPlatos(terminoInicial);
    } else {
        filtrarPlatos("");
    }
});
