(function () {
  "use strict";
  var nav = document.getElementById("nav"), boton = document.getElementById("menu-boton"), menu = document.getElementById("menu-panel");
  function estadoNav() { nav.classList.toggle("solida", menu.classList.contains("abierto") || window.scrollY > 24); }
  function menuAbierto(abre) {
    menu.classList.toggle("abierto", abre);
    boton.setAttribute("aria-expanded", String(abre));
    boton.setAttribute("aria-label", abre ? "Cerrar menú" : "Abrir menú");
    estadoNav();
  }
  window.addEventListener("scroll", estadoNav, {passive:true});
  boton.addEventListener("click", function () { menuAbierto(!menu.classList.contains("abierto")); });
  menu.addEventListener("click", function(e) { if (e.target.closest("a")) menuAbierto(false); });
  document.addEventListener("click", function(e) { if (!menu.contains(e.target) && !boton.contains(e.target)) menuAbierto(false); });
  document.addEventListener("keydown", function(e) { if (e.key === "Escape" && menu.classList.contains("abierto")) { menuAbierto(false); boton.focus(); } });
  window.matchMedia("(min-width:1024px)").addEventListener("change", function(e) { if(e.matches) menuAbierto(false); });
  estadoNav();

})();
