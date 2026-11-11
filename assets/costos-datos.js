/* Generado por herramientas/armar_costos.py. No editar a mano. */
window.COSTOS_DATOS = {
  "version": 1,
  "sha256_origen": {
    "salarios": "05f9baaf1ef9eb0192ada5d6de8b2ebe7638c6073131046ed1bd5e7b2eb7d5ee",
    "impuestos": "fbc3c6136f63722a2719da2f726b6e0b026858c95879740f68d08cb49434ed52",
    "energia": "b25c5429ac7a4184a12a6f2edd03792dd1ce0b06f97a91ea3b549904a8bd9b03"
  },
  "salarios": {
    "consulta": "2026-11-10",
    "periodo": "Mayo de 2025 (edición más reciente de OEWS, última modificación 15-may-2026 según bls.gov)",
    "fuente": {
      "nombre": "Occupational Employment and Wage Statistics (OEWS), Bureau of Labor Statistics, serie OE",
      "acceso": "Servicio público de BLS sin llave. Serie = OEUM + zona (7 dígitos) + 000000 (todas las industrias) + ocupación (6 dígitos) + 08 (mediana por hora).",
      "tipos_de_dato": "https://download.bls.gov/pub/time.series/oe/oe.datatype",
      "zonas_y_ocupaciones": [
        "https://download.bls.gov/pub/time.series/oe/oe.area",
        "https://download.bls.gov/pub/time.series/oe/oe.occupation"
      ],
      "licencia": "Dominio público (bls.gov/bls/linksite.htm)"
    },
    "resumen": {
      "con_dato": 86,
      "sin_dato": 2,
      "pendientes": 0,
      "total_cruces": 88
    },
    "zonas": [
      {
        "id": "laredo",
        "region": "laredo",
        "nombre_oficial": "Laredo, TX",
        "codigo": "29700",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 14.87,
            "serie": "OEUM002970000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": null,
            "serie": "OEUM002970000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000051404108",
            "estado": "sin dato"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 21.81,
            "serie": "OEUM002970000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 26.95,
            "serie": "OEUM002970000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 25.49,
            "serie": "OEUM002970000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 15.61,
            "serie": "OEUM002970000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 14.28,
            "serie": "OEUM002970000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 23.56,
            "serie": "OEUM002970000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": null,
            "serie": "OEUM002970000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000017211208",
            "estado": "sin dato"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 19.09,
            "serie": "OEUM002970000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 16.55,
            "serie": "OEUM002970000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002970000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "mcallen",
        "region": "valle",
        "nombre_oficial": "McAllen-Edinburg-Mission, TX",
        "codigo": "32580",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 14.34,
            "serie": "OEUM003258000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 23.19,
            "serie": "OEUM003258000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 19.09,
            "serie": "OEUM003258000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 24.31,
            "serie": "OEUM003258000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 25.05,
            "serie": "OEUM003258000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 15.2,
            "serie": "OEUM003258000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 15.14,
            "serie": "OEUM003258000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 22.62,
            "serie": "OEUM003258000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 44.08,
            "serie": "OEUM003258000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 20.17,
            "serie": "OEUM003258000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 17.23,
            "serie": "OEUM003258000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM003258000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "brownsville",
        "region": "valle",
        "nombre_oficial": "Brownsville-Harlingen, TX",
        "codigo": "15180",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 16.35,
            "serie": "OEUM001518000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 23.54,
            "serie": "OEUM001518000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 21.64,
            "serie": "OEUM001518000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 27.39,
            "serie": "OEUM001518000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 28.5,
            "serie": "OEUM001518000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 15.53,
            "serie": "OEUM001518000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 16.65,
            "serie": "OEUM001518000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 23.34,
            "serie": "OEUM001518000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 35.13,
            "serie": "OEUM001518000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 19.97,
            "serie": "OEUM001518000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 18.44,
            "serie": "OEUM001518000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001518000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "san-antonio",
        "region": "san-antonio",
        "nombre_oficial": "San Antonio-New Braunfels, TX",
        "codigo": "41700",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 20.15,
            "serie": "OEUM004170000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 25.57,
            "serie": "OEUM004170000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 23.18,
            "serie": "OEUM004170000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 29.21,
            "serie": "OEUM004170000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 33.89,
            "serie": "OEUM004170000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 18.01,
            "serie": "OEUM004170000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 21.8,
            "serie": "OEUM004170000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 25.79,
            "serie": "OEUM004170000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 47.65,
            "serie": "OEUM004170000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 23.15,
            "serie": "OEUM004170000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 20.54,
            "serie": "OEUM004170000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM004170000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "austin",
        "region": "austin",
        "nombre_oficial": "Austin-Round Rock-San Marcos, TX",
        "codigo": "12420",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 19.16,
            "serie": "OEUM001242000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 28.38,
            "serie": "OEUM001242000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 28.39,
            "serie": "OEUM001242000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 30.13,
            "serie": "OEUM001242000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 34.36,
            "serie": "OEUM001242000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 18.53,
            "serie": "OEUM001242000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 22.32,
            "serie": "OEUM001242000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 27.46,
            "serie": "OEUM001242000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 49.81,
            "serie": "OEUM001242000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 26.12,
            "serie": "OEUM001242000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 21.02,
            "serie": "OEUM001242000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001242000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "dfw",
        "region": "dfw",
        "nombre_oficial": "Dallas-Fort Worth-Arlington, TX",
        "codigo": "19100",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 18.43,
            "serie": "OEUM001910000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 28.76,
            "serie": "OEUM001910000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 24.82,
            "serie": "OEUM001910000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 30.47,
            "serie": "OEUM001910000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 33.63,
            "serie": "OEUM001910000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 18.52,
            "serie": "OEUM001910000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 22.71,
            "serie": "OEUM001910000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 28.62,
            "serie": "OEUM001910000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 50.79,
            "serie": "OEUM001910000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 24.86,
            "serie": "OEUM001910000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 21.63,
            "serie": "OEUM001910000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM001910000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "houston",
        "region": "houston",
        "nombre_oficial": "Houston-Pasadena-The Woodlands, TX",
        "codigo": "26420",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 18.22,
            "serie": "OEUM002642000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 29.46,
            "serie": "OEUM002642000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 27.86,
            "serie": "OEUM002642000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 30.38,
            "serie": "OEUM002642000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 36.21,
            "serie": "OEUM002642000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 18.27,
            "serie": "OEUM002642000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 22.11,
            "serie": "OEUM002642000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 27.33,
            "serie": "OEUM002642000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 53.7,
            "serie": "OEUM002642000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 23.78,
            "serie": "OEUM002642000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 19.42,
            "serie": "OEUM002642000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002642000000043405108",
            "estado": "verificado"
          }
        ]
      },
      {
        "id": "el-paso",
        "region": "el-paso",
        "nombre_oficial": "El Paso, TX",
        "codigo": "21340",
        "puestos": [
          {
            "id": "ensamblador",
            "puesto": "Ensamblador u operario de producción (ensambladores y fabricantes varios)",
            "codigo": "51-2090",
            "titulo_oficial": "Miscellaneous Assemblers and Fabricators",
            "mediana_hora": 16.6,
            "serie": "OEUM002134000000051209008",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000051209008",
            "estado": "verificado"
          },
          {
            "id": "maquinista",
            "puesto": "Maquinista",
            "codigo": "51-4041",
            "titulo_oficial": "Machinists",
            "mediana_hora": 22.54,
            "serie": "OEUM002134000000051404108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000051404108",
            "estado": "verificado"
          },
          {
            "id": "soldador",
            "puesto": "Soldador",
            "codigo": "51-4121",
            "titulo_oficial": "Welders, Cutters, Solderers, and Brazers",
            "mediana_hora": 21.63,
            "serie": "OEUM002134000000051412108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000051412108",
            "estado": "verificado"
          },
          {
            "id": "mecanico-industrial",
            "puesto": "Mecánico de maquinaria industrial",
            "codigo": "49-9041",
            "titulo_oficial": "Industrial Machinery Mechanics",
            "mediana_hora": 27.15,
            "serie": "OEUM002134000000049904108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000049904108",
            "estado": "verificado"
          },
          {
            "id": "supervisor-produccion",
            "puesto": "Supervisor de producción",
            "codigo": "51-1011",
            "titulo_oficial": "First-Line Supervisors of Production and Operating Workers",
            "mediana_hora": 29.46,
            "serie": "OEUM002134000000051101108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000051101108",
            "estado": "verificado"
          },
          {
            "id": "ayudante-carga",
            "puesto": "Ayudante general de carga y almacén (peón de carga a mano)",
            "codigo": "53-7062",
            "titulo_oficial": "Laborers and Freight, Stock, and Material Movers, Hand",
            "mediana_hora": 17.09,
            "serie": "OEUM002134000000053706208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000053706208",
            "estado": "verificado"
          },
          {
            "id": "montacargas",
            "puesto": "Operador de montacargas (y tractores industriales)",
            "codigo": "53-7051",
            "titulo_oficial": "Industrial Truck and Tractor Operators",
            "mediana_hora": 18.52,
            "serie": "OEUM002134000000053705108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000053705108",
            "estado": "verificado"
          },
          {
            "id": "chofer-tractocamion",
            "puesto": "Chofer de tractocamión",
            "codigo": "53-3032",
            "titulo_oficial": "Heavy and Tractor-Trailer Truck Drivers",
            "mediana_hora": 23.69,
            "serie": "OEUM002134000000053303208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000053303208",
            "estado": "verificado"
          },
          {
            "id": "ingeniero-industrial",
            "puesto": "Ingeniero industrial",
            "codigo": "17-2112",
            "titulo_oficial": "Industrial Engineers",
            "mediana_hora": 39.79,
            "serie": "OEUM002134000000017211208",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000017211208",
            "estado": "verificado"
          },
          {
            "id": "auxiliar-contable",
            "puesto": "Auxiliar contable (tenedores de libros, contabilidad y auditoría)",
            "codigo": "43-3031",
            "titulo_oficial": "Bookkeeping, Accounting, and Auditing Clerks",
            "mediana_hora": 19.97,
            "serie": "OEUM002134000000043303108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000043303108",
            "estado": "verificado"
          },
          {
            "id": "servicio-cliente",
            "puesto": "Representante de servicio al cliente",
            "codigo": "43-4051",
            "titulo_oficial": "Customer Service Representatives",
            "mediana_hora": 18.1,
            "serie": "OEUM002134000000043405108",
            "url": "https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM002134000000043405108",
            "estado": "verificado"
          }
        ]
      }
    ]
  },
  "impuestos": {
    "consulta": "2026-11-10",
    "impuestos": [
      {
        "id": "franquicia-tasa",
        "impuesto": "Impuesto de franquicia de Texas (franchise tax), tasa",
        "tasa": "0.375% para comercio al menudeo o al mayoreo; 0.75% para los demás. Cálculo EZ: 0.331% (ingresos totales de 20 millones USD o menos)",
        "aplica_a": "Cada entidad sujeta a impuesto formada u organizada en Texas o que hace negocios en Texas",
        "anio": "Informes de 2026 y 2027 (las mismas tasas rigen para los informes de 2024 y 2025)",
        "fuente": "Texas Comptroller of Public Accounts",
        "url": "https://comptroller.texas.gov/taxes/franchise/",
        "estado": "verificado"
      },
      {
        "id": "franquicia-umbral",
        "impuesto": "Impuesto de franquicia, umbral de no pago (no tax due threshold)",
        "tasa": "2,650,000 USD (informes 2026 y 2027); 2,470,000 USD (informes 2024 y 2025)",
        "aplica_a": "Entidades sujetas; por debajo del umbral no se debe impuesto",
        "anio": "Informes 2026-2027 y 2024-2025. Los informes se presentan en mayo del año que nombran",
        "fuente": "Texas Comptroller of Public Accounts",
        "url": "https://comptroller.texas.gov/taxes/franchise/",
        "estado": "verificado"
      },
      {
        "id": "ventas",
        "impuesto": "Impuesto estatal a las ventas y uso",
        "tasa": "6.25% estatal; las autoridades locales pueden sumar hasta 2%; tope combinado 8.25%",
        "aplica_a": "Ventas al menudeo, arrendamientos y rentas de la mayoría de los bienes",
        "anio": "Vigente a la consulta (la página no trae fecha de vigencia)",
        "fuente": "Texas Comptroller of Public Accounts",
        "url": "https://comptroller.texas.gov/taxes/sales/",
        "estado": "verificado"
      },
      {
        "id": "renta-personas",
        "impuesto": "Impuesto estatal sobre la renta de las personas físicas: prohibición constitucional",
        "tasa": "No hay; la Constitución prohíbe al Legislativo imponerlo",
        "aplica_a": "Ingresos netos de individuos, incluida su parte de ingresos de sociedades y asociaciones no incorporadas",
        "anio": "Añadida por los votantes el 5-nov-2019 (Artículo VIII, sección 24-a; la misma enmienda derogó la sección 24)",
        "fuente": "Legislatura de Texas, texto de la resolución conjunta H.J.R. 38 (86.ª Legislatura, versión engrosada), que es la enmienda aprobada en 2019",
        "url": "https://capitol.texas.gov/tlodocs/86R/billtext/html/HJ00038E.htm",
        "estado": "verificado"
      },
      {
        "id": "desempleo-minima",
        "impuesto": "Seguro de desempleo para empleadores (Texas Workforce Commission), tasa mínima",
        "tasa": "0.32%",
        "aplica_a": "Empleadores sujetos. Se paga sobre los primeros 9,000 USD que cada empleado gana en el año calendario",
        "anio": "2026",
        "fuente": "Texas Workforce Commission",
        "url": "https://www.twc.texas.gov/programs/unemployment-tax/your-tax-rates",
        "estado": "verificado"
      },
      {
        "id": "desempleo-maxima",
        "impuesto": "Seguro de desempleo para empleadores, tasa máxima",
        "tasa": "6.32%",
        "aplica_a": "Empleadores sujetos",
        "anio": "2026",
        "fuente": "Texas Workforce Commission",
        "url": "https://www.twc.texas.gov/programs/unemployment-tax/your-tax-rates",
        "estado": "verificado"
      },
      {
        "id": "desempleo-nuevo",
        "impuesto": "Seguro de desempleo, tasa de empleador nuevo y promedios",
        "tasa": "Tasa de entrada 2.70% para todos los grupos; tasa promedio 1.20%; tasa promedio por experiencia 0.99%. Componentes: tasa de reposición 0.21%, tasa de interés 0.01%, sin tasa de déficit ni de obligación en 2026; evaluación ETIA de 0.10% de los salarios, compensada por la rebaja de la reposición",
        "aplica_a": "Empleadores nuevos (tasa de entrada) y promedios del estado",
        "anio": "2026",
        "fuente": "Texas Workforce Commission",
        "url": "https://www.twc.texas.gov/programs/unemployment-tax/tax-rates",
        "estado": "verificado"
      },
      {
        "id": "propiedad-quien",
        "impuesto": "Impuesto a la propiedad, quién lo fija",
        "tasa": "El estado no cobra impuesto a la propiedad. Lo fijan y cobran unidades locales (escuelas, condados, ciudades y otras); el Comptroller no los cobra ni fija las tasas",
        "aplica_a": "Propietarios de inmuebles y de ciertos bienes de empresa, según el avalúo local",
        "anio": "Vigente a la consulta",
        "fuente": "Texas Comptroller of Public Accounts",
        "url": "https://comptroller.texas.gov/taxes/property-tax/rates/",
        "estado": "verificado"
      },
      {
        "id": "propiedad-tasas-ciudad",
        "impuesto": "Tasa total de impuesto a la propiedad en la ciudad principal de cada región",
        "tasa": null,
        "aplica_a": "Cada unidad local fija su tasa; la tasa total de un inmueble suma las unidades que lo cubren",
        "anio": "Lista de tasas de 2025",
        "fuente": "Texas Comptroller, Tax Rates and Levies",
        "url": "https://comptroller.texas.gov/taxes/property-tax/rates/",
        "estado": "no encontrado"
      }
    ]
  },
  "energia": {
    "consulta": "2026-11-10",
    "entradas": [
      {
        "id": "laredo",
        "region": "laredo",
        "ciudad": "Laredo",
        "empresa": "AEP Texas (distribución y transmisión)",
        "tipo": "empresa de transmisión y distribución con libre elección de proveedor",
        "red": "ERCOT",
        "libre_eleccion": "sí",
        "fuente": [
          "https://www.aeptexas.com/company/about/",
          "https://www.ercot.com/files/docs/2026/03/06/2026_07-Retail-101.pdf"
        ],
        "estado": "parcial"
      },
      {
        "id": "mcallen",
        "region": "valle",
        "ciudad": "McAllen",
        "empresa": "AEP Texas (desde la transición de clientes de McAllen y Mission, que antes atendía Oncor)",
        "tipo": "empresa de transmisión y distribución con libre elección de proveedor",
        "red": "ERCOT",
        "libre_eleccion": "sí",
        "fuente": [
          "https://www.aeptexas.com/company/about/"
        ],
        "estado": "parcial"
      },
      {
        "id": "brownsville",
        "region": "valle",
        "ciudad": "Brownsville",
        "empresa": "Brownsville Public Utilities Board (BPUB)",
        "tipo": "empresa pública de la ciudad (su página dice «Your Hometown Utility»; la página no dice quién es el dueño), no tipificada oficialmente en lo que leí",
        "red": "ERCOT",
        "libre_eleccion": "por confirmar",
        "fuente": [
          "https://www.bpub.com/"
        ],
        "estado": "parcial"
      },
      {
        "id": "san-antonio",
        "region": "san-antonio",
        "ciudad": "San Antonio",
        "empresa": "CPS Energy",
        "tipo": "empresa municipal («community-owned»)",
        "red": "ERCOT (según la presentación de ERCOT vista en resumen, que ubica a San Antonio entre los NOIE dentro de ERCOT; la página de CPS no menciona ERCOT)",
        "libre_eleccion": "no",
        "fuente": [
          "https://www.cpsenergy.com/",
          "https://www.ercot.com/files/docs/2025/11/17/ERCOT-Grid-Insights-Retail-Market.pdf"
        ],
        "estado": "parcial"
      },
      {
        "id": "austin",
        "region": "austin",
        "ciudad": "Austin",
        "empresa": "Austin Energy",
        "tipo": "empresa municipal (departamento de la Ciudad de Austin)",
        "red": "ERCOT (según el resumen de la propia empresa en su buscador; la página que leí no la menciona)",
        "libre_eleccion": "no",
        "fuente": [
          "https://austinenergy.com/about/company-profile",
          "https://www.ercot.com/files/docs/2025/11/17/ERCOT-Grid-Insights-Retail-Market.pdf"
        ],
        "estado": "parcial"
      },
      {
        "id": "dfw",
        "region": "dfw",
        "ciudad": "Dallas y Fort Worth",
        "empresa": "Oncor Electric Delivery",
        "tipo": "empresa de transmisión y distribución con libre elección de proveedor",
        "red": "ERCOT",
        "libre_eleccion": "sí",
        "fuente": [
          "https://www.oncor.com/content/oncorwww/us/en/home/locations.html",
          "https://www.ercot.com/files/docs/2025/11/17/ERCOT-Grid-Insights-Retail-Market.pdf"
        ],
        "estado": "parcial"
      },
      {
        "id": "houston",
        "region": "houston",
        "ciudad": "Houston",
        "empresa": "CenterPoint Energy Houston Electric",
        "tipo": "empresa de transmisión y distribución con libre elección de proveedor",
        "red": "ERCOT",
        "libre_eleccion": "sí",
        "fuente": [
          "https://www.centerpointenergy.com/en-us/about-us",
          "https://www.centerpointenergy.com/en-us/corp/pages/communities-we-serve-ho.aspx"
        ],
        "estado": "parcial"
      },
      {
        "id": "el-paso",
        "region": "el-paso",
        "ciudad": "El Paso",
        "empresa": "El Paso Electric",
        "tipo": "empresa integrada fuera de ERCOT (generación, transmisión y distribución)",
        "red": "Fuera de ERCOT; interconexión del oeste (WECC)",
        "libre_eleccion": "no",
        "fuente": [
          "https://www.epelectric.com/",
          "https://www.epelectric.com/company/about-epe/service-territory"
        ],
        "estado": "parcial"
      }
    ],
    "precios": {
      "nota": "Centavos de dólar por kilovatio hora, sector industrial, promedio de venta final. 2026 es preliminar; 2025 es final.",
      "fuente_nombre": "U.S. Energy Information Administration, Electric Power Monthly, publicada el 2026-10-23 (próxima: 2026-11-24). Datos del formulario EIA-861M.",
      "mes_reciente": {
        "periodo": "agosto 2026 (preliminar) y agosto 2025 (final)",
        "tabla": "Table 5.6.A",
        "url": "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a",
        "texas": {
          "2026": 7.21,
          "2025": 6.42
        },
        "estados_unidos_total": {
          "2026": 9.64,
          "2025": 8.98
        },
        "estado": "verificado"
      }
    }
  }
};
