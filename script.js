let productos = [];

fetch("/api.json")
  .then((response) => response.json())
  .then((data) => {
    productos = data;
    cargarMarcas();
  })
  .catch((error) => {
    console.error("Hubo un problema con la solicitud fetch:", error);
  });

function cargarMarcas() {
  let marcaSelect = document.getElementById("marcaSelect");
  let marcas = [...new Set(productos.map((vehiculo) => vehiculo.marca))];
  marcas.forEach((marca) => {
    let option = document.createElement("option");
    option.textContent = marca;
    option.value = marca;
    marcaSelect.appendChild(option);
  });
}

function cargarVehiculos(marca) {
  let vehiculosContainer = document.getElementById("vehiculos");
  vehiculosContainer.innerHTML = "";

  let vehiculosFiltrados = productos.filter(
    (vehiculo) => vehiculo.marca === marca
  );
  vehiculosFiltrados.forEach((vehiculo) => {
    let card = document.createElement("div");
    card.classList.add("card");

    let imagen = document.createElement("img");
    imagen.src = vehiculo.imagenUrl;
    card.appendChild(imagen);

    let cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    let nombreMarca = document.createElement("h2");
    nombreMarca.textContent = `${vehiculo.marca} ${vehiculo.nombre}`;
    cardContent.appendChild(nombreMarca);

    let año = document.createElement("p");
    año.textContent = `Año: ${vehiculo.año}`;
    cardContent.appendChild(año);

    let stock = document.createElement("p");
    stock.textContent = `Stock: ${vehiculo.Stock}`;
    stock.id = `stock-${vehiculo.id}`;
    cardContent.appendChild(stock);

    let precio = document.createElement("p");
    precio.textContent = `Precio: $${vehiculo.precio}`;
    cardContent.appendChild(precio);

    let boton = document.createElement("button");
    boton.textContent = "Agregar al Carrito";
    boton.addEventListener("click", function () {
      agregarAlCarrito(vehiculo);
    });
    cardContent.appendChild(boton);

    card.appendChild(cardContent);

    vehiculosContainer.appendChild(card);
  });
}

function actualizarStock(id) {
  let stockElement = document.getElementById(`stock-${id}`);
  let vehiculo = productos.find((v) => v.id === id);
  if (stockElement && vehiculo) {
    stockElement.textContent = `Stock: ${vehiculo.Stock}`;
  }
}

function actualizarEstadoCompra() {
  let comprarBtn = document.getElementById("comprar-btn");
  comprarBtn.disabled =
    document.getElementById("carrito-lista").children.length === 0 ||
    !validarUsuario();
}

function validarUsuario() {
  let nombre = document.getElementById("nombre").value;
  let apellido = document.getElementById("apellido").value;
  let edad = document.getElementById("edad").value;
  let correo = document.getElementById("correo").value;
  return nombre && apellido && edad && correo;
}

function actualizarCarrito() {
  actualizarSubtotalTotal();
  actualizarEstadoCompra();
}

function actualizarSubtotalTotal() {
  let subtotalTotal = 0;
  let carritoItems = document.querySelectorAll(".carrito-item");
  carritoItems.forEach((item) => {
    let subtotalElement = item.querySelector(".subtotal");
    let subtotalText = subtotalElement.textContent.replace("Subtotal: $", "");
    subtotalTotal += parseInt(subtotalText);
  });

  let subtotalTotalElement = document.getElementById("subtotal-total");
  if (carritoItems.length > 0) {
    subtotalTotalElement.textContent = `Subtotal Total: $${subtotalTotal}`;
  } else {
    subtotalTotalElement.textContent = "";
  }
}

