/* Invest Texas Hub · maqueta de la portada, versión 3 (9-nov-2026).
   Página normal con tres mapas que salen de la misma función de dibujo (crearMapa), cada uno con su encuadre:
   1. Entrada: apertura con las rutas desde Monterrey, linterna, carreteras que se encienden con el puntero,
      región que enciende su ruta; el clic baja a la sección de regiones con esa región elegida.
   2. ¿Desde dónde sales?: selector de tres orígenes; las rutas se dibujan hasta su puente y el puente dice su nombre.
   3. Regiones: selector de siete regiones y de origen (el mismo de la sección 2); mapa chico con hasta tres rutas.
   Además: necesidades, puentes de carga, empresas (arcos), parques y guías, cada una con su módulo.
   Los mapas 2 y 3 se crean cuando su sección está por entrar en pantalla. Sin bibliotecas ni servidores de mapas.
   Guion clásico: abre como archivo local.
   Datos: assets/mapa-datos.js (satélite, límites, ciudades), assets/red-datos.js (red y rutas, herramientas/red.py),
   assets/capas-datos.js (puentes, empresas y parques, herramientas/armar_datos.py).
   Parámetros de la maqueta: ?quieto=1 (sin movimiento), ?origen=saltillo, ?region=dfw, ?necesidad=mar, ?estado=Tamaulipas,
   ?empresas=anclas, ?zona=dfw, ?paleta=, ?conmutador=1,
   y para capturas ?ir=<id>&menos=<px> (abre en esa sección) y ?alto=<px> (alto fijo de la portada). */
