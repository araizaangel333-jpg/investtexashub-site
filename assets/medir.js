/* Único punto de medición del sitio. Carga Google Analytics sólo en investtexashub.com:
   la maqueta abierta como archivo, en localhost o en la red de casa no manda nada.
   ?medir=ver escribe los eventos en la consola sin enviarlos. ?interno=1 marca al visitante
   como tráfico interno (traffic_type) y ?interno=0 lo desmarca. */
(function () {
  "use strict";
  var parametros=new URLSearchParams(location.search),ver=parametros.get("medir")==="ver";
  var interno=false,clave="ith-trafico-interno",guion=document.currentScript;
  var enSitio=/^(www\.)?investtexashub\.com$/.test(location.hostname);
  try {
    if(parametros.get("interno")==="1")localStorage.setItem(clave,"1");
    if(parametros.get("interno")==="0")localStorage.removeItem(clave);
    interno=localStorage.getItem(clave)==="1";
  } catch(e) { interno=parametros.get("interno")==="1"; }
  var permitidos={
    hoja_inicio:["plan"],hoja_respuesta:["pregunta","respuesta"],hoja_completa:["plan","origen","envio","personas","etapa","regiones"],hoja_region:["region","accion"],hoja_guardar:["metodo"],hoja_enviar:["metodo","con_duda","con_empresa"],
    contacto_clic:["seccion","asunto"],origen_elegido:["origen"],region_elegida:["region","desde"],necesidad_elegida:["necesidad"],comparar_region:["region","accion"],puentes_estado:["estado"],empresas_capa:["capa"],parques_zona:["zona"],ruta_alterna:["region"],costos_puesto:["puesto"],impuestos_actividad:["actividad"],energia_region:["region"],
    mapa_region:["region","desde"],mapa_parque:["parque","nivel","desde"],mapa_vista:["vista"],mapa_buscar:["region"],mapa_enlace:["tipo"]
  };
  /* La etiqueta de Google cuenta una vista de página cada vez que cambia la dirección, y la manda con la dirección
     completa. La hoja de ruta guarda sus respuestas en la dirección y el mapa de parques guarda la región y el parque:
     las cambian con las funciones originales del navegador, tomadas aquí, antes de que la etiqueta cargue y las
     envuelva. Lo que la persona hace en esas páginas se cuenta con sus eventos, no como vistas de página. */
  window.cambiarDireccion = History.prototype.replaceState.bind(history);
  window.agregarDireccion = History.prototype.pushState.bind(history);
  window.medir = function (nombre, datos) {
    if(!Object.prototype.hasOwnProperty.call(permitidos,nombre))return;
    var limpios={};permitidos[nombre].forEach(function(k){var v=datos&&datos[k];if(typeof v==="boolean"||typeof v==="number"&&Number.isFinite(v))limpios[k]=v;else if(typeof v==="string"&&v.length<=160&&!/[<>@\r\n]/.test(v))limpios[k]=v;});
    if (ver) console.info("[medir]", nombre, limpios);
    else if (!navigator.webdriver && typeof window.gtag === "function") window.gtag("event", nombre, limpios);
  };
  // Los asuntos son textos públicos del sitio, nunca el cuerpo de un correo.
  var ASUNTOS=["Avísame: Con qué visa se puede ir a operar", "Avísame: Cómo abrir una empresa en Texas", "Avísame: Cómo cruza tu mercancía", "Avísame: Qué apoyos ofrece cada región", "Duda sobre Austin", "Duda sobre DalPort Trade Center", "Duda sobre Dallas-Fort Worth", "Duda sobre El Paso", "Duda sobre Houston", "Duda sobre IAC Pleasant Run", "Duda sobre Laredo", "Duda sobre Logistix Hub South Dallas", "Duda sobre Longhorn 35 Logistics Park", "Duda sobre North Laredo Industrial Park", "Duda sobre Pinnacle Industry Center", "Duda sobre Port Grande", "Duda sobre Premier Industrial Park", "Duda sobre Prime Pointe", "Duda sobre Prologis Park 20/35", "Duda sobre San Antonio", "Duda sobre Southport Logistics Park", "Duda sobre Sunridge Business Park", "Duda sobre Talise Logistics Park", "Duda sobre Valle del Río Grande", "Duda sobre Wisdom Industrial Park", "Duda sobre World Logistics Park", "Mi hoja de ruta"]; /* asuntos-publicos */
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest('a[href^="mailto:"]');if(!a)return;
    var asunto="",href=a.getAttribute("href"),p=href.indexOf("?");
    if(p>=0)asunto=new URLSearchParams(href.slice(p+1)).get("subject")||"";
    if(ASUNTOS.indexOf(asunto)<0)asunto=asunto?"consulta":"sin asunto";
    var seccion=a.closest("section[id],footer[id]");
    window.medir("contacto_clic",{seccion:seccion?seccion.id:rutaPublica(),asunto:asunto});
  });
  function rutaPublica(){var c=document.querySelector('link[rel="canonical"]');try{return new URL(c?c.href:location.href).pathname;}catch(e){return "/";}}
  /* La dirección que se manda es la pública, sin las respuestas de la hoja ni otros parámetros.
     Se conservan sólo las etiquetas de campaña, que dicen de qué publicación llegó la visita. */
  function campania(){var q=new URLSearchParams();["utm_source","utm_medium","utm_campaign","utm_content","utm_term","utm_id"].forEach(function(k){var v=parametros.get(k);if(v&&v.length<=120&&!/[<>@\s]/.test(v))q.set(k,v);});var s=q.toString();return s?"?"+s:"";}
  if(ver||navigator.webdriver||!enSitio)return;
  var id=guion&&guion.dataset.ga4;if(!/^G-[A-Z0-9]+$/.test(id||""))return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments);};
  var comunes={allow_google_signals:false,allow_ad_personalization_signals:false,page_location:"https://investtexashub.com"+rutaPublica()+campania()};
  if(interno)comunes.traffic_type="internal";
  try{var ref=new URL(document.referrer);comunes.page_referrer=ref.origin+ref.pathname;}catch(e){comunes.page_referrer="";}
  /* La etiqueta de Google ignora los parámetros que llegan dentro de «config» (comprobado el 11-nov-2026 con
     herramientas/probar-medicion.mjs): ni la dirección limpia, ni la marca de tráfico interno, ni los ajustes de
     privacidad llegaban a la petición. Sólo se aplican con «set», y antes de «js». */
  window.gtag("set",comunes);window.gtag("js",new Date());window.gtag("config",id);
  var tag=document.createElement("script");tag.async=true;tag.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(tag);
})();
