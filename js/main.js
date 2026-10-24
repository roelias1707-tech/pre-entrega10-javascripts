let inventario = [];

// Elementos del DOM
const listaInventario = document.getElementById("lista-inventario");
const formProducto = document.getElementById("form-producto");
const contenedorCarga = document.getElementById("contenedor-carga");

// Función auxiliar para mostrar notificaciones con Toastify (Reemplaza las alertas nativas)
function mostrarToast(mensaje, tipo = "exito") {
    Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: tipo === "exito" ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
        }
    }).showToast();
}

// 1. Solicitar datos al cargar la página usando Fetch y Async/Await con Try/Catch/Finally
async function cargarDatosIniciales() {
    try {
        contenedorCarga.style.display = "block";
        
        // Simulamos petición fetch al archivo local data.json
        const respuesta = await fetch("./data.json");
        
        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con la fuente de datos.");
        }

        const datos = await respuesta.json();

        // Verificamos si hay algo en localStorage previamente guardado, sino usamos el json
        const guardadoStorage = localStorage.getItem("inventario_productos");
        if (guardadoStorage) {
            try {
                inventario = JSON.parse(guardadoStorage);
            } catch (errorStorage) {
                console.warn("Error al parsear el localStorage, usando datos por defecto del JSON.");
                inventario = datos;
            }
        } else {
            inventario = datos;
            guardarEnStorage();
        }

        renderizarInventario();
        mostrarToast("Productos cargados con éxito", "exito");

    } catch (error) {
        console.error("Error en la petición:", error);
        mostrarToast("❌ Error al cargar los productos. Intente más tarde.", "error");
    } finally {
        // Ocultar mensaje de carga
        contenedorCarga.style.display = "none";
    }
}

// Guardar en LocalStorage
function guardarEnStorage() {
    localStorage.setItem("inventario_productos", JSON.stringify(inventario));
}

// 4. Renderizar en el DOM de forma prolija y blindada con el operador ??
function renderizarInventario() {
    listaInventario.innerHTML = "";

    if (inventario.length === 0) {
        listaInventario.innerHTML = `<p class="text-muted">No hay productos en el inventario.</p>`;
        return;
    }

    inventario.forEach((producto) => {
        // Blindaje con operador de fusión nula para evitar crash si falta una propiedad
        const id = producto.id ?? "N/A";
        const nombre = producto.nombre ?? "Sin nombre";
        const precio = producto.precio ?? 0;
        const stock = producto.stock ?? 0;

        const card = document.createElement("div");
        card.classList.add("col-md-4");
        card.innerHTML = `
            <div class="card h-100 shadow-sm p-3">
                <div class="card-body">
                    <h5 class="card-title text-dark">${nombre}</h5>
                    <p class="card-text mb-1">Precio: <strong>$${precio.toLocaleString("es-AR")}</strong></p>
                    <p class="card-text text-muted">Stock disponible: ${stock} unidades</p>
                    <button class="btn btn-outline-danger btn-sm mt-2" onclick="eliminarProducto(${id})">Eliminar</button>
                </div>
            </div>
        `;
        listaInventario.appendChild(card);
    });
}

// Agregar producto desde el formulario (CRUD)
formProducto.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre-input").value.trim();
    const precio = Number(document.getElementById("precio-input").value);
    const stock = Number(document.getElementById("stock-input").value);

    const nuevoProducto = {
        id: Date.now(), // ID único basado en timestamp
        nombre,
        precio,
        stock
    };

    inventario.push(nuevoProducto);
    guardarEnStorage();
    renderizarInventario();
    
    mostrarToast(`Se agregó "${nombre}" correctamente`, "exito");
    formProducto.reset();
});

// Eliminar producto
function eliminarProducto(id) {
    inventario = inventario.filter(prod => prod.id !== id);
    guardarEnStorage();
    renderizarInventario();
    mostrarToast("Producto eliminado del stock", "error");
}

// Temporizador asincrónico (heredado de la entrega anterior con duración de 6 segundos)
function iniciarTemporizadorPromocional() {
    setTimeout(() => {
        mostrarToast("🔔 ¡Promoción del día: 10% de descuento en líneas de látex!", "exito");
    }, 6000);
}

// Inicialización al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    cargarDatosIniciales();
    iniciarTemporizadorPromocional();
});