(function () {
  "use strict";
  var D = window.MAPA_DATOS;
  var R = window.RED_DATOS;
  var C = window.CAPAS_DATOS || {};
  C.cruces = C.cruces || []; C.mexicanas = C.mexicanas || []; C.parques = C.parques || {}; C.carreteras = C.carreteras || [];
  var SVGNS = "http://www.w3.org/2000/svg";
  var raiz = document.documentElement;
  var q = location.search;
  function param(n) { var m = new RegExp("[?&]" + n + "=([^&#]*)").exec(q); return m ? decodeURIComponent(m[1]) : null; }
  var quieto = param("quieto") === "1";
  if (quieto) raiz.classList.add("quieto");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || quieto;
  var punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var S_MAX = 140; // px por grado: el recorte de detalle tiene 150, no se acerca más de lo que aguanta nítido.

  function merc(lat) { return 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }
  function el(tag, attrs, padre) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function h(tag, cls, padre, texto) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto != null) e.textContent = texto;
    if (padre) padre.appendChild(e);
    return e;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function color(v) { return getComputedStyle(raiz).getPropertyValue(v).trim() || "#fff"; }
  function lim(x, a, b) { return x < a ? a : x > b ? b : x; }
  function suave(x) { x = lim(x, 0, 1); return x * x * (3 - 2 * x); }
  var cada = function (lista, f) { Array.prototype.forEach.call(lista, f); };
  function unir(b, p) { return b ? [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])] : [p[0], p[1], p[0], p[1]]; }
  function ampliar(b, f) { var dx = (b[2] - b[0]) * f, dy = (b[3] - b[1]) * f; return [b[0] - dx, b[1] - dy, b[2] + dx, b[3] + dy]; }

  /* ------------------------------------------------------------ datos */
  var REGIONES = [
    { id: "laredo", nombre: "Laredo", puntos: ["laredo"] },
    { id: "valle", nombre: "Valle del Río Grande", puntos: ["mcallen", "brownsville"] },
    { id: "san-antonio", nombre: "San Antonio", puntos: ["sanantonio"] },
    { id: "austin", nombre: "Austin", puntos: ["austin"] },
    { id: "dfw", nombre: "Dallas-Fort Worth", puntos: ["fortworth", "dallas"] },
    { id: "houston", nombre: "Houston", puntos: ["houston"] },
    { id: "el-paso", nombre: "El Paso", puntos: ["elpaso"] }
  ];
  var RPOR = {}; REGIONES.forEach(function (r) { RPOR[r.id] = r; r.pts = r.puntos.map(function (p) { return D.ciudades[p]; }); });
  var CRUCE = {}; C.cruces.forEach(function (c) { CRUCE[c.id] = c; });
  var LA_GLORIA = null; C.carreteras.forEach(function (c) { if (c.id === "la-gloria-colombia") LA_GLORIA = c; });
  var AR = R.aristas;
  var MTY = [R.origenes.monterrey.lon, R.origenes.monterrey.y];
  // Rótulo corto del puente en el mapa; el nombre completo va en el texto.
  var CORTO = {
    "laredo-world-trade": "Comercio Mundial", "laredo-colombia": "Colombia-Solidaridad", "pharr-reynosa": "Reynosa-Pharr",
    "eagle-pass-camino-real": "Camino Real", "del-rio-acuna": "Acuña-Del Río", "el-paso-bota": "Córdova de las Américas",
    "el-paso-ysleta-zaragoza": "Ysleta-Zaragoza"
  };
  var PUENTES_ENTRADA = ["laredo-world-trade", "laredo-colombia", "pharr-reynosa"];
  // Rutas de cada origen, en el orden de sus oraciones (red-datos.js). extra: puentes del mismo cruce sin trazo propio.
  var RUTAS_ORIGEN = {
    monterrey: [{ r: "laredo" }, { r: "laredo", alt: 0 }, { r: "valle" }],
    saltillo: [{ r: "san-antonio", alt: 1 }, { r: "san-antonio", alt: 0 }, { r: "laredo" }, { r: "valle" }],
    chihuahua: [{ r: "el-paso", extra: ["el-paso-ysleta-zaragoza"] }]
  };
  var SATS = [ // kB de cada recorte, para elegir el más ligero que se vea nítido
    { s: D.satelite.escritorio, kb: 595 }, { s: D.satelite.movil, kb: 545 },
    { s: { archivo: "satelite-detalle.jpg", lon0: -107.5, lon1: -93.0, y0: 25.39262, y1: 36.91766, ancho: 2175, alto: 1729 }, kb: 515 }
  ];
  var DETALLE = SATS[2].s;
  var USADOS = {}; // recortes que ya pidió algún mapa

  function nombreCamino(n, pais) {
    if (!n) return "Cruce a Texas";
    if (pais === "MX") {
      if (n === "MEX 2") return "Carretera 2";
      if (/^\d/.test(n) || n === "La Gloria-Colombia") return "Carretera " + n;
    }
    return n;
  }
  function textoCamino(a) {
    if (a.f === "conector") { var c = a.puente && CRUCE[a.puente]; return [a.n || "Cruce a Texas", c && c.parcial ? "Por confirmar" : null]; }
    var sub = null;
    if (a.id === "nl1" && LA_GLORIA && LA_GLORIA.estado !== "verificado") sub = "Obra por confirmar";
    return [nombreCamino(a.n, a.pais), sub];
  }
  // Une aristas en una línea que sale del origen; con cortar, termina al otro lado del primer puente.
  function linea(origen, lista, cortar) {
    var cur = R.origenes[origen].nodo, coords = [], puentes = [], visto = false;
    for (var n = 0; n < lista.length; n++) {
      var a = AR[lista[n]], c = a.c, esPuente = a.f === "conector";
      if (cortar && visto && !esPuente) break;
      if (esPuente && !visto) { visto = true; puentes.push({ id: a.puente, k: Math.max(0, coords.length - 1) }); }
      if (a.a === cur) cur = a.b; else { cur = a.a; c = c.slice().reverse(); }
      coords = coords.concat(coords.length ? c.slice(1) : c);
    }
    var L = [0];
    for (var i = 1; i < coords.length; i++) L.push(L[i - 1] + Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]));
    var total = L[L.length - 1] || 1;
    return { c: coords, puentes: puentes.map(function (p) { return { id: p.id, f: L[p.k] / total }; }) };
  }
  function caja(coords, b) { coords.forEach(function (p) { b = unir(b, p); }); return b; }

  /* ------------------------------------------------------------ una sola función de dibujo para los tres mapas */
  function crearMapa(cont, op) {
    op = op || {};
    cont.classList.add("mapa");
    var M = { cont: cont, W: 0, H: 0, cam: { ox: 0, oy: 0, s: 1 }, marcas: [], trazos: [], red: [], puentes: {} };
    var img = h("img", "sat", cont); img.alt = ""; img.decoding = "async";
    var imgDet = null, detListo = false;
    if (op.detalle) { imgDet = h("img", "sat detalle", cont); imgDet.alt = ""; imgDet.addEventListener("load", function () { detListo = true; M.render(); }); }
    h("div", op.velo || "velo-claro", cont).setAttribute("aria-hidden", "true");
    if (op.linterna) { M.sombra = h("div", "sombra", cont); M.sombra.setAttribute("aria-hidden", "true"); }
    var svg = M.svg = el("svg", { "class": "lienzo", "aria-hidden": op.marcasConEnlace ? "false" : "true" }, cont);
    var gLim = el("g", {}, svg);
    var gBase = el("g", {}, svg), gCasco = el("g", {}, svg), gLuz = el("g", {}, svg);
    M.gActiva = el("g", {}, svg);
    var gTrazos = el("g", {}, svg);
    M.gRot = el("g", {}, svg);
    M.gExtra = el("g", {}, svg);
    var gPuentes = el("g", {}, svg), gMarcas = el("g", {}, svg);
    if (op.caminos) { M.etiqueta = h("div", "etq-puntero", cont); M.etiqueta.hidden = true; }
    var LIM = [];
    D.limites.otros.forEach(function (c) { LIM.push({ c: c, e: el("path", { "class": "lim-otros" }, gLim) }); });
    (D.limites.nuevoleon || []).forEach(function (c) { LIM.push({ c: c, e: el("path", { "class": "lim-nl" }, gLim) }); });
    D.limites.texas.forEach(function (c) { LIM.push({ c: c, e: el("path", { "class": "lim-tx" }, gLim) }); });
    var paises = op.paises ? [el("text", { "class": "rot-pais", "text-anchor": "middle" }, gLim), el("text", { "class": "rot-pais", "text-anchor": "middle" }, gLim)] : [];
    if (paises.length) { paises[0].textContent = "MÉXICO"; paises[1].textContent = "TEXAS"; }
    M.porNombre = {};
    if (op.red) AR.forEach(function (a, i) {
      var f = a.g === "fino" ? " fino" : "";
      var x = { a: a, i: i, dir: 0, pts: [], clave: a.f === "conector" ? "#" + i : a.n,
        base: el("path", { "class": "r-base" + f }, gBase), casco: el("path", { "class": "r-casco" + f, pathLength: "1" }, gCasco), luz: el("path", { "class": "r-luz" + f, pathLength: "1" }, gLuz) };
      M.red.push(x);
      (M.porNombre[x.clave] = M.porNombre[x.clave] || []).push(x);
    });

    function X(lon) { return M.cam.ox + M.cam.s * lon; }
    function Y(y) { return M.cam.oy - M.cam.s * y; }
    M.X = X; M.Y = Y;
    M.ruta = function (c, dir) {
      var d = "", n = c.length, cm = M.cam;
      for (var k = 0; k < n; k++) { var p = c[dir ? n - 1 - k : k]; d += (k ? "L" : "M") + (cm.ox + cm.s * p[0]).toFixed(1) + " " + (cm.oy - cm.s * p[1]).toFixed(1); }
      return d;
    };
    M.medir = function () { M.W = cont.clientWidth; M.H = cont.clientHeight; return M.W > 0; };
    M.encuadre = function (b, r) {
      r = r || { x: 18, y: 18, w: M.W - 36, h: M.H - 36 };
      var minLado = op.minLado || 0;
      var cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
      var s = Math.min(r.w / Math.max(b[2] - b[0], minLado), r.h / Math.max(b[3] - b[1], minLado * 0.7), S_MAX);
      return { s: s, ox: r.x + r.w / 2 - s * cx, oy: r.y + r.h / 2 + s * cy };
    };
    function cubre(s) { return X(s.lon0) <= 0 && X(s.lon1) >= M.W && Y(s.y1) <= 0 && Y(s.y0) >= M.H; }
    function colocarImg(im, s) {
      var src = "assets/" + s.archivo;
      if (im === img && im.getAttribute("src") !== src) im.src = src;
      USADOS[s.archivo] = true;
      var k = M.cam.s * (s.lon1 - s.lon0) / s.ancho;
      im.style.width = s.ancho + "px"; im.style.height = s.alto + "px";
      im.style.transform = "translate(" + X(s.lon0).toFixed(1) + "px," + Y(s.y1).toFixed(1) + "px) scale(" + k.toFixed(5) + ")";
    }
    function satelite() {
      if (op.detalle) { // entrada: recorte base que cubra la pantalla, y el de detalle encima si la escala lo pide
        var orden = M.W < 700 ? [D.satelite.movil, D.satelite.escritorio] : [D.satelite.escritorio, D.satelite.movil], e = null;
        for (var i = 0; i < orden.length; i++) if (cubre(orden[i])) { e = orden[i]; break; }
        e = e || D.satelite.escritorio;
        colocarImg(img, e);
        var quiere = M.cam.s > e.ancho / (e.lon1 - e.lon0) * 1.08;
        if (quiere && !imgDet.getAttribute("src")) imgDet.src = "assets/" + DETALLE.archivo;
        colocarImg(imgDet, DETALLE);
        imgDet.classList.toggle("visible", quiere && detListo);
        return;
      }
      // mapas chicos: el recorte más ligero que cubra el encuadre y se vea nítido a ese tamaño
      var pide = M.cam.s * Math.min(2, window.devicePixelRatio || 1) * 0.8, mejor = null, nitido = null;
      SATS.forEach(function (x) {
        if (!cubre(x.s)) return;
        var ppd = x.s.ancho / (x.s.lon1 - x.s.lon0), kb = USADOS[x.s.archivo] ? 0 : x.kb; // lo ya descargado no pesa
        if (ppd >= pide && (!mejor || kb < mejor.kb)) mejor = { s: x.s, kb: kb };
        if (!nitido || ppd > nitido.ppd) nitido = { s: x.s, ppd: ppd };
      });
      colocarImg(img, mejor ? mejor.s : nitido ? nitido.s : D.satelite.escritorio);
    }

    /* marcas: punto (o varios), rótulo opcional y subrótulo */
    M.marca = function (o) {
      var g = el("g", { "class": o.cls }, gMarcas);
      if (o.aria) { g.setAttribute("role", "link"); g.setAttribute("tabindex", "0"); g.setAttribute("aria-label", o.aria); } else g.setAttribute("aria-hidden", "true");
      var m = { g: g, in: el("g", { "class": "in" }, g), pts: o.pts || [o.p], lados: o.lados || ["der", "izq", "arriba", "abajo"], ver: 1, conRot: true, grande: o.grande };
      var varios = m.pts.length > 1;
      m.dots = m.pts.map(function (p, i) {
        if (o.aria) el("circle", { r: 18, "class": "golpe" }, m.in);
        if (o.rombo) return el("rect", { x: -3.6, y: -3.6, width: 7.2, height: 7.2, "class": "punto", transform: "rotate(45)" }, m.in);
        return el("circle", { r: varios && i === 0 ? 3.5 : (o.r || 5.5), "class": varios && i === 0 ? "punto sec" : "punto" }, m.in);
      });
      m.golpes = o.aria ? Array.prototype.filter.call(m.in.children, function (c) { return c.getAttribute("class") === "golpe"; }) : [];
      if (o.texto) { m.rot = el("text", { "class": "rotulo" }, m.in); m.rot.textContent = o.texto; }
      if (o.sub) { m.sub = el("text", { "class": "sub" }, m.in); m.sub.textContent = o.sub; }
      if (o.rombo) gPuentes.appendChild(g);
      M.marcas.push(m);
      return m;
    };
    M.ver = function (m, v, conRot) {
      m.ver = v; m.conRot = conRot !== false;
      m.g.style.display = v > 0.01 ? "" : "none";
      m.g.style.opacity = v > 0.99 ? "" : v;
      if (m.rot) m.rot.style.display = m.conRot ? "" : "none";
      if (m.sub) m.sub.style.display = m.conRot ? "" : "none";
    };
    M.puente = function (id) {
      if (M.puentes[id] || !CRUCE[id]) return M.puentes[id];
      var c = CRUCE[id];
      var m = M.marca({ p: c.p, cls: "m-puente" + (c.parcial ? " parcial" : ""), rombo: true, texto: op.rotulosPuente ? CORTO[id] || c.nombre : null, sub: op.rotulosPuente && c.parcial ? "POR CONFIRMAR" : null });
      m.id = id;
      M.ver(m, 0);
      return (M.puentes[id] = m);
    };

    /* trazos: rutas que se dibujan; el puente aparece cuando la línea lo cruza */
    M.trazo = function (t) { // t: {c, puentes:[{id,f}]}
      t.casco = el("path", { "class": "act-casco" + (t.alt ? " alt" : ""), pathLength: "1" }, gTrazos);
      t.linea = el("path", { "class": "act" + (t.alt ? " alt" : ""), pathLength: "1" }, gTrazos);
      t.puentes = t.puentes || [];
      t.puentes.forEach(function (p) { p.m = M.puente(p.id); });
      M.trazos.push(t);
      M.progreso(t, 0);
      var d = M.ruta(t.c); t.casco.setAttribute("d", d); t.linea.setAttribute("d", d);
      return t;
    };
    M.progreso = function (t, p) {
      t.p = p;
      var off = (1 - p).toFixed(4);
      t.casco.style.strokeDashoffset = off; t.linea.style.strokeDashoffset = off;
    };
    M.quitarTrazos = function () {
      M.trazos.forEach(function (t) { t.casco.remove(); t.linea.remove(); });
      M.trazos = [];
      Object.keys(M.puentes).forEach(function (k) { M.ver(M.puentes[k], 0); });
    };
    M.puentesSegunTrazos = function () {
      var cambio = false;
      Object.keys(M.puentes).forEach(function (k) {
        var m = M.puentes[k], v = 0;
        M.trazos.forEach(function (t) { t.puentes.forEach(function (p) { if (p.m === m && t.p + 0.004 >= p.f) v = Math.max(v, t.bajo ? 0.35 : 1); }); });
        if ((v > 0) !== (m.ver > 0) || v !== m.ver) { M.ver(m, v, v > 0.5); cambio = true; }
      });
      if (cambio) M.rotulos();
    };
    // Dibuja los trazos en ms, cada uno con su retraso (t.retraso, 0 a 1 del tiempo).
    M.dibujar = function (ms, alFin) {
      cancelAnimationFrame(M.rafDib);
      if (reduce || !ms) { M.trazos.forEach(function (t) { M.progreso(t, 1); }); M.puentesSegunTrazos(); if (alFin) alFin(); return; }
      var t0 = performance.now();
      (function paso(ahora) {
        var u = (ahora - t0) / ms, sigue = false;
        M.trazos.forEach(function (t) {
          var r = t.retraso || 0, p = suave((u - r) / (1 - r));
          M.progreso(t, p); if (p < 1) sigue = true;
        });
        M.puentesSegunTrazos();
        if (sigue) M.rafDib = requestAnimationFrame(paso); else if (alFin) alFin();
      })(t0);
    };
    M.resaltar = function (indices) { // baja lo demás; null devuelve todo
      M.trazos.forEach(function (t, i) { t.bajo = !!indices && indices.indexOf(i) < 0; t.casco.classList.toggle("bajo", t.bajo); t.linea.classList.toggle("bajo", t.bajo); });
      M.puentesSegunTrazos();
    };

    /* vuelo de la cámara entre dos encuadres */
    M.volar = function (dest, ms, alFin) {
      cancelAnimationFrame(M.rafVuelo);
      if (reduce || !ms || !M.cam.s || M.cam.s === 1) { M.cam = dest; M.render(); if (alFin) alFin(); return; }
      var a = M.cam, Wc = M.W / 2, Hc = M.H / 2, t0 = performance.now();
      var la = (Wc - a.ox) / a.s, ya = (a.oy - Hc) / a.s, lb = (Wc - dest.ox) / dest.s, yb = (dest.oy - Hc) / dest.s;
      (function paso(ahora) {
        var t = Math.min(1, (ahora - t0) / ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        var s = a.s * Math.pow(dest.s / a.s, e);
        M.cam = t < 1 ? { s: s, ox: Wc - s * (la + (lb - la) * e), oy: Hc + s * (ya + (yb - ya) * e) } : dest;
        M.render(t < 1);
        if (t < 1) M.rafVuelo = requestAnimationFrame(paso); else if (alFin) alFin();
      })(t0);
    };

    /* dibujo */
    function poner(g, x, y) { g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")"); }
    M.render = function (enVuelo) {
      if (!M.W) return;
      satelite();
      svg.setAttribute("viewBox", "0 0 " + M.W + " " + M.H);
      LIM.forEach(function (l) { l.e.setAttribute("d", M.ruta(l.c)); });
      if (paises.length) {
        paises[0].setAttribute("x", X(-102.6)); paises[0].setAttribute("y", Y(merc(26.9)));
        paises[1].setAttribute("x", X(-100.6)); paises[1].setAttribute("y", Y(merc(31.2)));
        paises.forEach(function (p) { p.style.display = M.W >= 640 ? "" : "none"; });
      }
      M.red.forEach(function (x) {
        var dd = M.ruta(x.a.c, x.dir);
        x.base.setAttribute("d", dd); x.casco.setAttribute("d", dd); x.luz.setAttribute("d", dd);
        var pts = x.pts; pts.length = 0;
        for (var k = 0; k < x.a.c.length; k++) pts.push(X(x.a.c[k][0]), Y(x.a.c[k][1]));
      });
      M.trazos.forEach(function (t) { var d = M.ruta(t.c); t.casco.setAttribute("d", d); t.linea.setAttribute("d", d); });
      if (M.alDibujar) M.alDibujar();
      M.marcas.forEach(function (m) {
        var pts = m.pts.map(function (p) { return [X(p[0]), Y(p[1])]; }), anc = pts[pts.length - 1];
        m.x = anc[0]; m.y = anc[1]; poner(m.g, m.x, m.y);
        pts.forEach(function (p, i) {
          var dx = (p[0] - anc[0]).toFixed(1), dy = (p[1] - anc[1]).toFixed(1);
          if (m.dots[i].tagName === "circle") { m.dots[i].setAttribute("cx", dx); m.dots[i].setAttribute("cy", dy); }
          if (m.golpes[i]) { m.golpes[i].setAttribute("cx", dx); m.golpes[i].setAttribute("cy", dy); }
        });
        m.otros = pts.slice(0, -1);
      });
      if (!enVuelo || !op.rotulosQuietos) M.rotulos();
    };

    /* rótulos sin choques */
    function chocan(a, b) { return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; }
    function cajaLado(m, lado, w, ws, alto) {
      var x = m.x, y = m.y, ww = Math.max(w, ws), conSub = !!ws, hh = conSub ? 30 : 16;
      if (lado === "der") return [x + 10, y - 11, x + 12 + ww, y - 11 + hh];
      if (lado === "izq") return [x - 12 - ww, y - 11, x - 10, y - 11 + hh];
      if (lado === "arriba") return [x - ww / 2 - 2, y - 14 - alto - (conSub ? 14 : 0), x + ww / 2 + 2, y - 9];
      return [x - ww / 2 - 2, y + 9, x + ww / 2 + 2, y + 13 + alto + (conSub ? 14 : 0)];
    }
    function ponerLado(m, lado, alto, conSub) {
      var a = lado === "der" ? "start" : lado === "izq" ? "end" : "middle";
      var x = lado === "der" ? 11 : lado === "izq" ? -11 : 0;
      var y = lado === "der" || lado === "izq" ? 4 : lado === "arriba" ? -12 - (conSub ? 14 : 0) : 10 + alto;
      m.rot.setAttribute("x", x); m.rot.setAttribute("y", y); m.rot.setAttribute("text-anchor", a);
      if (m.sub) { m.sub.setAttribute("x", x); m.sub.setAttribute("y", y + 13); m.sub.setAttribute("text-anchor", a); }
    }
    M.banda = null;
    M.rotulos = function () {
      var bd = M.banda ? M.banda() : [4, 4, M.W - 4, M.H - 4], ocupadas = [];
      var vis = M.marcas.filter(function (m) { return m.ver > 0.01; });
      vis.forEach(function (m) { ocupadas.push([m.x - 7, m.y - 7, m.x + 7, m.y + 7]); (m.otros || []).forEach(function (p) { ocupadas.push([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5]); }); });
      vis.filter(function (m) { return m.rot && m.conRot; }).sort(function (a, b) { return (b.grande ? 1 : 0) - (a.grande ? 1 : 0); }).forEach(function (m) {
        var conSub = m.sub && m.sub.style.display !== "none";
        var w = m.rot.getComputedTextLength() || m.rot.textContent.length * 8, ws = conSub ? m.sub.getComputedTextLength() : 0;
        var alto = m.grande ? 12 : 10, elegido = null, dentro = null;
        for (var i = 0; i < m.lados.length; i++) {
          var c = cajaLado(m, m.lados[i], w, ws, alto);
          if (c[0] < bd[0] || c[2] > bd[2] || c[1] < bd[1] || c[3] > bd[3]) continue;
          if (!dentro) dentro = m.lados[i];
          if (!ocupadas.some(function (o) { return chocan(c, o) && !(o[0] === m.x - 7 && o[1] === m.y - 7); })) { elegido = m.lados[i]; break; }
        }
        m.lado = elegido || dentro || m.lados[0];
        ponerLado(m, m.lado, alto, conSub);
        m.caja = cajaLado(m, m.lado, w, ws, alto);
        ocupadas.push(m.caja);
      });
      M.ocupadas = ocupadas;
      if (M.alRotular) M.alRotular(ocupadas, bd);
    };

    /* carretera que se enciende con su nombre al acercar el puntero (y, en la entrada, la linterna) */
    var lin = { x: -999, y: -999, tx: -999, ty: -999, r: 0, tr: 0, raf: 0 };
    function linterna() {
      var k = reduce ? 1 : 0.16;
      lin.x += (lin.tx - lin.x) * k; lin.y += (lin.ty - lin.y) * k; lin.r += (lin.tr - lin.r) * (reduce ? 1 : 0.12);
      M.sombra.style.setProperty("--lx", lin.x.toFixed(1) + "px");
      M.sombra.style.setProperty("--ly", lin.y.toFixed(1) + "px");
      M.sombra.style.setProperty("--lr", Math.max(1, lin.r).toFixed(1) + "px");
      if (Math.abs(lin.tx - lin.x) + Math.abs(lin.ty - lin.y) + Math.abs(lin.tr - lin.r) > 0.5) lin.raf = requestAnimationFrame(linterna);
      else lin.raf = 0;
    }
    function moverLinterna(x, y, r) {
      if (!M.sombra) return;
      if (lin.x < -900) { lin.x = x; lin.y = y; }
      lin.tx = x; lin.ty = y; lin.tr = r;
      if (!lin.raf) lin.raf = requestAnimationFrame(linterna);
    }
    function cercano(x, y, tope) {
      var mejor = null;
      M.red.forEach(function (a) {
        var p = a.pts;
        for (var k = 2; k < p.length; k += 2) {
          var x0 = p[k - 2], y0 = p[k - 1], dx = p[k] - x0, dy = p[k + 1] - y0, L = dx * dx + dy * dy;
          var t = L ? Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / L)) : 0;
          var d = Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy));
          if (d < tope && (!mejor || d < mejor.d)) mejor = { d: d, a: a };
        }
      });
      return mejor;
    }
    var encendida = null;
    function encender(x) {
      var k = x ? x.clave : null;
      if (encendida === k) return;
      if (encendida) M.porNombre[encendida].forEach(function (b) { b.luz.classList.remove("encendida"); b.casco.classList.remove("encendida"); });
      encendida = k;
      if (k) M.porNombre[k].forEach(function (b) { b.luz.classList.add("encendida"); b.casco.classList.add("encendida"); });
    }
    function etiqueta(texto, x, y, sub) {
      var e = M.etiqueta;
      e.innerHTML = esc(texto) + (sub ? "<small>" + esc(sub) + "</small>" : "");
      e.hidden = false;
      var w = e.offsetWidth, px = x + 14;
      if (px + w > M.W - 8) px = x - 14 - w;
      e.style.left = Math.max(6, px) + "px"; e.style.top = Math.max(6, y - 30) + "px";
    }
    M.limpiarPuntero = function () { encender(null); if (M.etiqueta) M.etiqueta.hidden = true; };
    M.sobreMarca = false;
    if (op.caminos) {
      var pend = null, pendRaf = 0;
      cont.addEventListener("pointermove", function (ev) {
        if (ev.pointerType !== "mouse") return;
        var b = cont.getBoundingClientRect();
        pend = [ev.clientX - b.left, ev.clientY - b.top];
        moverLinterna(pend[0], pend[1], 170);
        if (!pendRaf) pendRaf = requestAnimationFrame(function () {
          pendRaf = 0;
          if (!pend || M.sobreMarca) { encender(null); return; }
          var c = cercano(pend[0], pend[1], 12);
          encender(c ? c.a : null);
          if (c) { var t = textoCamino(c.a.a); etiqueta(t[0], pend[0], pend[1], t[1]); } else M.etiqueta.hidden = true;
        });
      });
      cont.addEventListener("pointerleave", function (ev) { if (ev.pointerType !== "mouse") return; moverLinterna(lin.tx, lin.ty, 0); M.limpiarPuntero(); });
      // Toque en teléfono: la carretera más cercana dice su nombre (y en la entrada se abre la linterna).
      cont.addEventListener("click", function (ev) {
        if (punteroFino || (ev.target.closest && ev.target.closest("g[role=link]"))) return;
        var b = cont.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top, c = cercano(x, y, 22);
        lin.x = x; lin.y = y; moverLinterna(x, y, 130);
        clearTimeout(M.tToque);
        M.tToque = setTimeout(function () { moverLinterna(x, y, 0); M.limpiarPuntero(); }, 2600);
        if (c) { encender(c.a); var t = textoCamino(c.a.a); etiqueta(t[0], x, y, t[1]); } else M.limpiarPuntero();
      });
    }
    return M;
  }
  // Crea un mapa cuando su contenedor está por entrar en pantalla.
  function alAcercarse(e, f, margen) {
    if (!("IntersectionObserver" in window)) { f(); return; }
    var io = new IntersectionObserver(function (ent) { if (ent[0].isIntersecting) { io.disconnect(); f(); } }, { rootMargin: margen || "600px 0px" });
    io.observe(e);
  }
  function alEntrar(e, f) { // una sola vez, cuando la sección ya se ve
    if (reduce || !("IntersectionObserver" in window)) { f(); return; }
    var io = new IntersectionObserver(function (ent) { if (ent[0].isIntersecting) { io.disconnect(); f(); } }, { threshold: 0.35 });
    io.observe(e);
  }

  /* ============================================================ 1. entrada */
  var heroTexto = document.querySelector(".hero-texto");
  var ME = crearMapa(document.getElementById("mapa-hero"), { detalle: true, velo: "velo", linterna: true, caminos: true, red: true, paises: true, marcasConEnlace: true });
  ME.svg.classList.add("lienzo-entrada");
  var TEXAS = unir([-106.7, merc(25.2), -93.5, merc(36.6)], MTY);
  var TEXAS_MOVIL = [-106.8, merc(25.25), -94.9, merc(33.2)];
  function anchoE() { return ME.W >= 1024; }
  function corteMovil() { return heroTexto.offsetTop + heroTexto.offsetHeight; }
  ME.banda = function () { return anchoE() ? [ME.W * 0.42, 100, ME.W - 8, ME.H - 34] : [4, corteMovil() + 6, ME.W - 4, ME.H - 34]; };
  function rectE() {
    if (anchoE()) { var x = Math.max(ME.W * 0.46, 590); return { x: x, y: 104, w: ME.W - x - 40, h: ME.H - 104 - 56 }; }
    var tb = corteMovil() + 14; return { x: 16, y: tb, w: ME.W - 32, h: Math.max(160, ME.H - tb - 72) };
  }
  function mascaraE() { // el lienzo se esconde bajo el texto: a la izquierda en escritorio, arriba en teléfono
    var m = anchoE() ? [ME.W * 0.30, ME.W * 0.40, 64, 100] : [0, 0, corteMovil() - 26, corteMovil() + 14];
    ["--ml0", "--ml1", "--mt0", "--mt1"].forEach(function (n, i) { ME.svg.style.setProperty(n, m[i].toFixed(1) + "px"); });
    ME.svg.style.setProperty("--mb0", ME.H + "px"); ME.svg.style.setProperty("--mb1", (ME.H + 1) + "px");
  }
  REGIONES.forEach(function (r) {
    r.mE = ME.marca({ pts: r.pts, cls: "m-region", texto: r.nombre, aria: r.nombre, lados: r.id === "valle" ? ["der", "abajo", "arriba", "izq"] : null });
  });
  var origenE = ME.marca({ p: MTY, cls: "m-origen actual", texto: "Monterrey", sub: "PUNTO DE PARTIDA", r: 7, lados: ["abajo", "der", "izq", "arriba"], grande: true });
  PUENTES_ENTRADA.forEach(function (id) { var m = ME.puente(id); if (m) ME.ver(m, 1, false); });
  var ROTULOS = {};
  Object.keys(ME.porNombre).forEach(function (k) { if (k.charAt(0) !== "#") { ROTULOS[k] = el("text", { "class": "rot-camino" }, ME.gRot); ROTULOS[k].textContent = k; } });
  var animando = false;
  // Rótulos de carretera: los principales que quepan sin chocar con regiones.
  ME.alRotular = function (ocupadas, bd) {
    if (animando) return;
    var tope = 4, cuantos = 0, oc = ocupadas.slice();
    var prioridad = ["I-35", "I-10", "85 / 85D", "I-45", "US-59", "I-37", "40D", "I-69E", "I-69C", "US-90", "I-20"];
    Object.keys(ROTULOS).forEach(function (n) { ROTULOS[n].style.display = "none"; });
    prioridad.forEach(function (n) {
      var t = ROTULOS[n];
      if (!t || cuantos >= tope) return;
      var mejor = null;
      ME.porNombre[n].forEach(function (a) {
        var p = a.pts, L = 0;
        for (var k = 2; k < p.length; k += 2) L += Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]);
        var mid = Math.floor(p.length / 4) * 2;
        if (L > 70 && (!mejor || L > mejor.L)) mejor = { L: L, x: p[mid], y: p[mid + 1] };
      });
      if (!mejor) return;
      var x = mejor.x + 7, y = mejor.y + 4, c = [x - 3, y - 11, x + n.length * 7 + 6, y + 4];
      if (c[0] < bd[0] || c[2] > bd[2] || c[1] < bd[1] || c[3] > bd[3]) return;
      if (oc.some(function (o) { return o[0] < c[2] && o[2] > c[0] && o[1] < c[3] && o[3] > c[1]; })) return;
      oc.push(c);
      t.setAttribute("x", x.toFixed(1)); t.setAttribute("y", y.toFixed(1));
      t.style.display = "";
      cuantos++;
    });
  };
  // Al pasar por una región se enciende su ruta desde Monterrey (y la alterna, si la hay).
  var activa = [], focoE = null;
  function encenderRutas(id) {
    if (focoE === id) return;
    while (ME.gActiva.firstChild) ME.gActiva.removeChild(ME.gActiva.firstChild);
    activa = []; focoE = id;
    ME.svg.classList.toggle("con-foco", !!id);
    REGIONES.forEach(function (r) { r.mE.g.classList.toggle("foco", r.id === id); });
    ME.red.forEach(function (x) { x.luz.classList.remove("en-foco"); });
    var rt = id && R.origenes.monterrey.rutas[id];
    if (!rt) return;
    [rt].concat(rt.alt || []).forEach(function (x, k) {
      x.aristas.forEach(function (i) { ME.red[i].luz.classList.add("en-foco"); });
      var casco = el("path", { "class": "act-casco" + (k ? " alt" : ""), pathLength: "1" }, ME.gActiva);
      var lin = el("path", { "class": "act" + (k ? " alt" : ""), pathLength: "1" }, ME.gActiva);
      activa.push({ c: linea("monterrey", x.aristas, false).c, e: [casco, lin] });
    });
    dibujarActiva();
    if (!reduce) activa.forEach(function (x, k) {
      x.e.forEach(function (p) { p.animate && p.animate([{ strokeDashoffset: 1.1 }, { strokeDashoffset: 0 }], { duration: 520, delay: k * 120, easing: "cubic-bezier(.3,.1,.3,1)", fill: "backwards" }); });
    });
  }
  function dibujarActiva() { activa.forEach(function (x) { var d = ME.ruta(x.c); x.e.forEach(function (p) { p.setAttribute("d", d); }); }); }
  ME.alDibujar = dibujarActiva;
  REGIONES.forEach(function (r) {
    var g = r.mE.g;
    g.addEventListener("pointerenter", function (ev) { if (ev.pointerType !== "mouse") return; ME.sobreMarca = true; ME.limpiarPuntero(); encenderRutas(r.id); });
    g.addEventListener("pointerleave", function (ev) { if (ev.pointerType !== "mouse") return; ME.sobreMarca = false; encenderRutas(null); });
    g.addEventListener("focus", function () { encenderRutas(r.id); });
    g.addEventListener("blur", function () { encenderRutas(null); });
    function ir(ev) { ev.preventDefault(); ev.stopPropagation(); irARegion(r.id); }
    g.addEventListener("click", ir);
    g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") ir(ev); });
  });
  // Apertura: la red se enciende desde Monterrey, cada región cuando la ruta llega y el puente parpadea al cruzar.
  function aplicarOrigenE() {
    var o = R.origenes.monterrey, enRuta = {}, dirs = {};
    o.enRuta.forEach(function (i) { enRuta[i] = true; });
    o.anim.forEach(function (x) { dirs[x[0]] = x[1]; });
    ME.red.forEach(function (x) { x.dir = dirs[x.i] || 0; x.luz.classList.toggle("ruta", !!enRuta[x.i]); x.casco.classList.toggle("ruta", !!enRuta[x.i]); });
  }
  function tiempoPuente(o, id) {
    if (o.puentes[id] != null) return o.puentes[id];
    var t = null;
    o.anim.forEach(function (x) { if (AR[x[0]].puente === id && (t === null || x[2] < t)) t = x[2]; });
    return t;
  }
  function animarE() {
    if (reduce || !ME.W) return;
    var o = R.origenes.monterrey, f = 1000;
    animando = true; ME.gRot.style.display = "none";
    function anima(e, kf, opc) { if (e.animate) e.animate(kf, opc); }
    o.anim.forEach(function (x) {
      var a = ME.red[x[0]], desde = x[1] ? -1.1 : 1.1;
      var opc = { delay: x[2] * f, duration: Math.max(40, x[3] * f), easing: "linear", fill: "backwards" };
      anima(a.luz, [{ strokeDashoffset: desde }, { strokeDashoffset: 0 }], opc);
      anima(a.casco, [{ strokeDashoffset: desde }, { strokeDashoffset: 0 }], opc);
    });
    anima(origenE.in, [{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1.3)", opacity: 1, offset: 0.7 }, { transform: "scale(1)", opacity: 1 }], { duration: 420, easing: "ease-out", fill: "backwards" });
    REGIONES.forEach(function (r) {
      var t = o.regiones[r.id];
      if (t != null) anima(r.mE.in, [{ opacity: 0, transform: "scale(.3)" }, { opacity: 1, transform: "scale(1.35)", offset: 0.55 }, { opacity: 1, transform: "scale(1)" }], { delay: t * f, duration: 420, easing: "ease-out", fill: "backwards" });
    });
    var rojo = color("--acento"), blanco = color("--tinta");
    PUENTES_ENTRADA.forEach(function (id) {
      var m = ME.puentes[id], t = tiempoPuente(o, id);
      if (!m || t == null) return;
      anima(m.in, [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1.9)", offset: 0.22 }, { opacity: 0.45, transform: "scale(1)", offset: 0.5 }, { opacity: 1, transform: "scale(1.45)", offset: 0.72 }, { opacity: 1, transform: "scale(1)" }], { delay: t * f, duration: 640, easing: "ease-out", fill: "backwards" });
      anima(m.dots[0], [{ fill: blanco }, { fill: rojo, offset: 0.2 }, { fill: rojo, offset: 0.8 }, { fill: blanco }], { delay: t * f, duration: 900, fill: "backwards" });
    });
    setTimeout(function () {
      animando = false; ME.rotulos(); ME.gRot.style.display = "";
      if (ME.gRot.animate) ME.gRot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    }, 3.45 * f);
  }
  function medirE() {
    if (!ME.medir()) return;
    ME.cam = ME.encuadre(anchoE() ? TEXAS : TEXAS_MOVIL, rectE());
    mascaraE();
    ME.render();
  }

  /* ============================================================ 2. ¿desde dónde sales? */
  var secOrigen = document.getElementById("origenes");
  var tabsOrigen = Array.prototype.slice.call(document.querySelectorAll("#selector-origen [role=tab]"));
  var MO = null, origenActivo = param("origen") && RUTAS_ORIGEN[param("origen")] ? param("origen") : "monterrey", origenListo = false;
  var RUTAS_O = {}; // trazos de cada origen, ya calculados
  Object.keys(RUTAS_ORIGEN).forEach(function (k) {
    RUTAS_O[k] = RUTAS_ORIGEN[k].map(function (d, j, todos) {
      var rt = R.origenes[k].rutas[d.r]; if (d.alt != null) rt = rt.alt[d.alt];
      var l = linea(k, rt.aristas, true);
      (d.extra || []).forEach(function (id) { if (l.puentes[0]) l.puentes.push({ id: id, f: l.puentes[0].f }); });
      l.retraso = todos.length > 1 ? 0.35 * j / (todos.length - 1) : 0;
      return l;
    });
  });
  function limitesOrigen(k) {
    var b = unir(null, [R.origenes[k].lon, R.origenes[k].y]);
    RUTAS_O[k].forEach(function (t) { b = caja(t.c, b); t.puentes.forEach(function (p) { b = unir(b, CRUCE[p.id].p); }); });
    b[3] += 0.7; // un poco del lado de Texas al que llegan
    return ampliar(b, 0.14);
  }
  function crearMO() {
    MO = crearMapa(document.getElementById("mapa-origen"), { red: true, caminos: true, rotulosPuente: true, minLado: 3.4 });
    MO.svg.classList.add("tenue");
    MO.org = {};
    Object.keys(R.origenes).forEach(function (k) {
      var o = R.origenes[k];
      MO.org[k] = MO.marca({ p: [o.lon, o.y], cls: "m-origen", texto: o.nombre, r: 7, lados: ["abajo", "der", "izq", "arriba"] });
      MO.ver(MO.org[k], 0);
    });
    MO.medir();
    MO.cam = MO.encuadre(limitesOrigen(origenActivo));
    mostrarOrigen(origenActivo, false, true);
    MO.render();
  }
  // Muestra un origen: la cámara lo encuadra, sus rutas se dibujan y lo anterior se apaga.
  function mostrarOrigen(k, animar, sinDibujo) {
    origenActivo = k;
    tabsOrigen.forEach(function (t) { var s = t.getAttribute("data-origen") === k; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; });
    cada(document.querySelectorAll(".org-frases [role=tabpanel]"), function (p) { p.hidden = p.getAttribute("data-origen") !== k; });
    cada(document.querySelectorAll(".frase.activa"), function (f) { f.classList.remove("activa"); });
    if (!MO) return;
    MO.quitarTrazos();
    Object.keys(MO.org).forEach(function (o) {
      var m = MO.org[o], es = o === k;
      m.g.classList.toggle("actual", es); m.grande = es;
      // con Saltillo, los dos rótulos se separan: Saltillo a la izquierda y Monterrey arriba
      m.lados = k === "saltillo" ? (o === "saltillo" ? ["izq", "abajo", "der", "arriba"] : ["arriba", "der", "abajo", "izq"]) : ["abajo", "der", "izq", "arriba"]; m.lado = null;
      MO.ver(m, es ? 1 : (k === "saltillo" && o === "monterrey" ? 0.85 : 0), es || (k === "saltillo" && o === "monterrey"));
    });
    RUTAS_O[k].forEach(function (t) { MO.trazo({ c: t.c, puentes: t.puentes.map(function (p) { return { id: p.id, f: p.f }; }), retraso: t.retraso }); });
    var dest = MO.encuadre(limitesOrigen(k));
    if (sinDibujo) { MO.cam = dest; return; }
    MO.volar(dest, animar ? 750 : 0, function () { MO.dibujar(animar ? 1300 : 0); });
  }
  tabsOrigen.forEach(function (t, i) {
    t.addEventListener("click", function () { if (t.getAttribute("data-origen") !== origenActivo || !origenListo) ponerOrigen(t.getAttribute("data-origen")); });
    t.addEventListener("keydown", function (ev) {
      var d = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : ev.key === "ArrowLeft" || ev.key === "ArrowUp" ? -1 : ev.key === "Home" ? -99 : ev.key === "End" ? 99 : 0;
      if (!d) return;
      ev.preventDefault();
      var n = lim(Math.abs(d) > 1 ? (d > 0 ? tabsOrigen.length - 1 : 0) : (i + d + tabsOrigen.length) % tabsOrigen.length, 0, tabsOrigen.length - 1);
      tabsOrigen[n].focus(); tabsOrigen[n].click();
    });
  });
  // Cada oración enciende su ruta y baja lo demás (puntero, foco o toque).
  cada(document.querySelectorAll(".frase"), function (f) {
    var ids = f.getAttribute("data-trazos").split(",").map(Number);
    function on() { if (!MO) return; cada(document.querySelectorAll(".frase.activa"), function (x) { if (x !== f) x.classList.remove("activa"); }); f.classList.add("activa"); MO.resaltar(ids); }
    function off() { f.classList.remove("activa"); if (MO) MO.resaltar(null); }
    f.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") on(); });
    f.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") off(); });
    f.addEventListener("focus", on);
    f.addEventListener("blur", off);
    f.addEventListener("click", function () { if (f.classList.contains("activa") && !punteroFino) off(); else on(); });
  });
  alAcercarse(secOrigen, function () {
    crearMO();
    alEntrar(document.getElementById("mapa-origen"), function () { origenListo = true; MO.dibujar(reduce ? 0 : 1400); }); // entrada de la sección: las rutas se dibujan una vez
  });

  /* ============================================================ 3. regiones */
  var secReg = document.getElementById("regiones");
  var vista = document.getElementById("reg-vista");
  var tabsReg = Array.prototype.slice.call(document.querySelectorAll("#reg-lista [role=tab]"));
  var botonesOrigenReg = Array.prototype.slice.call(document.querySelectorAll("#reg-origen button"));
  var paneles = {}; cada(vista.querySelectorAll(".reg-panel"), function (p) { paneles[p.getAttribute("data-region")] = p; });
  var ORDEN = tabsReg.map(function (t) { return t.getAttribute("data-region"); });
  var regionActiva = param("region") && paneles[param("region")] ? param("region") : ORDEN[0], regionPrevia = null, regListo = false;
  var contadas = {}, MINI = {};
  function movil() { return window.innerWidth < 1024; }
  // Cifras: cuentan hasta su valor una sola vez por región.
  ORDEN.forEach(function (id) {
    var l = paneles[id].querySelector(".linea");
    if (!l || reduce) return;
    l.innerHTML = esc(l.textContent).replace(/(\d+(?:[.,]\d+)*)/g, function (m, _g, i, todo) {
      if (/^(19|20)\d\d$/.test(m) || /[-‑A-Za-z]/.test(todo.charAt(i - 1) || "")) return m; // años y nombres de carretera no cuentan
      return '<span class="cifra" data-v="' + m + '">' + m + "</span>";
    });
  });
  function contar(id) {
    if (contadas[id] || reduce) return; contadas[id] = true;
    cada(paneles[id].querySelectorAll(".cifra"), function (s) {
      var txt = s.getAttribute("data-v"), dec = /\.(\d+)$/.exec(txt), coma = txt.indexOf(",") >= 0;
      var v = parseFloat(txt.replace(/,/g, "")), nd = dec ? dec[1].length : 0, t0 = performance.now();
      s.style.minWidth = s.offsetWidth + "px";
      (function f(ahora) {
        var t = Math.min(1, (ahora - t0) / 1100), k = 1 - Math.pow(1 - t, 3), n = (v * k).toFixed(nd);
        if (coma) n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        s.textContent = t < 1 ? n : txt;
        if (t < 1) requestAnimationFrame(f);
      })(t0);
    });
  }

  // Rutas de la red hacia una región desde un origen: hasta tres, con puentes distintos, de la más corta a la más larga.
  function nb(t) { return t.replace(/\b(I|US|SH)-/g, "$1‑"); } // los nombres de carretera no se parten
  function enLista(xs) {
    if (xs.length < 2) return xs.join("");
    var ult = xs[xs.length - 1];
    return xs.slice(0, -1).join(", ") + (/^I/.test(ult) ? " e " : " y ") + ult;
  }
  function rutasDe(origen, region) {
    var rt = R.origenes[origen].rutas[region];
    if (!rt) return [];
    var vistos = {}, out = [];
    [rt].concat(rt.alt || []).sort(function (a, b) { return a.km - b.km; }).forEach(function (x) {
      var pte = null; x.pasos.forEach(function (p) { if (p.t === "puente" && !pte) pte = p.puente || p.n; });
      if (vistos[pte] || out.length >= 3) return;
      vistos[pte] = true;
      var l = linea(origen, x.aristas, false), parcial = false;
      var nombres = x.pasos.map(function (p) {
        if (p.t === "puente") { if (CRUCE[p.puente] && CRUCE[p.puente].parcial) parcial = true; return p.n || "Cruce a Texas"; }
        if (p.n === "La Gloria-Colombia" && LA_GLORIA && LA_GLORIA.estado !== "verificado") parcial = true;
        return nombreCamino(p.n, p.pais);
      });
      var pasando = Object.keys(R.origenes).filter(function (k) {
        if (k === origen) return false;
        var o = R.origenes[k];
        return l.c.some(function (c) { return Math.abs(c[0] - o.lon) < 0.22 && Math.abs(c[1] - o.y) < 0.22; });
      }).map(function (k) { return R.origenes[k].nombre; });
      out.push({ c: l.c, puentes: l.puentes, texto: nb(enLista(nombres)), pasando: pasando, parcial: parcial });
    });
    return out;
  }
  function escribirRutas(id) {
    var ul = paneles[id].querySelector(".rutas"), lista = rutasDe(origenActivo, id);
    paneles[id].querySelector(".o-nombre").textContent = R.origenes[origenActivo].nombre;
    ul.classList.remove("abierta");
    var ver = paneles[id].querySelector(".ver-otra");
    if (lista.length > 1 && !ver) {
      ver = h("button", "ver-otra", null, "Ver otra ruta"); ver.type = "button"; ul.parentNode.insertBefore(ver, ul.nextSibling);
      ver.addEventListener("click", function () { var a = !ul.classList.contains("abierta"); ul.classList.toggle("abierta", a); ver.setAttribute("aria-expanded", a ? "true" : "false"); });
    }
    if (ver) { ver.hidden = lista.length < 2; ver.setAttribute("aria-expanded", "false"); }
    ul.innerHTML = lista.map(function (x, i) {
      return '<li' + (i ? ' class="alterna"' : "") + '><button type="button" class="ruta" data-i="' + i + '">' + esc(x.texto) +
        (x.pasando.length ? '<span class="pasando">, pasando por ' + esc(enLista(x.pasando)) + "</span>" : "") +
        (x.parcial ? ' <span class="por-confirmar">por confirmar</span>' : "") + "</button></li>";
    }).join("");
    cada(ul.querySelectorAll(".ruta"), function (b) {
      var i = +b.getAttribute("data-i");
      function on() { cada(ul.querySelectorAll(".ruta.activa"), function (x) { x.classList.remove("activa"); }); b.classList.add("activa"); if (MINI[id]) MINI[id].resaltar([i]); }
      function off() { b.classList.remove("activa"); if (MINI[id]) MINI[id].resaltar(null); }
      b.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") on(); });
      b.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") off(); });
      b.addEventListener("focus", on); b.addEventListener("blur", off);
      b.addEventListener("click", function () { if (b.classList.contains("activa") && !punteroFino) off(); else on(); });
    });
    return lista;
  }
  // Mapa chico de cada región: satélite, límites, origen, puentes y las rutas (la primera en acento, las alternas en blanco).
  function crearMini(id) {
    if (MINI[id]) return MINI[id];
    var r = RPOR[id];
    var M = crearMapa(paneles[id].querySelector(".mini"), { minLado: 2.2 });
    M.org = {};
    Object.keys(R.origenes).forEach(function (k) { var o = R.origenes[k]; M.org[k] = M.marca({ p: [o.lon, o.y], cls: "m-origen", texto: o.nombre, r: 5, lados: ["abajo", "izq", "der", "arriba"] }); M.ver(M.org[k], 0); });
    M.marca({ pts: r.pts, cls: "m-region foco", texto: r.nombre, grande: true });
    MINI[id] = M;
    return M;
  }
  function pintarMini(id, dibujar) {
    var M = crearMini(id), lista = escribirRutas(id), o = R.origenes[origenActivo];
    M.quitarTrazos();
    Object.keys(M.org).forEach(function (k) { M.ver(M.org[k], k === origenActivo ? 1 : 0); });
    var b = caja(RPOR[id].pts, unir(null, [o.lon, o.y]));
    lista.slice().reverse().forEach(function (x, j) {
      var i = lista.length - 1 - j;
      M.trazo({ c: x.c, puentes: x.puentes.map(function (p) { return { id: p.id, f: p.f }; }), alt: i > 0, retraso: i * 0.15 });
      b = caja(x.c, b);
    });
    M.trazos.reverse(); // índice 0 = la ruta más corta (dibujada encima)
    M.bbox = ampliar(b, 0.1);
    if (!M.medir()) return;
    M.cam = M.encuadre(M.bbox);
    M.render();
    M.dibujar(dibujar ? (reduce ? 0 : 1100) : 0);
  }
  function barrido(id) { // la foto entra con un barrido corto en la dirección del viaje
    var img = paneles[id].querySelector("figure img");
    if (reduce || !img.animate) return;
    var a = regionPrevia ? RPOR[regionPrevia].pts.slice(-1)[0] : MTY, b = RPOR[id].pts.slice(-1)[0];
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var desde = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)") : (dy > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)");
    img.animate([{ clipPath: desde }, { clipPath: "inset(0 0 0 0)" }], { duration: 650, easing: "cubic-bezier(.6,0,.2,1)" });
  }
  var desdeCarrusel = false;
  function elegirRegion(id, animar, moverCarrusel) {
    if (!paneles[id]) return;
    if (id !== regionActiva) regionPrevia = regionActiva;
    regionActiva = id;
    tabsReg.forEach(function (t) { var s = t.getAttribute("data-region") === id; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; if (s && movil()) { var fila = t.parentNode; fila.scrollTo({ left: t.offsetLeft - fila.offsetLeft - (fila.clientWidth - t.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" }); } }); // sólo en horizontal: no mueve la página
    ORDEN.forEach(function (k) { paneles[k].classList.toggle("activa", k === id); });
    if (!regListo) { escribirRutas(id); return; }
    if (moverCarrusel && movil()) { desdeCarrusel = true; vista.scrollTo({ left: paneles[id].offsetLeft - vista.offsetLeft - parseFloat(getComputedStyle(vista).paddingLeft || 0), behavior: reduce ? "auto" : "smooth" }); setTimeout(function () { desdeCarrusel = false; }, 700); }
    if (animar && !movil()) barrido(id);
    pintarMini(id, animar);
    contar(id);
  }
  tabsReg.forEach(function (t, i) {
    t.addEventListener("click", function () { elegirRegion(t.getAttribute("data-region"), true, true); });
    t.addEventListener("keydown", function (ev) {
      var d = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : ev.key === "ArrowLeft" || ev.key === "ArrowUp" ? -1 : ev.key === "Home" ? -99 : ev.key === "End" ? 99 : 0;
      if (!d) return;
      ev.preventDefault();
      var n = Math.abs(d) > 1 ? (d > 0 ? tabsReg.length - 1 : 0) : (i + d + tabsReg.length) % tabsReg.length;
      tabsReg[n].focus(); tabsReg[n].click();
    });
  });
  botonesOrigenReg.forEach(function (b) { b.addEventListener("click", function () { ponerOrigen(b.getAttribute("data-origen")); }); });
  // Un solo origen para las dos secciones: cambiar uno cambia el otro.
  function ponerOrigen(k) {
    if (!R.origenes[k]) return;
    origenListo = true;
    var cambio = k !== origenActivo;
    mostrarOrigen(k, cambio || !MO);
    botonesOrigenReg.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-origen") === k ? "true" : "false"); });
    ORDEN.forEach(function (id) {
      if (MINI[id] && (id === regionActiva || movil()) && regListo) pintarMini(id, id === regionActiva);
      else escribirRutas(id);
    });
  }
  // Teléfono: al deslizar el carrusel cambia el nombre activo.
  var tDesliz;
  vista.addEventListener("scroll", function () {
    if (!movil() || desdeCarrusel) return;
    clearTimeout(tDesliz);
    tDesliz = setTimeout(function () {
      var b = vista.getBoundingClientRect(), mejor = null;
      ORDEN.forEach(function (k) { var d = Math.abs(paneles[k].getBoundingClientRect().left - b.left - 20); if (!mejor || d < mejor.d) mejor = { d: d, k: k }; });
      if (mejor && mejor.k !== regionActiva) elegirRegion(mejor.k, true, false);
    }, 90);
  }, { passive: true });
  ORDEN.forEach(escribirRutas);
  botonesOrigenReg.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-origen") === origenActivo ? "true" : "false"); });
  alAcercarse(secReg, function () {
    if (movil()) ORDEN.forEach(function (k) { crearMini(k); });
    alEntrar(vista, function () { regListo = true; var id = regionActiva; regionActiva = null; regionPrevia = null; elegirRegion(id, true, id !== ORDEN[0]); if (movil()) ORDEN.forEach(function (k) { if (k !== id) pintarMini(k, false); }); });
  });
  function irARegion(id) {
    elegirRegion(id, regListo, true);
    secReg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    var t = tabsReg.filter(function (x) { return x.getAttribute("data-region") === id; })[0];
    if (t) t.focus({ preventScroll: true });
  }

  // Selector de pestañas genérico: clic y flechas, con foco que sigue.
  function pestanas(lista, alElegir) {
    lista.forEach(function (t, i) {
      t.addEventListener("click", function () {
        lista.forEach(function (x) { var s = x === t; x.setAttribute("aria-selected", s ? "true" : "false"); x.tabIndex = s ? 0 : -1; });
        var panel = document.getElementById(t.getAttribute("aria-controls")); if (panel) panel.setAttribute("aria-labelledby", t.id);
        alElegir(t);
      });
      t.addEventListener("keydown", function (ev) {
        var d = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : ev.key === "ArrowLeft" || ev.key === "ArrowUp" ? -1 : ev.key === "Home" ? -99 : ev.key === "End" ? 99 : 0;
        if (!d) return;
        ev.preventDefault();
        var n = Math.abs(d) > 1 ? (d > 0 ? lista.length - 1 : 0) : (i + d + lista.length) % lista.length;
        lista[n].focus(); lista[n].click();
      });
    });
  }
  var CONFIRMAR = ' <span class="por-confirmar">por confirmar</span>';
  // Fuente corta: editor y año como enlace; el detalle completo va en el title.
  var CORTOS = [["U.S. Customs and Border Protection", "CBP"], ["Texas Department of Transportation", "TxDOT"], ["Cameron County", "Condado de Cameron"],
    ["Texas Comptroller", "Texas Comptroller"], ["Board of Governors of the Federal Reserve", "Reserva Federal"], ["Oficina del Gobernador", "Gobernador de Texas"],
    ["Brownsville Community Improvement", "BCIC"], ["Toyota", "Toyota"], ["Arca Continental", "Arca Continental"], ["Vitro", "Vitro"], ["CEMEX", "Cemex"],
    ["GRUMA", "Gruma"], ["U.S. Census Bureau", "Census y Natural Earth"], ["Bimbo", "Bimbo Bakeries USA"], ["Grupo Bafar", "Grupo Bafar"]];
  function nombreCorto(ed) {
    for (var i = 0; i < CORTOS.length; i++) if (ed.indexOf(CORTOS[i][0]) === 0) return CORTOS[i][1];
    return ed.split(" (")[0].split(",")[0];
  }
  function enlaceFuente(f, texto) {
    if (!f || !f.editor) return esc(texto);
    var full = f.editor + (f.fecha ? ", " + f.fecha : "");
    return f.url ? '<a href="' + esc(f.url) + '" title="' + esc(full) + '">' + esc(texto) + "</a>" : '<span title="' + esc(full) + '">' + esc(texto) + "</span>";
  }
  function fuenteCorta(f) {
    if (!f || !f.editor) return "";
    var y = /^(\d{4})/.exec(f.fecha || "");
    return '<span class="fuente-corta">' + enlaceFuente(f, nombreCorto(f.editor) + (y ? ", " + y[1] : "")) + "</span>";
  }

  /* ============================================================ 4. ¿qué necesitas resolver? (textos de la v1) */
  var CATEGORIAS = {
    tierra: {
      regiones: {
        laredo: "Port Laredo recibió 3,026,632 camiones en 2024 y concentró el 62% del comercio de los puertos terrestres de Texas.",
        valle: "Por el puerto de Hidalgo entraron 721,489 camiones en 2024.",
        "el-paso": "Por el puerto de Ysleta pasaron 670,627 camiones en 2024."
      },
      fuente: "Texas Comptroller of Public Accounts, páginas de puertos de entrada, datos 2024. Consulta 9-nov-2026."
    },
    mar: {
      regiones: {
        houston: "Port Houston movió 223.5 mil millones de dólares en 2024, el 52% del comercio de los puertos marítimos de Texas.",
        valle: "El puerto marítimo de Brownsville movió 22.7 mil millones de dólares en 2024. México fue su principal destino de exportación."
      },
      fuente: "Texas Comptroller of Public Accounts, páginas de Port Houston y Port of Brownsville, datos 2024. Consulta 9-nov-2026."
    },
    aire: {
      regiones: {
        dfw: "El aeropuerto DFW concentró el 72.1% del comercio de aeropuertos e instalaciones intermodales de Texas en 2024. AllianceTexas es la otra instalación intermodal del estado.",
        "san-antonio": "Port San Antonio es una de las dos instalaciones de logística intermodal de Texas, con pista y acceso a ferrocarril.",
        austin: "El aeropuerto Austin-Bergstrom movió 254 millones de libras de carga de enero a noviembre de 2025."
      },
      fuente: "Texas Comptroller of Public Accounts (DFW, AllianceTexas y Port San Antonio, datos 2024) y aeropuerto Austin-Bergstrom (ene-nov 2025). Consulta 9-nov-2026."
    }
  };
  var tabsNec = Array.prototype.slice.call(document.querySelectorAll("#selector-nec [role=tab]"));
  var panelNec = document.getElementById("panel-nec"), MN = null, necActual = param("necesidad") && CATEGORIAS[param("necesidad")] ? param("necesidad") : "tierra";
  function elegirNec(k, entrada) {
    necActual = k;
    var cat = CATEGORIAS[k];
    tabsNec.forEach(function (t) { var s = t.getAttribute("data-cat") === k; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; if (s) panelNec.setAttribute("aria-labelledby", t.id); });
    panelNec.innerHTML = "<ol>" + ORDEN.filter(function (id) { return cat.regiones[id]; }).map(function (id) {
      return '<li><button type="button" class="nec-fila" data-region="' + id + '"><b>' + esc(RPOR[id].nombre) + "</b>" + esc(cat.regiones[id]) + "</button></li>";
    }).join("") + '</ol><p class="fuente">' + esc(cat.fuente) + "</p>";
    cada(panelNec.querySelectorAll(".nec-fila"), function (b) { b.addEventListener("click", function () { irARegion(b.getAttribute("data-region")); }); });
    if (!MN) return;
    var n = 0;
    REGIONES.forEach(function (r) {
      var si = !!cat.regiones[r.id];
      r.mN.g.classList.toggle("apagada", !si); r.mN.g.classList.toggle("foco", si);
      MN.ver(r.mN, 1, si);
      if (si && !reduce && r.mN.in.animate) r.mN.in.animate([{ transform: "scale(.2)", opacity: 0 }, { transform: "scale(1.5)", opacity: 1, offset: 0.6 }, { transform: "scale(1)", opacity: 1 }], { duration: 420, delay: (entrada ? 380 : 90) * n++, easing: "ease-out", fill: "backwards" });
    });
    MN.rotulos();
  }
  pestanas(tabsNec, function (t) { elegirNec(t.getAttribute("data-cat")); });
  elegirNec(necActual);
  alAcercarse(document.getElementById("necesidad"), function () {
    MN = crearMapa(document.getElementById("mapa-nec"), { minLado: 0 });
    REGIONES.forEach(function (r) { r.mN = MN.marca({ pts: r.pts, cls: "m-region", texto: r.nombre, lados: r.id === "valle" ? ["der", "abajo", "arriba", "izq"] : null }); r.mN.g.addEventListener("click", function () { irARegion(r.id); }); });
    MN.medir();
    MN.cam = MN.encuadre(ampliar([-106.7, merc(25.4), -94.9, merc(33.2)], 0.04));
    MN.render();
    REGIONES.forEach(function (r) { r.mN.g.classList.add("apagada"); MN.ver(r.mN, 1, false); });
    alEntrar(document.getElementById("mapa-nec"), function () { elegirNec(necActual, true); }); // entrada: sus regiones se encienden una tras otra
  });

  /* ============================================================ 5. puentes de carga */
  function estadoDe(c) { var m = /,\s*([^,(]+?)\s*(\(|$)/.exec(c.lado_mx || ""); return m ? m[1].trim() : ""; }
  function ladoMx(c) { return esc((c.lado_mx || "").replace(/\s*\(.*no verificado.*\)/, "")) + (/no verificado/.test(c.lado_mx || "") ? " (municipio" + CONFIRMAR + ")" : ""); }
  var CRUCES_O = C.cruces.slice().sort(function (a, b) { return a.p[0] - b.p[0]; }); // de oeste a este
  var tabsEst = Array.prototype.slice.call(document.querySelectorAll("#selector-estado [role=tab]"));
  var panelPtes = document.getElementById("panel-puentes"), MP = null, estadoActual = param("estado") || tabsEst[0].getAttribute("data-estado");
  var contador = document.getElementById("contador-puentes");
  function marcarPuente(id, desdeMapa) {
    cada(panelPtes.querySelectorAll(".pte"), function (li) { li.classList.toggle("activa", li.getAttribute("data-id") === id); });
    if (MP) Object.keys(MP.pts).forEach(function (k) { MP.pts[k].g.classList.toggle("marcado", k === id); });
    if (desdeMapa) { var li = panelPtes.querySelector('.pte[data-id="' + id + '"]'); if (li) li.focus({ preventScroll: true }); }
  }
  function elegirEstado(e) {
    estadoActual = e;
    tabsEst.forEach(function (t) { var s = t.getAttribute("data-estado") === e; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; if (s) panelPtes.setAttribute("aria-labelledby", t.id); });
    panelPtes.innerHTML = "<ul>" + CRUCES_O.filter(function (c) { return estadoDe(c) === e; }).map(function (c) {
      return '<li class="pte" tabindex="0" data-id="' + c.id + '"><b>' + esc(c.nombre) + "</b><i lang=\"en\">" + esc(c.nombre_en) + "</i><br>" + ladoMx(c) + " y " + esc(c.lado_tx) +
        "<br>Carga " + (c.carga === "sí" && !c.parcial ? "sí" : CONFIRMAR) + "<br>" + fuenteCorta(c.fuente) + "</li>";
    }).join("") + "</ul>";
    cada(panelPtes.querySelectorAll(".pte"), function (li) {
      var id = li.getAttribute("data-id");
      li.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") marcarPuente(id); });
      li.addEventListener("focus", function () { marcarPuente(id); });
      li.addEventListener("click", function (ev) { if (!ev.target.closest("a")) marcarPuente(id); });
    });
    if (MP) Object.keys(MP.pts).forEach(function (k) { var si = estadoDe(CRUCE[k]) === e; MP.pts[k].g.classList.toggle("elegido", si); MP.pts[k].g.classList.toggle("apagado", !si); MP.pts[k].g.setAttribute("tabindex", "-1"); }); // con teclado se usan los renglones
  }
  pestanas(tabsEst, function (t) { elegirEstado(t.getAttribute("data-estado")); });
  tabsEst.forEach(function (t) { var s = t.getAttribute("data-estado") === estadoActual; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; });
  elegirEstado(estadoActual);
  alAcercarse(document.getElementById("puentes"), function () {
    MP = crearMapa(document.getElementById("mapa-puentes"), {});
    MP.pts = {};
    var b = null;
    CRUCES_O.forEach(function (c) {
      var m = MP.marca({ p: c.p, cls: "m-puente" + (c.parcial ? " parcial" : ""), rombo: true, aria: c.nombre });
      m.g.addEventListener("click", function () { if (estadoDe(c) !== estadoActual) { var t = tabsEst.filter(function (x) { return x.getAttribute("data-estado") === estadoDe(c); })[0]; if (t) t.click(); } marcarPuente(c.id, true); });
      m.g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); marcarPuente(c.id, true); } });
      MP.pts[c.id] = m; b = unir(b, c.p);
    });
    MP.medir();
    MP.cam = MP.encuadre(ampliar(b, 0.06), { x: 20, y: 46, w: MP.W - 40, h: MP.H - 66 });
    MP.render();
    elegirEstado(estadoActual);
    var pts = CRUCES_O.map(function (c) { return MP.pts[c.id]; });
    if (reduce) { contador.textContent = pts.length; return; }
    pts.forEach(function (m) { MP.ver(m, 0); });
    contador.textContent = "0";
    alEntrar(document.getElementById("mapa-puentes"), function () { // entrada: los puntos se encienden de oeste a este, con contador
      pts.forEach(function (m, i) {
        setTimeout(function () {
          MP.ver(m, 1, false); contador.textContent = i + 1;
          if (m.in.animate) m.in.animate([{ transform: "scale(.2)" }, { transform: "scale(1.8)", offset: 0.5 }, { transform: "scale(1)" }], { duration: 380, easing: "ease-out" });
        }, 120 * i);
      });
    });
  });

  /* ============================================================ 6. empresas */
  var tabsEmp = Array.prototype.slice.call(document.querySelectorAll("#selector-emp [role=tab]"));
  var panelEmp = document.getElementById("panel-emp"), ME2 = null, capaEmp = param("empresas") === "anclas" ? "anclas" : "mexicanas", empEntrada = false;
  function tarjetaEmp(e, i) {
    var donde = esc(e.ciudad) + (e.desde ? ", desde " + esc(e.desde) : "") + (capaEmp === "mexicanas" && e.sede_mapa ? ", sale de " + esc(e.sede_mapa) : "");
    return '<li><div class="emp-t" tabindex="0" data-i="' + i + '"><b>' + esc(e.empresa) + (e.parcial ? CONFIRMAR : "") + '</b><span class="donde">' + donde + "</span>" + esc(e.que) +
      '<span class="fuente-e">' + fuenteCorta(e.fuente) + "</span></div></li>";
  }
  function resaltarEmp(i) {
    cada(panelEmp.querySelectorAll(".emp-t"), function (t) { t.classList.toggle("activa", +t.getAttribute("data-i") === i); });
    if (!ME2) return;
    ME2.items.forEach(function (x, k) {
      if (x.arco) { x.arco.classList.toggle("resaltado", k === i); x.arco.classList.toggle("bajo", i != null && k !== i); }
      if (x.m) x.m.g.classList.toggle("resaltado", k === i);
    });
  }
  function datosEmp() { return capaEmp === "mexicanas" ? C.mexicanas : C.anclas; }
  function elegirEmp(capa, entrada) {
    capaEmp = capa;
    var lista = datosEmp();
    tabsEmp.forEach(function (t) { var s = t.getAttribute("data-capa") === capa; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; if (s) panelEmp.setAttribute("aria-labelledby", t.id); });
    panelEmp.innerHTML = lista.map(tarjetaEmp).join("");
    cada(panelEmp.querySelectorAll(".emp-t"), function (t) {
      var i = +t.getAttribute("data-i");
      t.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") resaltarEmp(i); });
      t.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") resaltarEmp(null); });
      t.addEventListener("focus", function () { resaltarEmp(i); });
      t.addEventListener("click", function () { resaltarEmp(i); });
    });
    if (ME2) dibujarEmp(entrada);
  }
  function dibujarEmp(entrada) {
    var M = ME2, lista = datosEmp();
    while (M.gExtra.firstChild) M.gExtra.removeChild(M.gExtra.firstChild);
    M.items.forEach(function (x) { if (x.m) x.m.g.remove(); });
    M.marcas = M.marcas.filter(function (m) { return m.fija; });
    M.items = [];
    var porDestino = {}, b = null;
    lista.forEach(function (e, i) {
      var x = { e: e }, k = e.p.join(",");
      b = unir(b, e.p);
      if (capaEmp === "mexicanas" && e.s) {
        b = unir(b, e.s);
        porDestino[k] = (porDestino[k] || 0) + 1;
        x.curva = (0.14 + 0.06 * (i % 3)) * (porDestino[k] % 2 ? 1 : -1);
        x.golpe = el("path", { "class": "arco-golpe" }, M.gExtra);
        x.arco = el("path", { "class": "arco", pathLength: "1" }, M.gExtra);
        [x.arco, x.golpe].forEach(function (p) {
          p.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") resaltarEmp(i); });
          p.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") resaltarEmp(null); });
          p.addEventListener("click", function () { resaltarEmp(i); var t = panelEmp.querySelector('.emp-t[data-i="' + i + '"]'); if (t) t.focus({ preventScroll: true }); });
        });
      }
      x.m = M.marca({ p: e.p, cls: "m-emp", aria: e.empresa, r: 4.5, texto: capaEmp === "anclas" ? e.ciudad : null }); // en anclas, el punto lleva su ciudad
      x.m.g.setAttribute("tabindex", "-1");
      x.m.g.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") resaltarEmp(i); });
      x.m.g.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") resaltarEmp(null); });
      x.m.g.addEventListener("click", function () { resaltarEmp(i); var t = panelEmp.querySelector('.emp-t[data-i="' + i + '"]'); if (t) t.focus({ preventScroll: true }); });
      M.items.push(x);
    });
    Object.keys(M.sedes).forEach(function (k) { M.ver(M.sedes[k], capaEmp === "mexicanas" ? 1 : 0); if (capaEmp === "mexicanas") b = unir(b, M.sedes[k].pts[0]); });
    M.medir();
    M.cam = M.encuadre(ampliar(b, 0.08));
    M.render();
    if (!entrada || reduce) return;
    // entrada: los arcos salen uno tras otro y cada tarjeta aparece cuando llega el suyo
    var tarjetas = panelEmp.querySelectorAll(".emp-t");
    M.items.forEach(function (x, i) {
      var t = tarjetas[i]; t.classList.add("espera");
      x.m.g.style.opacity = 0;
      var retraso = 260 * i;
      if (x.arco && x.arco.animate) x.arco.animate([{ strokeDasharray: "1 1.2", strokeDashoffset: 1.1 }, { strokeDasharray: "1 1.2", strokeDashoffset: 0 }], { duration: 700, delay: retraso, easing: "cubic-bezier(.4,.1,.3,1)", fill: "backwards" });
      setTimeout(function () { t.classList.remove("espera"); x.m.g.style.opacity = ""; }, retraso + (x.arco ? 650 : 0));
    });
  }
  pestanas(tabsEmp, function (t) { elegirEmp(t.getAttribute("data-capa"), false); });
  elegirEmp(capaEmp, false);
  alAcercarse(document.getElementById("empresas"), function () {
    ME2 = crearMapa(document.getElementById("mapa-emp"), {});
    ME2.items = []; ME2.sedes = {};
    C.mexicanas.forEach(function (e) {
      if (!e.s || ME2.sedes[e.sede_mapa]) return;
      var m = ME2.marca({ p: e.s, cls: "m-origen", texto: e.sede_mapa, r: 4.5, lados: ["izq", "abajo", "der", "arriba"] });
      m.fija = true; ME2.sedes[e.sede_mapa] = m;
    });
    ME2.alDibujar = function () {
      ME2.items.forEach(function (x) {
        if (!x.arco) return;
        var x0 = ME2.X(x.e.s[0]), y0 = ME2.Y(x.e.s[1]), x1 = ME2.X(x.e.p[0]), y1 = ME2.Y(x.e.p[1]);
        var cx = (x0 + x1) / 2 - (y1 - y0) * x.curva, cy = (y0 + y1) / 2 + (x1 - x0) * x.curva;
        var d = "M" + x0.toFixed(1) + " " + y0.toFixed(1) + "Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + x1.toFixed(1) + " " + y1.toFixed(1);
        x.arco.setAttribute("d", d); x.golpe.setAttribute("d", d);
      });
    };
    ME2.medir();
    dibujarEmp(false);
    if (!reduce) cada(panelEmp.querySelectorAll(".emp-t"), function (t) { t.classList.add("espera"); });
    if (!reduce) ME2.items.forEach(function (x) { x.m.g.style.opacity = 0; if (x.arco) x.arco.style.opacity = 0; });
    alEntrar(document.getElementById("mapa-emp"), function () { ME2.items.forEach(function (x) { if (x.arco) x.arco.style.opacity = ""; }); dibujarEmp(true); });
  });

  /* ============================================================ cifras: cuentan una sola vez al entrar */
  (function () {
    var cs = document.querySelectorAll("#cifras .cifra-v");
    if (reduce || !cs.length) return;
    function correr() {
      cada(cs, function (s) {
        var txt = s.getAttribute("data-v"), dec = /\.(\d+)$/.exec(txt), v = parseFloat(txt), nd = dec ? dec[1].length : 0, t0 = performance.now();
        s.style.minWidth = s.offsetWidth + "px";
        (function f(ahora) {
          var t = Math.min(1, (ahora - t0) / 1200), k = 1 - Math.pow(1 - t, 3);
          s.textContent = t < 1 ? (v * k).toFixed(nd) : txt;
          if (t < 1) requestAnimationFrame(f);
        })(t0);
      });
    }
    cada(cs, function (s) { s.textContent = (0).toFixed((/\.(\d+)$/.exec(s.getAttribute("data-v")) || ["", ""])[1].length); });
    alEntrar(document.getElementById("cifras"), correr);
  })();

  /* ============================================================ compara regiones */
  var COMERCIO = { // cifra, qué mide y por dónde, con su fuente (contenido/regiones/EVIDENCIA.md, fila 2)
    laredo: { c: "339.7 mil millones de dólares", mide: "por su cruce terrestre", por: "Puerto de Laredo", f: { editor: "Texas Comptroller of Public Accounts, puerto de Laredo", url: "https://comptroller.texas.gov/economy/economic-data/ports/2024/laredo.php", fecha: "2024" } },
    valle: { c: "46.4 mil millones de dólares", mide: "por su cruce terrestre", por: "Puerto de Hidalgo", f: { editor: "Texas Comptroller of Public Accounts, puerto de Hidalgo", url: "https://comptroller.texas.gov/economy/economic-data/ports/2024/hidalgo.php", fecha: "2024" } },
    "san-antonio": { c: "1.28 mil millones de dólares", mide: "por Port San Antonio, instalación de logística intermodal", por: "Port San Antonio", f: { editor: "Texas Comptroller of Public Accounts, Port San Antonio", url: "https://comptroller.texas.gov/economy/economic-data/ports/2024/port-san-antonio.php", fecha: "2024" } },
    austin: null,
    dfw: { c: "62.6 mil millones de dólares", mide: "por su aeropuerto", por: "Aeropuerto DFW", f: { editor: "Texas Comptroller of Public Accounts, aeropuerto DFW", url: "https://comptroller.texas.gov/economy/economic-data/ports/2024/dfw.php", fecha: "2024" } },
    houston: { c: "223.5 mil millones de dólares", mide: "por su puerto marítimo", por: "Port Houston", f: { editor: "Texas Comptroller of Public Accounts, Port Houston", url: "https://comptroller.texas.gov/economy/economic-data/ports/2024/houston.php", fecha: "2024" } },
    "el-paso": { c: "86.8 mil millones de dólares", mide: "por su cruce terrestre", por: "Puerto de Ysleta", f: { editor: "Texas Comptroller of Public Accounts, puerto de Ysleta", url: "https://comptroller.texas.gov/economy/economic-data/ports/2024/ysleta.php", fecha: "2024" } }
  };
  var TIGER = { editor: "U.S. Census Bureau, TIGER/Line 2025 y TIGERweb (carreteras de Texas); Natural Earth 10m roads (I-35W y las de México). Ver assets/SATELITE-FUENTE.txt", url: "https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html", fecha: "2025-2026" };
  // Carreteras principales de cada región según la red: las de Texas con más tramo cerca de sus ciudades.
  function carreterasDe(id) {
    var pts = RPOR[id].pts, suma = {};
    AR.forEach(function (a) {
      if (a.pais !== "TX" || !a.n || a.f === "conector") return;
      for (var k = 1; k < a.c.length; k++) {
        var p = a.c[k], q2 = a.c[k - 1];
        if (pts.some(function (c) { return Math.abs(c[0] - p[0]) < 0.7 && Math.abs(c[1] - p[1]) < 0.7; })) suma[a.n] = (suma[a.n] || 0) + Math.hypot(p[0] - q2[0], p[1] - q2[1]);
      }
    });
    return Object.keys(suma).sort(function (a, b) { return suma[b] - suma[a]; }).slice(0, 3);
  }
  var ACUDIR = {};
  cada(document.querySelectorAll(".acu-lista li"), function (li) {
    var b = li.querySelector("[data-region]");
    if (b) ACUDIR[b.getAttribute("data-region")] = Array.prototype.slice.call(li.querySelectorAll("a"));
  });
  var fichas = document.getElementById("fichas"), tablaC = document.getElementById("tabla-compara");
  var elegidas = ["laredo", "dfw"], nuevas = {};
  function topeC() { return movil() ? 2 : 3; }
  ORDEN.forEach(function (id) {
    var b = h("button", "ficha", fichas, RPOR[id].nombre);
    b.type = "button"; b.setAttribute("data-region", id);
    b.addEventListener("click", function () {
      var i = elegidas.indexOf(id);
      if (i >= 0) { if (elegidas.length > 1) elegidas.splice(i, 1); }
      else { elegidas.push(id); nuevas[id] = true; while (elegidas.length > topeC()) elegidas.shift(); } // al pasar el tope sale la más antigua
      pintarCompara();
    });
  });
  function celdas(id) {
    var co = COMERCIO[id], r = [];
    r.push(co ? '<b>' + esc(co.c) + "</b> " + esc(co.mide) + "<br>" + fuenteCorta(co.f) : "sin dato");
    r.push(co ? esc(co.por) + "<br>" + fuenteCorta(co.f) : "sin dato");
    var ptes = C.cruces.filter(function (c) { return c.region === id && c.carga === "sí" && !c.parcial; });
    var frontera = ptes.length || C.cruces.some(function (c) { return c.region === id; });
    r.push(!frontera ? "no tiene frontera" : ptes.length ? ptes.map(function (c) { return esc(c.nombre) + " " + fuenteCorta(c.fuente); }).join("<br>") : "ninguno confirmado");
    var cs = carreterasDe(id);
    r.push(cs.length ? esc(enLista(cs.map(nb))) + "<br>" + fuenteCorta(TIGER) : "sin dato");
    var emp = C.mexicanas.filter(function (e) { return e.region === id; });
    r.push(emp.length ? emp.length + " · " + emp.map(function (e) { return enlaceFuente(e.fuente, e.empresa) + (e.parcial ? CONFIRMAR : ""); }).join(", ") : "ninguna en la muestra");
    var an = C.anclas.filter(function (e) { return e.region === id; });
    r.push(an.length ? an.map(function (e) { return esc(e.empresa) + (e.parcial ? CONFIRMAR : "") + " " + fuenteCorta(e.fuente); }).join("<br>") : "sin dato");
    r.push((ACUDIR[id] || []).map(function (a) { return '<a href="' + esc(a.getAttribute("href")) + '">' + esc(a.textContent) + "</a>"; }).join("<br>") || "sin dato");
    return r;
  }
  var RUBROS = ["Comercio en 2024", "Por dónde", "Puentes de carga", "Carreteras", "Empresas mexicanas en la muestra", "Empresa ancla", "A quién acudir"];
  function pintarCompara() {
    while (elegidas.length > topeC()) elegidas.shift();
    cada(fichas.children, function (b) { b.setAttribute("aria-pressed", elegidas.indexOf(b.getAttribute("data-region")) >= 0 ? "true" : "false"); });
    var cols = ORDEN.filter(function (id) { return elegidas.indexOf(id) >= 0; }), datos = cols.map(celdas), n = cols.length;
    var html = '<table class="tabla-c"><caption class="sr">Comparación de regiones</caption><thead><tr>' + (movil() ? "" : '<th scope="col"><span class="sr">Rubro</span></th>') +
      cols.map(function (id) { return '<th scope="col" class="' + (nuevas[id] ? "nueva" : "") + '">' + esc(RPOR[id].nombre) + "</th>"; }).join("") + "</tr></thead><tbody>";
    RUBROS.forEach(function (rb, k) {
      if (movil()) html += '<tr class="rubro"><th scope="colgroup" colspan="' + n + '">' + esc(rb) + "</th></tr><tr>";
      else html += '<tr><th scope="row">' + esc(rb) + "</th>";
      html += datos.map(function (d, j) { return '<td class="' + (nuevas[cols[j]] ? "nueva" : "") + '">' + d[k] + "</td>"; }).join("") + "</tr>";
    });
    tablaC.innerHTML = html + "</tbody></table>";
    nuevas = {};
  }
  pintarCompara();
  var anchoC = movil();
  window.addEventListener("resize", function () { if (movil() !== anchoC) { anchoC = movil(); pintarCompara(); } });

  /* ============================================================ a quién acudir */
  cada(document.querySelectorAll(".acu-lista button.acu-reg"), function (b) { b.addEventListener("click", function () { irARegion(b.getAttribute("data-region")); }); });

  /* ============================================================ 7. parques */
  var tabsPq = Array.prototype.slice.call(document.querySelectorAll("#selector-parques [role=tab]"));
  var panelPq = document.getElementById("panel-parques");
  function elegirZona(z) {
    tabsPq.forEach(function (t) { var s = t.getAttribute("data-zona") === z; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; if (s) panelPq.setAttribute("aria-labelledby", t.id); });
    panelPq.innerHTML = (C.parques[z] || []).map(function (n) {
      return '<li><span class="cand-nombre">' + esc(n) + '</span><span class="en-verif">en verificación</span><a class="cand-escribe" href="mailto:contacto@investtexashub.com?subject=' + encodeURIComponent("Duda sobre " + n) + '">Escríbenos sobre este parque</a></li>';
    }).join("");
  }
  pestanas(tabsPq, function (t) { elegirZona(t.getAttribute("data-zona")); });
  elegirZona(param("zona") === "dfw" ? "dfw" : "laredo");
  if (param("zona") === "dfw") tabsPq.forEach(function (t) { var s = t.getAttribute("data-zona") === "dfw"; t.setAttribute("aria-selected", s ? "true" : "false"); t.tabIndex = s ? 0 : -1; });
  var pasosVer = document.querySelectorAll("#pasos-ver li");
  alEntrar(document.getElementById("pasos-ver"), function () { // entrada: los tres pasos se marcan en secuencia, una vez
    cada(pasosVer, function (li, i) { setTimeout(function () { li.classList.add("hecho"); }, reduce ? 0 : 450 * i + 200); });
  });

  /* ------------------------------------------------------------ navegación */
  var nav = document.getElementById("nav");
  var boton = document.getElementById("menu-boton");
  var menu = document.getElementById("menu-panel");
  function estadoNav() { nav.classList.toggle("solida", menu.classList.contains("abierto") || window.scrollY > 24); }
  function menuAbierto(abre) {
    menu.classList.toggle("abierto", abre);
    boton.setAttribute("aria-expanded", abre ? "true" : "false");
    boton.setAttribute("aria-label", abre ? "Cerrar menú" : "Abrir menú");
    estadoNav();
  }
  window.addEventListener("scroll", estadoNav, { passive: true });
  boton.addEventListener("click", function () { menuAbierto(!menu.classList.contains("abierto")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") menuAbierto(false); });
  document.addEventListener("click", function (e) { if (menu.classList.contains("abierto") && !menu.contains(e.target) && !boton.contains(e.target)) menuAbierto(false); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && menu.classList.contains("abierto")) { menuAbierto(false); boton.focus(); } });
  cada(document.querySelectorAll('a[aria-disabled="true"]'), function (a) { a.addEventListener("click", function (e) { e.preventDefault(); }); });
  estadoNav();

  /* conmutador de paleta (sólo de la maqueta, con ?conmutador=1) */
  var botonesPaleta = document.querySelectorAll(".conmutador button");
  function marcarPaleta() {
    var p = raiz.getAttribute("data-paleta");
    cada(botonesPaleta, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-paleta") === p ? "true" : "false"); });
  }
  cada(botonesPaleta, function (b) {
    b.addEventListener("click", function () {
      raiz.setAttribute("data-paleta", b.getAttribute("data-paleta"));
      marcarPaleta();
      try {
        var u = location.search.replace(/([?&])paleta=[^&]*&?/, "$1").replace(/[?&]$/, "");
        history.replaceState(null, "", location.pathname + u + (u ? "&" : "?") + "paleta=" + b.getAttribute("data-paleta") + location.hash);
      } catch (e) {}
    });
  });
  marcarPaleta();

  /* ------------------------------------------------------------ arranque */
  var listo = false;
  function iniciar() {
    if (listo) return; listo = true;
    aplicarOrigenE();
    medirE();
    animarE();
  }
  function iniciarYIr() { // ?ir=<id> abre la página en esa sección (para capturas)
    iniciar();
    var ir = param("ir"), e = ir && document.getElementById(ir);
    if (e && !iniciarYIr.hecho) { iniciarYIr.hecho = true; raiz.style.scrollBehavior = "auto"; window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - (+param("menos") || 0)); }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(iniciarYIr);
  setTimeout(iniciarYIr, 900);
  var tRes, anchoAntes = window.innerWidth;
  window.addEventListener("resize", function () {
    clearTimeout(tRes);
    tRes = setTimeout(function () {
      if (!listo) return;
      medirE();
      if (MO && MO.medir()) { MO.cam = MO.encuadre(limitesOrigen(origenActivo)); MO.render(); }
      Object.keys(MINI).forEach(function (k) { var M = MINI[k]; if (M.medir()) { M.cam = M.encuadre(M.bbox); M.render(); } });
      if ((anchoAntes < 1024) !== (window.innerWidth < 1024) && regListo) pintarMini(regionActiva, false);
      anchoAntes = window.innerWidth;
    }, 140);
  });
})();
