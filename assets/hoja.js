/* Hoja de ruta. El motor no necesita DOM; comprobar-hoja.py lo ejecuta con Node. */
(function (root) {
  "use strict";
  var H=root.HOJA_DATOS, D=root.COSTOS_DATOS, R=root.RED_DATOS, C=root.CAPAS_DATOS;
  var CAPTURA={url:"", campos:{correo:"",empresa:"",sector:"",respuestas:"",duda:"",presentacion:""}};
  var PRESENTACION=false;
  /* GUÍA EN ESPERA: en falso mientras «¿Filial o seguir exportando?» no esté publicada; «Qué leer ahora» no la enlaza. */
  var GUIA_PUBLICADA=false;
  var PLANES={vender:["Vender desde México","Exportas y tu operación se queda en México.","Quieres vender desde México."],bodega:["Tener bodega o centro de distribución","Guardas y repartes producto desde Texas.","Quieres tener bodega o centro de distribución."],producir:["Producir o ensamblar","Pones una planta o una línea allá.","Quieres producir o ensamblar."],oficina:["Abrir una oficina","Ventas, servicio o administración, sin mover mercancía.","Quieres abrir una oficina."]};
  var ORIGENES={monterrey:["Monterrey",""],saltillo:["Saltillo",""],chihuahua:["Chihuahua",""],otra:["Otra ciudad","Escríbela y la sumamos a nuestras rutas."]};
  var ENVIOS={tierra:["Por carretera","Camión completo o consolidado.","Tu mercancía viaja por carretera."],mar:["Por barco","Contenedores o granel.","Tu mercancía viaja por barco."],aire:["Por avión","Carga urgente o de alto valor.","Tu mercancía viaja por avión."]};
  var ETAPAS={explorando:["Estoy explorando","Quiero entender el terreno.","Estás explorando."],evaluando:["Lo estoy evaluando","Comparo opciones con números.","Estás evaluando opciones."],decidido:["Ya lo decidí","Busco cómo y con quién.","Ya lo decidiste."]};
  var PUESTOS={bodega:["ayudante-carga","montacargas","chofer-tractocamion"],producir:["ensamblador","maquinista","soldador","mecanico-industrial","supervisor-produccion"],oficina:["servicio-cliente","auxiliar-contable"]};
  var ORDEN=["laredo","san-antonio","austin","dfw","houston","valle","el-paso"];
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function dinero(n){return Number(n).toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2});}
  function entero(n){return Math.round(n).toLocaleString("es-MX");}
  var MESES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  /* Las fechas de los datos vienen como 2026-11-10; a la vista van como en el resto del sitio, 10-nov-2026. */
  function fechas(s){return String(s==null?"":s).replace(/(\d{4})-(\d{2})-(\d{2})/g,function(_,a,m,d){return (+d)+"-"+MESES[+m-1]+"-"+a;});}
  function nombreCorto(ed){for(var i=0;i<H.cortosFuente.length;i++)if(ed.indexOf(H.cortosFuente[i][0])===0)return H.cortosFuente[i][1];return ed.split(" (")[0].split(",")[0];}
  function tramo(n){return n===0?"0":n<=5?"1-5":n<=25?"6-25":n<=100?"26-100":"101+";}
  function pasos(s){return ["plan","origen"].concat(s.plan==="oficina"?[]:["envio"],s.plan==="vender"?[]:["personas"],["etapa"]);}
  function completo(s){return pasos(s).every(function(k){return s[k]!==undefined&&s[k]!=="";});}
  function sugeridas(s){if(s.plan==="oficina")return [];if(s.envio==="tierra"&&H.rutas[s.origen])return Array.from(new Set(H.rutas[s.origen].map(function(r){return r.r;})));return Object.keys((H.categorias[s.envio]||{regiones:{}}).regiones);}
  function leer(query){
    var p=new URLSearchParams(query),s={};
    [["plan",PLANES],["origen",ORIGENES],["envio",ENVIOS],["etapa",ETAPAS]].forEach(function(x){var v=p.get(x[0]);if(Object.prototype.hasOwnProperty.call(x[1],v))s[x[0]]=v;});
    if(p.has("personas")&&/^\d{1,6}$/.test(p.get("personas"))&&+p.get("personas")<=100000)s.personas=+p.get("personas");
    if(p.has("kwh")&&/^\d{1,9}(\.\d{1,2})?$/.test(p.get("kwh")))s.kwh=+p.get("kwh");
    if(s.plan==="oficina")delete s.envio;if(s.plan==="vender")delete s.personas;if(s.plan!=="producir")delete s.kwh;
    if(p.has("regiones")){var ids=p.get("regiones").split(",");s.regiones=Array.from(new Set(ids.filter(function(id){return ORDEN.indexOf(id)>=0;}))).slice(0,3);if(p.get("regiones")&&!s.regiones.length)delete s.regiones;}
    return s;
  }
  function direccion(s){var p=new URLSearchParams();["plan","origen","envio","personas","etapa","kwh"].forEach(function(k){if(s[k]!==undefined)p.set(k,s[k]);});if(s.regiones)p.set("regiones",s.regiones.join(","));return p.toString();}
  function resumen(s,k){if(k==="plan")return PLANES[s.plan][2];if(k==="origen")return s.origen==="otra"?"Sales de "+(s.ciudad||"otra ciudad")+". Todavía no trazamos tu ruta, así que tu hoja no lleva el camino ni el puente.":"Sales de "+ORIGENES[s.origen][0]+".";if(k==="envio")return ENVIOS[s.envio][2];if(k==="personas")return s.personas?"Empezarías con "+s.personas+(s.personas===1?" persona.":" personas."):"Todavía sin personal en Texas.";return ETAPAS[s.etapa][2];}
  function salarios(s,id){return D.salarios.zonas.filter(function(z){return z.region===id;}).map(function(z){return {zona:z.nombre_oficial,puestos:z.puestos.filter(function(p){return (PUESTOS[s.plan]||[]).indexOf(p.id)>=0;})};});}
  function nomina(s,id){var ps=salarios(s,id).flatMap(function(z){return z.puestos;}),vs=ps.filter(function(p){return p.estado==="verificado"&&Number.isFinite(p.mediana_hora);}).map(function(p){return p.mediana_hora;});return vs.length?{min:Math.min.apply(null,vs)*s.personas*H.horas,max:Math.max.apply(null,vs)*s.personas*H.horas,parcial:vs.length!==ps.length}:null;}
  function rutas(s,id){var o=R.origenes[s.origen],r=o&&o.rutas[id];if(!r)return [];var vistos={};return [r].concat(r.alt||[]).sort(function(a,b){return a.km-b.km;}).filter(function(x){var p=x.pasos.find(function(p){return p.t==="puente";});var key=p&&(p.puente||p.n);if(vistos[key])return false;vistos[key]=true;return true;}).slice(0,3).map(function(x){var parcial=false;var nombres=x.pasos.map(function(p){var c=C.cruces.find(function(c){return c.id===p.puente;});if(c&&c.parcial)parcial=true;var gloria=C.carreteras.find(function(c){return c.id==="la-gloria-colombia";});if(p.n==="La Gloria-Colombia"&&gloria&&gloria.estado!=="verificado")parcial=true;return p.pais==="MX"&&(/^\d/.test(p.n)||p.n==="La Gloria-Colombia")?"Carretera "+p.n:p.n==="MEX 2"?"Carretera 2":p.n;});return {texto:nombres.join(", "),parcial:parcial,fuentes:x.pasos.filter(function(p){return p.t==="puente";}).map(function(p){return C.cruces.find(function(c){return c.id===p.puente;});}).filter(Boolean).map(function(c){return c.fuente;})};});}
  function tabla(s,seleccion){
    var fuentes=new Map();
    function link(url,texto,completo){if(/^https?:/.test(url))fuentes.set(url,completo||texto);return '<a href="'+esc(url)+'"'+(completo?' title="'+esc(completo)+'"':'')+'>'+esc(texto)+'</a>';}
    /* Fuente corta, como en la portada: nombre breve y año. El texto completo va en el título del enlace y en la lista de impresión. */
    function fuente(f){var completo=f.editor+(f.fecha?', '+fechas(f.fecha):''),y=/^(\d{4})/.exec(f.fecha||'');return '<span class="fuente-hoja">'+link(f.url,nombreCorto(f.editor)+(y?', '+y[1]:''),completo)+'</span>';}
    function fila(t,fn){return {rubro:t,celdas:seleccion.map(function(id){return fn(id)||"no informado";})};}
    var filas=[fila("Qué es",function(id){var r=H.regiones[id];return esc(r.linea)+'<span class="fuente-hoja">'+link(r.fuente.url,r.fuente.fecha)+'</span>';})];
    if(s.plan!=="oficina")filas.push(fila("Por qué encaja con tu carga",function(id){var cat=H.categorias[s.envio];return cat&&cat.regiones[id]?esc(cat.regiones[id])+'<span class="fuente-hoja">'+esc(cat.fuente)+' '+link('../index.html#necesidad','Ver las fuentes en la portada')+'</span>':"sin dato para este tipo de envío";}));
    if(s.envio==="tierra"){
      filas.push(fila("Cómo llegas desde "+(s.origen==="otra"?(s.ciudad||"otra ciudad"):ORIGENES[s.origen][0]),function(id){var rs=rutas(s,id);if(s.origen==="otra"||!rs.length)return "Todavía no trazamos tu ruta.";function ruta(r){return '<p>'+esc(r.texto)+(r.parcial?' <span class="pendiente">por confirmar</span>':'')+'</p>'+r.fuentes.map(fuente).join('');}return ruta(rs[0])+(rs.length>1?'<details><summary>Ver otra ruta</summary>'+rs.slice(1).map(ruta).join('')+'</details>':'')+fuente({editor:'Census TIGER/Line y Natural Earth',url:'https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html',fecha:'2025-2026. Consulta 9-nov-2026'})+link('../index.html?origen='+s.origen+'&region='+id+'#regiones','Ver el camino en el mapa');}));
      filas.push(fila("Puentes de carga",function(id){if(s.origen==="otra")return 'Todavía no trazamos tu ruta.';var xs=C.cruces.filter(function(c){return c.region===id&&c.carga==="sí"&&!c.parcial;});return xs.length?xs.map(function(c){return esc(c.nombre)+fuente(c.fuente);}).join('<br>'):C.cruces.some(function(c){return c.region===id;})?'ninguno confirmado':'no tiene frontera';}));
    }
    if(PUESTOS[s.plan]){
      /* Una fuente por celda y no una por sueldo: cada puesto enlaza a su serie de BLS, y el detalle completo vive en costos/. */
      filas.push(fila("Sueldo por hora, mediana",function(id){fuentes.set('https://investtexashub.com/costos/','Salarios por región, con la serie de BLS de cada dato');return salarios(s,id).map(function(z){return '<p class="zona-sueldo">'+esc(z.zona.replace(/, TX$/,''))+'</p><ul class="sueldos">'+z.puestos.map(function(p){var hay=p.estado==="verificado"&&Number.isFinite(p.mediana_hora);return '<li><a href="'+esc(p.url)+'" title="'+esc('BLS, serie '+p.serie+', ocupación '+p.codigo)+'">'+esc(H.cortos[p.id]||p.puesto)+'</a><b>'+(hay?'USD '+dinero(p.mediana_hora):'no informado')+'</b></li>';}).join('')+'</ul>';}).join('')+'<span class="fuente-hoja">BLS, encuesta OEWS, '+esc(D.salarios.periodo.split(' (')[0].toLowerCase())+'. Consulta '+esc(fechas(D.salarios.consulta))+'. Cada puesto enlaza a su serie.</span>';}));
      if(s.personas>0)filas.push(fila("Nómina base al año para "+s.personas+(s.personas===1?" persona":" personas"),function(id){var n=nomina(s,id);return (n?'<p>'+(n.min===n.max?'USD '+entero(n.min):'Entre USD '+entero(n.min)+' y USD '+entero(n.max))+'</p>'+(n.parcial?'<p>Rango parcial. Hay puestos con mediana no informada.</p>':''):'<p>no informado</p>')+'<p>Sueldo base con la mediana de BLS. No incluye prestaciones, impuestos sobre la nómina ni seguros.</p>'+fuente(H.fuenteHoras);}));
    }
    if(s.plan==="bodega"||s.plan==="producir"){
      var precios=D.energia.precios.mes_reciente,anioPrecio=Object.keys(precios.texas).sort().reverse()[0],precio=precios.texas[anioPrecio];
      filas.push(fila("Luz",function(id){var xs=D.energia.entradas.filter(function(x){return x.region===id;});return xs.map(function(x){var parcial=x.estado==="parcial";return '<p>'+esc(x.ciudad)+'. '+esc(x.empresa.split(' (')[0])+(parcial?' <span class="pendiente">Por confirmar. Información parcial</span>':'')+'</p><p>Elección de proveedor. '+esc(x.libre_eleccion.charAt(0).toUpperCase()+x.libre_eleccion.slice(1))+(parcial&&x.libre_eleccion!=="por confirmar"?' <span class="pendiente">Por confirmar</span>':'')+'</p>'+x.fuente.map(function(u){return fuente({url:u,editor:new URL(u).hostname.replace(/^www\./,''),fecha:'consulta '+D.energia.consulta});}).join('');}).join('')+(xs.length?'<p>La cobertura y las características de cada ficha requieren confirmación para el inmueble.</p>':'');}));
      /* El precio es el promedio del estado: va una sola vez, a lo ancho de la tabla, y no repetido en cada región. */
      if(s.kwh!==undefined){var consumo=fila("Tu consumo de luz",function(){return '<p>A '+dinero(precio)+' centavos por kWh, '+s.kwh.toLocaleString('es-MX')+' kWh al mes serían USD '+entero(precio*s.kwh/100)+' al mes.</p><p>Es el promedio de venta final al sector industrial de Texas en '+esc(precios.periodo.split(' y ')[0])+'. La tarifa de una fábrica depende de su contrato y consumo; no es una tarifa por ciudad ni por empresa.</p>'+fuente({url:precios.url,editor:'EIA, '+precios.tabla,fecha:'consulta '+D.energia.consulta});});consumo.unica=true;filas.push(consumo);}
      filas.push(fila("Parques con ficha",function(id){var nombres=C.parques[id]||[],con=nombres.filter(function(n){return H.fichas[n];}),n=nombres.length-con.length;if(!con.length&&!n)return 'Todavía sin fichas en esta región.';return (con.length?con.map(function(nombre){return link('../parques/'+H.fichas[nombre]+'/index.html',nombre);}).join('<br>'):'Todavía sin fichas en esta región.')+(n?'<p>'+n+' en verificación</p>':'')+(con.length?link('../parques/index.html','Fuentes y fechas de las fichas'):'');}));
    }
    /* El rubro se llama como en el comparador de la portada. La muestra acredita que son empresas ancla, no que tengan registro de proveedores. */
    if(s.plan==="vender")filas.push(fila("Empresas ancla",function(id){var xs=C.anclas.filter(function(x){return x.region===id;});return xs.length?xs.map(function(x){return '<p>'+esc(x.empresa)+(x.parcial?' <span class="pendiente">por confirmar</span>':'')+'</p>'+fuente(x.fuente);}).join(''):'ninguna en la muestra';}));
    filas.push(fila("Empresas mexicanas en la muestra",function(id){var xs=C.mexicanas.filter(function(x){return x.region===id;});return xs.length?xs.map(function(x){return '<p>'+esc(x.empresa)+(x.parcial?' <span class="pendiente">por confirmar</span>':'')+'</p>'+fuente(x.fuente);}).join(''):'ninguna en la muestra';}));
    filas.push(fila("A quién acudir",function(id){return (H.acudir[id]||[]).map(function(a){return link(a.url,a.texto);}).join('<br>')+'<span class="fuente-hoja">Páginas de los organismos. Consulta 9-nov-2026.</span>';}));
    return {filas:filas,fuentes:Array.from(fuentes).map(function(x){return {url:x[0],texto:x[1]};})};
  }
  root.HojaRuta={leer:leer,direccion:direccion,pasos:pasos,completo:completo,sugeridas:sugeridas,nomina:nomina,tabla:tabla,tramo:tramo,puestos:PUESTOS};
  if(!root.document)return;
  var doc=root.document, q=function(s){return doc.querySelector(s);}, estado=leer(location.search),inicio=false,terminada=false,editando=null,animar=null;
  var preguntas={plan:'¿Qué quieres hacer en Texas?',origen:'¿Desde dónde sales?',envio:'¿Cómo se mueve tu mercancía?',personas:'¿Con cuántas personas empezarías?',etapa:'¿Qué tan cerca estás de decidir?'};
  var opciones={plan:PLANES,origen:ORIGENES,envio:ENVIOS,etapa:ETAPAS};
  function medir(n,d){if(root.medir)root.medir(n,d);}
  function tope(){return matchMedia('(max-width: 699px)').matches?2:3;}
  function normalizar(){if(estado.plan==='oficina')delete estado.envio;if(estado.plan==='vender')delete estado.personas;if(estado.plan!=='producir')delete estado.kwh;if(estado.regiones)estado.regiones=estado.regiones.slice(0,tope());}
  function url(){return doc.querySelector('link[rel=canonical]').href+'?'+direccion(estado);}
  function actualizarURL(){var p=new URLSearchParams(direccion(estado)),actual=new URLSearchParams(location.search);['medir','interno'].forEach(function(k){if(actual.has(k))p.set(k,actual.get(k));});try{(root.cambiarDireccion||history.replaceState.bind(history))(null,'','?'+p.toString());}catch(e){/* file:// puede impedir replaceState; copiar sigue disponible. */}}
  function responder(k,v){
    var antes=estado[k];estado[k]=v;editando=null;animar=k;
    if(['plan','origen','envio'].indexOf(k)>=0&&antes!==v)delete estado.regiones;
    normalizar();if(!inicio){inicio=true;medir('hoja_inicio',{plan:estado.plan});}
    medir('hoja_respuesta',{pregunta:k,respuesta:k==='personas'?tramo(v):v});
    if(completo(estado)){if(!estado.regiones)estado.regiones=sugeridas(estado).slice(0,tope());if(!terminada){terminada=true;q('#resultado').classList.add('recien');medir('hoja_completa',{plan:estado.plan,origen:estado.origen,envio:estado.envio||'no-aplica',personas:estado.personas===undefined?'no-aplica':tramo(estado.personas),etapa:estado.etapa,regiones:estado.regiones.join('+')});}}
    pintar();actualizarURL();var foco=q('.pregunta-activa legend')||q('#titulo-regiones');if(foco)foco.focus({preventScroll:true});
  }
  function pintar(){
    var ps=pasos(estado),proxima=editando||ps.find(function(k){return estado[k]===undefined;}),html='';
    q('#avance').textContent=ps.filter(function(k){return estado[k]!==undefined;}).length+' de '+ps.length;
    ps.forEach(function(k){if(estado[k]!==undefined&&k!==editando){html+='<div class="respuesta'+(animar===k?' recien':'')+'"><p>'+esc(resumen(estado,k))+'</p><button type="button" data-cambiar="'+k+'" aria-label="Cambiar. '+esc(preguntas[k])+'">Cambiar</button></div>';return;}if(k!==proxima)return;
      html+='<fieldset class="pregunta-activa"><legend tabindex="-1">'+esc(preguntas[k])+'</legend>';
      if(k==='personas')html+='<div class="cantidad"><button type="button" data-ajuste="-1" aria-label="Una persona menos">−</button><label class="sr" for="personas">Número de personas</label><input id="personas" type="number" required min="0" max="100000" step="1" value="'+(estado.personas===undefined?10:estado.personas)+'"><button type="button" data-ajuste="1" aria-label="Una persona más">+</button></div><button type="button" class="principal" data-personas>Continuar</button><button type="button" data-nadie>Todavía con nadie</button>';
      else Object.keys(opciones[k]).forEach(function(v){var o=opciones[k][v];html+='<button type="button" class="opcion" data-pregunta="'+k+'" data-valor="'+v+'"><span>'+esc(o[0])+'</span>'+(o[1]?'<small>'+esc(o[1])+'</small>':'')+'</button>';});
      if(k==='origen')html+='<form id="otra-ciudad" hidden><label for="ciudad">Tu ciudad</label><input id="ciudad" name="ciudad" maxlength="80" required autocomplete="address-level2" value="'+esc(estado.ciudad||'')+'"><button class="principal" type="submit">Continuar</button></form>';
      html+='</fieldset>';
    });
    q('#preguntas').innerHTML=html;animar=null;
    q('#consumo').hidden=!(estado.plan==='producir'&&estado.personas!==undefined);q('#kwh').value=estado.kwh===undefined?'':estado.kwh;
    q('#resultado').hidden=!completo(estado);q('#sin-guion').hidden=true;
    if(completo(estado)){if(!estado.regiones)estado.regiones=sugeridas(estado).slice(0,tope());pintarResultado();}
  }
  /* Cinco renglones y no la ficha completa de cada impuesto: el detalle vive en impuestos/. Las cifras se leen del dato;
     si la forma del dato cambia y una cifra ya no se puede leer, se muestra el texto del dato tal cual. */
  function resumenImpuestos(lista){
    var por={};lista.forEach(function(x){por[x.id]=x;});
    function lee(re,s){var r=re.exec(s||'');return r?r.slice(1):null;}
    var out=[],f=por['franquicia-tasa'],u=por['franquicia-umbral'],v=por.ventas,r=por['renta-personas'],d=por['desempleo-nuevo'],b=por['desempleo-minima'],p=por['propiedad-quien'];
    if(f){var t=lee(/([\d.]+%) para comercio al menudeo o al mayoreo; ([\d.]+%) para los demás/,f.tasa),um=u&&lee(/^([\d,]+ USD)/,u.tasa);out.push({n:'Franquicia',t:t?t[0]+' para comercio al menudeo o al mayoreo y '+t[1]+' para las demás actividades.'+(um?' Por debajo de '+um[0]+' de ingresos totales anualizados no se paga.':''):f.tasa,x:f});}
    if(v)out.push({n:'Ventas y uso',t:v.tasa+'.',x:v});
    if(r)out.push({n:'Renta de las personas',t:/^No hay; la /.test(r.tasa)?r.tasa.replace(/^No hay; la /,'Sin impuesto estatal. La ')+'.':r.tasa,x:r});
    if(d){var e=lee(/^Tasa de entrada ([\d.]+%)/,d.tasa),base=b&&lee(/primeros ([\d,]+ USD)/,b.aplica_a);out.push({n:'Seguro de desempleo, empleador nuevo',t:e?'Tasa de entrada de '+e[0]+(base?', sobre los primeros '+base[0]+' que gana cada empleado en el año.':'.'):d.tasa,x:d});}
    if(p)out.push({n:'Propiedad',t:p.tasa.split('; ')[0]+'.',x:p});
    return out;
  }
  function pintarResultado(){
    var oficina=estado.plan==='oficina',ids=estado.regiones||[],t=tabla(estado,ids),movil=tope()===2;
    q('#titulo-regiones').textContent=oficina?'Elige las regiones que quieres comparar':'Regiones que encajan con lo que dijiste';
    q('#criterio-regiones').textContent=oficina?'Para una oficina no tenemos un dato que acerque una ciudad más que otra. Elige hasta tres.':'Salen de cruzar tu origen con la forma en que se mueve tu mercancía. No son una recomendación. Puedes quitar una o agregar otra.';
    q('#limite-regiones').textContent='Puedes comparar hasta '+tope()+' regiones en esta pantalla. Al agregar otra, sale la primera.';
    q('#selector-hoja').innerHTML=ORDEN.map(function(id){return '<button type="button" class="ficha" data-region="'+id+'" aria-pressed="'+ids.includes(id)+'">'+esc(H.regiones[id].nombre)+'</button>';}).join('');
    var fotos=ids.map(function(id){var r=H.regiones[id];return '<th scope="col"><figure><img src="../'+esc(r.foto)+'" alt="'+esc(r.alt)+'" width="1280" height="853" loading="lazy"><figcaption><a href="'+esc(r.credito.url)+'">'+esc(r.credito.texto)+'</a></figcaption></figure><span>'+esc(r.nombre)+'</span></th>';}).join('');
    q('#tabla-hoja').innerHTML=ids.length?'<table><caption class="sr">Datos para tu hoja de ruta</caption><thead><tr>'+(movil?'':'<th scope="col">Rubro</th>')+fotos+'</tr></thead><tbody>'+t.filas.map(function(f){return (movil?'<tr class="rubro"><th colspan="'+ids.length+'" scope="colgroup">'+esc(f.rubro)+'</th></tr><tr>':'<tr><th scope="row">'+esc(f.rubro)+'</th>')+(f.unica?'<td colspan="'+ids.length+'">'+f.celdas[0]+'</td>':f.celdas.map(function(c){return '<td>'+c+'</td>';}).join(''))+'</tr>';}).join('')+'</tbody></table>':'<p>Elige una región para llenar la tabla.</p>';
    var impuestos=D.impuestos.impuestos.filter(function(x){return ['franquicia-tasa','franquicia-umbral','ventas','renta-personas','desempleo-nuevo','desempleo-minima','propiedad-quien'].includes(x.id)&&x.estado==='verificado';});
    q('#impuestos-hoja').hidden=estado.plan==='vender';q('#lista-impuestos').innerHTML=resumenImpuestos(impuestos).map(function(i){var x=i.x,consulta='Consulta '+fechas(D.impuestos.consulta);return '<li><h3>'+esc(i.n)+'</h3><div><p>'+esc(i.t)+'</p><span class="fuente-hoja"><a href="'+esc(x.url)+'" title="'+esc(x.fuente+'. '+fechas(x.anio)+'. '+consulta)+'">'+esc(nombreCorto(x.fuente))+'</a>. '+esc(fechas(x.anio).split(' (')[0])+'. '+esc(consulta)+'.</span></div></li>';}).join('');
    var lecturas={explorando:[['../guias/filial-o-exportar/index.html','¿Filial o seguir exportando?'],['../costos/index.html','Salarios por región'],['../index.html#empresas','Empresas mexicanas en Texas']],evaluando:[['../index.html#compara','Compara regiones'],['../costos/index.html','Salarios por región'],['../impuestos/index.html','Impuestos'],['../energia/index.html','Electricidad']],decidido:[['../index.html#acudir','A quién acudir'],['../parques/index.html','Parques industriales'],['../guias/filial-o-exportar/index.html','¿Filial o seguir exportando?']]};
    var sinGuia={explorando:['../index.html#compara','Compara regiones'],decidido:['../impuestos/index.html','Impuestos']};
    q('#lecturas').innerHTML=lecturas[estado.etapa].map(function(a){return !GUIA_PUBLICADA&&a[0].indexOf('guias/')>=0?sinGuia[estado.etapa]:a;}).map(function(a){return '<li><a href="'+a[0]+'">'+a[1]+'</a></li>';}).join('');
    var fuentes=t.fuentes.concat(ids.map(function(id){return H.regiones[id].credito;}));if(estado.plan!=='vender')fuentes=fuentes.concat(impuestos.map(function(x){return {url:x.url,texto:x.fuente};}));var vistas=new Set();q('#fuentes-impresion').innerHTML=fuentes.filter(function(f){if(vistas.has(f.url))return false;vistas.add(f.url);return true;}).map(function(f){return '<li>'+esc(f.texto)+'<br>'+esc(f.url)+'</li>';}).join('');
    if(PRESENTACION&&ids.length){q('#presentacion').hidden=false;q('#region-presentacion').textContent=H.regiones[ids[0]].nombre;}
  }
  q('#preguntas').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    if(b.dataset.cambiar){editando=b.dataset.cambiar;pintar();q('.pregunta-activa legend').focus();return;}
    if(b.dataset.pregunta){if(b.dataset.valor==='otra'){q('#otra-ciudad').hidden=false;q('#ciudad').focus();return;}responder(b.dataset.pregunta,b.dataset.valor);return;}
    if(b.dataset.ajuste){var input=q('#personas');input.value=Math.max(0,Math.min(100000,(Number(input.value)||0)+Number(b.dataset.ajuste)));return;}
    if(b.hasAttribute('data-nadie'))responder('personas',0);
    if(b.hasAttribute('data-personas')){var n=q('#personas');if(n.reportValidity()&&n.value!=='')responder('personas',+n.value);}
  });
  q('#preguntas').addEventListener('submit',function(e){if(e.target.id!=='otra-ciudad')return;e.preventDefault();var ciudad=q('#ciudad').value.trim();if(!ciudad){q('#ciudad').setCustomValidity('Escribe tu ciudad.');q('#ciudad').reportValidity();return;}estado.ciudad=ciudad;responder('origen','otra');});
  q('#preguntas').addEventListener('input',function(e){if(e.target.id==='ciudad')e.target.setCustomValidity('');});
  q('#kwh').addEventListener('change',function(){if(!this.reportValidity())return;if(this.value==='')delete estado.kwh;else estado.kwh=+this.value;if(completo(estado))pintarResultado();actualizarURL();});
  q('#selector-hoja').addEventListener('click',function(e){var b=e.target.closest('[data-region]');if(!b)return;var id=b.dataset.region,ids=estado.regiones,existe=ids.includes(id);if(existe)ids.splice(ids.indexOf(id),1);else {if(ids.length>=tope()){var removida=ids.shift();medir('hoja_region',{region:removida,accion:'quitar'});}ids.push(id);}medir('hoja_region',{region:id,accion:existe?'quitar':'agregar'});pintarResultado();actualizarURL();q('#selector-hoja [data-region="'+id+'"]').focus();});
  q('#imprimir').addEventListener('click',function(){medir('hoja_guardar',{metodo:'imprimir'});root.print();});
  q('#copiar').addEventListener('click',async function(){try{if(navigator.clipboard&&root.isSecureContext)await navigator.clipboard.writeText(url());else {var a=doc.createElement('textarea');a.value=url();doc.body.appendChild(a);a.select();if(!doc.execCommand('copy'))throw new Error('clipboard');a.remove();q('#copiar').focus();}q('#estado-acciones').textContent='Enlace copiado';medir('hoja_guardar',{metodo:'copiar'});}catch(e){q('#enlace-manual').hidden=false;q('#enlace-manual').value=url();q('#enlace-manual').select();q('#estado-acciones').textContent='Copia este enlace con el teclado.';}});
  q('#enviar').textContent=CAPTURA.url?'Enviar':'Enviar por correo';
  q('#captura').addEventListener('submit',async function(e){e.preventDefault();if(q('#sitio-web').value)return;
    var form=e.target,correo=q('#correo').value.trim(),empresa=q('#empresa').value.trim(),sector=q('#sector').value,duda=q('#duda').value.trim(),respuestas=pasos(estado).map(function(k){return resumen(estado,k);}).join('\n')+(estado.kwh!==undefined?'\nConsumo mensual. '+estado.kwh+' kWh.':'')+'\nRegiones. '+(estado.regiones||[]).map(function(id){return H.regiones[id].nombre;}).join(', '),datos={correo:correo,empresa:empresa,sector:sector,respuestas:respuestas+'\n'+url(),duda:duda,presentacion:PRESENTACION&&q('#acepta-presentacion').checked?'sí':'no'};
    if(CAPTURA.url){
      if(['correo','respuestas'].some(function(k){return !CAPTURA.campos[k];})){q('#estado-envio').textContent='El formulario aún no está disponible. Usa el enlace de contacto del pie.';return;}
      q('#enviar').disabled=true;try{var body=new URLSearchParams();Object.keys(datos).forEach(function(k){if(CAPTURA.campos[k])body.set(CAPTURA.campos[k],datos[k]);});await fetch(CAPTURA.url,{method:'POST',mode:'no-cors',body:body});q('#estado-envio').textContent='Listo. Enviamos tu hoja. Si no recibes respuesta en unos días, escríbenos a contacto@investtexashub.com.';medir('hoja_enviar',{metodo:'formulario',con_duda:!!duda,con_empresa:!!empresa});}catch(err){q('#estado-envio').textContent='No se pudo enviar. Inténtalo de nuevo o escríbenos desde el pie.';}finally{q('#enviar').disabled=false;}
    }else{var cuerpo=respuestas+'\n\n'+url()+'\n\nCorreo. '+correo+(empresa?'\nEmpresa. '+empresa:'')+(sector?'\nActividad. '+sector:'')+(duda?'\n\nDuda. '+duda:'');medir('hoja_enviar',{metodo:'correo',con_duda:!!duda,con_empresa:!!empresa});location.href='mailto:contacto@investtexashub.com?subject=Mi%20hoja%20de%20ruta&body='+encodeURIComponent(cuerpo);q('#estado-envio').textContent='Se abrió tu aplicación de correo. Envía el mensaje allí para hacérnoslo llegar.';}
  });
  var nav=q('#nav'),menu=q('#menu-panel'),boton=q('#menu-boton');function navEstado(){nav.classList.toggle('solida',root.scrollY>24||menu.classList.contains('abierto'));}function cerrar(){menu.classList.remove('abierto');boton.setAttribute('aria-expanded','false');boton.setAttribute('aria-label','Abrir menú');navEstado();}boton.addEventListener('click',function(){var abre=!menu.classList.contains('abierto');menu.classList.toggle('abierto',abre);boton.setAttribute('aria-expanded',String(abre));boton.setAttribute('aria-label',abre?'Cerrar menú':'Abrir menú');navEstado();});menu.addEventListener('click',function(e){if(e.target.closest('a'))cerrar();});doc.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('abierto')){cerrar();boton.focus();}});root.addEventListener('scroll',navEstado,{passive:true});matchMedia('(min-width:1024px)').addEventListener('change',function(e){if(e.matches)cerrar();});
  matchMedia('(max-width:699px)').addEventListener('change',function(){normalizar();if(completo(estado))pintarResultado();});
  q('#fecha-hoja').textContent='Armada el '+new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});normalizar();
  /* Una hoja que llega ya llena por su enlace no cuenta como terminada por esta visita: hoja_completa sólo sale al contestar la última pregunta aquí. */
  terminada=completo(estado);pintar();navEstado();
})(typeof window!=="undefined"?window:globalThis);
