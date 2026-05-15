// Datos de 6 estaciones de bicicletas públicas en San Borja, Lima, Perú
// Coordenadas verificadas con OpenStreetMap
// Estado posible: "disponible" | "pocas" | "llena" | "vacia"

const estacionesMock = [
  {
    id: 1,
    nombre: "Municipalidad de San Borja",
    direccion: "Av. Joaquín de la Madrid 200, San Borja",
    latitud: -12.1072,
    longitud: -76.9991,
    bicicletasDisponibles: 10,
    capacidadTotal: 20,
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Pentagonito",
    direccion: "Av. San Luis 2000, San Borja",
    latitud: -12.0870,
    longitud: -76.9966,
    bicicletasDisponibles: 3,
    capacidadTotal: 15,
    estado: "pocas",
  },
  {
    id: 3,
    nombre: "Museo de la Nación",
    direccion: "Av. Javier Prado Este 2300, San Borja",
    latitud: -12.0867,
    longitud: -77.0019,
    bicicletasDisponibles: 20,
    capacidadTotal: 20,
    estado: "llena",
  },
  {
    id: 4,
    nombre: "Biblioteca Nacional del Perú",
    direccion: "Av. Aviación 160, San Borja",
    latitud: -12.0875,
    longitud: -77.0048,
    bicicletasDisponibles: 0,
    capacidadTotal: 18,
    estado: "vacia",
  },
  {
    id: 5,
    nombre: "Centro Comercial La Rambla",
    direccion: "Av. Javier Prado Este 2050, San Borja",
    latitud: -12.0894,
    longitud: -77.0048,
    bicicletasDisponibles: 6,
    capacidadTotal: 12,
    estado: "disponible",
  },
  {
    id: 6,
    nombre: "Parque de la Felicidad",
    direccion: "Parque de la Felicidad, San Borja",
    latitud: -12.1015,
    longitud: -76.9890,
    bicicletasDisponibles: 8,
    capacidadTotal: 22,
    estado: "disponible",
  },
];

export default estacionesMock;
