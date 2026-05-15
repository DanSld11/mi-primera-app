// Datos ficticios de 6 estaciones de bicicletas públicas
// Estado posible: "disponible" | "pocas" | "llena" | "vacia"

const estacionesMock = [
  {
    id: 1,
    nombre: "Plaza Mayor",
    direccion: "Calle Mayor 1, Centro",
    latitud: 40.4167,
    longitud: -3.7036,
    bicicletasDisponibles: 8,
    capacidadTotal: 20,
    estado: "disponible",
  },
  {
    id: 2,
    nombre: "Estación Atocha",
    direccion: "Paseo de la Infanta Isabel 5",
    latitud: 40.4063,
    longitud: -3.6891,
    bicicletasDisponibles: 2,
    capacidadTotal: 15,
    estado: "pocas",
  },
  {
    id: 3,
    nombre: "Parque del Retiro",
    direccion: "Calle de Alcalá 99",
    latitud: 40.4152,
    longitud: -3.6843,
    bicicletasDisponibles: 25,
    capacidadTotal: 25,
    estado: "llena",
  },
  {
    id: 4,
    nombre: "Campus Universitario",
    direccion: "Avenida Complutense s/n",
    latitud: 40.4491,
    longitud: -3.7277,
    bicicletasDisponibles: 0,
    capacidadTotal: 18,
    estado: "vacia",
  },
  {
    id: 5,
    nombre: "Gran Vía",
    direccion: "Gran Vía 45, Centro",
    latitud: 40.4202,
    longitud: -3.7061,
    bicicletasDisponibles: 5,
    capacidadTotal: 12,
    estado: "disponible",
  },
  {
    id: 6,
    nombre: "Plaza de Castilla",
    direccion: "Plaza de Castilla 3",
    latitud: 40.4655,
    longitud: -3.6894,
    bicicletasDisponibles: 10,
    capacidadTotal: 22,
    estado: "disponible",
  },
];

export default estacionesMock;
