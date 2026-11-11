/* Invest Texas Hub, mapa de parques (publicado el 11-nov-2026).
   Dos estados en una página:
   1. Portada: satélite fijo de Texas (el mismo recorte de la portada del sitio) y la lista de regiones con sus cuentas.
      No pide nada fuera del sitio.
   2. Explorador: lista y ficha a un lado, mapa al otro (en teléfono, mapa con hoja inferior). El mapa interactivo
      (MapLibre GL JS, servido desde el sitio) sólo se carga cuando la persona elige una región o llega con un enlace.
   Datos: assets/parques-datos.js y assets/parques-contornos-osm.js (herramientas/armar-directorio.py).
   Mapa base: imagen de USGS The National Map (dominio público) y, en la vista «Mapa», OpenFreeMap (datos de OpenStreetMap).
   Parámetros: ?region=laredo, ?parque=L01, ?vista=mapa. Guion clásico: abre como archivo local. */
(function () {
  "use strict";
  var D = window.PARQUES_DATOS, CT = window.PARQUES_CONTORNOS || {};
  if (!D) return;
  var doc = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ancho = window.matchMedia("(min-width: 1024px)");
  var VENDOR = "../assets/vendor/maplibre/";
  var SAT_URL = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}";
  var MAPA_URL = "https://tiles.openfreemap.org/styles/positron";
  var ROJO = "#BF0D3E", HONDO = "#001A45", BLANCO = "#FFFFFF", GRIS = "#C9D2E0";

  function medir(n, d) {
    if (typeof window.medir === "function") window.medir(n, d);
    else if (typeof window.gtag === "function" && !navigator.webdriver) window.gtag("event", n, d || {});
  }
  function $(id) { return doc.getElementById(id); }
  function el(tag, cls, texto) { var e = doc.createElement(tag); if (cls) e.className = cls; if (texto != null) e.textContent = texto; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function merc(lat) { return 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function fecha(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); return m ? (+m[3]) + "-" + MESES[+m[2] - 1] + "-" + m[1] : (iso || ""); }
  var MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function mesAnio(iso) { var m = /^(\d{4})-(\d{2})/.exec(iso || ""); return m ? MESES_LARGOS[+m[2] - 1] + " de " + m[1] : (iso || ""); }

  /* ------------------------------------------------------------ datos */
  var NIVEL = {
    ficha: { n: "Verificado", t: "Nombre, promotor y punto comprobados con fuente propia. Tiene ficha." },
    confirmado: { n: "Confirmado", t: "Identidad y punto tomados del desarrollador. Su ficha está en preparación." },
    listado: { n: "En el directorio", t: "Lo nombra una fuente pública. Falta verificar el conjunto." }
  };
  var ORDEN_NIVEL = { ficha: 0, confirmado: 1, listado: 2 };
  var ESTADO = { anunciado: "Anunciado", "en obra": "En obra", operando: "Operando" };
  var RPOR = {}, PPOR = {};
  D.regiones.forEach(function (r) { RPOR[r.id] = r; });
  RPOR.texas = { id: "texas", n: "Todo Texas", caja: [-106.7, 25.8, -93.45, 36.55], total: D.resumen.total, en_el_mapa: D.resumen.en_el_mapa };
  D.parques.forEach(function (p) { PPOR[p.id] = p; });
  function deRegion(id) { return D.parques.filter(function (p) { return id === "texas" || p.r === id; }); }
  function ordenar(a, b) {
    return (a.u ? 0 : 1) - (b.u ? 0 : 1) || ORDEN_NIVEL[a.nv] - ORDEN_NIVEL[b.nv] || a.n.localeCompare(b.n, "es");
  }
  // Ancla de cada región: el centro de sus parques ubicados, no el de su caja (el rótulo va con el grupo).
  function ancla(r) {
    var ps = deRegion(r.id).filter(function (p) { return p.u; });
    if (!ps.length) return [(r.caja[0] + r.caja[2]) / 2, (r.caja[1] + r.caja[3]) / 2];
    var x = 0, y = 0; ps.forEach(function (p) { x += p.u.p[0]; y += p.u.p[1]; });
    return [x / ps.length, y / ps.length];
  }
  function cajaDe(id) {
    var ps = deRegion(id).filter(function (p) { return p.u; });
    if (id === "texas" || ps.length < 2) return [[RPOR[id].caja[0], RPOR[id].caja[1]], [RPOR[id].caja[2], RPOR[id].caja[3]]];
    var b = [180, 90, -180, -90];
    ps.forEach(function (p) { b = [Math.min(b[0], p.u.p[0]), Math.min(b[1], p.u.p[1]), Math.max(b[2], p.u.p[0]), Math.max(b[3], p.u.p[1])]; });
    var dx = Math.max((b[2] - b[0]) * 0.06, 0.02), dy = Math.max((b[3] - b[1]) * 0.06, 0.02);
    return [[b[0] - dx, b[1] - dy], [b[2] + dx, b[3] + dy]];
  }

  var S = { region: null, sel: null, vista: "sat", filtro: "", verSin: false };
  var portada = $("portada"), explorador = $("explorador");

  /* ------------------------------------------------------------ 1. portada */
  var SAT = { // recortes de assets/SATELITE-FUENTE.txt
    escritorio: { archivo: "satelite-escritorio.jpg", lon0: -122, y1: 46.36187, w: 2432, h: 1929, ppg: 64 },
    movil: { archivo: "satelite-movil.jpg", lon0: -109, y1: 42.4155, w: 1800, h: 2264, ppg: 90 }
  };
  // De qué lado del punto va el rótulo. En teléfono Texas es chico y los rótulos se abren hacia fuera.
  var LADO = { laredo: "izq", valle: "abajo", "san-antonio": "izq", austin: "der", dfw: "arriba", houston: "der", "el-paso": "arriba" };
  var LADO_MOVIL = { laredo: "izq", valle: "der", "san-antonio": "izq", austin: "izq", dfw: "arriba", houston: "der", "el-paso": "arriba" };
  var fondo = $("mp-fondo"), puntos = $("mp-puntos"), listaReg = $("mp-regiones"), textoPortada = doc.querySelector(".mp-portada-texto");
  var botonesReg = {}, puntosReg = {}, alcance = 48, cerca = null;

  function cuentaRegion(r) {
    if (!r.total) return "en investigación";
    var resto = r.total - r.en_el_mapa;
    return r.en_el_mapa + " en el mapa" + (resto ? ", " + resto + " en lista" : "");
  }
  function encender(id, si) {
    if (botonesReg[id]) botonesReg[id].classList.toggle("encendida", si);
    if (puntosReg[id]) puntosReg[id].classList.toggle("encendida", si);
  }
  function pintarPortada() {
    // La bajada y la lista ya vienen escritas en el HTML con estos mismos textos (armar-directorio.py, escribir_portada),
    // para que la página no brinque al llegar el guion. Aquí se vuelven a pintar, ya con sus botones vivos.
    $("mp-bajada").textContent = D.resumen.total + " parques y conjuntos industriales, cada uno con su fuente. " +
      D.resumen.en_el_mapa + " ya tienen punto en el mapa. Elige una región en la lista o en el mapa.";
    listaReg.textContent = "";
    D.regiones.concat([RPOR.texas]).forEach(function (r) {
      var li = el("li"), b = el("button", r.id === "texas" ? "r-todo" : "");
      b.type = "button";
      b.appendChild(el("span", "r-nombre", r.n));
      b.appendChild(el("span", "r-cuenta", r.id === "texas" ? r.en_el_mapa + " en el mapa" : cuentaRegion(r)));
      b.addEventListener("click", function () { entrar(r.id, "portada", true); });
      if (r.id !== "texas") {
        b.addEventListener("pointerenter", function () { encender(r.id, true); });
        b.addEventListener("pointerleave", function () { encender(r.id, false); });
        b.addEventListener("focus", function () { encender(r.id, true); });
        b.addEventListener("blur", function () { encender(r.id, false); });
        // El punto es la vista en el mapa de este mismo botón: no recibe foco, y su clic lo resuelve la portada.
        var pt = el("span", "mp-punto"), rot = el("span", "p-rotulo");
        rot.appendChild(el("span", "p-nombre", r.n));
        rot.appendChild(el("span", "p-cuenta", r.total ? r.en_el_mapa + " en el mapa" : "en investigación"));
        pt.appendChild(el("i")); pt.appendChild(rot);
        puntos.appendChild(pt); puntosReg[r.id] = pt;
      }
      li.appendChild(b); listaReg.appendChild(li); botonesReg[r.id] = b;
    });
    acomodarFondo();
  }

  /* Elegir región picándole al mapa. Gana la región más cercana al puntero o al dedo, contando su punto y su
     rótulo, hasta «alcance» pixeles. Sólo cuenta lo que cae sobre el mapa: ni el texto ni los botones de la lista. */
  function sobreElMapa(ev) {
    var t = ev.target;
    return t === portada || t === fondo || t === puntos || t === textoPortada;
  }
  function regionCercana(x, y) {
    var mejor = null, dm = Infinity;
    D.regiones.forEach(function (r) {
      var pt = puntosReg[r.id];
      if (!pt || pt.hidden) return;
      var c = pt.getBoundingClientRect(), e = pt.querySelector(".p-nombre").getBoundingClientRect();
      var d = Math.hypot(x - c.left, y - c.top);
      var dx = Math.max(e.left - x, 0, x - e.right), dy = Math.max(e.top - y, 0, y - e.bottom);
      d = Math.min(d, Math.hypot(dx, dy) + 4); // el nombre también cuenta; a igual distancia gana el punto
      if (d < dm) { dm = d; mejor = r.id; }
    });
    return dm <= alcance ? mejor : null;
  }
  function apuntarRegion(id) {
    if (id === cerca) return;
    // al pasar del mapa a la lista, el botón de esa región ya la tiene encendida: no se le apaga
    var b = cerca && botonesReg[cerca];
    if (b && !(b.matches(":hover") || doc.activeElement === b)) encender(cerca, false);
    cerca = id;
    if (id) encender(id, true);
    portada.classList.toggle("mp-apunta", !!id);
  }
  portada.addEventListener("mousemove", function (ev) { apuntarRegion(sobreElMapa(ev) ? regionCercana(ev.clientX, ev.clientY) : null); });
  portada.addEventListener("mouseleave", function () { apuntarRegion(null); });
  portada.addEventListener("click", function (ev) {
    if (!sobreElMapa(ev)) return;
    var id = regionCercana(ev.clientX, ev.clientY);
    if (!id) return;
    apuntarRegion(null);
    entrar(id, "portada_mapa", true);
  });
  // En escritorio el satélite se coloca para que Texas quede a la derecha del texto; en teléfono cubre centrado.
  function acomodarFondo() {
    if (portada.hidden) return;
    var W = portada.clientWidth, H = portada.clientHeight, Hv = Math.min(H, window.innerHeight);
    var s = SAT.escritorio;
    function colocar(x0, y0, e, lados, borde) {
      D.regiones.forEach(function (r) {
        var a = ancla(r), pt = puntosReg[r.id], x = x0 + (a[0] - s.lon0) * e;
        pt.style.left = x + "px";
        pt.style.top = (y0 + (s.y1 - merc(a[1])) * e) + "px";
        // una región que caería sobre la columna de texto no se pinta: ahí manda la lista
        pt.hidden = x < borde;
        var lado = lados[r.id] || "abajo";
        // si el nombre no cabe hacia el Golfo (pantalla angosta), va del otro lado
        if (lado === "der" && x + 16 + pt.querySelector(".p-rotulo").offsetWidth > W - 8) lado = "izq";
        pt.setAttribute("data-lado", lado);
      });
    }
    if (!ancho.matches) { // franja de arriba: Texas completo bajo la barra, con el Valle libre del titular
      var em = 17, km = em / s.ppg;
      var mx = W / 2 - (-99.9 - s.lon0) * em, my = 162 - (s.y1 - merc(31.3)) * em;
      fondo.style.backgroundImage = 'url("../assets/' + s.archivo + '")';
      fondo.style.backgroundSize = Math.round(s.w * km) + "px " + Math.round(s.h * km) + "px";
      fondo.style.backgroundPosition = Math.round(mx) + "px " + Math.round(my) + "px";
      colocar(Math.round(mx), Math.round(my), em, LADO_MOVIL, 0);
      alcance = 36;
      return;
    }
    var finTexto = listaReg.getBoundingClientRect().right;
    var k = Math.min(1.25, Math.max(0.6, W * 0.45 / (13.1 * s.ppg)));
    k = Math.min(k, (W - finTexto - 44 - 36) / (13.1 * s.ppg)); // en un portátil angosto Texas se achica para caber junto a la lista
    k = Math.max(k, W / s.w + 0.02, H / s.h + 0.02);            // pero la imagen siempre cubre la portada
    var e = s.ppg * k, ay = Hv * 0.55;
    // Texas va a la derecha del texto: su punta oeste (El Paso) no debe tocar la columna de regiones
    var ax = Math.max(W * 0.67, finTexto + 44 + (106.6 - 99.6) * e);
    ax = Math.min(ax, W - 36 - (99.6 - 93.5) * e);
    var x0 = ax - (-99.6 - s.lon0) * e, y0 = ay - (s.y1 - merc(31.3)) * e;
    // A lo ancho la imagen puede empezar bajo la columna de texto, donde el velo es casi opaco y no se nota la orilla;
    // así Texas cabe completo en un portátil angosto. A la derecha y a lo alto nunca deja hueco.
    x0 = Math.min(Math.max(0, finTexto - 80), Math.max(W - s.w * k, x0)); y0 = Math.min(0, Math.max(H - s.h * k, y0));
    fondo.style.backgroundImage = 'url("../assets/' + s.archivo + '")';
    fondo.style.backgroundSize = Math.round(s.w * k) + "px " + Math.round(s.h * k) + "px";
    fondo.style.backgroundPosition = Math.round(x0) + "px " + Math.round(y0) + "px";
    colocar(x0, y0, e, LADO, finTexto + 20);
    alcance = Math.max(48, e * 1.25); // unos 140 km alrededor de cada región
  }
  // Los nombres se miden con su tipografía: al terminar de cargar se vuelve a acomodar.
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(acomodarFondo);

  /* ------------------------------------------------------------ 2. explorador: panel */
  var cabeza = $("mp-cabeza"), lista = $("mp-lista"), ficha = $("mp-ficha"), buscar = $("mp-buscar"), asa = $("mp-asa"), cuerpo = $("mp-cuerpo");
  var filas = {}, visibles = [];

  function coincide(p) {
    if (!S.filtro) return true;
    var t = norm([p.n].concat(p.al || [], [p.c, p.pr, p.co]).join(" "));
    return S.filtro.split(/\s+/).every(function (w) { return t.indexOf(w) >= 0; });
  }
  function filaDe(p) {
    var b = el("button", "mp-fila");
    b.type = "button"; b.setAttribute("data-id", p.id);
    b.appendChild(el("span", "pin " + (p.u ? "pin-" + p.nv : "pin-sin")));
    var t = el("span");
    t.appendChild(el("span", "f-nombre", p.n));
    var linea = p.c || (p.co ? "Condado de " + p.co : "");
    if (S.region === "texas") linea = linea ? linea + ", región " + RPOR[p.r].n : RPOR[p.r].n;
    if (linea) t.appendChild(el("span", "f-linea", linea));
    b.appendChild(t);
    b.addEventListener("click", function () { seleccionar(p.id, "lista"); });
    b.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") resaltar(p.id, true); });
    b.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") resaltar(p.id, false); });
    b.addEventListener("focus", function () { resaltar(p.id, true); });
    b.addEventListener("blur", function () { resaltar(p.id, false); });
    filas[p.id] = b;
    return b;
  }
  function pintarLista() {
    var r = RPOR[S.region], todos = deRegion(S.region).slice().sort(ordenar);
    var con = todos.filter(function (p) { return p.u && coincide(p); }), sin = todos.filter(function (p) { return !p.u && coincide(p); });
    $("mp-region").textContent = r.n;
    $("mp-cuenta").textContent = r.total ? cuentaRegion(r).replace(" en lista", " más en lista, sin ubicar todavía") : "Esta región sigue en investigación.";
    asa.querySelector(".a-region").textContent = r.n;
    asa.querySelector(".a-cuenta").textContent = r.total ? cuentaRegion(r) : "en investigación";
    lista.innerHTML = ""; filas = {}; visibles = [];
    if (!todos.length) { lista.appendChild(el("p", "mp-vacio", "Todavía no tenemos parques de esta región con fuente. Sigue en investigación.")); return; }
    if (!con.length && !sin.length) { lista.appendChild(el("p", "mp-vacio", "Ningún parque coincide con esa búsqueda en " + r.n + ".")); aplicarFiltro(); return; }
    function grupo(titulo, ps) {
      lista.appendChild(el("h3", "mp-grupo", titulo));
      var ul = el("ul", "mp-filas");
      ps.forEach(function (p) { var li = el("li"); li.appendChild(filaDe(p)); ul.appendChild(li); visibles.push(p.id); });
      lista.appendChild(ul);
    }
    if (con.length) grupo("En el mapa", con);
    if (sin.length) {
      if (S.verSin || S.filtro || !con.length) grupo("Sin ubicar todavía", sin);
      else {
        var mas = el("button", "mp-mas", "Ver los " + sin.length + " que faltan por ubicar");
        mas.type = "button";
        mas.addEventListener("click", function () { S.verSin = true; pintarLista(); var f = filas[sin[0].id]; if (f) f.focus(); });
        lista.appendChild(mas);
      }
    }
    aplicarFiltro();
  }
  function dato(dl, nombre, html) { var d = el("div"); d.appendChild(el("dt", "", nombre)); var dd = el("dd"); dd.innerHTML = html; d.appendChild(dd); dl.appendChild(d); }
  var NO = '<span class="no">no informado</span>';
  function pintarFicha(p) {
    var i = visibles.indexOf(p.id);
    ficha.innerHTML = "";
    var nav = el("div", "mp-ficha-nav"), volver = el("button", "mp-volver", "Volver a la lista");
    volver.type = "button"; volver.addEventListener("click", function () { cerrarFicha(true); });
    nav.appendChild(volver);
    if (i >= 0 && visibles.length > 1) {
      var pasos = el("div", "pasos"), ant = el("button", "", "Anterior"), sig = el("button", "", "Siguiente");
      ant.type = sig.type = "button"; ant.disabled = i === 0; sig.disabled = i === visibles.length - 1;
      ant.addEventListener("click", function () { seleccionar(visibles[i - 1], "pasos"); });
      sig.addEventListener("click", function () { seleccionar(visibles[i + 1], "pasos"); });
      pasos.appendChild(ant); pasos.appendChild(el("span", "", (i + 1) + " de " + visibles.length)); pasos.appendChild(sig);
      nav.appendChild(pasos);
    }
    ficha.appendChild(nav);
    var nv = el("p", "mp-nivel"); nv.appendChild(el("span", "pin " + (p.u ? "pin-" + p.nv : "pin-sin"))); nv.appendChild(doc.createTextNode(NIVEL[p.nv].n));
    ficha.appendChild(nv);
    var h = el("h3", "", p.n); h.id = "mp-ficha-titulo"; h.tabIndex = -1; ficha.appendChild(h);
    if (p.al && p.al.length) ficha.appendChild(el("p", "f-alias", "También aparece como " + p.al.join(", ") + "."));
    ficha.appendChild(el("p", "f-que", p.nv === "listado" && p.pl
      ? "Lo nombra una fuente pública y tiene plano registrado en la ciudad. Falta acreditar a su promotor."
      : NIVEL[p.nv].t));

    var dl = el("dl", "mp-datos");
    dato(dl, "Ciudad", p.c ? esc(p.c) + (p.co ? ", condado de " + esc(p.co) : "")
      : p.co ? "Fuera de ciudad incorporada, condado de " + esc(p.co)
      : '<span class="no">no informada</span><small>Región ' + esc(RPOR[p.r].n) + "</small>");
    dato(dl, "Promotor", p.pr ? esc(p.pr) + "<small>Según la fuente.</small>" : NO);
    var e = p.e && p.e.t;
    dato(dl, "Estado de obra", e ? esc(ESTADO[e]) + (p.e.f ? ", " + esc(fecha(p.e.f)) : "") + "<small>" + (e === "anunciado" ? "Es un anuncio. Anunciado no es construido." : "Según la fuente, a esa fecha.") + "</small>" : NO);
    var u = "";
    if (!p.u) u = '<span class="no">Sin ubicar todavía.</span><small>La fuente no publica un punto ni un domicilio con número.</small>';
    else if (p.u.m === "fuente") u = "Punto de referencia tomado de la fuente." + (p.u.d ? "<small>" + esc(p.u.d) + "</small>" : "") + "<small>No es el centro ni el límite del parque.</small>";
    else if (p.u.m === "domicilio") u = "Por el domicilio que publica la fuente, ubicado con el geocodificador del U.S. Census Bureau." + (p.u.d ? "<small>" + esc(p.u.d) + "</small>" : "") + "<small>No es el centro ni el límite del conjunto.</small>";
    else if (p.u.m === "plano") u = "Según el plano de subdivisión de " + esc(p.pl ? p.pl.c : "la ciudad") + ".<small>El punto es el centro del plano «" + esc(p.pl ? p.pl.n : "") + "». No es deslinde.</small>" +
      (p.pl && p.pl.p === false ? "<small>El contorno no se dibuja. Esa capa no trae una licencia que permita volver a publicarlo.</small>" : "");
    else u = "Según OpenStreetMap.<small>El contorno es aproximado. Lo trazó la comunidad y no lo verificamos lote por lote.</small>";
    dato(dl, "Ubicación", u);
    if (p.pl && p.pl.p !== false) dato(dl, "Contorno", "Plano de subdivisión «" + esc(p.pl.n) + "», de la capa pública de " + esc(p.pl.c) + "." +
      (p.pl.x === "alias" ? "<small>Ahí aparece escrito distinto. Falta confirmar que es el mismo conjunto.</small>" : "") +
      (p.pl.f ? "<small>Capa actualizada en " + esc(mesAnio(p.pl.f)) + ". Puede no traer las etapas más nuevas.</small>" : ""));
    dato(dl, "Fuente", p.s && p.s.url ? '<a href="' + esc(p.s.url) + '" target="_blank" rel="noopener" data-enlace="fuente">' + esc(p.s.editor || "Fuente") + "</a><small>Consulta " + esc(fecha(p.s.consulta)) + ".</small>" : NO);
    ficha.appendChild(dl);

    var ac = el("div", "mp-acciones"), html = "";
    if (p.f) html += '<a class="boton" href="..' + esc(p.f) + 'index.html" data-enlace="ficha">Ver ficha completa</a>';
    if (p.u) html += '<a href="https://www.openstreetmap.org/?mlat=' + p.u.p[1] + "&amp;mlon=" + p.u.p[0] + "#map=15/" + p.u.p[1] + "/" + p.u.p[0] + '" target="_blank" rel="noopener" data-enlace="osm">Abrir en OpenStreetMap</a>';
    html += '<a href="mailto:contacto@investtexashub.com?subject=' + encodeURIComponent("Duda sobre " + p.n) + '" data-enlace="correo">Escríbenos sobre este parque</a>';
    ac.innerHTML = html; ficha.appendChild(ac);
    ficha.appendChild(el("p", "mp-nota", "Datos públicos con su fuente. Para disponibilidad y precios, consulta al desarrollador."));
  }
  ficha.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a[data-enlace]");
    if (a) medir("mapa_enlace", { tipo: a.getAttribute("data-enlace") });
  });

  function hoja(estado) { // sólo cuenta en teléfono: baja (asa), media (lista o ficha)
    explorador.classList.toggle("hoja-baja", estado === "baja");
    asa.setAttribute("aria-expanded", estado === "baja" ? "false" : "true");
    asa.querySelector(".a-accion").textContent = estado === "baja" ? "Ver lista" : "Ver mapa";
  }
  asa.addEventListener("click", function () { hoja(explorador.classList.contains("hoja-baja") ? "media" : "baja"); });

  function seleccionar(id, desde) {
    var p = PPOR[id];
    if (!p) return;
    if (S.region !== "texas" && p.r !== S.region) { S.region = p.r; pintarLista(); }
    S.sel = id;
    cabeza.hidden = true; lista.hidden = true; ficha.hidden = false;
    explorador.classList.add("con-ficha"); // en teléfono la hoja de la ficha es más baja, para que se vea el parque
    pintarFicha(p);
    hoja("media"); cuerpo.scrollTop = 0;
    if (desde !== "enlace") $("mp-ficha-titulo").focus({ preventScroll: true });
    marcarSel(true);
    escribirURL(false);
    if (desde !== "pasos" || true) medir("mapa_parque", { parque: p.id, nivel: p.nv, desde: desde });
  }
  function cerrarFicha(foco) {
    var antes = S.sel;
    S.sel = null;
    ficha.hidden = true; cabeza.hidden = false; lista.hidden = false;
    explorador.classList.remove("con-ficha");
    marcarSel(false);
    escribirURL(false);
    if (foco && antes && filas[antes]) { filas[antes].focus({ preventScroll: true }); filas[antes].scrollIntoView({ block: "nearest" }); }
  }
  doc.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && S.sel && !explorador.hidden) cerrarFicha(true); });

  var avisoBuscar = false;
  buscar.addEventListener("input", function () {
    S.filtro = norm(buscar.value).trim();
    if (S.filtro.length >= 3 && !avisoBuscar) { avisoBuscar = true; medir("mapa_buscar", { region: S.region }); }
    pintarLista();
  });
  $("mp-a-regiones").addEventListener("click", function () { salir(true); });

  /* ------------------------------------------------------------ 3. explorador: mapa */
  var mapa = null, listo = false, cargando = false, primerEstilo = true, estadoTxt = $("mp-estado");
  var rotulo = null, rotuloSel = null, zonas = [], nombres = [], vecinos = [], hoverId = null, apagados = {};
  var MX = [ // las mismas ciudades y coordenadas de assets/red-datos.js (ciudadesMx), en longitud y latitud
    { n: "Nuevo Laredo", p: [-99.55, 27.5] }, { n: "Reynosa", p: [-98.3, 26.08] }, { n: "Matamoros", p: [-97.5, 25.88] },
    { n: "Piedras Negras", p: [-100.5316, 28.7076] }, { n: "Ciudad Juárez", p: [-106.492, 31.6923] },
    { n: "México", p: [-101.2, 26.3], pais: true }
  ];

  function decir(t, abajo) { estadoTxt.textContent = t || ""; estadoTxt.classList.toggle("abajo", !!abajo); }
  function relleno() {
    if (S.region === "texas") return ancho.matches ? { top: 40, bottom: 34, left: 24, right: 40 } : { top: 66, bottom: 84, left: 8, right: 44 };
    return ancho.matches ? { top: 84, bottom: 64, left: 64, right: 84 } : { top: 78, bottom: 96, left: 30, right: 72 }; // a la derecha va la columna de la cámara
  }
  function cargarMapa(hecho) {
    if (window.maplibregl) return hecho();
    if (cargando) return;
    cargando = true; decir("Cargando el mapa");
    var css = el("link"); css.rel = "stylesheet"; css.href = VENDOR + "maplibre-gl.css"; doc.head.appendChild(css);
    function biblioteca() {
      var s = el("script"); s.src = VENDOR + "maplibre-gl.js";
      s.onload = function () { cargando = false; hecho(); };
      s.onerror = function () { cargando = false; decir("No se pudo cargar el mapa. La lista sigue disponible."); };
      doc.head.appendChild(s);
    }
    // El límite de Texas y los contornos de los planos sólo hacen falta con el mapa: se piden aquí, uno tras otro.
    var pendientes = ["../assets/texas-limite.js", "../assets/parques-contornos-oficiales.js"];
    (function sigue() {
      if (!pendientes.length) return biblioteca();
      var s = el("script"); s.src = pendientes.shift(); s.onload = s.onerror = sigue; doc.head.appendChild(s);
    })();
  }
  // La imagen de USGS llega en blanco fuera de Estados Unidos: lo que no es Texas se cubre con el azul de la casa.
  function geoMascara() {
    var hoyo = (window.TEXAS_LIMITE || []).slice();
    if (hoyo.length && (hoyo[0][0] !== hoyo[hoyo.length - 1][0] || hoyo[0][1] !== hoyo[hoyo.length - 1][1])) hoyo.push(hoyo[0]);
    return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-130, 8], [-70, 8], [-70, 52], [-130, 52], [-130, 8]], hoyo] } };
  }
  function estiloSat() {
    return {
      version: 8,
      sources: { sat: { type: "raster", tiles: [SAT_URL], tileSize: 256, maxzoom: 16, attribution: "Imagen de satélite: USGS, The National Map" } },
      layers: [{ id: "fondo", type: "background", paint: { "background-color": "#0b1730" } },
        { id: "sat", type: "raster", source: "sat", paint: { "raster-fade-duration": reduce ? 0 : 180, "raster-saturation": -0.12, "raster-contrast": 0.04 } }]
    };
  }
  function geoParques() {
    return { type: "FeatureCollection", features: D.parques.filter(function (p) { return p.u; }).map(function (p) {
      return { type: "Feature", id: p.id, properties: { id: p.id, nv: p.nv, r: p.r, n: p.n }, geometry: { type: "Point", coordinates: p.u.p } };
    }) };
  }
  // Contornos: los de planos de la ciudad (línea continua) y, donde no hay plano, los de OpenStreetMap (punteada).
  function planos() { return (window.PARQUES_PLANOS && window.PARQUES_PLANOS.contornos) || {}; }
  function cerrar(a) { a = a.slice(); if (a.length && (a[0][0] !== a[a.length - 1][0] || a[0][1] !== a[a.length - 1][1])) a.push(a[0]); return a; }
  function anillosDe(id) { var pl = planos()[id]; return pl ? pl : (CT[id] ? [CT[id]] : null); }
  function geoContornos() {
    var fs = [], PL = planos();
    Object.keys(PL).forEach(function (id) {
      if (PPOR[id]) fs.push({ type: "Feature", properties: { id: id, t: "plano" }, geometry: { type: "MultiPolygon", coordinates: PL[id].map(function (a) { return [cerrar(a)]; }) } });
    });
    Object.keys(CT).forEach(function (id) {
      if (PPOR[id] && !PL[id]) fs.push({ type: "Feature", properties: { id: id, t: "osm" }, geometry: { type: "Polygon", coordinates: [cerrar(CT[id])] } });
    });
    return { type: "FeatureCollection", features: fs };
  }
  function cajaContorno(id) {
    var as = anillosDe(id); if (!as) return null;
    var b = [180, 90, -180, -90];
    as.forEach(function (a) { a.forEach(function (p) { b = [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])]; }); });
    return [[b[0], b[1]], [b[2], b[3]]];
  }
  function geoPuentes() {
    return { type: "FeatureCollection", features: D.puentes.map(function (b) {
      return { type: "Feature", id: b.id, properties: { id: b.id, n: b.n, puente: 1 }, geometry: { type: "Point", coordinates: b.p } };
    }) };
  }
  function capas() {
    if (mapa.getSource("parques")) return;
    if (S.vista === "mapa") limpiarBase();
    var APAG = ["boolean", ["feature-state", "apagado"], false], HOV = ["boolean", ["feature-state", "hover"], false];
    var BASE = ["match", ["get", "nv"], "ficha", 7, "confirmado", 6.5, 4.6];
    var R = ["case", APAG, 3, HOV, ["+", BASE, 2.5], BASE];
    var TRAZO = ["case", APAG, 0.8, ["match", ["get", "nv"], "ficha", 2, "confirmado", 3, 1.5]];
    function conZoom(x) { return ["interpolate", ["linear"], ["zoom"], 4, ["*", 0.5, x], 7, ["*", 0.78, x], 10, x, 14, ["*", 1.2, x]]; }
    if (S.vista === "sat" && window.TEXAS_LIMITE && window.TEXAS_LIMITE.length) {
      mapa.addSource("mascara", { type: "geojson", data: geoMascara() });
      mapa.addLayer({ id: "mascara", type: "fill", source: "mascara", paint: { "fill-color": "#0b1730", "fill-antialias": true } });
      mapa.addLayer({ id: "limite", type: "line", source: "mascara", paint: { "line-color": BLANCO, "line-opacity": 0.38, "line-width": 1 } });
    }
    mapa.addSource("contornos", { type: "geojson", data: geoContornos() });
    mapa.addSource("puentes", { type: "geojson", data: geoPuentes(), promoteId: "id" });
    mapa.addSource("parques", { type: "geojson", data: geoParques(), promoteId: "id" });
    var enSat = S.vista === "sat"; // sobre satélite, trazo blanco con casco oscuro; sobre el mapa claro, trazo oscuro
    var esPlano = ["==", ["get", "t"], "plano"], esOsm = ["==", ["get", "t"], "osm"], elegido = ["==", ["get", "id"], S.sel || ""];
    mapa.addLayer({ id: "ct-relleno", type: "fill", source: "contornos", minzoom: 9.5, paint: { "fill-color": enSat ? BLANCO : HONDO, "fill-opacity": enSat ? 0.1 : 0.06 } });
    mapa.addLayer({ id: "ct-casco", type: "line", source: "contornos", minzoom: 9.5, paint: { "line-color": HONDO, "line-width": 3.6, "line-opacity": enSat ? 0.7 : 0.0 } });
    mapa.addLayer({ id: "ct-linea", type: "line", source: "contornos", minzoom: 9.5, filter: esPlano, paint: { "line-color": enSat ? BLANCO : HONDO, "line-width": 1.5 } });
    mapa.addLayer({ id: "ct-linea-osm", type: "line", source: "contornos", minzoom: 9.5, filter: esOsm, paint: { "line-color": enSat ? BLANCO : HONDO, "line-width": 1.4, "line-dasharray": [3, 2] } });
    mapa.addLayer({ id: "ct-sel", type: "line", source: "contornos", filter: elegido, paint: { "line-color": enSat ? BLANCO : ROJO, "line-width": 3 } });
    mapa.addLayer({ id: "pt-halo", type: "circle", source: "puentes", minzoom: 6.5, paint: { "circle-radius": 7.5, "circle-color": enSat ? HONDO : BLANCO, "circle-opacity": enSat ? 0.55 : 0.9 } });
    mapa.addLayer({ id: "pt", type: "circle", source: "puentes", minzoom: 6.5, paint: { "circle-radius": 4.5, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": enSat ? BLANCO : HONDO, "circle-stroke-width": 2 } });
    mapa.addLayer({ id: "pq-halo", type: "circle", source: "parques",
      layout: { "circle-sort-key": ["match", ["get", "nv"], "ficha", 3, "confirmado", 2, 1] },
      paint: { "circle-radius": conZoom(["+", R, ["+", TRAZO, 2]]), "circle-color": HONDO, "circle-opacity": ["case", APAG, 0, ["match", ["get", "nv"], "listado", 0, 0.6]] } });
    mapa.addLayer({ id: "pq", type: "circle", source: "parques",
      layout: { "circle-sort-key": ["match", ["get", "nv"], "ficha", 3, "confirmado", 2, 1] },
      paint: {
        "circle-radius": conZoom(R),
        "circle-color": ["case", APAG, GRIS, ["match", ["get", "nv"], "ficha", ROJO, BLANCO]],
        "circle-stroke-color": ["case", APAG, HONDO, ["match", ["get", "nv"], "ficha", BLANCO, "confirmado", ROJO, HONDO]],
        "circle-stroke-width": TRAZO
      } });
    mapa.addLayer({ id: "pq-sel-halo", type: "circle", source: "parques", filter: ["==", ["get", "id"], S.sel || ""], paint: { "circle-radius": 16, "circle-color": HONDO, "circle-opacity": 0.6 } });
    mapa.addLayer({ id: "pq-sel", type: "circle", source: "parques", filter: ["==", ["get", "id"], S.sel || ""], paint: { "circle-radius": 11, "circle-color": ROJO, "circle-stroke-color": BLANCO, "circle-stroke-width": 3 } });
    Object.keys(apagados).forEach(function (id) { mapa.setFeatureState({ source: "parques", id: id }, { apagado: true }); });
    listo = true;
    if (S.sel) marcarSel(primerEstilo, true); // quien llega con el enlace de un parque abre sobre ese parque
    primerEstilo = false;
    enReposo();
  }
  // En la vista «Mapa» casi todo el ruido viene del mapa base: fuera comercios, números, escudos y edificios.
  function limpiarBase() {
    (mapa.getStyle().layers || []).forEach(function (c) {
      // se quedan las vías de tren principales y el escudo de las interestatales, que sí orientan a quien busca una nave
      if (/^park$|landuse_residential|landcover_wood|building|aeroway|airport|railway_transit|railway_service|shield-non-us|road_shield_us|(^|[_-])poi|housenum|highway_path|highway-name-path/i.test(c.id)) mapa.setLayoutProperty(c.id, "visibility", "none");
    });
  }
  // Los rótulos son texto de apoyo: la biblioteca los marca como botón y aquí se le quita, porque no se pulsan.
  function adorno(m) {
    var e = m.getElement();
    e.removeAttribute("role"); e.removeAttribute("aria-label"); e.removeAttribute("tabindex"); e.setAttribute("aria-hidden", "true");
    return m;
  }
  function crearMapa() {
    decir("");
    mapa = new maplibregl.Map({
      container: "mp-mapa", style: S.vista === "sat" ? estiloSat() : MAPA_URL,
      bounds: cajaDe(S.region), fitBoundsOptions: { padding: relleno(), maxZoom: 12.5 },
      // límites holgados: en teléfono Texas completo pide alejarse más y un encuadre alto
      minZoom: 3.8, maxZoom: 17.4, maxBounds: [[-125, 12], [-75, 48]],
      dragRotate: false, pitchWithRotate: false, touchPitch: false, attributionControl: { compact: true }
    });
    mapa.touchZoomRotate.disableRotation();
    if (mapa.keyboard && mapa.keyboard.disableRotation) mapa.keyboard.disableRotation();
    mapa.on("style.load", capas);
    mapa.on("moveend", enReposo);
    mapa.on("mousemove", function (ev) { if (listo) apuntar(masCercano(ev.point)); });
    mapa.on("mouseout", function () { apuntar(null); });
    mapa.on("click", function (ev) {
      if (!listo) return;
      var f = masCercano(ev.point);
      if (f && !f.properties.puente) seleccionar(f.properties.id, "mapa");
      else if (f) { apuntar(f); }
      else if (S.sel && !ancho.matches) hoja("baja");
    });
    var avisado = false;
    mapa.on("error", function (ev) {
      if (avisado || !ev || !ev.error) return;
      var t = String(ev.error.message || ev.error);
      if (ev.sourceId === "sat" || /basemap\.nationalmap|openfreemap|Failed to fetch|NetworkError/i.test(t)) {
        avisado = true; decir("No llegó la imagen del mapa base. Los puntos y la lista siguen disponibles.", true);
        setTimeout(function () { decir(""); }, 7000);
      }
    });
    rotulo = adorno(new maplibregl.Marker({ element: el("div", "mp-rotulo"), anchor: "bottom", offset: [0, -14] }));
    rotuloSel = adorno(new maplibregl.Marker({ element: el("div", "mp-rotulo"), anchor: "bottom", offset: [0, -18] }));
    D.regiones.forEach(function (r) {
      if (!r.en_el_mapa) return;
      var b = el("button", "mp-zona"); b.type = "button";
      b.appendChild(doc.createTextNode(r.n)); b.appendChild(el("b", "", String(r.en_el_mapa)));
      b.setAttribute("aria-label", r.n + ", " + r.en_el_mapa + " parques en el mapa");
      b.addEventListener("click", function (ev) { ev.stopPropagation(); entrar(r.id, "zona", true); });
      // cada tarjeta sale hacia fuera de Texas para no tapar los puntos ni encimarse con la de al lado
      var lado = { laredo: "right", valle: ancho.matches ? "left" : "top", "san-antonio": "right", austin: "bottom", dfw: "bottom", houston: ancho.matches ? "left" : "top", "el-paso": "left" }[r.id] || "bottom";
      var sep = { right: [-10, 0], left: [10, 0], top: [0, 10], bottom: [0, -10] }[lado];
      zonas.push({ r: r, m: new maplibregl.Marker({ element: b, anchor: lado, offset: sep }).setLngLat(ancla(r)), puesto: false });
    });
    // Sobre el azul que cubre México van sus ciudades de frontera, para que no se lea como mar.
    MX.forEach(function (c) {
      var e = el("div", "mp-mx", c.n); if (c.pais) e.classList.add("pais"); else e.appendChild(el("small", "", "México"));
      vecinos.push({ c: c, m: adorno(new maplibregl.Marker({ element: e, anchor: c.pais ? "center" : "top-right", offset: c.pais ? [0, 0] : [-6, 6] })).setLngLat(c.p), puesto: false });
    });
    D.parques.forEach(function (p) {
      if (!p.u || p.nv === "listado") return;
      nombres.push({ p: p, m: adorno(new maplibregl.Marker({ element: el("div", "mp-rotulo", p.n), anchor: "top", offset: [0, 12] })).setLngLat(p.u.p), puesto: false });
    });
  }
  // Lo que hay bajo el puntero: sólo marcas pintadas y gana la más cercana, hasta 12 px.
  function masCercano(pt) {
    var fs = mapa.queryRenderedFeatures([[pt.x - 12, pt.y - 12], [pt.x + 12, pt.y + 12]], { layers: ["pq", "pq-sel", "pt"] });
    var mejor = null, dm = 1e9;
    fs.forEach(function (f) {
      var c = mapa.project(f.geometry.coordinates), d = Math.hypot(c.x - pt.x, c.y - pt.y);
      if (f.properties.puente) d += 4; // un parque junto a un puente gana el toque
      if (d < dm) { dm = d; mejor = f; }
    });
    return dm <= 16 ? mejor : null;
  }
  function apuntar(f) {
    var id = f && !f.properties.puente ? f.properties.id : null;
    if (id !== hoverId) {
      if (hoverId) { mapa.setFeatureState({ source: "parques", id: hoverId }, { hover: false }); if (filas[hoverId]) filas[hoverId].classList.remove("encendida"); }
      hoverId = id;
      if (id) { mapa.setFeatureState({ source: "parques", id: id }, { hover: true }); if (filas[id]) filas[id].classList.add("encendida"); }
    }
    mapa.getCanvas().style.cursor = f ? "pointer" : "";
    if (f && f.properties.id !== S.sel) {
      var e = rotulo.getElement();
      e.textContent = f.properties.n;
      if (f.properties.puente) e.appendChild(el("small", "", "Puente de carga"));
      rotulo.setLngLat(f.geometry.coordinates).addTo(mapa);
    } else rotulo.remove();
  }
  function resaltar(id, si) { // desde la lista
    var p = PPOR[id];
    if (!listo || !p || !p.u) return;
    if (si) apuntar({ properties: { id: id, n: p.n }, geometry: { coordinates: p.u.p } }); else apuntar(null);
  }
  function marcarSel(volar, alInstante) {
    if (!listo) return;
    var p = S.sel && PPOR[S.sel];
    ["pq-sel", "pq-sel-halo", "ct-sel"].forEach(function (c) { mapa.setFilter(c, ["==", ["get", "id"], S.sel || ""]); });
    rotulo.remove();
    if (p && p.u) {
      rotuloSel.getElement().textContent = p.n;
      rotuloSel.setLngLat(p.u.p).addTo(mapa);
      if (volar) {
        // En teléfono se encuadra en lo que la hoja deja libre del mapa. El relleno de easeTo se queda guardado en
        // la cámara y descuadra lo que sigue, así que el punto va con desplazamiento y el contorno con fitBounds.
        var abajo = ancho.matches ? 0 : Math.min($("mp-panel").offsetHeight, explorador.clientHeight - 150);
        var dura = reduce || alInstante ? 0 : 900, caja = cajaContorno(p.id);
        if (caja) {
          mapa.fitBounds(caja, { padding: ancho.matches ? { top: 90, bottom: 70, left: 70, right: 90 } : { top: 26, bottom: abajo + 16, left: 22, right: 22 }, maxZoom: 15.2, duration: dura });
        } else {
          mapa.easeTo({ center: p.u.p, zoom: Math.min(Math.max(mapa.getZoom(), 13.6), 15.5), offset: ancho.matches ? [0, 10] : [0, (34 - abajo) / 2], duration: dura });
        }
      }
    } else rotuloSel.remove();
    enReposo();
  }
  function aplicarFiltro() {
    if (!listo) { D.parques.forEach(function (p) { if (p.u) { if (S.filtro && !coincide(p)) apagados[p.id] = 1; else delete apagados[p.id]; } }); return; }
    D.parques.forEach(function (p) {
      if (!p.u) return;
      var ap = !!S.filtro && !coincide(p);
      if (ap !== !!apagados[p.id]) { mapa.setFeatureState({ source: "parques", id: p.id }, { apagado: ap }); if (ap) apagados[p.id] = 1; else delete apagados[p.id]; }
    });
  }
  // Con la cámara en reposo: tarjetas de región en la vista de todo Texas y nombres de los verificados de cerca.
  function enReposo() {
    if (!mapa || !listo) return;
    var z = mapa.getZoom(), verZonas = S.region === "texas" && z < 7.4 && !S.sel, verNombres = z >= 11.2;
    zonas.forEach(function (x) { if (verZonas !== x.puesto) { if (verZonas) x.m.addTo(mapa); else x.m.remove(); x.puesto = verZonas; } });
    nombres.forEach(function (x) {
      var si = verNombres && x.p.id !== S.sel && !apagados[x.p.id];
      if (si !== x.puesto) { if (si) x.m.addTo(mapa); else x.m.remove(); x.puesto = si; }
    });
    var ley = doc.querySelector(".mp-leyenda"), caja = $("mp-mapa").getBoundingClientRect(), rl = ley && ley.offsetParent ? ley.getBoundingClientRect() : null;
    vecinos.forEach(function (x) {
      var si = S.vista === "sat" && (x.c.pais ? z < 7.8 : z >= 7.8 && z < 13);
      if (si && rl) { // un rótulo que caería bajo la leyenda no se pone
        var q = mapa.project(x.c.p), px = q.x + caja.left, py = q.y + caja.top;
        if (px > rl.left - 110 && px < rl.right + 20 && py > rl.top - 24 && py < rl.bottom + 30) si = false;
      }
      if (si !== x.puesto) { if (si) x.m.addTo(mapa); else x.m.remove(); x.puesto = si; }
    });
    $("mp-cam-region").disabled = false;
  }
  function encuadrar(id, animar) {
    if (!mapa) return;
    mapa.fitBounds(cajaDe(id), { padding: relleno(), maxZoom: 12.5, duration: animar && !reduce ? 1100 : 0 });
  }
  function ponerVista(v, avisar) {
    if (v === S.vista) return;
    S.vista = v; listo = false;
    Array.prototype.forEach.call(doc.querySelectorAll("#mp-vista button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-vista") === v ? "true" : "false"); });
    if (mapa) { rotulo.remove(); mapa.setStyle(v === "sat" ? estiloSat() : MAPA_URL); }
    escribirURL(false);
    if (avisar) medir("mapa_vista", { vista: v });
  }
  Array.prototype.forEach.call(doc.querySelectorAll("#mp-vista button"), function (b) { b.addEventListener("click", function () { ponerVista(b.getAttribute("data-vista"), true); }); });
  $("mp-cam-mas").addEventListener("click", function () { if (mapa) mapa.zoomIn({ duration: reduce ? 0 : 250 }); });
  $("mp-cam-menos").addEventListener("click", function () { if (mapa) mapa.zoomOut({ duration: reduce ? 0 : 250 }); });
  $("mp-cam-region").addEventListener("click", function () { if (S.sel) cerrarFicha(false); encuadrar(S.region, true); });
  $("mp-cam-texas").addEventListener("click", function () { if (S.sel) cerrarFicha(false); entrar("texas", "camara", true); });

  /* ------------------------------------------------------------ 4. entrar, salir y dirección */
  function escribirURL(nueva) {
    var p = new URLSearchParams();
    if (S.region) p.set("region", S.region);
    if (S.sel) p.set("parque", S.sel);
    if (S.vista !== "sat") p.set("vista", S.vista);
    var u = location.pathname + (p.toString() ? "?" + p.toString() : "");
    // Con las funciones originales del navegador (assets/medir.js): elegir región o parque no cuenta como vista de página.
    var poner = nueva ? (window.agregarDireccion || history.pushState.bind(history)) : (window.cambiarDireccion || history.replaceState.bind(history));
    try { poner({ mp: 1 }, "", u); } catch (e) { /* archivo local en algunos navegadores */ }
  }
  function entrar(id, desde, nueva) {
    if (!RPOR[id]) return;
    var cambio = S.region !== id;
    S.region = id; S.verSin = false;
    if (S.sel && (id !== "texas" && PPOR[S.sel].r !== id)) S.sel = null;
    portada.hidden = true; explorador.hidden = false;
    doc.documentElement.classList.add("mp-en-mapa");
    $("nav").classList.add("solida");
    if (!S.sel) { ficha.hidden = true; cabeza.hidden = false; lista.hidden = false; }
    buscar.value = ""; S.filtro = "";
    pintarLista();
    cuerpo.scrollTop = 0;
    hoja(S.sel ? "media" : "baja");
    $("mp-cam-region").textContent = id === "texas" ? "Todo" : "Región";
    $("mp-cam-texas").hidden = id === "texas";
    window.scrollTo(0, 0);
    cargarMapa(function () {
      if (!mapa) crearMapa();
      else { mapa.resize(); if (cambio || desde === "camara") encuadrar(id, desde !== "enlace"); marcarSel(false); enReposo(); }
    });
    if (desde !== "atras") escribirURL(!!nueva);
    if (cambio) medir("mapa_region", { region: id, desde: desde });
  }
  function salir(nueva) {
    S.region = null; S.sel = null;
    explorador.hidden = true; portada.hidden = false;
    doc.documentElement.classList.remove("mp-en-mapa");
    $("nav").classList.toggle("solida", window.scrollY > 24);
    if (rotuloSel) rotuloSel.remove();
    acomodarFondo();
    if (nueva) escribirURL(true);
    var b = listaReg.querySelector("button"); if (b) b.focus({ preventScroll: true });
  }
  function desdeDireccion(inicio) {
    var p = new URLSearchParams(location.search), r = p.get("region"), pq = p.get("parque"), v = p.get("vista");
    if (pq && PPOR[pq] && !RPOR[r]) r = PPOR[pq].r;
    if (v === "mapa" && S.vista !== "mapa") ponerVista("mapa", false);
    if (r && RPOR[r]) {
      S.sel = null;
      entrar(r, inicio ? "enlace" : "atras", false);
      if (pq && PPOR[pq]) { seleccionar(pq, "enlace"); if (listo) marcarSel(false); }
      else if (!ficha.hidden) cerrarFicha(false);
    } else if (!explorador.hidden) salir(false);
  }
  window.addEventListener("popstate", function () { desdeDireccion(false); });
  window.addEventListener("resize", function () { acomodarFondo(); if (mapa && !explorador.hidden) mapa.resize(); });

  pintarPortada();
  desdeDireccion(true);
  // Para pruebas: el estado y el mapa quedan a la vista de la consola.
  window.__mapaParques = { estado: S, mapa: function () { return mapa; }, listo: function () { return listo; } };
})();