function limpiarLocalStorage() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("carrito");
}
document.getElementById("comprar-btn").addEventListener("click", function () {
  if (validarUsuario()) {
    guardarUsuarioEnLocalStorage();
    limpiarCamposFormulario();
    limpiarLocalStorage(); // Limpiar datos del localStorage
    let carrito = document.getElementById("carrito-lista");
    while (carrito.firstChild) {
      carrito.removeChild(carrito.firstChild);
    }
    Swal.fire({
      title: "¡Compra realizada con éxito!",
      text: "Estaremos contactándolo por correo electrónico.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    actualizarEstadoCompra();
  } else {
    alert(
      "Por favor complete todos los campos del usuario antes de realizar la compra."
    );
  }
});

function limpiarCamposFormulario() {
  document.getElementById("nombre").value = null;
  document.getElementById("apellido").value = null;
  document.getElementById("edad").value = null;
  document.getElementById("correo").value = null;
  document.getElementById("subtotal-total").textContent = "";
  document.getElementById("marcaSelect").selectedIndex = 0;
}

function agregarAlCarrito(vehiculo) {
  if (vehiculo.Stock > 0) {
    let carritoLista = document.getElementById("carrito-lista");
    let listItem = carritoLista.querySelector(`li[data-id="${vehiculo.id}"]`);
    if (listItem) {
      let cantidadSpan = listItem.querySelector("span");
      let cantidad = parseInt(
        cantidadSpan.textContent.replace(/[^\d]/g, ""),
        10
      );
      cantidad++;
      cantidadSpan.textContent = `(${cantidad})`;

      let subtotal = vehiculo.precio * cantidad;
      let subtotalSpan = listItem.querySelector(".subtotal");
      subtotalSpan.textContent = `Subtotal: $${subtotal}`;
    } else {
      listItem = document.createElement("li");
      listItem.classList.add("carrito-item");
      listItem.setAttribute("data-id", vehiculo.id);
      listItem.textContent = `${vehiculo.marca} ${vehiculo.nombre} - Precio: $${vehiculo.precio} `;
      let cantidadSpan = document.createElement("span");
      cantidadSpan.textContent = "(1)";
      listItem.appendChild(cantidadSpan);

      let subtotal = vehiculo.precio;
      let subtotalSpan = document.createElement("span");
      subtotalSpan.classList.add("subtotal");
      subtotalSpan.textContent = `Subtotal: $${subtotal}`;
      listItem.appendChild(subtotalSpan);

      let botonEliminar = document.createElement("button");
      botonEliminar.textContent = "Eliminar";
      botonEliminar.addEventListener("click", function () {
        Swal.fire({
          title: "¿Estás seguro?",
          text: "No podrás revertir esta acción",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar!",
        }).then((result) => {
          if (result.isConfirmed) {
            listItem.remove();
            vehiculo.Stock++;
            actualizarCarrito();
            actualizarStock(vehiculo.id);
            Swal.fire(
              "Eliminado!",
              "El producto ha sido eliminado del carrito.",
              "success"
            );
          }
        });
      });
      listItem.appendChild(botonEliminar);
      carritoLista.appendChild(listItem);
    }
    vehiculo.Stock--;
    actualizarCarrito();
    actualizarStock(vehiculo.id);
    Swal.fire({
      title: "¡Producto agregado al carrito!",
      icon: "success",
      timer: 1500,
    });
  } else {
    alert(`Lo sentimos, ${vehiculo.marca} ${vehiculo.nombre} está agotado.`);
  }
  guardarCarritoEnLocalStorage();
}

function guardarUsuarioEnLocalStorage() {
  let usuario = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    edad: document.getElementById("edad").value,
    correo: document.getElementById("correo").value,
  };
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function cargarCarritoDesdeLocalStorage() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (carrito) {
    carrito.forEach((item) => {
      let vehiculo = productos.find((v) => v.id === parseInt(item.id));
      if (vehiculo) {
        vehiculo.Stock -= item.cantidad;
        agregarAlCarrito(vehiculo);
      }
    });
  }
}

window.onload = function () {
  actualizarEstadoCompra();
  cargarCarritoDesdeLocalStorage();
  cargarUsuarioDesdeLocalStorage();
};

function cargarUsuarioDesdeLocalStorage() {
  let usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    document.getElementById("nombre").value = usuario.nombre || "";
    document.getElementById("apellido").value = usuario.apellido || "";
    document.getElementById("edad").value = usuario.edad || "";
    document.getElementById("correo").value = usuario.correo || "";
  }
}

function guardarCarritoEnLocalStorage() {
  let carritoItems = document.querySelectorAll(".carrito-item");
  let carrito = [];

  carritoItems.forEach((item) => {
    let itemId = item.getAttribute("data-id");
    let itemNombre = item.textContent.split(" - ")[0];
    let itemPrecio = parseInt(item.textContent.split("$")[1]);
    let itemCantidad = parseInt(
      item.querySelector("span").textContent.replace(/[^\d]/g, ""),
      10
    );
    let itemSubtotal = parseInt(
      item.querySelector(".subtotal").textContent.split("$")[1]
    );

    carrito.push({
      id: itemId,
      nombre: itemNombre,
      precio: itemPrecio,
      cantidad: itemCantidad,
      subtotal: itemSubtotal,
    });
  });

  localStorage.setItem("carrito", JSON.stringify(carrito));
}

document
  .getElementById("marcaSelect")
  .addEventListener("change", function (event) {
    let marcaSeleccionada = event.target.value;
    cargarVehiculos(marcaSeleccionada);
  });
