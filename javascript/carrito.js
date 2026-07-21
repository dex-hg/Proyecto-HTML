
document.addEventListener("DOMContentLoaded", () => {
    const CLAVE_CARRITO = "chaufaDmingCarrito";
    const MAXIMA_CANTIDAD = 99;
    const formatoMoneda = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN"
    });

    const obtenerCarrito = () => {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));

            if (!Array.isArray(datos)) {
                return [];
            }

            return datos.filter((producto) => (
                typeof producto?.id === "string"
                && typeof producto?.nombre === "string"
                && Number.isFinite(Number(producto?.precio))
                && Number.isFinite(Number(producto?.cantidad))
            )).map((producto) => ({
                ...producto,
                precio: Number(producto.precio),
                cantidad: Math.min(
                    MAXIMA_CANTIDAD,
                    Math.max(1, Math.trunc(Number(producto.cantidad)))
                )
            }));
        } catch (error) {
            console.warn("No se pudo leer el carrito guardado.", error);
            return [];
        }
    };

    let carrito = obtenerCarrito();

    const guardarCarrito = () => {
        try {
            localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
        } catch (error) {
            console.warn("No se pudo guardar el carrito.", error);
        }
    };

    const crearId = (nombre) => nombre
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const leerPrecio = (texto) => {
        const coincidencia = texto.replace(",", ".").match(/\d+(?:\.\d+)?/);
        return coincidencia ? Number(coincidencia[0]) : 0;
    };

    const totalUnidades = () => carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

    const actualizarContador = () => {
        const unidades = totalUnidades();

        document.querySelectorAll('a[href$="carrito.html"]').forEach((enlace) => {
            let contador = enlace.querySelector(".contador-carrito");

            if (!contador) {
                contador = document.createElement("span");
                contador.className = "contador-carrito";
                enlace.appendChild(contador);
            }

            contador.textContent = unidades;
            contador.hidden = unidades === 0;
            enlace.setAttribute(
                "aria-label",
                `Carrito, ${unidades} ${unidades === 1 ? "producto" : "productos"}`
            );
        });
    };

    let temporizadorNotificacion;
    const notificar = (mensaje) => {
        let notificacion = document.querySelector(".notificacion-carrito");

        if (!notificacion) {
            notificacion = document.createElement("div");
            notificacion.className = "notificacion-carrito";
            notificacion.setAttribute("role", "status");
            notificacion.setAttribute("aria-live", "polite");
            document.body.appendChild(notificacion);
        }

        window.clearTimeout(temporizadorNotificacion);
        notificacion.textContent = mensaje;
        notificacion.classList.add("visible");
        temporizadorNotificacion = window.setTimeout(() => {
            notificacion.classList.remove("visible");
        }, 2400);
    };

    const agregarProducto = (tarjeta) => {
        const nombre = tarjeta.querySelector(".plato-info h3")?.textContent.trim();
        const precioTexto = tarjeta.querySelector(".precio")?.textContent ?? "";

        if (!nombre || !precioTexto) {
            return;
        }

        const id = crearId(nombre);
        const productoExistente = carrito.find((producto) => producto.id === id);

        if (productoExistente) {
            productoExistente.cantidad = Math.min(
                MAXIMA_CANTIDAD,
                productoExistente.cantidad + 1
            );
        } else {
            const imagen = tarjeta.querySelector("img");
            carrito.push({
                id,
                nombre,
                descripcion: tarjeta.querySelector(".plato-info p")?.textContent.trim() ?? "",
                precio: leerPrecio(precioTexto),
                imagen: imagen?.getAttribute("src") ?? "",
                cantidad: 1
            });
        }

        guardarCarrito();
        actualizarContador();
        renderizarCarrito();
        notificar(`✅ ${nombre} se añadió al carrito.`);
    };

    document.querySelectorAll(".plato-item .btn").forEach((boton) => {
        boton.classList.add("btn-agregar");
        boton.setAttribute("role", "button");
        boton.addEventListener("click", (evento) => {
            evento.preventDefault();
            const tarjeta = boton.closest(".plato-item");
            if (tarjeta) {
                agregarProducto(tarjeta);
            }
        });
    });

    const listaCarrito = document.querySelector("#lista-carrito");
    const totalPrecio = document.querySelector(".total-precio");
    const totalFinal = document.querySelector(".total-final");
    const botonVaciar = document.querySelector(".btn-vaciar");

    function crearItemCarrito(producto) {
        const item = document.createElement("div");
        item.className = "carrito-item";
        item.dataset.productoId = producto.id;

        const informacion = document.createElement("div");
        informacion.className = "producto-info";

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;

        const textos = document.createElement("div");
        const nombre = document.createElement("div");
        nombre.className = "nombre";
        nombre.textContent = producto.nombre;
        const descripcion = document.createElement("div");
        descripcion.className = "descripcion";
        descripcion.textContent = producto.descripcion;
        textos.append(nombre, descripcion);
        informacion.append(imagen, textos);

        const precio = document.createElement("div");
        precio.className = "precio";
        precio.textContent = formatoMoneda.format(producto.precio);

        const cantidad = document.createElement("div");
        cantidad.className = "cantidad";
        const selectorCantidad = document.createElement("input");
        selectorCantidad.type = "number";
        selectorCantidad.min = "1";
        selectorCantidad.max = String(MAXIMA_CANTIDAD);
        selectorCantidad.value = String(producto.cantidad);
        selectorCantidad.setAttribute("aria-label", `Cantidad de ${producto.nombre}`);
        cantidad.appendChild(selectorCantidad);

        const subtotal = document.createElement("div");
        subtotal.className = "subtotal";
        subtotal.textContent = formatoMoneda.format(producto.precio * producto.cantidad);

        const acciones = document.createElement("div");
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn-eliminar";
        botonEliminar.title = `Eliminar ${producto.nombre}`;
        botonEliminar.setAttribute("aria-label", `Eliminar ${producto.nombre}`);
        botonEliminar.textContent = "🗑️";
        acciones.appendChild(botonEliminar);

        item.append(informacion, precio, cantidad, subtotal, acciones);
        return item;
    }

    function renderizarCarrito() {
        if (!listaCarrito) {
            return;
        }

        listaCarrito.replaceChildren();

        if (carrito.length === 0) {
            const mensaje = document.createElement("div");
            mensaje.className = "carrito-vacio";
            mensaje.innerHTML = "<span>🥡</span><p>Tu carrito está vacío.</p><a href=\"carta.html\">Explorar la carta</a>";
            listaCarrito.appendChild(mensaje);
        } else {
            carrito.forEach((producto) => {
                listaCarrito.appendChild(crearItemCarrito(producto));
            });
        }

        const total = carrito.reduce(
            (acumulado, producto) => acumulado + producto.precio * producto.cantidad,
            0
        );
        const totalFormateado = formatoMoneda.format(total);

        if (totalPrecio) {
            totalPrecio.textContent = totalFormateado;
        }
        if (totalFinal) {
            totalFinal.textContent = totalFormateado;
        }
        if (botonVaciar) {
            botonVaciar.disabled = carrito.length === 0;
        }
    }

    listaCarrito?.addEventListener("change", (evento) => {
        const campoCantidad = evento.target.closest('input[type="number"]');
        const item = evento.target.closest(".carrito-item");

        if (!campoCantidad || !item) {
            return;
        }

        const producto = carrito.find(({ id }) => id === item.dataset.productoId);
        if (!producto) {
            return;
        }

        const nuevaCantidad = Math.min(
            MAXIMA_CANTIDAD,
            Math.max(1, Math.trunc(Number(campoCantidad.value) || 1))
        );
        producto.cantidad = nuevaCantidad;
        guardarCarrito();
        actualizarContador();
        renderizarCarrito();
    });

    listaCarrito?.addEventListener("click", (evento) => {
        const botonEliminar = evento.target.closest(".btn-eliminar");
        const item = evento.target.closest(".carrito-item");

        if (!botonEliminar || !item) {
            return;
        }

        const producto = carrito.find(({ id }) => id === item.dataset.productoId);
        carrito = carrito.filter(({ id }) => id !== item.dataset.productoId);
        guardarCarrito();
        actualizarContador();
        renderizarCarrito();

        if (producto) {
            notificar(`🗑️ ${producto.nombre} se eliminó del carrito.`);
        }
    });

    botonVaciar?.addEventListener("click", () => {
        if (carrito.length === 0) {
            return;
        }

        const confirmarVaciado = window.confirm("¿Deseas eliminar todos los productos del carrito?");
        if (!confirmarVaciado) {
            return;
        }

        carrito = [];
        guardarCarrito();
        actualizarContador();
        renderizarCarrito();
        notificar("🗑️ El carrito se vació correctamente.");
    });

    window.addEventListener("storage", (evento) => {
        if (evento.key === CLAVE_CARRITO) {
            carrito = obtenerCarrito();
            actualizarContador();
            renderizarCarrito();
        }
    });

    actualizarContador();
    renderizarCarrito();
});
