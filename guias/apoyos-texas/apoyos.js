(function () {
  "use strict";
  const nav = document.getElementById("nav");
  const boton = document.getElementById("menu-boton");
  const menu = document.getElementById("menu-panel");
  function estadoNav() {
    nav.classList.toggle("solida", menu.classList.contains("abierto") || window.scrollY > 24);
  }
  function menuAbierto(abre) {
    menu.classList.toggle("abierto", abre);
    boton.setAttribute("aria-expanded", String(abre));
    boton.setAttribute("aria-label", abre ? "Cerrar menú" : "Abrir menú");
    estadoNav();
  }
  window.addEventListener("scroll", estadoNav, {passive: true});
  boton.addEventListener("click", function () { menuAbierto(!menu.classList.contains("abierto")); });
  menu.addEventListener("click", function (evento) { if (evento.target.closest("a")) menuAbierto(false); });
  document.addEventListener("click", function (evento) {
    if (!menu.contains(evento.target) && !boton.contains(evento.target)) menuAbierto(false);
  });
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) { menuAbierto(false); boton.focus(); }
  });
  window.matchMedia("(min-width:1024px)").addEventListener("change", function (evento) {
    if (evento.matches) menuAbierto(false);
  });
  estadoNav();

  const selector = document.getElementById("region");
  const regiones = Array.from(document.querySelectorAll(".region"));
  function elegir(anunciar) {
    regiones.forEach(function (region) { region.hidden = region.id !== "region-" + selector.value; });
    if (anunciar) document.getElementById("estado-region").textContent = "Se muestra " + selector.options[selector.selectedIndex].text + ".";
  }
  document.querySelector(".elegir-region").hidden = false;
  selector.addEventListener("change", function () { elegir(true); });
  elegir(false);
  // No cambia la dirección ni crea eventos o dimensiones nuevas de GA4.
})();
