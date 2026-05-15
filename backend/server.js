const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// DATOS MOCK (mismos que /src/constants/estacionesMock.js)
// ============================================================
const estaciones = [
  {
    id: 1,
    nombre: "Municipalidad de San Borja",
    direccion: "Av. Joaquín Madrid 200, San Borja",
    latitud: -12.0945,
    longitud: -77.0056,
    bicicletasDisponibles: 10,
    capacidadTotal: 20,
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Pentagonito",
    direccion: "Av. San Luis 2000, San Borja",
    latitud: -12.0932,
    longitud: -76.9989,
    bicicletasDisponibles: 3,
    capacidadTotal: 15,
    estado: "pocas",
  },
  {
    id: 3,
    nombre: "Museo de la Nación",
    direccion: "Av. Javier Prado Este 2465, San Borja",
    latitud: -12.0921,
    longitud: -77.0018,
    bicicletasDisponibles: 20,
    capacidadTotal: 20,
    estado: "llena",
  },
  {
    id: 4,
    nombre: "Biblioteca Nacional",
    direccion: "Av. Javier Prado Este 3210, San Borja",
    latitud: -12.0989,
    longitud: -77.0012,
    bicicletasDisponibles: 0,
    capacidadTotal: 18,
    estado: "vacia",
  },
  {
    id: 5,
    nombre: "Centro Comercial La Rambla",
    direccion: "Av. Javier Prado Este 2300, San Borja",
    latitud: -12.0998,
    longitud: -76.9978,
    bicicletasDisponibles: 6,
    capacidadTotal: 12,
    estado: "disponible",
  },
  {
    id: 6,
    nombre: "Parque de la Felicidad",
    direccion: "Calle Morelli 200, San Borja",
    latitud: -12.0967,
    longitud: -77.0033,
    bicicletasDisponibles: 8,
    capacidadTotal: 22,
    estado: "disponible",
  },
];

// Almacén de incidencias en memoria
const incidencias = [];

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// Fórmula de Haversine: distancia en km entre dos coordenadas
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Determinar estado según bicicletas disponibles
function calcularEstado(bicisDisponibles, capacidadTotal) {
  if (bicisDisponibles === 0) return "vacia";
  if (bicisDisponibles === capacidadTotal) return "llena";
  if (bicisDisponibles <= 3) return "pocas";
  return "disponible";
}

// Actualizar estado de todas las estaciones
function refrescarEstaciones() {
  estaciones.forEach((e) => {
    e.estado = calcularEstado(e.bicicletasDisponibles, e.capacidadTotal);
  });
}

// ============================================================
// ENDPOINTS
// ============================================================

// GET /estaciones → lista todas las estaciones
app.get("/estaciones", (_req, res) => {
  refrescarEstaciones();
  res.json(estaciones);
});

// GET /estaciones/cercanas?lat=X&lng=Y → 3 más cercanas con disponibilidad
app.get("/estaciones/cercanas", (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "Faltan parámetros",
      mensaje: "Se requieren lat y lng como parámetros de consulta.",
    });
  }

  const latitud = parseFloat(lat);
  const longitud = parseFloat(lng);

  if (isNaN(latitud) || isNaN(longitud)) {
    return res.status(400).json({
      error: "Parámetros inválidos",
      mensaje: "lat y lng deben ser números válidos.",
    });
  }

  refrescarEstaciones();

  const cercanas = estaciones
    .filter((e) => e.estado === "disponible" || e.estado === "pocas")
    .map((e) => ({
      ...e,
      distancia: calcularDistancia(latitud, longitud, e.latitud, e.longitud),
    }))
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, 3);

  res.json(cercanas);
});

// GET /estaciones/:id → detalle de una estación por id
app.get("/estaciones/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      error: "ID inválido",
      mensaje: "El ID debe ser un número.",
    });
  }

  const estacion = estaciones.find((e) => e.id === id);

  if (!estacion) {
    return res.status(404).json({
      error: "Estación no encontrada",
      mensaje: `No existe una estación con el ID ${id}.`,
    });
  }

  estacion.estado = calcularEstado(
    estacion.bicicletasDisponibles,
    estacion.capacidadTotal
  );

  res.json(estacion);
});

// POST /incidencias → guarda reporte
app.post("/incidencias", (req, res) => {
  const { tipo, descripcion, estacionId } = req.body;

  // Validación de campos obligatorios
  const errores = [];
  if (!tipo) errores.push("tipo es obligatorio");
  if (!estacionId) errores.push("estacionId es obligatorio");

  const tiposValidos = [
    "bicicleta_danada",
    "estacion_bloqueada",
    "mal_estacionada",
    "otro",
  ];
  if (tipo && !tiposValidos.includes(tipo)) {
    errores.push(
      `tipo debe ser uno de: ${tiposValidos.join(", ")}`
    );
  }

  if (estacionId) {
    const existe = estaciones.find((e) => e.id === parseInt(estacionId));
    if (!existe) {
      errores.push(`estacionId ${estacionId} no existe`);
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos",
      mensaje: errores.join(". "),
    });
  }

  const nuevaIncidencia = {
    id: incidencias.length + 1,
    tipo,
    descripcion: descripcion || "",
    estacionId: parseInt(estacionId),
    fecha: new Date().toISOString(),
  };

  incidencias.push(nuevaIncidencia);

  res.status(201).json({
    mensaje: "Incidencia registrada exitosamente",
    incidencia: nuevaIncidencia,
  });
});

// GET /incidencias → lista todas las incidencias (útil para debug)
app.get("/incidencias", (_req, res) => {
  res.json(incidencias);
});

// ============================================================
// MANEJO DE ERRORES GLOBAL
// ============================================================
app.use((err, _req, res, _next) => {
  console.error("Error interno:", err.message);
  res.status(500).json({
    error: "Error interno del servidor",
    mensaje: "Ocurrió un error inesperado.",
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log(`  GET  http://localhost:${PORT}/estaciones`);
  console.log(`  GET  http://localhost:${PORT}/estaciones/:id`);
  console.log(`  GET  http://localhost:${PORT}/estaciones/cercanas?lat=X&lng=Y`);
  console.log(`  POST http://localhost:${PORT}/incidencias`);
});
